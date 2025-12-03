
import { CalendarDays } from 'lucide-react'
import HistorialCitasCronologico from "@/components/HistorialCitasCronologico"
import { Suspense } from 'react'
export default function AppointmentsDashboard() {
	return (
		<div className="min-h-screen bg-background p-6">
				<Suspense fallback={<div>loading...</div>}>
					<HistorialCitasCronologico />
				</Suspense>
		</div>
	)
}
