"use client"

import { useNotification } from "../NotificationProvider"
import { NotificationToast } from "../NotificationToast"

export function NotificationContainer() {
	const { notifications } = useNotification()

	return (
		<div className="fixed top-6 right-4 z-70 flex flex-col gap-2 w-full max-w-sm px-4 md:px-0 pointer-events-none">
			{notifications.map((notification) => (
				<NotificationToast key={notification.id} notification={notification} />
			))}
		</div>
	)
}

