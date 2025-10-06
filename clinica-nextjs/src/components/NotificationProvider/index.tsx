"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { NotificationContainer } from "../NotificationContainer"

export interface Notification {
	id: string
	type: "connected" | "info" | "newMessage" | "success" | "warning" | "error"
	title: string
	message: string
	timestamp?: Date
}

interface NotificationContextType {
	notifications: Notification[]
	showNotification: (notification: Omit<Notification, "id">) => void
	removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const [notifications, setNotifications] = useState<Notification[]>([])

	const showNotification = useCallback((notification: Omit<Notification, "id">) => {
		const id = `notification-${Date.now()}-${Math.random()}`
		const newNotification: Notification = {
			...notification,
			id,
		}

		setNotifications((prev) => {
			// Limit to maximum 3 visible notifications
			const updated = [...prev, newNotification]
			return updated.slice(-3)
		})
	}, [])

	const removeNotification = useCallback((id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id))
	}, [])

	return (
		<NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
			{children}
			<NotificationContainer />
		</NotificationContext.Provider>
	)
}

export function useNotification() {
	const context = useContext(NotificationContext)
	if (context === undefined) {
		throw new Error("useNotification must be used within a NotificationProvider")
	}
	return context
}

