package ws

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"sync"

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

type Manager struct {
	Clients ClientList
	sync.RWMutex
	handlers map[string]EventHanlder
}

func NewManager() *Manager {
	m := &Manager{
		Clients:  make(ClientList),
		handlers: make(map[string]EventHanlder),
	}

	m.setupEventHandlers()
	return m
}

func (m *Manager) ServeWs(w http.ResponseWriter, r *http.Request) {
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
	username := "user-" + id.String()[:8]
	client := NewClient(conn, m, id.String(), username)
	fmt.Printf("New client connected: %s\n", client.Username)

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

}

func sendMessage(event Event, c *Client) error {
	fmt.Println(event)
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
