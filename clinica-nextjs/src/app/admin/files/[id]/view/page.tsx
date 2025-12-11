
import { ArrowLeftIcon, Eye, FileText, LucideBookUser, FileSignatureIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import DocumentosExpediente from '@/components/DocuementosExpediente'
import ConsentManagement from '@/components/ConsentManagment'
import AntecedentesManager from '@/components/AntecedentesManager'
import { Button } from '@/components/ui/button'

import { ExpedienteByID } from '@/components/ExpedienteByID'
import { getExpedienteByID } from '@/actions/expedientes'
import NewExpediente from '@/components/NewExpediente'

export default async function ViewFilePage({ params }) {
	const { id } = await params

	// Obtener información del expediente para extraer el ID del paciente
	const expediente = await getExpedienteByID(Number(id))
	const pacienteId = expediente?.idPaciente

	return (
		<div className="space-y-6 p-6 bg-background min-h-screen">
			<div className="flex items-center justify-between mb-6">
				<Link
					href="/admin/files"
					className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
				>
					<ArrowLeftIcon size={16} className="mr-1" />
					Regresar a expedientes
				</Link>

			</div>

			<Card className="bg-card shadow-sm">
				<CardHeader className="pb-4">
					<CardTitle>
						<div className="flex items-center gap-2">
							<Eye className="w-5 h-5 text-text-primary" />
							<h2 className="text-lg lg:text-2xl font-semibold text-text-primary">
								Ver expediente
							</h2>
						</div>
					</CardTitle>
					<CardDescription>Información general del paciente (solo lectura)</CardDescription>
				</CardHeader>
				<CardContent>
					<NewExpediente expediente={expediente} isEditing={true} />
				</CardContent>
			</Card>

			<h2 className='pb-4 text-xl md:text-3xl font-semibold text-center'>Contenidos del expediente</h2>

			{/* Consentimientos */}
			<Card className="bg-card shadow-sm">
				<CardHeader className="pb-4">
					<CardTitle>
						<div className="flex items-center gap-2">
							<LucideBookUser className="w-5 h-5 text-text-primary" />
							<h3 className="text-lg font-semibold text-text-primary">
								Consentimientos
							</h3>
						</div>
					</CardTitle>
					<CardDescription>
						Documentos de consentimiento del paciente
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<div>Cargando consentimientos...</div>}>
						<ConsentManagement expedienteId={Number(id)} pacienteId={pacienteId} />
					</Suspense>
				</CardContent>
			</Card>

			{/* Antecedentes Clínicos */}
			<Card className="bg-card shadow-sm">
				<CardHeader className="pb-4">
					<CardTitle>
						<div className="flex items-center gap-2">
							<FileSignatureIcon className="w-5 h-5 text-text-primary" />
							<h3 className="text-lg font-semibold text-text-primary">
								Antecedentes Clínicos
							</h3>
						</div>
					</CardTitle>
					<CardDescription>
						Historial médico completo del paciente
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<div>Cargando antecedentes...</div>}>
						{pacienteId ? (
							<AntecedentesManager
								pacienteId={pacienteId}
								expedienteId={Number(id)}
								canEdit={true}
							/>
						) : (
							<div>No se pudo obtener la información del paciente</div>
						)}
					</Suspense>
				</CardContent>
			</Card>

			{/* Documentos del expediente */}
			<Card className="bg-card shadow-sm">
				<CardHeader className="pb-4">
					<CardTitle>
						<div className="flex items-center gap-2">
							<FileText className="w-5 h-5 text-text-primary" />
							<h3 className="text-lg font-semibold text-text-primary">
								Documentos
							</h3>
						</div>
					</CardTitle>
					<CardDescription>
						Archivos y documentos del expediente
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<div>Cargando documentos...</div>}>
						<DocumentosExpediente expedienteId={Number(id)} pacienteId={pacienteId} />
					</Suspense>
				</CardContent>
			</Card>
		</div>
	)
}
