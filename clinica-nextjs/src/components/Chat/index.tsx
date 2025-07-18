'use client';
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, X, Send } from "lucide-react"

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  if(isOpen){
    
  }
  const toggleChat = () => {
    setIsOpen(!isOpen)

  }

  return (
    <>
      {/* Botón flotante */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 z-50"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat desplegable */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 h-96 shadow-2xl z-40 animate-in slide-in-from-bottom-2 duration-200 bg-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Chat de Ayuda</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto space-y-3 max-h-60">
            {
              <div className="flex justify-start">
                <div className="bg-card text-text-primary p-2 rounded-lg text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            }
          </CardContent>

          <CardFooter className="pt-3">
            <form  className="flex w-full space-x-2">
              <Input
                placeholder="Escribe tu mensaje..."
                className="flex-1 text-sm"

              />
              <Button type="submit" size="icon" >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}