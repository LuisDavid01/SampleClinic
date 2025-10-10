'use client'

import { UserButton } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserButtonClient() {
	// Puedes verificar si el usuario está cargado antes de mostrar el UserButton
	return (
		<div className="flex items-center justify-center gap-3 mb-8">
			<UserButton showName userProfileUrl="/user" />
		</div>
	);
}
