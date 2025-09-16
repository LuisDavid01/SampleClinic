package ws

import (
	"github.com/gorilla/websocket"
)

type Client struct {
	ID       string          `json:"user_id"`
	Username string          `json:"username"`
	Conn     *websocket.Conn `json:"-"`
	Manager  *Manager        `json:"-"`
}

func NewClient(conn *websocket.Conn, manager *Manager, id string, username string) *Client {
	return &Client{
		ID:       id,
		Username: username,
		Conn:     conn,
		Manager:  manager,
	}
}
