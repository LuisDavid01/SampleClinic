import {z} from "zod"

/*
export interface Chat {
	id: string;
	customerName: string;
	customerEmail: string;
	subject: string;
	status: "active" | "waiting" | "closed";
	lastMessage?: string;
	lastMessageTime: Date;
	unreadCount: number;
	messages: Message[];
}
*/
const RoleAdmin = "admin"
const RolePacient = "paciente"
const RoleFisio = "fisioterapeuta"
const RoleRecep = "recepcionista"

export const chatMessageSchema =  z.string().trim().min(1,'Mensaje es muy pequeño').max(300, 'Mensaje es muy grande')

export class chatRoomEvent {
	id: string;
	constructor(id: string) {
		this.id = id;


	}
}


export class chatEvent {
	type: string;
	payload: SendMessageEvent | NewMessageEvent | chatRoomEvent | GetHistoryEvent | errorMessageEvent |
		GetChatRoomsEvent | joinRoomEvent | createRoomEvent | LeaveRoomEvent|string;
	constructor(type: string, payload: SendMessageEvent |
		NewMessageEvent | chatRoomEvent | GetHistoryEvent |
		errorMessageEvent | GetChatRoomsEvent | joinRoomEvent | LeaveRoomEvent |string) {
		this.type = type;
		this.payload = payload;
	}
}


export class NewMessageEvent {
	message: string;
	from: string;
	role: string;
	sent: Date
	constructor(message: string, from: string, role: string, sent: Date) {
		this.message = message;
		this.from = from;
		this.sent = sent;
		this.role = role;
	}
}




export class SendMessageEvent {
	message: string;


	constructor(message: string,) {
		this.message = message;

	}
}

export type GetHistoryEvent = {
	messages: NewMessageEvent[];

}

export type rooms = {
	id: string;
	name: string;
	lastMessage: string;
	sent: Date;
}
export type currentRoom = {
	id: string;
	name: string;
}

export type GetChatRoomsEvent = {
	rooms: rooms[];
}

export type errorMessageEvent = {
	error: string;
	sent: Date;
}

export type createRoomEvent = {
	id: string;
	name: string;
	lastMessage: string;
	sent: Date;
}

export type joinRoomEvent = {
	userid: string;
	username: string;
}

export type updateRoomEvent = {
	id: string;
	lastMessage: string;
	sent: Date;
}

export type LeaveRoomEvent = {
	id: string;
}
