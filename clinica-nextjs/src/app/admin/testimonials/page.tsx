import { PermissionGuard } from "@/components/PermissionGuard"
import TestimonialsContent from "./TestimonialsContent"

export default async function TestimonialsPage() {
	return (
		<PermissionGuard allowedRoles={['admin', 'recepcionista']}>
			<TestimonialsContent />
		</PermissionGuard>
	)
}
