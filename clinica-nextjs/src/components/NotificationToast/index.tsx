"use client"

import { useEffect, useState } from "react"
import { X, MessageCircle, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react"
import { useNotification, type Notification } from "../NotificationProvider"
import { cn } from "../../lib/utils"

interface NotificationToastProps {
	notification: Notification
}

export function NotificationToast({ notification }: NotificationToastProps) {
	const { removeNotification } = useNotification()
	const [isVisible, setIsVisible] = useState(false)
	const [isPaused, setIsPaused] = useState(false)

	useEffect(() => {
		// Trigger entrance animation
		const showTimer = setTimeout(() => setIsVisible(true), 10)

		// Auto-close after 4 seconds
		const closeTimer = setTimeout(() => {
			if (!isPaused) {
				handleClose()
			}
		}, 4000)

		return () => {
			clearTimeout(showTimer)
			clearTimeout(closeTimer)
		}
	}, [isPaused])

	const handleClose = () => {
		setIsVisible(false)
		setTimeout(() => {
			removeNotification(notification.id)
		}, 300) // Wait for exit animation
	}

	const getIcon = () => {
		switch (notification.type) {
			case "connected":
				return <MessageCircle className="h-5 w-5 text-primary" />
			case "success":
				return <CheckCircle className="h-5 w-5 text-primary" />
			case "warning":
				return <AlertTriangle className="h-5 w-5 text-primary" />
			case "error":
				return <AlertCircle className="h-5 w-5 text-destructive" />
			default:
				return <Info className="h-5 w-5 text-primary" />
		}
	}

	const formatTimestamp = (date?: Date) => {
		if (!date) return null
		const now = new Date()
		const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

		if (diff < 60) return "Ahora"
		if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`
		return `Hace ${Math.floor(diff / 3600)}h`
	}

	return (
		<div
			className={cn(
				"pointer-events-auto transition-all duration-300 ease-in-out",
				isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
			)}
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
		>
			<div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-start gap-3">
				{/* Icon */}
				<div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium text-foreground">{notification.title}</p>
					<p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
					{notification.timestamp && (
						<p className="text-xs text-muted-foreground mt-1">{formatTimestamp(notification.timestamp)}</p>
					)}
				</div>

				{/* Close button */}
				<button
					onClick={handleClose}
					className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
					aria-label="Cerrar notificación"
				>
					<X className="h-4 w-4" />
				</button>
			</div>
		</div>
	)
}



