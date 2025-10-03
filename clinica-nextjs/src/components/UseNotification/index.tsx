"use client"

import { useNotification as useNotificationContext } from "../NotificationProvider"

export function useNotification() {
	return useNotificationContext()
}
