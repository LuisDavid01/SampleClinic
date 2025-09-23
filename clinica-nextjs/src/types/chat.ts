export interface Message {
	id: string;
	content: string;
	timestamp: Date;
	isFromSupport: boolean;
	isRead: boolean;
}

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

export class chatEvent {
	type: string;
	payload: SendMessageEvent | NewMessageEvent | string;
	constructor(type: string, payload: SendMessageEvent | NewMessageEvent | string) {
		this.type = type;
		this.payload = payload;
	}
}


export class NewMessageEvent {
	message: string;
	from: "user" | "support";
	sent: Date
	constructor(message: string, from: "user" | "support", sent: Date) {
		this.message = message;
		this.from = from;
		this.sent = sent;
	}
}


export class SendMessageEvent {
	message: string;
	from: "user" | "support";
	constructor(message: string, from: "user" | "support") {
		this.message = message;
		this.from = from;

	}
}
