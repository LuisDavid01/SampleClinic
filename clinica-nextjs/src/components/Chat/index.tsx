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
import { chatEvent } from "../../types/chat"
import { useUser } from "@clerk/nextjs";


export default function FloatingChat() {
	const [isOpen, setIsOpen] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | null>(null);
	const wsRef = useRef<WebSocket | null>(null);
	const { user, isLoaded } = useUser();
	const [messages, setMessages] = useState<Array<{
		id: string; text: string; sender: 'user' | 'support'; timestamp: string
	}>>([]);

	useEffect(() => {


		if (typeof window !== 'undefined' && window.WebSocket) {
			console.log("WebSocket supported");

			if (!wsRef.current) {
				const userId = user?.id ?? "12345";
				const username = user?.username ?? "user-1234";
				wsRef.current = new WebSocket(`ws://localhost:8080/ws`);

				wsRef.current.onerror = (error) => {
					console.log("WebSocket error:", error);
					setConnectionStatus('error');
				};


				wsRef.current.onopen = () => {
					console.log("WebSocket connected");
					setConnectionStatus('connected');
				};

				wsRef.current.onmessage = (event) => {
					const eventData = JSON.parse(event.data);
					const evnt = Object.assign(new chatEvent('', ''), eventData);

					routeEvents(evnt);
				};

				wsRef.current.onclose = () => {
					console.log("WebSocket disconnected");
				};

			}
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

	function routeEvents(event: chatEvent) {
		if (!event.type) {
			alert("no  event");
		}
		switch (event.type) {
			case "new_message":
				console.log("new message");
				setMessages(prev => [
					...prev,
					{
						id: crypto.randomUUID(),
						sender: 'support',
						text: event.payload,
						timestamp: new Date().toLocaleTimeString()
					}
				]);
				break;
			default:
				alert("unsupported event type");
				break;
		}
	}

	function sendEvent(eventName: string, payload: string) {
		const event = new chatEvent(eventName, payload);
		wsRef.current?.send(JSON.stringify(event));


	}
	function sendMessage() {
		const newMessage = document.getElementById("messageInput") as HTMLInputElement | null;
		console.log("message: ", newMessage?.value);
		if (newMessage) {
			sendEvent("send_message", newMessage.value);
			setMessages(prev => [
				...prev,
				{
					id: crypto.randomUUID(),
					sender: 'user',
					text: newMessage.value,
					timestamp: new Date().toLocaleTimeString()
				}
			]);

			newMessage.value = ""; // limpiar campo
		}

	}
	const toggleChat = () => {
		setIsOpen(!isOpen);
	};

	const handleExitChat = () => {
		setIsOpen(false);
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
											<span className="font-medium">Recepcionista</span>
											<div className={`w-2 h-2 rounded-full bg-green-400`} />
										</div>
										<p className="text-xs text-gray-500">Consulta chat</p>
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
											<div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
												<div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'user'
													? 'bg-card text-text-primary'
													: 'bg-blue-500 text-white'
													}`}>
													<p>{msg.text}</p>
													<div className="flex items-center gap-1 mt-1">
														<Clock className="h-3 w-3 opacity-70" />
														<span className="text-xs opacity-70">{msg.timestamp}</span>
													</div>
												</div>
											</div>
										))}
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
	);
}
