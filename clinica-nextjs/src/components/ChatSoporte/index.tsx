"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
	Forward,
	LogOut,
	Users,
} from "lucide-react";
import { chatEvent, chatRoomEvent, errorMessageEvent, GetHistoryEvent, NewMessageEvent, SendMessageEvent, rooms, GetChatRoomsEvent } from "@/types/chat";
import { cn } from "@/lib/utils";
import { OfflineChat } from "../OfflineChat";
import { useAuth } from "@clerk/nextjs";
import { useNotification } from "../UseNotification";


export default function SupportChat() {
	const [isOpen, setIsOpen] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | null>(null);
	const { getToken } = useAuth();
	const wsRef = useRef<WebSocket | null>(null);
	const [rooms, setRooms] = useState<rooms[]>([]);
	const [chatroom, setChatroom] = useState<chatRoomEvent | null>(null);
	const [messages, setMessages] = useState<Array<{
		id: string; text: string; sender: string; role: string; timestamp: string
	}>>([]);
	const [roomNameFilter, setRoomNameFilter] = useState("")


	const { showNotification } = useNotification()

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	const isOpenRef = useRef(isOpen);
	useEffect(() => {
		isOpenRef.current = isOpen;
	}, [isOpen]);

	const filteredChats = (
		rooms.filter((room) => room.name.includes(roomNameFilter))
	);
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "end"
		});
	};
	useEffect(() => {
		if (messages.length > 0) {
			scrollToBottom();
		}
	}, [messages]);
	useEffect(() => {


		if (typeof window !== 'undefined' && window.WebSocket) {
			console.log("WebSocket supported");


		} else {
			console.log("WebSocket not supported");
		}

		// Cleanup: cerrar conexión cuando el componente se desmonte
		return () => {
			if (wsRef.current) {
				wsRef.current.close();
			}
		};
	}, []);

	const initializeWebSocketWithAuth = async () => {
		try {



			const token = await getToken();

			const otp = await fetch('/chat/otp', {
				headers: {
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				method: 'post',
				body: JSON.stringify({
					username: "test-Pacient",
					phone_number: "+123455667",
				}),
				mode: 'cors'
			}).then((resp) => {
				if (resp.ok) {
					return resp.json();
				} else {
					throw 'unathorized';
				}
			}).then((data) => {
				return data.otp;
			})
			wsRef.current = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws"}?otp=` + otp);

			wsRef.current.onerror = (error) => {
				console.log("WebSocket error:", error);
				setConnectionStatus('error');
			};


			wsRef.current.onopen = () => {
				console.log("WebSocket connected");
				showNotification({
					type: "connected",
					title: "Conectado al chat",
					message: "Logro ingresar correctamente",
					timestamp: new Date(),
				})
				setConnectionStatus('connected');
				getChatRooms();
			};

			wsRef.current.onmessage = (event) => {
				const eventData = JSON.parse(event.data);
				const evnt = Object.assign(new chatEvent('', ''), eventData);

				routeEvents(evnt);
			};

			wsRef.current.onclose = (event) => {
				console.log("WebSocket disconnected");
				if (event.code === 1000) {
					setConnectionStatus(null);
				} else {
					setConnectionStatus('error');
					showNotification({
						type: "error",
						title: "Conexión perdida",
						message: "Intente reconectar",
						timestamp: new Date(),
					});
				}

			};


		} catch (err) {
			showNotification({
				type: "error",
				title: "Error de conexión",
				message: "Intente conectarse más tarde",
				timestamp: new Date(),
			})

			setConnectionStatus('error');
		}

	}

	function routeEvents(event: chatEvent) {
		if (!event.type) {
			alert("no  event");
		}
		switch (event.type) {
			case "new_message":
				console.log("new message");
				const payload = event.payload as NewMessageEvent;
				const messageEvent = Object.assign(new NewMessageEvent(payload.message, payload.from, payload.role, payload.sent))
				setMessages(prev => [
					...prev,
					{
						id: crypto.randomUUID(),
						sender: messageEvent.from,
						role: messageEvent.role,
						text: messageEvent.message,
						timestamp: new Date(messageEvent.sent).toLocaleTimeString(),
					}
				]);

				if (!isOpenRef.current && messageEvent.role === 'paciente') {
					showNotification({
						type: "newMessage",
						title: `Nuevo mensaje de ${messageEvent.from}`,
						message: messageEvent.message,
						timestamp: new Date(messageEvent.sent),
					});
				}


				break;
			case "change_chatroom":
				console.log("change chatroom");
				break;
			case "get_history":
				console.log("got the chat history");
				const payloadHistory = event.payload as GetHistoryEvent;
				const historyMessages = payloadHistory.messages.map(msg => ({
					id: crypto.randomUUID(),
					sender: msg.from,
					role: msg.role,
					text: msg.message,
					timestamp: new Date(msg.sent).toLocaleTimeString(),
				}));
				setMessages(historyMessages);

				break;
			case "get_chatrooms":
				console.log("got the chatroom");
				const payloadRooms = event.payload as GetChatRoomsEvent;
				console.log(payloadRooms.rooms)
				setRooms(payloadRooms.rooms);

				break;
			case "error_message":
				console.log("Error message");
				const errorPayload = event.payload as errorMessageEvent;
				showNotification({
					type: "error",
					title: "Error",
					message: errorPayload.error,
					timestamp: new Date(errorPayload.sent),
				})

				break;
			default:
				alert("unsupported event type");
				break;
		}
	}

	function changeChatroom(newChatroom: string | null) {
		if (newChatroom != chatroom?.name) {
			const selectedChatroom = new chatRoomEvent(newChatroom ?? "");
			if (newChatroom == "") {
				setChatroom(null);
			} else {
				setChatroom(selectedChatroom);
			}
			sendEvent("change_chatroom", selectedChatroom);
			setMessages([]);
			console.log("chatroom changed to: ", newChatroom);
		}
	}

	function getChatRooms() {
		console.log("getting chatrooms...")
		sendEvent("get_chatrooms", "");
	}

	function sendEvent(eventName: string, payload: SendMessageEvent | NewMessageEvent | chatRoomEvent | string) {
		try {
			const event = new chatEvent(eventName, payload);
			wsRef.current?.send(JSON.stringify(event));
		} catch (err) {
			console.log("err: ", err);
			setConnectionStatus('error');
		}


	}
	function sendMessage() {
		const newMessage = document.getElementById("messageInput") as HTMLInputElement | null;
		if (newMessage) {
			sendEvent("send_message", new SendMessageEvent(newMessage.value));
			/*
			setMessages(prev => [
				...prev,
				{
					id: crypto.randomUUID(),
					sender: 'Pacient',
					text: newMessage.value,
					timestamp: new Date().toLocaleTimeString()
				}
			]);
			*/

			newMessage.value = ""; // limpiar campo
		}

	}
	const toggleChat = () => {
		if (!wsRef.current) {
			console.log("Intentando reconectar...");
			initializeWebSocketWithAuth();
		}
		setIsOpen(!isOpen);
	};

	const handleExitChat = () => {
		// Cierra la conexion y limpia los mensajes
		if (wsRef.current) {
			console.log("Cerrando la conexion")
			wsRef.current.close(1000, "User closed chat");
		}
		setMessages([]);
		wsRef.current = null;
		setIsOpen(false);
	};


	return (
		<>
			<>
				{/* Botón flotante */}
				<Button
					onClick={toggleChat}
					className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg 
        hover:scale-110 transition-transform duration-200 z-50
        cursor-pointer"
					size="icon"
					name="chat"
					aria-label="chat"
				>
					{isOpen ? (
						<X className="h-6 w-6" />
					) : (
						<MessageCircle className="h-6 w-6" />
					)}
				</Button>

				{/* Chat desplegable */}
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
						{connectionStatus === 'error' ? (
							<OfflineChat />
						) : (

							chatroom === null ? (
								// Vista de lista de chats
								<>
									<CardHeader className="pb-3">
										<CardTitle className="flex justify-between text-lg gap-1 mb-2">
											<div className="flex items-center gap-1">
												<MessageCircle className="h-5 w-5" />
												Chats de Soporte
												{0 > 0 && (
													<Badge
														variant="outline"
														className="ml-auto rounded-full bg-red-600 text-white"
													>
														{0}
													</Badge>
												)}
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={handleExitChat}
												className="flex items-center gap-1 "
											>
												<span>Cerrar</span>
												<LogOut className="h-4 w-4" />
											</Button>

										</CardTitle>
										<div className="w-full">
											<form
												id="searchForm"
												name="searchForm"
												onSubmit={(e) => {
													e.preventDefault();
													const searchTerm = document.getElementById("searchChatName") as HTMLInputElement | null;
													setRoomNameFilter(searchTerm?.value ?? "");
												}}
												className="relative"
											>
												<input
													className="w-full border border-input rounded text-sm px-4 py-2.5 pr-20 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
													type="text"
													id="searchChatName"
													name="searchChatName"
													placeholder="Buscar chats..."
												/>
												<button
													type="submit"
													className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium px-3 py-1.5 
			                                         border-l-2 border-input bg-background/10 hover:cursor-pointer"
												>
													Buscar
												</button>
											</form>
										</div>
									</CardHeader>

									<CardContent className="flex-1 p-0 overflow-hidden">
										{!filteredChats || filteredChats.length === 0 ? (
											<div className="flex flex-col items-center justify-center h-full">
												<div className="p-4 text-center text-muted-foreground">No hay chats disponibles</div>
												<Button variant="ghost" size="sm" className="m-4" onClick={getChatRooms}><Users className="h-4 w-4 mr-2" />Recargar</Button>
											</div>
										) : (
											<ScrollArea className="h-full">
												{filteredChats.map((chat, index) => (
													<div key={chat.id}>
														<div
															onClick={() => changeChatroom(chat.id)}
															className="p-4 hover:bg-card/70 cursor-pointer transition-colors"
														>
															<div className="flex items-start justify-between mb-2">
																<div className="flex items-center gap-2">
																	<User className="h-4 w-4 " />
																	<span className="font-medium text-sm">
																		{chat.name}
																	</span>
																</div>
																<div className="flex items-center gap-2">
																	<span className="text-xs ">
																		{new Date(chat.sent).toLocaleString()}
																	</span>
																	{0 > 0 && (
																		<Badge
																			variant="outline"
																			className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-600 text-white"
																		>
																			0
																		</Badge>
																	)}
																</div>
															</div>

															{chat.lastMessage && (
																<p className="text-xs text-muted-foreground line-clamp-2 ">
																	{chat.lastMessage}
																</p>
															)}
														</div>
														{index < rooms.length - 1 && <Separator />}
													</div>
												))}
											</ScrollArea>
										)}
									</CardContent>
								</>
							) : (
								<>
									<CardHeader className="">

										<div className="flex items-center gap-2">
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<User className="h-4 w-4" />
													<span className="font-medium "> {chatroom?.name}</span>
													<div className={`w-2 h-2 rounded-full bg-green-400`} />


												</div>
												<p className="text-xs text-gray-500">Chat de soporte</p>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => changeChatroom("")}
												className="flex items-center gap-1 "
											>
												<span>Salir</span>
												<LogOut className="h-4 w-4" />
											</Button>

										</div>
									</CardHeader>

									<CardContent className="flex-1 px-4 overflow-hidden">
										<ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
											<div className="space-y-3">
												{messages.map(msg => (
													<div key={msg.id} className={`flex ${msg.role === 'paciente' ? 'justify-start' : 'justify-end'}`}>
														<div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'paciente'
															? 'bg-blue-500 text-white'
															: 'bg-card'
															}`}>
															<p className="break-words whitespace-pre-wrap">

																{msg.text}
															</p>
															<div className="flex items-center gap-1 mt-1">
																<Clock className="h-3 w-3 opacity-70" />
																<span className="text-xs opacity-70">{msg.timestamp}</span>
															</div>
														</div>
													</div>
												))}
												<div ref={messagesEndRef} />
											</div>
										</ScrollArea>
									</CardContent>

									<CardFooter className=" px-3">
										<form onSubmit={(e) => {
											e.preventDefault();
											sendMessage();
										}
										} className="flex gap-2 w-full space-x-2">
											<Input
												id="messageInput"
												placeholder="Escribe tu mensaje..."
												className="flex-1 text-sm"
											/>
											<Button type="submit" size="icon">
												<Send className="h-4 w-4" />
											</Button>
										</form>
									</CardFooter>
								</>)
						)}
					</Card>

				)}
			</>

		</>
	);
}
