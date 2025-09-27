package ws

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/LuisDavid01/fisioterapeuta-ep/clinica-chat-api/internal/auth"
	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

func checkOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")

	switch origin {
	case "http://localhost:3000":
		return true
	default:
		return false
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     checkOrigin,
}

type Room struct {
	ID      string            `json:"id"`
	Name    string            `json:"name"`
	History []NewMessageEvent `json:"msg_history"`
}

// lista de salas de chat
type RoomList map[string]*Room

type Manager struct {
	Clients ClientList
	sync.RWMutex
	Rooms    RoomList
	opts     auth.RetentionMap
	handlers map[string]EventHanlder
}

func NewManager(ctx context.Context) *Manager {
	m := &Manager{
		Clients:  make(ClientList),
		handlers: make(map[string]EventHanlder),
		opts:     auth.NewRetentionMap(ctx, 5*time.Second),
		Rooms:    make(RoomList),
	}

	m.setupEventHandlers()
	return m
}

func (m *Manager) ServeWs(w http.ResponseWriter, r *http.Request) {

	otp := r.URL.Query().Get("otp")

	if otp == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	authUsr, ok := m.opts.ValidateOTP(otp)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	log.Println(authUsr)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	id, err := uuid.NewRandom()
	if err != nil {
		log.Printf("Error generating the id: %v", err)
		return
	}

	client := NewClient(conn, m, id.String(), authUsr.Username, authUsr.Rol)
	fmt.Printf("New client connected: %s , role: %s\n", client.Username, client.Rol)

	m.AddClient(client)

	go client.Read()
	go client.Write()
}

func (m *Manager) AddClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	m.Clients[client] = true
}

func (m *Manager) RemoveClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	if _, ok := m.Clients[client]; ok {
		client.Conn.Close()
		delete(m.Clients, client)
	}
}

// events

func (m *Manager) setupEventHandlers() {
	m.handlers[EventSendMessage] = sendMessage
	m.handlers[EventChangeRoom] = chatRoomHandler

}

func sendMessage(event Event, c *Client) error {
	var chatevent SendMessageEvent
	log.Printf("Revived event: %+v", event)
	if err := json.Unmarshal(event.Payload, &chatevent); err != nil {
		return fmt.Errorf("Bad payload, %v", err)
	}

	var broadMessage NewMessageEvent
	var role string
	if c.Rol == "admin" {
		role = "Support"
	} else {
		role = "Pacient"
	}
	log.Printf("Client role: %s, username: %s, message sent role: %s", c.Rol, c.Username, role)
	broadMessage.Sent = time.Now()
	broadMessage.Message = chatevent.Message
	broadMessage.From = c.Username
	broadMessage.Role = role

	data, err := json.Marshal(broadMessage)
	if err != nil {
		return fmt.Errorf("Error marshalling the message: %v", err)
	}
	outgoingEvent := Event{
		Payload: data,
		Type:    EventNewMessage,
	}

	for client := range c.Manager.Clients {
		if client.chatroom == c.chatroom {
			client.egress <- outgoingEvent
		}
	}
	return nil
}

func chatRoomHandler(event Event, c *Client) error {
	var changeChatRoomEvent ChangeChatRoomEvent
	if err := json.Unmarshal(event.Payload, &changeChatRoomEvent); err != nil {
		return fmt.Errorf("Bad payload in request: %v", err)
	}
	log.Println("changing to chatroom: ", changeChatRoomEvent.Name)
	c.chatroom = changeChatRoomEvent.Name

	return nil
}

func (m *Manager) RouteEvent(event Event, c *Client) error {
	if handler, ok := m.handlers[event.Type]; ok {
		if err := handler(event, c); err != nil {
			return err
		}
		return nil
	}
	return errors.New("Event not found")
}

// OTP GEN

func (m *Manager) OtpHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Recibí OTP request")
	authHeader := r.Header.Get("Authorization")

	type userLoginRequest struct {
		Username    string `json:"username"`
		PhoneNumber string `json:"phone_number"`
	}

	var role = "Pacient"
	var req userLoginRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if authHeader != "" {
		claims, ok := clerk.SessionClaimsFromContext(r.Context())
		log.Println("Getting claims...")
		if ok {
			userID := claims.Subject
			log.Println("claims: ", claims)

			usr, err := user.Get(r.Context(), userID)
			if err != nil {
				http.Error(w, "could not fetch user", http.StatusInternalServerError)
				return
			}
			log.Printf("Usuario obtenido de Clerk: %+v", *usr.FirstName)
			req.Username = *usr.FirstName + " " + *usr.LastName

			metadata := make(map[string]interface{})
			if err := json.Unmarshal(usr.PublicMetadata, &metadata); err != nil {
				http.Error(w, "could not parse public_metadata", http.StatusInternalServerError)
				return
			}
			role, ok = metadata["role"].(string)
			if !ok {
				role = "Pacient"
			}
		}
	}

	// eliminar en prod
	log.Printf("Usuario loggeado: %+v , rol: %s", req, role)

	//generamos la respuesta
	otp := m.opts.NewOTP(req.Username, role)

	type response struct {
		OTP string `json:"otp"`
	}

	resp := response{
		OTP: otp.Key,
	}

	data, err := json.Marshal(resp)
	if err != nil {
		log.Printf("Error sending the OTP: %v", err)
	}
	w.WriteHeader(http.StatusOK)
	w.Write(data)
	return

}
