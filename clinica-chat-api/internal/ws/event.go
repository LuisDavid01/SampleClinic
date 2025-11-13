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
	EventError       = "error_message"
	EventJoinRoom    = "join_room"
	EventGetSingleRoom = "get_single_room"
)

type RoomEvent struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	LastMessage   string    `json:"lastMessage"`
	LastMessageAt time.Time `json:"sent"`
}

type ErrorMessageEvent struct {
	ErrorMessage string    `json:"error"`
	Sent         time.Time `json:"sent"`
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
type GetSingleRoomEvent struct {
	Room RoomEvent `json:"room"`
}

type GetHistoryEvent struct {
	History []NewMessageEvent `json:"messages"`
}

type JoinRoomEvent struct {
	UserID   string `json:"userid"`
	Username string `json:"username"`
}
