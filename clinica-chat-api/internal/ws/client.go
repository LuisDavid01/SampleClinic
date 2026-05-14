package ws

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/gorilla/websocket"
)

var (
	pongWait = 10 * time.Second

	pingInterval = (pongWait * 9) / 10
)

// Client Roles
const (
	RoleAdmin   = "admin"
	RolePacient = "paciente"
	RoleFisio   = "fisioterapeuta"
	RoleRecep   = "recepcionista"
)

type Client struct {
	ID              string          `json:"user_id"`
	Username        string          `json:"username"`
	Rol             string          `json:"-"`
	Conn            *websocket.Conn `json:"-"`
	Manager         *Manager        `json:"-"`
	chatroom        string          `json:"-"`
	egress          chan Event      `json:"-"`
	rateLimiter     *SlidingWindowLimiter
	lastMessageTime time.Time
}

type ClientList map[*Client]bool

func NewClient(conn *websocket.Conn, manager *Manager, id string, username string, rol string) *Client {
	return &Client{
		ID:              id,
		Username:        username,
		Conn:            conn,
		Manager:         manager,
		Rol:             rol,
		egress:          make(chan Event),
		rateLimiter:     NewSlidingWindowLimiter(20, time.Minute),
		lastMessageTime: time.Now(),
	}
}

func (c *Client) Read() {
	defer func() {
		// clean up function
		c.Manager.RemoveClient(c)
	}()

	if err := c.Conn.SetReadDeadline(time.Now().Add(pongWait)); err != nil {
		c.Manager.Logger.Error("error setting read deadline", "error", err)
		return
	}

	c.Conn.SetReadLimit(600)
	c.Conn.SetPongHandler(c.pongHandler)

	for {
		_, payload, err := c.Conn.ReadMessage()

		if err != nil {

			if websocket.IsUnexpectedCloseError(err, websocket.CloseAbnormalClosure, websocket.CloseGoingAway) {
				fmt.Printf("Unsual close error: %v", err)
			}
			break
		}
		var request Event

		if err := json.Unmarshal(payload, &request); err != nil {
			c.Manager.Logger.Error("Error unmarshalling the message", "error", err)
			continue
		}

		if request.Type == EventSendMessage && !c.rateLimiter.Allow() {
			errorMessageHandler("Demasiados mensajes, espere un minuto", time.Now(), c)
			continue
		}

		c.lastMessageTime = time.Now()

		if err := c.Manager.RouteEvent(request, c); err != nil {
			c.Manager.Logger.Error("Error routing the event", "error", err)
		}

	}

}

func (c *Client) Write() {
	defer func() {
		c.Manager.RemoveClient(c)

	}()

	ticker := time.NewTicker(pingInterval)
	inactivityTicker := time.NewTicker(30 * time.Second)

	for {
		select {
		case message, ok := <-c.egress:
			if !ok {
				if err := c.Conn.WriteMessage(websocket.CloseMessage, nil); err != nil {
					c.Manager.Logger.Error("Error sending close message", "error", err)

				}
				return
			}
			data, err := json.Marshal(message)
			if err != nil {
				c.Manager.Logger.Error("Error marshalling the message", "error", err)

				return
			}

			if err := c.Conn.WriteMessage(websocket.TextMessage, data); err != nil {
				c.Manager.Logger.Error("Error sending message", "error", err)
				return
			}


		case <-ticker.C:
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				c.Manager.Logger.Error("Error sending ping message", "error", err)
				return
			}

		case <-inactivityTicker.C:
			if time.Since(c.lastMessageTime) > 5*time.Minute {
				c.Manager.Logger.Error("Client inactivity", "username", c.Username)
				c.Conn.Close()
				return
			}
		}
	}

}

func (c *Client) pongHandler(pongMsg string) error {
	return c.Conn.SetReadDeadline(time.Now().Add(pongWait))
}
