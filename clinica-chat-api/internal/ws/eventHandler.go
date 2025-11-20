package ws

import (
	"encoding/json"
	"fmt"
	"log"
	"time"
)

// events

func (m *Manager) setupEventHandlers() {
	m.handlers[EventSendMessage] = sendMessage
	m.handlers[EventChangeRoom] = chatRoomHandler
	m.handlers[EventGetRooms] = getRoomsHandler

}

func sendMessage(event Event, c *Client) error {
	var chatevent SendMessageEvent
	if err := json.Unmarshal(event.Payload, &chatevent); err != nil {
		errorMessageHandler("Bad payload", time.Now(), c)
		return fmt.Errorf("Bad payload, %v", err)
	}

	var broadMessage NewMessageEvent
	var role string
	if c.Rol == RolePacient {
		role = RolePacient
	} else {
		role = c.Rol
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
	if c.Rol != RoleAdmin && c.Rol != RoleRecep {
		errorMessageHandler("Unauthorized", time.Now(), c)
		return fmt.Errorf("Authorized action")
	}

	var changeChatRoomEvent ChangeChatRoomEvent
	if err := json.Unmarshal(event.Payload, &changeChatRoomEvent); err != nil {
		errorMessageHandler("Bad payload", time.Now(), c)
		return fmt.Errorf("Bad payload in request: %v", err)
	}

	// Si la sala es vacio, no enviamos historial
	if changeChatRoomEvent.Name != "" {

		room := c.Manager.getRoomByID(changeChatRoomEvent.Name)
		if room == nil {
			errorMessageHandler("Room not found", time.Now(), c)
			log.Println("Room not found")
			return nil
		}
		log.Println("changing to chatroom: ", changeChatRoomEvent.Name)
		c.chatroom = changeChatRoomEvent.Name
		//enviamos la notificacion al paciente de que se unio un miembro de soporte
		joinEvent := JoinRoomEvent{
			UserID:   c.ID,
			Username: c.Username,
		}

		joinData, err := json.Marshal(joinEvent)
		if err != nil {
			return fmt.Errorf("Couldnt parse the join event: %v", err)
		}

		joinOutGoingEvent := Event{
			Type:    EventJoinRoom,
			Payload: joinData,
		}
		for client := range c.Manager.Clients {
			if client.chatroom == c.chatroom && client.Rol == RolePacient {
				client.egress <- joinOutGoingEvent
			}
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
	if c.Rol != RoleAdmin && c.Rol != RoleRecep {
		errorMessageHandler("Unauthorized", time.Now(), c)
		return fmt.Errorf("Unauthorized action")
	}

	return c.Manager.getRooms(c)
}

func newRoomHandler(room Room, c *Client) error {
	roomEvent := RoomEvent{
		ID:   room.ID,
		Name: room.Name,
	}

	roomEvent.LastMessage = ""
	roomEvent.LastMessageAt = time.Now()

	data, err := json.Marshal(&roomEvent)
	if err != nil {
		errorMessageHandler("Couldnt sent the chatrooms", time.Now(), c)

		return fmt.Errorf("Couldnt parse the rooms: %v", err)
	}

	outgoingEvent := Event{
		Type:    EventCreateRoom,
		Payload: data,
	}

	for client := range c.Manager.Clients {
		if client.Rol == RoleRecep || client.Rol == RoleAdmin {
			client.egress <- outgoingEvent
		}
	}

	return nil
}
