"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, X, ArrowLeft, Send, Clock, User, Mail } from "lucide-react"
import type { Chat, Message } from "@/types/chat"

// Datos mock para simular chats existentes
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
        content: "Hola Ana, ¿puedes contarme más detalles?",
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        isFromSupport: true,
        isRead: true,
      },
      {
        id: "3",
        content: "No puedo completar mi compra",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
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
        content: "Quiero devolver un producto",
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
        isFromSupport: false,
        isRead: true,
      },
      {
        id: "2",
        content: "Perfecto, te ayudo con eso",
        timestamp: new Date(Date.now() - 32 * 60 * 1000),
        isFromSupport: true,
        isRead: true,
      },
      {
        id: "3",
        content: "Gracias por la ayuda",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isFromSupport: false,
        isRead: true,
      },
    ],
  },
]

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [chats, setChats] = useState<Chat[]>(mockChats)
  const [newMessage, setNewMessage] = useState("")

  const totalUnreadCount = chats.reduce((total, chat) => total + chat.unreadCount, 0)

  const toggleChat = () => {
    setIsOpen(!isOpen)
    setSelectedChat(null)
  }

  const selectChat = (chat: Chat) => {
    setSelectedChat(chat)
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
    )
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date(),
      isFromSupport: true,
      isRead: true,
    }

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
    )

    setSelectedChat((prev) => (prev ? { ...prev, messages: [...prev.messages, message] } : null))

    setNewMessage("")
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Ahora"
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  const getStatusColor = (status: Chat["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "waiting":
        return "bg-yellow-500"
      case "closed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: Chat["status"]) => {
    switch (status) {
      case "active":
        return "Activo"
      case "waiting":
        return "Esperando"
      case "closed":
        return "Cerrado"
      default:
        return "Desconocido"
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            {totalUnreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
              </Badge>
            )}
          </div>
        )}
      </Button>

      {/* Panel de chat */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-2xl z-40 animate-in slide-in-from-bottom-2 duration-200 flex flex-col">
          {!selectedChat ? (
            // Vista de lista de chats
            <>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chats de Soporte
                  {totalUnreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {totalUnreadCount}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full">
                  {chats.map((chat, index) => (
                    <div key={chat.id}>
                      <div
                        onClick={() => selectChat(chat)}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-sm">{chat.customerName}</span>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(chat.status)}`} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{formatTime(chat.lastMessageTime)}</span>
                            {chat.unreadCount > 0 && (
                              <Badge
                                variant="destructive"
                                className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                              >
                                {chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 mb-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{chat.customerEmail}</span>
                        </div>

                        <p className="text-sm font-medium text-gray-700 mb-1">{chat.subject}</p>

                        {chat.lastMessage && <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>}

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
                  <Button variant="ghost" size="icon" onClick={() => setSelectedChat(null)} className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{selectedChat.customerName}</span>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedChat.status)}`} />
                    </div>
                    <p className="text-xs text-gray-500">{selectedChat.subject}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-4 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-3">
                    {selectedChat.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isFromSupport ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg text-sm ${
                            message.isFromSupport ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
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

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage} size="icon" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  )
}