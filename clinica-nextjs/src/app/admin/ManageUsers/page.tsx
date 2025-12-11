import { Suspense } from "react";
import { PermissionGuard } from "@/components/PermissionGuard";
import ManageUserSkeleton from "@/components/ManageUserSkeleton";
import ManageUser from "@/components/ManageUser";
import {
	User,
} from "lucide-react";

function ManageUsersContent() {
	return (
		<main className="min-h-screen bg-background">
			<div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
				{/* Encabezado minimalista */}
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
						<User className="h-6 w-6 text-accent" />
					</div>
					<div>
						<h1 className="text-3xl font-bold">Gestionar usuarios</h1>
						<p className="text-muted-foreground">
							Gestiona los permisos de los usuarios
						</p>
					</div>
				</div>

				<Suspense fallback={<ManageUserSkeleton />}>
					<ManageUser />
				</Suspense>
			</div>
		</main>
	);
}

export default async function AdminUsersPage() {
	return (
		<PermissionGuard allowedRoles={['admin', 'recepcionista']}>
			<ManageUsersContent />
		</PermissionGuard>
	);
}

