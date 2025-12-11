import { PermissionGuard } from "@/components/PermissionGuard"
import AuditContent from "./AuditContent"

export default async function AuditDashboard() {
	return (
		<PermissionGuard allowedRoles={['admin']}>
			<AuditContent />
		</PermissionGuard>
	)
}
