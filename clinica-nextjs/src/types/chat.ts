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
