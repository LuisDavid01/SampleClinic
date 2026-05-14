package ws

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"os"
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
	if os.Getenv("GO_ENV") == "development" {
		return true
	}
	switch origin {
	case "http://localhost:3000":
		return true
	case "https://fisioterapeuta-ep.vercel.app":
		return true
	case "http://clinica.stackkub.com":
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
	Logger  *slog.Logger
	sync.RWMutex
	Rooms    RoomList
	opts     *auth.RetentionMap
	handlers map[string]EventHanlder
}

func NewManager(ctx context.Context, logger *slog.Logger) *Manager {
	m := &Manager{
		Clients:  make(ClientList),
		handlers: make(map[string]EventHanlder),
		opts:     auth.NewRetentionMap(ctx, 5*time.Second),
		Rooms:    make(RoomList),
		Logger:   logger,
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
		m.Logger.Error("failed to upgrade connection", "error", err)
		return
	}

	client := NewClient(conn, m, authUsr.UserID, authUsr.Username, authUsr.Rol)
	m.AddClient(client)
	var clientRoom *Room
	if client.Rol == RolePacient {
		clientRoom = &Room{
			ID:      strings.Trim(authUsr.Username, " ") + "-" + authUsr.UserID[:8],
			Name:    authUsr.Username,
			History: []NewMessageEvent{},
		}
		m.addRoom(clientRoom)
		client.chatroom = clientRoom.ID
	}

	m.Logger.Debug("New client connected", "username", client.Username, "role", client.Rol, "chatroom", client.chatroom)

	go client.Read()
	go client.Write()

	if client.Rol == RolePacient {

		newRoomHandler(*clientRoom, client)
	}
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
		if client.Rol == RolePacient {
			m.removeRoom(client.chatroom)
		}
		leaveRoomHandler(client)
		client.Conn.Close()
		delete(m.Clients, client)

	}
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
	authHeader := r.Header.Get("Authorization")

	var role = RolePacient
	var req UserLoginRequest
	var clientID string

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if len(req.Username) < 8 {
		http.Error(w, "Introduce tu nombre y apellido en tu perfil por favor", http.StatusInternalServerError)
		return
	}

	if authHeader != "" {

		claims, ok := clerk.SessionClaimsFromContext(r.Context())
		if ok {
			userID := claims.Subject

			usr, err := user.Get(r.Context(), userID)
			if err != nil {
				http.Error(w, "could not fetch user", http.StatusInternalServerError)
				return
			}
			clientID = usr.ID
			if usr.FirstName == nil && usr.LastName == nil {
				http.Error(w, "Introduce tu nombre y apellido en tu perfil por favor", http.StatusInternalServerError)
				return
			}
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
				role = RolePacient
			}
		}
	}

	if clientID == "" {
		clientID = "anon-" + uuid.New().String()
	}
	m.Logger.Debug("Usuario loggeado", "role", role, "id", clientID)

	//generamos la respuesta
	otp := m.opts.NewOTP(req.Username, role, clientID)

	resp := Response{
		OTP: otp.Key,
	}

	data, err := json.Marshal(resp)
	if err != nil {
		m.Logger.Error("Error sending the OTP", "error", err)
	}
	w.WriteHeader(http.StatusOK)
	w.Write(data)

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
