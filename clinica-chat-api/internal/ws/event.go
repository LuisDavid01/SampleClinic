package ws

import (
	"encoding/json"
	"time"
)

type Event struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type EventHanlder func(event Event, c *Client) error

const (
	EventSendMessage = "send_message"
	EventNewMessage  = "new_message"
	EventChangeRoom  = "change_chatroom"
	EventGetRooms    = "get_chatrooms"
	EventGetHistory  = "get_history"
)

type RoomEvent struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	LastMessage string `json:"last_message"`
}

type SendMessageEvent struct {
	Message string `json:"message"`
	From    string `json:"from"`
	Role    string `json:"role"`
}

type NewMessageEvent struct {
	SendMessageEvent
	Sent time.Time `json:"sent"`
}

type ChangeChatRoomEvent struct {
	Name string `json:"name"`
}

type GetChatRoomsEvent struct {
	Rooms []RoomEvent `json:"rooms"`
}

type GetHistoryEvent struct {
	History []NewMessageEvent `json:"messages"`
}
