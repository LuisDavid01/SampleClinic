"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { MessageCircle, LogOut, Send, Clock, X, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { OfflineChat } from "../OfflineChat";
import { chatEvent, chatMessageSchema, errorMessageEvent, joinRoomEvent, NewMessageEvent, SendMessageEvent } from "../../types/chat"
import { useAuth } from "@clerk/nextjs";
import { useNotification } from "../UseNotification";
import { SurveyForm } from "../SurveyForm";


export default function FloatingChat() {
	const { showNotification } = useNotification()
	const [isOpen, setIsOpen] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | 'survey' | null>(null);
	const [isSurveyActive, setIsSurveyActive] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const { getToken } = useAuth();
	const [messages, setMessages] = useState<Array<{
		id: string; text: string; sender: string; role: string; timestamp: string
	}>>([]);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const isOpenRef = useRef(isOpen);
	const [inputError, setInputError] = useState<string | null>(null);
	const [receptionist, setRecptionist] = useState<joinRoomEvent | null>(null);


	useEffect(() => {
		isOpenRef.current = isOpen;
	}, [isOpen]);
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

	const initializeWebSocket = async () => {
		try {

			const token = await getToken();
			const otp = await fetch(`/chat/otp`, {
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
			wsRef.current = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?otp=` + otp);

			wsRef.current.onerror = (error) => {
				console.log("WebSocket error:", error);
				setConnectionStatus('error');
			};


			wsRef.current.onopen = () => {
				console.log("WebSocket connected");
				showNotification({
					type: "connected",
					title: "Ha ingresado a una sala",
					message: "Espere un momento por favor...",
					timestamp: new Date(),
				})
				setConnectionStatus('connected');
			};

			wsRef.current.onmessage = (event) => {
				const eventData = JSON.parse(event.data);
				const evnt = Object.assign(new chatEvent('', ''), eventData);

				routeEvents(evnt);
			};

			wsRef.current.onclose = (event) => {
				console.log("WebSocket disconnected");
				if (event.code === 1000) {
					console.log("ws closed normally")
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
				const payload = event.payload as NewMessageEvent;
				const messageEvent = Object.assign(new NewMessageEvent(payload.message, payload.from, payload.role, payload.sent))
				setMessages(prev => [
					...prev,
					{
						id: crypto.randomUUID(),
						sender: messageEvent.from,
						role: messageEvent.role,
						text: messageEvent.message,
						timestamp: new Date().toLocaleTimeString()
					}
				]);

				if (!isOpenRef.current && (messageEvent.role === 'admin' ||
					messageEvent.role === 'recepcionista')) {
					showNotification({
						type: "newMessage",
						title: `Nuevo mensaje de ${messageEvent.from}`,
						message: messageEvent.message,
						timestamp: new Date(),
					})
				}

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
			case "join_room":
				console.log("join room");
				const joinPayload = event.payload as joinRoomEvent;
				setRecptionist(joinPayload)
				break;
			default:
				alert("unsupported event type");
				break;
		}
	}

	function sendEvent(eventName: string, payload: SendMessageEvent | NewMessageEvent) {
		try {
			const event = new chatEvent(eventName, payload);
			console.log("enviando evento: ", JSON.stringify(event));
			wsRef.current?.send(JSON.stringify(event));
		} catch (err) {
			console.log("err: ", err);
			setConnectionStatus('error');
		}


	}

	function sendMessage() {

		const newMessage = document.getElementById("messageInput") as HTMLInputElement | null;
		const validationResult = chatMessageSchema.safeParse(newMessage?.value);
		if (!validationResult.success) {
			const validationError = validationResult.error.format()._errors[0] ?? 'Mensaje invalido'
			setInputError(validationError)
			return;
		}
		setInputError(null)
		if (newMessage) {
			sendEvent("send_message", new SendMessageEvent(validationResult.data));


			newMessage.value = ""; // limpiar campo
		}

	}


	const toggleChat = () => {
		if (!wsRef.current && isSurveyActive === false) {
			console.log("Intentando reconectar...");
			initializeWebSocket();
		}
		setIsSurveyActive(false);
		setIsOpen(!isOpen);
	};

	const handleExitChat = () => {
		if (wsRef.current) {
			wsRef.current.close(1000, "User closed chat");
			setMessages([]);
			wsRef.current = null;
			setIsSurveyActive(true);
		}
	};
	const handleExitForm = () => {
		setIsOpen(false);
		setIsSurveyActive(false);
		setRecptionist(null)
	};

	return (
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

						// Clases base (móvil) - justo encima del botón flotante
						"fixed bottom-20 right-4 left-4 z-30 max-w-md mx-auto h-[500px] rounded-lg",

						// Clases para PC (≥640px) - posición fija en esquina, tamaño fijo
						"sm:fixed sm:inset-auto z-30 sm:bottom-24 sm:right-6 sm:w-96 sm:h-[600px] sm:rounded-lg",
					)}
				>
					{connectionStatus === 'error' ? (
						<OfflineChat />
					) : isSurveyActive ? (
						<>

							<SurveyForm handleExitForm={handleExitForm} recepcionist={receptionist} />


						</>
					) :
						<>
							<CardHeader className="">

								<div className="flex items-center gap-2">
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<User className="h-4 w-4" />
											<span className="font-medium">{receptionist?.username ?? 'Recepcionista'}</span>
											<div className={`w-2 h-2 rounded-full bg-green-400`} />
										</div>
										<p className="text-xs text-gray-500">Consulta chat</p>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={handleExitChat}
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
											<div key={msg.id} className={`flex ${msg.role === 'paciente' ? 'justify-end' : 'justify-start'}`}>
												<div className={`max-w-[80%] p-3 rounded-lg text-sm  ${msg.role === 'paciente'
													? 'bg-card '
													: 'bg-blue-500 text-white'
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

							<CardFooter className=" px-3 flex-col items-start">
								{inputError && (
									<div className="mb-2">
										<p className="text-red-500 text-sm">{inputError}</p>
									</div>
								)}
								<form onSubmit={(e) => {
									e.preventDefault();
									sendMessage();
								}
								} className="flex gap-2 w-full space-x-2">
									<Input
										id="messageInput"
										placeholder="Escribe tu mensaje..."
										required
										minLength={1}
										className={`${inputError ? 'border-red-500' : ''} flex-1 text-sm`}
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
	);
}
