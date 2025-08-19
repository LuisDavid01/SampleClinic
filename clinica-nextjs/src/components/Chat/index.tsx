"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle, LogOut, Send, Clock, X, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

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
                {/*Estos mensajes son de prueba*/}
                <div className={`flex justify-start`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm bg-blue-500 text-white`}
                  >
                    <p>El chat aun no esta disponible</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 opacity-70" />
                      <span className="text-xs opacity-70">18:02 2025</span>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-start`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm bg-blue-500 text-white`}
                  >
                    <p>El chat aun no esta disponible</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 opacity-70" />
                      <span className="text-xs opacity-70">18:02 2025</span>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-start`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm bg-blue-500 text-white`}
                  >
                    <p>El chat aun no esta disponible</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 opacity-70" />
                      <span className="text-xs opacity-70">18:02 2025</span>
                    </div>
                  </div>
                </div>

                {/*Mensaje usuario prueba*/}
                <div className={`flex justify-end`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm bg-card text-text-primary`}
                  >
                    <p>mensaje de prueba del usuario</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 opacity-70" />
                      <span className="text-xs opacity-70">18:02 2025</span>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-start`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm bg-blue-500 text-white`}
                  >
                    <p>El chat aun no esta disponible</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 opacity-70" />
                      <span className="text-xs opacity-70">18:02 2025</span>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-end`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm bg-card text-text-primary`}
                  >
                    <p>mensaje de prueba del usuario</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 opacity-70" />
                      <span className="text-xs opacity-70">18:02 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className=" px-3">
            <form className="flex gap-2 w-full space-x-2">
              <Input
                placeholder="Escribe tu mensaje..."
                className="flex-1 text-sm"
              />
              <Button type="submit" disabled size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
