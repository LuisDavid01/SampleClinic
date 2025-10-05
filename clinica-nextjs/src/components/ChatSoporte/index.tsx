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
import { chatEvent, chatRoomEvent, GetHistoryEvent, NewMessageEvent, SendMessageEvent } from "@/types/chat";
import { cn, smoothScrollTo } from "@/lib/utils";
import { OfflineChat } from "../OfflineChat";
import { useAuth } from "@clerk/nextjs";
import { useNotification } from "../UseNotification";


export default function SupportChat() {
	const [isOpen, setIsOpen] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | null>(null);
	const { getToken } = useAuth();
	const wsRef = useRef<WebSocket | null>(null);
	const [chatroom, setChatroom] = useState<chatRoomEvent | null>(null);
	const [messages, setMessages] = useState<Array<{
		id: string; text: string; sender: string; role: 'Pacient' | 'Support'; timestamp: string
	}>>([]);
	const { showNotification } = useNotification()


	const isOpenRef = useRef(isOpen);
	useEffect(() => {
		isOpenRef.current = isOpen;
	}, [isOpen]);

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

			const otp = await fetch('/api/chat/otp', {
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
			wsRef.current = new WebSocket(`ws://localhost:8080/ws?otp=` + otp);

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

				setConnectionStatus('connected');
			};

			wsRef.current.onmessage = (event) => {
				const eventData = JSON.parse(event.data);
				const evnt = Object.assign(new chatEvent('', ''), eventData);

				routeEvents(evnt);
			};

			wsRef.current.onclose = () => {
				console.log("WebSocket disconnected");
				setConnectionStatus('connected');

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
						timestamp: new Date().toLocaleTimeString(),
					}
				]);

				if (!isOpenRef.current && messageEvent.role === 'Pacient') {
					showNotification({
						type: "connected",
						title: `Nuevo mensaje de ${messageEvent.from}`,
						message: messageEvent.message,
						timestamp: new Date(),
					});
				}
				smoothScrollTo('chat-end');


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
				smoothScrollTo('chat-end');

				break;
			default:
				alert("unsupported event type");
				break;
		}
	}

	function changeChatroom() {
		const newChatroom = document.getElementById("chatroomInput") as HTMLInputElement;
		if (newChatroom != null && newChatroom.value != chatroom?.name) {
			const selectedChatroom = new chatRoomEvent(newChatroom.value);
			setChatroom(selectedChatroom);
			sendEvent("change_chatroom", selectedChatroom);
			setMessages([]);
			console.log("chatroom changed to: ", newChatroom.value);
		}
	}

	function sendEvent(eventName: string, payload: SendMessageEvent | NewMessageEvent | chatRoomEvent) {
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
		console.log("message: ", newMessage?.value);
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
		wsRef.current?.close();
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
						) :
							<>
								<CardHeader className="">

									<div className="flex items-center gap-2">
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<User className="h-4 w-4" />
												<span className="font-medium">Chat actual: {chatroom?.name}</span>
												<div className={`w-2 h-2 rounded-full bg-green-400`} />
												<form onSubmit={(e) => {
													e.preventDefault();
													changeChatroom();
												}
												} className="flex gap-2 w-full space-x-2">
													<Input
														id="chatroomInput"
														placeholder="Escribe el chat al que quieres cambiar"
														className="flex-1 text-sm"
													/>
													<Button type="submit" size="icon">
														<Users className="h-4 w-4" />
													</Button>
												</form>

											</div>
											<p className="text-xs text-gray-500">Chat de soporte</p>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={handleExitChat}
											className="flex items-center gap-1 text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
										>
											<span>Salir</span>
											<LogOut className="h-4 w-4" />
										</Button>
									</div>
								</CardHeader>

								<CardContent className="flex-1 px-4 overflow-hidden">
									<ScrollArea className="h-full pr-4">
										<div className="space-y-3">
											{messages.map(msg => (
												<div key={msg.id} className={`flex ${msg.role === 'Pacient' ? 'justify-start' : 'justify-end'}`}>
													<div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'Pacient'
														? 'bg-blue-500 text-white'
														: 'bg-card'
														}`}>
														<p>{msg.text}</p>
														<div className="flex items-center gap-1 mt-1">
															<Clock className="h-3 w-3 opacity-70" />
															<span className="text-xs opacity-70">{msg.timestamp}</span>
														</div>
													</div>
												</div>
											))}
											<div id="chat-end" />
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
							</>
						}
					</Card>
				)}
			</>

		</>
	);
}
