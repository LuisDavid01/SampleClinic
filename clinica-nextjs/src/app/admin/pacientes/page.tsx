import { PermissionGuard } from "@/components/PermissionGuard"
import PacientesContent from "./PacientesContent"

export default async function AdminPacientesPage() {
	return (
		<PermissionGuard allowedRoles={['admin', 'recepcionista']}>
			<PacientesContent />
		</PermissionGuard>
	)
}
