import { PermissionGuard } from "@/components/PermissionGuard"
import TeamContent from "./TeamContent"

export default async function TeamPage() {
	return (
		<PermissionGuard allowedRoles={['admin', 'recepcionista']}>
			<TeamContent />
		</PermissionGuard>
	)
}
