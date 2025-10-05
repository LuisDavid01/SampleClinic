
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
export class chatRoomEvent {
	name: string;
	constructor(name: string) {
		this.name = name;


	}
}


export class chatEvent {
	type: string;
	payload: SendMessageEvent | NewMessageEvent | chatRoomEvent | GetHistoryEvent | string;
	constructor(type: string, payload: SendMessageEvent | NewMessageEvent | chatRoomEvent | GetHistoryEvent | string) {
		this.type = type;
		this.payload = payload;
	}
}


export class NewMessageEvent {
	message: string;
	from: string;
	role: "Pacient" | "Support";
	sent: Date
	constructor(message: string, from: string, role: "Pacient" | "Support", sent: Date) {
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
