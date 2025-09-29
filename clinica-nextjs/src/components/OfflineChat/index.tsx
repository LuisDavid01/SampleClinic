import { MessageCircle } from "lucide-react"
import { Button } from "../ui/button"

export const OfflineChat = () => {
	return (
		<div className="flex flex-col items-center justify-center h-full p-6 text-center">
			<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
				<MessageCircle className="h-8 w-8 text-red-500" />
			</div>
			<h3 className="font-semibold text-lg mb-2">Chat no disponible</h3>
			<p className="text-sm text-muted-foreground mb-4">
				No se puede conectar con el servidor de chat en este momento.
			</p>
			<Button
				variant="outline"
				size="sm"
				onClick={() => window.location.reload()}
			>
				Reintentar
			</Button>
		</div>
	)
}
