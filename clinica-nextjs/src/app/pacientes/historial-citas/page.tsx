"use client";

import { CalendarDays } from 'lucide-react'
import HistorialCitasCronologico from "@/components/HistorialCitasCronologico"
import { Suspense } from 'react'

export default function HistorialCitasPage() {
  return (
		<main className="min-h-screen bg-background">
			<div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
				{/* Encabezado minimalista */}
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
						<CalendarDays className="h-6 w-6 text-accent" />
					</div>
					<div>
						<h1 className="text-3xl font-bold">Historial de Citas</h1>
						<p className="text-muted-foreground">
							Gestiona y completa las citas del sistema
						</p>
					</div>
				</div>

				<Suspense fallback={<div>loading...</div>}>
					<HistorialCitasCronologico />
				</Suspense>
			</div>
		</main>
	)
}
