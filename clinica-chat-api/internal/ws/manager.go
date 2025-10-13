package ws

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
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
	case "https://fisioterapeuta-ep.vercel.app":
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

// ServeWs godoc
//
//	@Summary		Inicia conexión WebSocket
//	@Description	Establece una conexión WebSocket autenticada mediante OTP.
//
//	Si el usuario es un paciente, se crea automáticamente una sala de chat asociada.
//
//	@Tags			WebSocket
//	@Param			otp	query		string	true	"OTP de autenticación"
//	@Success		101	{string}	string	"Switching Protocols"
//	@Failure		401	{string}	string	"Unauthorized"
//	@Router			/ws [get]
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
	m.AddClient(client)

	if client.Rol == "Pacient" {
		clientRoom := &Room{
			ID:      strings.Trim(authUsr.Username, " ") + "-" + id.String()[:8],
			Name:    authUsr.Username,
			History: []NewMessageEvent{},
		}
		m.addRoom(clientRoom)
		client.chatroom = clientRoom.ID
		log.Printf("New room created: %s", clientRoom.ID)
	}
	fmt.Printf("New client connected: %s , role: %s, chatroom:  %s\n", client.Username, client.Rol, client.chatroom)

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
		if client.Rol == "Pacient" {
			m.removeRoom(client.chatroom)
		}
		client.Conn.Close()
		delete(m.Clients, client)
		log.Printf("Client removed:  %s", client.Username)

	}
}

// events

func (m *Manager) setupEventHandlers() {
	m.handlers[EventSendMessage] = sendMessage
	m.handlers[EventChangeRoom] = chatRoomHandler
	m.handlers[EventGetRooms] = getRoomsHandler

}

func sendMessage(event Event, c *Client) error {
	var chatevent SendMessageEvent
	log.Printf("Revived event: %+v", event)
	if err := json.Unmarshal(event.Payload, &chatevent); err != nil {
		errorMessageHandler("Bad payload", time.Now(), c)
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
		errorMessageHandler("Couldnt send the message", time.Now(), c)
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

	room := c.Manager.getRoomByID(c.chatroom)
	if room != nil {
		room.History = append(room.History, broadMessage)
		if len(room.History) > 50 {
			room.History = room.History[len(room.History)-50:]
		}
	}

	return nil
}

func errorMessageHandler(message string, sent time.Time, c *Client) error {

	errorEvent := ErrorMessageEvent{
		ErrorMessage: message,
		Sent:         sent,
	}

	data, err := json.Marshal(errorEvent)

	if err != nil {
		return fmt.Errorf("Error sending the message to the user")
	}

	outgoingEvent := Event{
		Type:    EventError,
		Payload: data,
	}

	c.egress <- outgoingEvent
	return nil
}

func chatRoomHandler(event Event, c *Client) error {
	if c.Rol != "admin" {
		errorMessageHandler("Unauthorized", time.Now(), c)
		return fmt.Errorf("Authorized action")
	}

	var changeChatRoomEvent ChangeChatRoomEvent
	if err := json.Unmarshal(event.Payload, &changeChatRoomEvent); err != nil {
		errorMessageHandler("Bad payload", time.Now(), c)
		return fmt.Errorf("Bad payload in request: %v", err)
	}
	log.Println("changing to chatroom: ", changeChatRoomEvent.Name)
	c.chatroom = changeChatRoomEvent.Name

	// Si la sala es vacio, no enviamos historial
	if changeChatRoomEvent.Name != "" {
		room := c.Manager.getRoomByID(c.chatroom)
		if room == nil {
			errorMessageHandler("Room not found", time.Now(), c)
			log.Println("Room not found")
			return nil
		}

		historyEvent := GetHistoryEvent{
			History: room.History,
		}
		data, err := json.Marshal(historyEvent)
		if err != nil {
			return fmt.Errorf("Couldnt parse the history: %v", err)
		}
		outgoingEvent := Event{
			Type:    EventGetHistory,
			Payload: data,
		}
		log.Println("sending history...")
		c.egress <- outgoingEvent

	}

	return nil
}

func (m *Manager) getRoomByID(roomID string) *Room {
	m.RLock()
	defer m.RUnlock()
	if room, ok := m.Rooms[roomID]; ok {
		return room
	}

	return nil
}

func (m *Manager) getRooms(c *Client) error {
	var rooms GetChatRoomsEvent
	for _, room := range m.Rooms {
		roomEvent := RoomEvent{
			ID:   room.ID,
			Name: room.Name,
		}

		if len(room.History) > 0 {
			lastMsg := room.History[len(room.History)-1]
			roomEvent.LastMessage = lastMsg.Message
			roomEvent.LastMessageAt = lastMsg.Sent
		} else {
			roomEvent.LastMessage = ""
			roomEvent.LastMessageAt = time.Now()
		}

		rooms.Rooms = append(rooms.Rooms, roomEvent)
	}
	data, err := json.Marshal(&rooms)
	if err != nil {
		errorMessageHandler("Couldnt sent the chatrooms", time.Now(), c)

		return fmt.Errorf("Couldnt parse the rooms: %v", err)
	}

	outgoingEvent := Event{
		Type:    EventGetRooms,
		Payload: data,
	}
	log.Println("sending rooms...")
	c.egress <- outgoingEvent

	return nil
}

func getRoomsHandler(event Event, c *Client) error {
	if c.Rol != "admin" {
		errorMessageHandler("Unauthorized", time.Now(), c)
		return fmt.Errorf("Unauthorized action")
	}

	return c.Manager.getRooms(c)
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

// Types for OTP
type Response struct {
	OTP string `json:"otp"`
}

type UserLoginRequest struct {
	Username    string `json:"username"`
	PhoneNumber string `json:"phone_number"`
}

// OtpHandler godoc
//
//	@Summary		Genera OTP para conexión WebSocket
//	@Description	Genera un OTP que será usado para autenticar conexiones WebSocket.
//
//	Si el usuario está autenticado mediante Clerk (Authorization header),
//	se obtiene su información desde el backend de Clerk.
//	Si no, se utilizan los parámetros enviados en el body.
//
//	@Tags			WebSocket
//	@Accept			json
//	@Produce		json
//	@Param			request	body		UserLoginRequest	true	"Información del usuario"
//
//	@Success		200		{object}	Response			"OK"
//
//	@Failure		400		{string}	string				"Bad Request"
//	@Failure		401		{string}	string				"Unauthorized"
//	@Failure		500		{string}	string				"Internal Server Error"
//	@Security		BearerAuth
//	@Router			/api/otp [post]
func (m *Manager) OtpHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Recibí OTP request")
	authHeader := r.Header.Get("Authorization")

	var role = "Pacient"
	var req UserLoginRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if authHeader != "" {

		claims, ok := clerk.SessionClaimsFromContext(r.Context())
		log.Println("Getting claims...")
		if ok {
			userID := claims.Subject

			usr, err := user.Get(r.Context(), userID)
			if err != nil {
				http.Error(w, "could not fetch user", http.StatusInternalServerError)
				return
			}
			log.Printf("Usuario obtenido: %+v", *usr.FirstName)
			if usr.LastName == nil {
				req.Username = *usr.FirstName
			} else {
				req.Username = *usr.FirstName + " " + *usr.LastName
			}
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

	resp := Response{
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

// ROOMS

func (m *Manager) addRoom(room *Room) {
	m.Lock()
	defer m.Unlock()
	m.Rooms[room.ID] = room
}

func (m *Manager) removeRoom(roomID string) {

	delete(m.Rooms, roomID)
}
