
import { CalendarDays } from 'lucide-react'
import CalendarAdmin from "@/components/CalendarAdmin"
import { Suspense } from 'react'
export default function AppointmentsDashboard() {
	return (
		<div className="min-h-screen bg-background p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card/80">
							<CalendarDays className="h-6 w-6 text-accent" />
						</div>
						<div>
							<h1 className="text-3xl font-bold">Citas</h1>
							<p className="text-muted-foreground">
								Gestiona las citas de los pacientes
							</p>
						</div>
					</div>

					{/* Legend - Minimalista
					<div className="flex items-center gap-4 text-xs">
						<div className="flex items-center gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
							<span>Programada</span>
						</div>
						<div className="flex items-center gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full bg-accent"></div>
							<span>Completada</span>
						</div>
						<div className="flex items-center gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
							<span>En Proceso</span>
						</div>
						<div className="flex items-center gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
							<span>Cancelada</span>
						</div>
					</div> */}
				</div>
				<Suspense fallback={<div>loading...</div>}>
					<CalendarAdmin />
				</Suspense>
			</div>
		</div>
	)
}
