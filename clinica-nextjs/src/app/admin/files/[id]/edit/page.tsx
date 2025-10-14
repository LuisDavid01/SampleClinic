import { ArrowLeftIcon, Edit, FileSignatureIcon, FileText, LucideBookUser } from 'lucide-react'
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
import DiagnosticoTable from '@/components/DiagnosticoTable'
import AntecedentesManager from '@/components/AntecedentesManager'

import { ExpedienteByID } from '@/components/ExpedienteByID'
import { getExpedienteByID } from '@/actions/expedientes'

export default async function EditFilePage({ params }) {
	const { id } = await params
	
	// Obtener información del expediente para extraer el ID del paciente
	const expediente = await getExpedienteByID(Number(id))
	const pacienteId = expediente?.idPaciente
	return (
		<div className="space-y-6 p-6 bg-background min-h-screen">
			<Link
				href="/admin/files"
				className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
			>
				<ArrowLeftIcon size={16} className="mr-1" />
				Regresar a expedientes
			</Link>

			<Card className="bg-card shadow-sm">
				<CardHeader className="pb-4">
					<CardTitle>
						<div className="flex items-center gap-2">
							<Edit className="w-5 h-5 text-text-primary" />
							<h2 className="text-lg lg:text-2xl font-semibold text-text-primary">
								Editar expediente
							</h2>
						</div>
					</CardTitle>
					<CardDescription>Información general del paciente</CardDescription>
				</CardHeader>
				<CardContent>
					<ExpedienteByID id={id} />
				</CardContent>
			</Card>

			<h2 className='pb-4 text-xl md:text-3xl font-semibold text-center'>Contenidos del expediente</h2>

			{/* Grid para Diagnósticos y Consentimientos */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Diagnósticos y Consultas */}
				<Card className="bg-card/50 shadow-sm">
					<CardHeader className="pb-4">
						<CardTitle>
							<div className="flex items-center gap-2">
								<LucideBookUser className="w-5 h-5 text-text-primary" />
								<h2 className="text-lg font-semibold text-text-primary">
									Diagnosticos & consultas
								</h2>
							</div>
						</CardTitle>
						<CardDescription>
							Diagnosticos del paciente
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Suspense fallback={<div>loading...</div>}>
							<DiagnosticoTable expedienteId={Number(id)} />
						</Suspense>
					</CardContent>
				</Card>

				{/* Gestión de Consentimientos */}
				<Card className="bg-card/50 shadow-sm">
					<CardHeader className="pb-4">
						<CardTitle>
							<div className="flex items-center gap-2">
								<FileSignatureIcon className="w-5 h-5 text-text-primary" />
								<h2 className="text-lg font-semibold text-text-primary">
									Consentimiento del paciente
								</h2>
							</div>
						</CardTitle>
						<CardDescription>
							Consentimiento del paciente
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Suspense fallback={<div>loading...</div>}>
							<ConsentManagement />
						</Suspense>
					</CardContent>
				</Card>
			</div>

			{/* Antecedentes Clínicos */}
			<Card className="bg-card/50 shadow-sm">
				<CardHeader className="pb-4">
					<CardTitle>
						<div className="flex items-center gap-2">
							<FileSignatureIcon className="w-5 h-5 text-text-primary" />
							<h2 className="text-lg font-semibold text-text-primary">
								Antecedentes Clínicos
							</h2>
						</div>
					</CardTitle>
					<CardDescription>Historial médico completo del paciente</CardDescription>
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

			{/* Documentos del Expediente */}
			<Card className="bg-card/50 shadow-sm">
				<CardHeader className="pb-4">
					<CardTitle>
						<div className="flex items-center gap-2">
							<FileText className="w-5 h-5 text-text-primary" />
							<h2 className="text-lg font-semibold text-text-primary">
								Documentos del expediente
							</h2>
						</div>
					</CardTitle>
					<CardDescription>Documentos guardados</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<div>loading...</div>}>
						<DocumentosExpediente />
					</Suspense>
				</CardContent>
			</Card>
		</div>
	)
}
