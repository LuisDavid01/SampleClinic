'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  User,
   Filter,
   Search,
   ChevronRight,
   ChevronLeft,
   ChevronsLeft,
   ChevronsRight,
   LucideBookUser,
   PlusIcon,
   Edit,
   Trash2
} from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getDiagnosticosByExpediente, deleteDiagnostico } from "@/actions/diagnosticos"
import { getExpedienteByID } from "@/actions/expedientes"
import { Diagnostico } from "@/types/Expediente"
import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import DiagnosticoForm from "../DiagnosticoForm"

interface DiagnosticoTableProps {
	expedienteId: number
}

export default function DiagnosticoTable({ expedienteId }: DiagnosticoTableProps) {
	const { user } = useUser()
	const queryClient = useQueryClient()
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [editingDiagnostico, setEditingDiagnostico] = useState<Diagnostico | null>(null)

	// Obtener expediente
	const { data: expediente } = useQuery({
		queryKey: ['expediente', expedienteId],
		queryFn: async () => {
			return await getExpedienteByID(expedienteId)
		},
		staleTime: 10 * 60 * 1000,
	})

	// Obtener diagnósticos del expediente
	const { isLoading, data: diagnosticos = [] } = useQuery<Diagnostico[]>({
		queryKey: ['diagnosticos', expedienteId],
		queryFn: async () => {
			const res = await getDiagnosticosByExpediente(expedienteId)
			return res.evaluaciones || []
		},
		staleTime: 2 * 60 * 1000,
	})

	// Verificar permisos - solo fisioterapeutas y administradores pueden gestionar diagnósticos
	const canManageDiagnosticos = user?.publicMetadata?.role === 'fisioterapeuta' || user?.publicMetadata?.role === 'admin'

	const handleDelete = async (diagnosticoId: number) => {
		if (confirm('¿Estás seguro de que quieres eliminar este diagnóstico?')) {
			await deleteDiagnostico(diagnosticoId)
			queryClient.invalidateQueries({ queryKey: ['diagnosticos', expedienteId] })
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	}
	return (
		<div className="space-y-6">
			{/* Header con botón de crear */}
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
				{canManageDiagnosticos ? (
					<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
						<DialogTrigger asChild>
							<Button className="cursor-pointer w-full">
								<PlusIcon className="w-4 h-4 mr-2" />
								Nuevo diagnóstico
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>Nuevo Diagnóstico</DialogTitle>
								<DialogDescription>
									Crear un nuevo diagnóstico para este expediente.
								</DialogDescription>
							</DialogHeader>
							<DiagnosticoForm 
								expedienteId={expedienteId}
								expediente={expediente}
								onSuccess={() => {
									setIsCreateDialogOpen(false)
									queryClient.invalidateQueries({ queryKey: ['diagnosticos', expedienteId] })
								}}
							/>
						</DialogContent>
					</Dialog>
				) : (
					<div className="text-sm text-muted-foreground">
						Solo fisioterapeutas y administradores pueden crear diagnósticos
					</div>
				)}
			</div>
			{/* Loading state */}
			{isLoading && (
				<div className="text-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p className="mt-2 text-muted-foreground">Cargando diagnósticos...</p>
				</div>
			)}

			{/* No data state */}
			{!isLoading && diagnosticos.length === 0 && (
				<Card>
					<CardContent className="p-8 text-center">
						<LucideBookUser className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-medium mb-2">No hay diagnósticos</h3>
						<p className="text-muted-foreground mb-4">
							{canManageDiagnosticos 
								? 'Este expediente no tiene diagnósticos registrados. Crea el primero.'
								: 'Este expediente no tiene diagnósticos registrados.'
							}
						</p>
					</CardContent>
				</Card>
			)}

			{/* Desktop Table */}
			{!isLoading && diagnosticos.length > 0 && (
				<Card className="hidden lg:block">
					<CardContent className="p-0">
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Fecha</TableHead>
										<TableHead>Doctor</TableHead>
										<TableHead>Diagnóstico Principal</TableHead>
										<TableHead>Síntomas</TableHead>
										<TableHead>Evaluación</TableHead>
										<TableHead>Acciones</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{diagnosticos.map((diagnostico) => (
										<TableRow key={diagnostico.idEvaluacion} className="hover:bg-muted/50">
											<TableCell className="font-mono text-sm">
												{formatDate(diagnostico.fecha)}
											</TableCell>
											<TableCell className="font-medium">
												<div className="flex items-center gap-2">
													{diagnostico.doctor?.nombre} {diagnostico.doctor?.apellido1}
												</div>
											</TableCell>
											<TableCell className="max-w-xs">
												<div className="truncate" title={diagnostico.diagnosticoPrincipal}>
													{diagnostico.diagnosticoPrincipal}
												</div>
											</TableCell>
											<TableCell className="max-w-xs">
												<div className="truncate" title={diagnostico.sintomasReportados || 'No especificado'}>
													{diagnostico.sintomasReportados || 'No especificado'}
												</div>
											</TableCell>
											<TableCell className="max-w-xs">
												<div className="truncate" title={diagnostico.evaluacionFisica || 'No especificado'}>
													{diagnostico.evaluacionFisica || 'No especificado'}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex gap-2">
													{canManageDiagnosticos && (
														<>
															<Button 
																variant="outline" 
																size="sm"
																onClick={() => setEditingDiagnostico(diagnostico)}
															>
																<Edit className="w-4 h-4" />
															</Button>
															{/* <Button 
																variant="destructive" 
																size="sm"
																onClick={() => handleDelete(diagnostico.idEvaluacion)}
															>
																<Trash2 className="w-4 h-4" />
															</Button> */}
														</>
													)}
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Mobile Cards */}
			{!isLoading && diagnosticos.length > 0 && (
				<div className="lg:hidden space-y-4">
					{diagnosticos.map((diagnostico) => (
						<Card key={diagnostico.idEvaluacion}>
							<CardContent className="p-4">
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center gap-2">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
											<User className="h-4 w-4 text-muted-foreground" />
										</div>
										<div>
											<h3 className="font-medium">
												{diagnostico.doctor?.nombre} {diagnostico.doctor?.apellido1}
											</h3>
											<p className="text-sm text-muted-foreground">
												{formatDate(diagnostico.fecha)}
											</p>
										</div>
									</div>
								</div>
								
								<div className="space-y-3">
									<div className="text-sm">
										<p className="text-muted-foreground mb-1">Diagnóstico Principal:</p>
										<p className="font-medium">{diagnostico.diagnosticoPrincipal}</p>
									</div>
									
									{diagnostico.sintomasReportados && (
										<div className="text-sm">
											<p className="text-muted-foreground mb-1">Síntomas Reportados:</p>
											<p className="text-sm">{diagnostico.sintomasReportados}</p>
										</div>
									)}
									
									{diagnostico.evaluacionFisica && (
										<div className="text-sm">
											<p className="text-muted-foreground mb-1">Evaluación Física:</p>
											<p className="text-sm">{diagnostico.evaluacionFisica}</p>
										</div>
									)}
									
									{diagnostico.planTratamiento && (
										<div className="text-sm">
											<p className="text-muted-foreground mb-1">Plan de Tratamiento:</p>
											<p className="text-sm">{diagnostico.planTratamiento}</p>
										</div>
									)}
									
									{diagnostico.recomendaciones && (
										<div className="text-sm">
											<p className="text-muted-foreground mb-1">Recomendaciones:</p>
											<p className="text-sm">{diagnostico.recomendaciones}</p>
										</div>
									)}
									
									{canManageDiagnosticos && (
										<div className="flex gap-2 pt-2">
											<Button 
												variant="outline" 
												size="sm"
												onClick={() => setEditingDiagnostico(diagnostico)}
												className="flex-1"
											>
												<Edit className="w-4 h-4 mr-2" />
												Editar
											</Button>
											<Button 
												variant="destructive" 
												size="sm"
												onClick={() => handleDelete(diagnostico.idEvaluacion)}
												className="flex-1"
											>
												<Trash2 className="w-4 h-4 mr-2" />
												Eliminar
											</Button>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Dialog para editar diagnóstico */}
			{editingDiagnostico && (
				<Dialog open={!!editingDiagnostico} onOpenChange={() => setEditingDiagnostico(null)}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Editar Diagnóstico</DialogTitle>
							<DialogDescription>
								Modificar la información del diagnóstico seleccionado.
							</DialogDescription>
						</DialogHeader>
						<DiagnosticoForm 
							expedienteId={expedienteId}
							expediente={expediente}
							diagnostico={editingDiagnostico}
							isEditing={true}
							onSuccess={() => {
								setEditingDiagnostico(null)
								queryClient.invalidateQueries({ queryKey: ['diagnosticos', expedienteId] })
							}}
						/>
					</DialogContent>
				</Dialog>
			)}
		</div>
	)
}