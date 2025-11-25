package ws

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

var (
	pongWait = 10 * time.Second

	pingInterval = (pongWait * 9) / 10
)

// Client Roles
const (
	RoleAdmin = "admin"
	RolePacient = "paciente"
	RoleFisio = "fisioterapeuta"
	RoleRecep = "recepcionista"
)

type Client struct {
	ID       string          `json:"user_id"`
	Username string          `json:"username"`
	Rol      string          `json:"-"`
	Conn     *websocket.Conn `json:"-"`
	Manager  *Manager        `json:"-"`
	chatroom string          `json:"-"`
	// channel to avoid blocking messages
	egress chan Event `json:"-"`
}

type ClientList map[*Client]bool

func NewClient(conn *websocket.Conn, manager *Manager, id string, username string, rol string) *Client {
	return &Client{
		ID:       id,
		Username: username,
		Conn:     conn,
		Manager:  manager,
		Rol:      rol,
		egress:   make(chan Event),
	}
}

func (c *Client) Read() {
	defer func() {
		// clean up function
		c.Manager.RemoveClient(c)
	}()

	if err := c.Conn.SetReadDeadline(time.Now().Add(pongWait)); err != nil {
		log.Println(err)
		return
	}

	c.Conn.SetReadLimit(600)
	c.Conn.SetPongHandler(c.pongHandler)

	for {
		_, payload, err := c.Conn.ReadMessage()

		if err != nil {

			if websocket.IsUnexpectedCloseError(err, websocket.CloseAbnormalClosure, websocket.CloseGoingAway) {
				log.Printf("error: %v", err)
			}
			break
		}
		var request Event

		if err := json.Unmarshal(payload, &request); err != nil {
			log.Printf("error parsing the event: %v", err)
			continue
		}

		if err := c.Manager.RouteEvent(request, c); err != nil {
			log.Printf("Error routing the event: %v", err)
		}

	}

}

func (c *Client) Write() {
	defer func() {
		c.Manager.RemoveClient(c)

	}()

	ticker := time.NewTicker(pingInterval)

	for {
		select {
		case message, ok := <-c.egress:
			if !ok {
				if err := c.Conn.WriteMessage(websocket.CloseMessage, nil); err != nil {
					log.Printf("error  sending error message: %v", err)

				}
				return
			}
			data, err := json.Marshal(message)
			if err != nil {

				log.Printf("error parsing the send message: %v", err)
				return
			}

			if err := c.Conn.WriteMessage(websocket.TextMessage, data); err != nil {
				log.Printf("error  sending the message: %v", err)
				return
			}

			log.Println("Message sent")

		case <-ticker.C:
			log.Println("ping")
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				log.Printf("Error sending ping message: %v", err)
				return
			}
		}
	}

}

func (c *Client) pongHandler(pongMsg string) error {
	log.Println("pong")
	return c.Conn.SetReadDeadline(time.Now().Add(pongWait))
}
