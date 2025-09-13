"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	MessageCircle,
	X,
	ArrowLeft,
	Send,
	Clock,
	User,
	Mail,
	Lock,
	Download,
	Forward,
} from "lucide-react";
import type { Chat, Message } from "@/types/chat";
import { cn } from "@/lib/utils";
// Datos mock para simular chats existentes - agregar más chats
const mockChats: Chat[] = [
	{
		id: "1",
		customerName: "Ana García",
		customerEmail: "ana@email.com",
		subject: "Problema con el pago",
		status: "waiting",
		lastMessage: "No puedo completar mi compra",
		lastMessageTime: new Date(Date.now() - 5 * 60 * 1000),
		unreadCount: 3,
		messages: [
			{
				id: "1",
				content: "Hola, tengo un problema con el pago",
				timestamp: new Date(Date.now() - 10 * 60 * 1000),
				isFromSupport: false,
				isRead: true,
			},
			{
				id: "2",
				content:
					"Hola Ana, ¿puedes contarme más detalles sobre el error que recibes?",
				timestamp: new Date(Date.now() - 8 * 60 * 1000),
				isFromSupport: true,
				isRead: true,
			},
			{
				id: "3",
				content:
					"No puedo completar mi compra, me aparece un error cuando intento pagar",
				timestamp: new Date(Date.now() - 5 * 60 * 1000),
				isFromSupport: false,
				isRead: false,
			},
			{
				id: "4",
				content: "He intentado con diferentes tarjetas y el mismo problema",
				timestamp: new Date(Date.now() - 4 * 60 * 1000),
				isFromSupport: false,
				isRead: false,
			},
			{
				id: "5",
				content: "¿Podrían ayudarme por favor?",
				timestamp: new Date(Date.now() - 3 * 60 * 1000),
				isFromSupport: false,
				isRead: false,
			},
		],
	},
	{
		id: "2",
		customerName: "Carlos López",
		customerEmail: "carlos@email.com",
		subject: "Consulta sobre producto",
		status: "active",
		lastMessage: "¿Tienen stock disponible?",
		lastMessageTime: new Date(Date.now() - 2 * 60 * 1000),
		unreadCount: 1,
		messages: [
			{
				id: "1",
				content: "Hola, estoy interesado en el producto XYZ",
				timestamp: new Date(Date.now() - 15 * 60 * 1000),
				isFromSupport: false,
				isRead: true,
			},
			{
				id: "2",
				content: "¡Hola Carlos! Te ayudo con información sobre ese producto",
				timestamp: new Date(Date.now() - 12 * 60 * 1000),
				isFromSupport: true,
				isRead: true,
			},
			{
				id: "3",
				content: "¿Tienen stock disponible?",
				timestamp: new Date(Date.now() - 2 * 60 * 1000),
				isFromSupport: false,
				isRead: false,
			},
		],
	},
	{
		id: "3",
		customerName: "María Rodríguez",
		customerEmail: "maria@email.com",
		subject: "Devolución de producto",
		status: "closed",
		lastMessage: "Gracias por la ayuda",
		lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
		unreadCount: 0,
		messages: [
			{
				id: "1",
				content: "Quiero devolver un producto que compré la semana pasada",
				timestamp: new Date(Date.now() - 35 * 60 * 1000),
				isFromSupport: false,
				isRead: true,
			},
			{
				id: "2",
				content: "Perfecto María, te ayudo con el proceso de devolución",
				timestamp: new Date(Date.now() - 32 * 60 * 1000),
				isFromSupport: true,
				isRead: true,
			},
			{
				id: "3",
				content: "Gracias por la ayuda, todo perfecto",
				timestamp: new Date(Date.now() - 30 * 60 * 1000),
				isFromSupport: false,
				isRead: true,
			},
		],
	},
	{
		id: "4",
		customerName: "Pedro Martínez",
		customerEmail: "pedro@email.com",
		subject: "Problema técnico",
		status: "waiting",
		lastMessage: "La página no carga",
		lastMessageTime: new Date(Date.now() - 45 * 60 * 1000),
		unreadCount: 2,
		messages: [
			{
				id: "1",
				content: "Tengo problemas para acceder a mi cuenta",
				timestamp: new Date(Date.now() - 50 * 60 * 1000),
				isFromSupport: false,
				isRead: true,
			},
			{
				id: "2",
				content: "La página no carga correctamente",
				timestamp: new Date(Date.now() - 45 * 60 * 1000),
				isFromSupport: false,
				isRead: false,
			},
		],
	},
	{
		id: "5",
		customerName: "Laura Fernández",
		customerEmail: "laura@email.com",
		subject: "Consulta de facturación",
		status: "active",
		lastMessage: "¿Pueden enviarme la factura?",
		lastMessageTime: new Date(Date.now() - 1 * 60 * 1000),
		unreadCount: 1,
		messages: [
			{
				id: "1",
				content: "Necesito la factura de mi última compra",
				timestamp: new Date(Date.now() - 10 * 60 * 1000),
				isFromSupport: false,
				isRead: true,
			},
			{
				id: "2",
				content: "Claro Laura, te ayudo a generar la factura",
				timestamp: new Date(Date.now() - 8 * 60 * 1000),
				isFromSupport: true,
				isRead: true,
			},
			{
				id: "3",
				content: "¿Pueden enviarme la factura por email?",
				timestamp: new Date(Date.now() - 1 * 60 * 1000),
				isFromSupport: false,
				isRead: false,
			},
		],
	},
	{
		id: "6",
		customerName: "Roberto Silva",
		customerEmail: "roberto@email.com",
		subject: "Cambio de dirección",
		status: "waiting",
		lastMessage: "Necesito actualizar mi dirección",
		lastMessageTime: new Date(Date.now() - 60 * 60 * 1000),
		unreadCount: 1,
		messages: [
			{
				id: "1",
				content: "Necesito actualizar mi dirección de envío",
				timestamp: new Date(Date.now() - 60 * 60 * 1000),
				isFromSupport: false,
				isRead: false,
			},
		],
	},
	{
		id: "7",
		customerName: "Carmen Ruiz",
		customerEmail: "carmen@email.com",
		subject: "Pregunta sobre garantía",
		status: "closed",
		lastMessage: "Entendido, muchas gracias",
		lastMessageTime: new Date(Date.now() - 120 * 60 * 1000),
		unreadCount: 0,
		messages: [
			{
				id: "1",
				content: "¿Cuál es el tiempo de garantía de los productos?",
				timestamp: new Date(Date.now() - 125 * 60 * 1000),
				isFromSupport: false,
				isRead: true,
			},
			{
				id: "2",
				content: "La garantía es de 2 años para todos nuestros productos",
				timestamp: new Date(Date.now() - 122 * 60 * 1000),
				isFromSupport: true,
				isRead: true,
			},
			{
				id: "3",
				content: "Entendido, muchas gracias por la información",
				timestamp: new Date(Date.now() - 120 * 60 * 1000),
				isFromSupport: false,
				isRead: true,
			},
		],
	},
];

export default function SupportChat() {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
	const [chats, setChats] = useState<Chat[]>(mockChats);
	const [newMessage, setNewMessage] = useState("");

	const totalUnreadCount = chats.reduce(
		(total, chat) => total + chat.unreadCount,
		0,
	);

	const toggleChat = () => {
		setIsOpen(!isOpen);
		setSelectedChat(null);
	};

	const selectChat = (chat: Chat) => {
		setSelectedChat(chat);
		// Marcar mensajes como leídos
		setChats((prevChats) =>
			prevChats.map((c) =>
				c.id === chat.id
					? {
						...c,
						unreadCount: 0,
						messages: c.messages.map((m) => ({ ...m, isRead: true })),
					}
					: c,
			),
		);
	};

	const sendMessage = () => {
		if (!newMessage.trim() || !selectedChat) return;

		const message: Message = {
			id: Date.now().toString(),
			content: newMessage,
			timestamp: new Date(),
			isFromSupport: true,
			isRead: true,
		};

		setChats((prevChats) =>
			prevChats.map((chat) =>
				chat.id === selectedChat.id
					? {
						...chat,
						messages: [...chat.messages, message],
						lastMessage: newMessage,
						lastMessageTime: new Date(),
					}
					: chat,
			),
		);

		setSelectedChat((prev) =>
			prev ? { ...prev, messages: [...prev.messages, message] } : null,
		);

		setNewMessage("");
	};

	const downloadChat = () => {
		alert("Descargando chat....");
	};

	const bloquearChat = () => {
		alert("Usuario bloqueado");
	};

	const transferirChat = () => {
		alert("Transfiriendo chat a recepcionista desocupado....");
	};

	const formatTime = (date: Date) => {
		const now = new Date();
		const diffInMinutes = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60),
		);

		if (diffInMinutes < 1) return "Ahora";
		if (diffInMinutes < 60) return `${diffInMinutes}m`;
		if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
		return `${Math.floor(diffInMinutes / 1440)}d`;
	};

	const getStatusColor = (status: Chat["status"]) => {
		switch (status) {
			case "active":
				return "bg-green-500";
			case "waiting":
				return "bg-yellow-500";
			case "closed":
				return "bg-gray-500";
			default:
				return "bg-gray-500";
		}
	};

	const getStatusText = (status: Chat["status"]) => {
		switch (status) {
			case "active":
				return "Activo";
			case "waiting":
				return "Esperando";
			case "closed":
				return "Cerrado";
			default:
				return "Desconocido";
		}
	};

	return (
		<>
			{/* Botón flotante */}
			<Button
				onClick={toggleChat}
				className="fixed bottom-6 right-6 h-14 w-14 
        rounded-full shadow-lg hover:scale-110 transition-transform duration-200 z-50
        cursor-pointer"
				size="icon"
				name="chat-soporte"
				aria-label="chat-soporte"
			>
				{isOpen ? (
					<X className="h-6 w-6" />
				) : (
					<div className="relative">
						<MessageCircle className="h-6 w-6" />
						{totalUnreadCount > 0 && (
							<Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
								{totalUnreadCount > 99 ? "99+" : totalUnreadCount}
							</Badge>
						)}
					</div>
				)}
			</Button>

			{/* Panel de chat */}
			{isOpen && (
				<Card
					className={cn(
						// Clases comunes (aplican en todos los tamaños)
						"shadow-2xl z-40 animate-in slide-in-from-bottom-2 duration-200 flex flex-col bg-background",

						// Clases base (móvil: <640px) - centrado y full-screen
						"fixed inset-0 m-auto w-full h-[640] rounded-none",

						// Clases para PC (≥640px) - posición fija en esquina, tamaño fijo
						"sm:fixed sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 sm:h-[600px] sm:rounded-lg",
					)}
				>
					{!selectedChat ? (
						// Vista de lista de chats
						<>
							<CardHeader className="pb-3">
								<CardTitle className="text-lg flex items-center gap-2">
									<MessageCircle className="h-5 w-5" />
									Chats de Soporte
									{totalUnreadCount > 0 && (
										<Badge
											variant="outline"
											className="ml-auto rounded-full bg-red-600 text-white"
										>
											{totalUnreadCount}
										</Badge>
									)}
								</CardTitle>
							</CardHeader>

							<CardContent className="flex-1 p-0 overflow-hidden">
								<ScrollArea className="h-full">
									{chats.map((chat, index) => (
										<div key={chat.id}>
											<div
												onClick={() => selectChat(chat)}
												className="p-4  hover:bg-card/70 cursor-pointer transition-colors"
											>
												<div className="flex items-start justify-between mb-2">
													<div className="flex items-center gap-2">
														<User className="h-4 w-4 text-text-primary" />
														<span className="font-medium text-sm">
															{chat.customerName}
														</span>
														<div
															className={`w-2 h-2 rounded-full ${getStatusColor(chat.status)}`}
														/>
													</div>
													<div className="flex items-center gap-2">
														<span className="text-xs text-text-primary">
															{formatTime(chat.lastMessageTime)}
														</span>
														{chat.unreadCount > 0 && (
															<Badge
																variant="outline"
																className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-600 text-white"
															>
																{chat.unreadCount}
															</Badge>
														)}
													</div>
												</div>

												<div className="flex items-center gap-1 mb-1">
													<Mail className="h-3 w-3 text-text-primary" />
													<span className="text-xs text-text-primary">
														{chat.customerEmail}
													</span>
												</div>

												<p className="text-sm font-medium text-text-primary mb-1">
													{chat.subject}
												</p>

												{chat.lastMessage && (
													<p className="text-xs text-text-primary truncate">
														{chat.lastMessage}
													</p>
												)}

												<div className="flex items-center justify-between mt-2">
													<Badge variant="outline" className="text-xs">
														{getStatusText(chat.status)}
													</Badge>
												</div>
											</div>
											{index < chats.length - 1 && <Separator />}
										</div>
									))}
								</ScrollArea>
							</CardContent>
						</>
					) : (
						// Vista de chat específico
						<>
							<CardHeader className="pb-3">
								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setSelectedChat(null)}
										className="h-8 w-8"
									>
										<ArrowLeft className="h-4 w-4" />
									</Button>
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<User className="h-4 w-4" />
											<span className="font-medium">
												{selectedChat.customerName}
											</span>
											<div
												className={`w-2 h-2 rounded-full ${getStatusColor(selectedChat.status)}`}
											/>
										</div>
										<p className="text-xs text-gray-500">
											{selectedChat.subject}
										</p>
									</div>
								</div>

								<div className="flex gap-2 mt-3">
									<Button
										variant="outline"
										size="sm"
										className="flex-1 sm:flex-none"
										onClick={bloquearChat}
									>
										<Lock className="h-4 w-4 sm:mr-1" />
										<span className="hidden sm:inline">Bloquear</span>
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="flex-1 sm:flex-none"
										onClick={downloadChat}
									>
										<Download className="h-4 w-4 sm:mr-1" />
										<span className="hidden sm:inline">Exportar</span>
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="flex-1 sm:flex-none"
										onClick={transferirChat}
									>
										<Forward className="h-4 w-4 sm:mr-1" />
										<span className="hidden sm:inline">Transferir</span>
									</Button>
								</div>
							</CardHeader>

							<CardContent className="flex-1 px-4 overflow-hidden">
								<ScrollArea className="h-full pr-4">
									<div className="space-y-3">
										{selectedChat.messages.map((message) => (
											<div
												key={message.id}
												className={`flex ${message.isFromSupport ? "justify-end" : "justify-start"}`}
											>
												<div
													className={`max-w-[80%] p-3 rounded-lg text-sm ${message.isFromSupport
														? "bg-blue-500 text-white"
														: "bg-card text-text-primary"
														}`}
												>
													<p>{message.content}</p>
													<div className="flex items-center gap-1 mt-1">
														<Clock className="h-3 w-3 opacity-70" />
														<span className="text-xs opacity-70">
															{message.timestamp.toLocaleTimeString([], {
																hour: "2-digit",
																minute: "2-digit",
															})}
														</span>
													</div>
												</div>
											</div>
										))}
									</div>
								</ScrollArea>
							</CardContent>

							<div className=" px-3">
								<div className="flex gap-2 w-full space-x-2">
									<Input
										value={newMessage}
										onChange={(e) => setNewMessage(e.target.value)}
										placeholder="Escribe tu respuesta..."
										className="flex-1 text-sm md:text-lg"
										onKeyDown={(e) => e.key === "Enter" && sendMessage()}
									/>
									<Button
										onClick={sendMessage}
										size="icon"
										disabled={!newMessage.trim()}
									>
										<Send className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</>
					)}
				</Card>
			)}
		</>
	);
}
