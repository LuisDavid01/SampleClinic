import { ArrowLeftIcon, Edit } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import NewService from '@/components/NewService'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

export default function NewFilePage() {
	return (
		<div className="min-h-screen bg-background p-6">
			<Link
				href="/admin/services"
				className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
			>
				<ArrowLeftIcon size={16} className="mr-1" />
				Regresar a Servicios
			</Link>
			<Card className="bg-card shadow-sm">
				<CardHeader className="pb-4">
					<CardTitle>
						<div className="flex items-center gap-2">
							<Edit className="w-5 h-5 text-text-primary" />
							<h2 className="text-lg lg:text-2xl font-semibold text-text-primary">
								Nuevo Servicio
							</h2>
						</div>
					</CardTitle>
					<CardDescription>Crear nuevo servicio para un paciente</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<div>loading...</div>}>
						<NewService />
					</Suspense>
				</CardContent>
			</Card>
		</div>
	)
}
