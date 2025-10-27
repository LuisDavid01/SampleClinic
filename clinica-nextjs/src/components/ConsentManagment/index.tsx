"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import {
	Search, Plus, Filter, FileText, Download, Edit, Trash2, Eye, Upload, PenTool, CalendarIcon, Check, ChevronsUpDown, X,
	ChevronRight,
	ChevronLeft,
	ChevronsLeft,
	ChevronsRight
} from 'lucide-react'
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { useQueries } from "@tanstack/react-query"

import { deleteConsentimiento, downloadConsentimiento, getConsentimientosbyUser } from "@/actions/consentimientos"

import { Archivo } from "@/types/Consent"
import { ConsentDialog } from "../ConsentForm"
import { EditConsentDialog } from "../EditConsentDialog"

export default function ConsentManagement({ expedienteId,
	pacienteId }:
	{
		expedienteId: number,
		pacienteId: number
	}) {



	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState("todos")
	const [treatmentFilter, setTreatmentFilter] = useState("todos")
	const [isConsentDialogOpen, setIsConsentDialogOpen] = useState(false)
	const [isEditConsentDialogOpen, setIsEditConsentDialogOpen] = useState(false)

	const [selectedConsent, setSelectedConsent] = useState<Archivo | null>(null)
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

	// New consent form state
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const results = useQueries({
		queries: [
			{
				queryKey: ['consentimientos', page, limit],
				queryFn: async () => {
					// Obtener el usuario actual desde la base de datos
					console.log("id del paciente", pacienteId)
					const res = await getConsentimientosbyUser(pacienteId, page, limit)
					console.log(res)
					return res.data;
				},
				staleTime: 60 * 1000,
			},

		]
	});
	const isLoading = results.some((r) => r.isLoading);
	const consentimientos = results[0].data ?? [];
	useEffect(() => {
		results[0].refetch()
	}, [expedienteId, pacienteId])




	const closeEditConsentDialog = () => {
		setIsEditConsentDialogOpen(false)
	}
	const closeConsentDialog = () => {
		setIsConsentDialogOpen(false)
	}


	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

				<Dialog open={isConsentDialogOpen} onOpenChange={setIsConsentDialogOpen}>
					<DialogTrigger asChild>
						<Button className="bg-primary hover:bg-primary cursor-pointer">
							<Plus className="w-4 h-4 mr-2" />
							Nuevo Consentimiento
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" >
						<ConsentDialog onClose={closeConsentDialog} expedienteId={expedienteId} pacienteId={pacienteId} />
					</DialogContent>
				</Dialog>
			</div>



			{/* Filters and Search */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="w-5 h-5" />
						Filtros y Búsqueda
					</CardTitle>
				</CardHeader>

				<CardContent className="p-6">
					<div className="flex flex-wrap gap-4">
						{/* Input de búsqueda */}
						<div className="w-full lg:flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground w-4 h-4" />
								<Input
									placeholder="Buscar por paciente, cédula o tratamiento..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-background border border-muted rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
								/>
							</div>
						</div>

						{/* Contenedor de selects */}
						<div className="flex flex-wrap gap-2 w-full lg:w-auto">
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-full sm:w-40">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="todos">Todos los estados</SelectItem>
									<SelectItem value="firmado">Firmados</SelectItem>
									<SelectItem value="pendiente">Pendientes</SelectItem>
									<SelectItem value="vencido">Vencidos</SelectItem>
								</SelectContent>
							</Select>

							<Select value={treatmentFilter} onValueChange={setTreatmentFilter}>
								<SelectTrigger className="w-full sm:w-48">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="todos">Todos los tratamientos</SelectItem>
									<SelectItem value="cirugía">Cirugía General</SelectItem>
									<SelectItem value="dental">Procedimiento Dental</SelectItem>
									<SelectItem value="anestesia">Anestesia</SelectItem>
									<SelectItem value="oncológico">Tratamiento Oncológico</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>
			{/* Consent List */}
			<div className="space-y-4">
				{

					consentimientos.length === 0 ? (
						<Card>
							<CardContent className="p-12 text-center">
								<FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
								<h3 className="text-lg font-medium mb-2">No se encontraron consentimientos</h3>
								<p className="text-muted-foreground mb-4">
									{searchTerm || statusFilter !== "todos" || treatmentFilter !== "todos"
										? "Intenta ajustar los filtros de búsqueda"
										: "Comienza creando tu primer consentimiento informado"
									}
								</p>
								{!searchTerm && statusFilter === "todos" && treatmentFilter === "todos" && (
									<p className="text-muted-foreground mb-4">No pudimos encontrar consentimientos </p>

								)}
							</CardContent>
						</Card>
					) : (
						consentimientos.map((consent: Archivo) => (
							<div
								key={consent.idArchivo + ' ' + consent.nombreOriginal}
								className="border border-border rounded-lg p-4 bg-card hover:bg-muted-foreground/10 transition-colors"
							>
								{/* Encabezado */}
								<div className="flex items-start justify-between mb-2">
									<div className="flex items-center gap-2 flex-wrap">
										<div className="flex items-center gap-2">
											<FileText className="w-4 h-4" />
											<span className="font-medium">{consent.nombreOriginal}</span>
										</div>
									</div>

									{/* Botones de acción */}
									<div className="flex gap-1">


										<Button
											size="sm"
											variant="ghost"
											className="h-8 w-8 p-0"
											onClick={() => {
												setSelectedConsent(consent)
												setIsViewDialogOpen(true)
											}}
										>
											<Eye className="h-4 w-4" />
										</Button>


										<Button size="sm" variant="ghost" className="h-8 w-8 p-0"
											onClick={async () => {

												const response = await downloadConsentimiento(pacienteId, consent.idArchivo)
												if (response.success === false) {
													alert(response.message)
													return
												}
												const blobArchivo = response.data

												const url = window.URL.createObjectURL(blobArchivo!)
												const link = document.createElement('a')

												link.href = url
												link.download = consent.nombreArchivo
												link.rel = 'noopener noreferrer' // Para seguridad

												// Append al body y click automático
												document.body.appendChild(link)
												link.click()

												// Cleanup inmediato
												document.body.removeChild(link)
												window.URL.revokeObjectURL(url)

											}}
										>
											<Download className="h-4 w-4" />
										</Button>

										<Button
											size="sm"
											variant="destructive"
											className="h-8 w-8 p-0 "
											onClick={() => {
												deleteConsentimiento(pacienteId, consent.idArchivo);
												results[0].refetch()
											}
											}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>

								{/* Detalles */}
								<div className="text-sm text-text-primary space-y-1">
									<p>
										<span className="font-medium">Descripción:</span>{" "}
										{consent.descripcion ?? 'sin descipción'}
									</p>
									<p>
										<span className="font-medium">Etiquetas:</span>{" "}
										{consent.etiquetas}
									</p>

									<p>
										<span className="font-medium">Creado:</span>{" "}
										{format(consent.fechaSubida, "dd 'de' MMMM 'de' yyyy", {
											locale: es,
										})}
									</p>
								</div>
							</div>
						))
					)}
				{/* Pagination */}
				<Card>
					<CardContent className="p-4">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

							{/* Selector de cantidad */}
							<div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
								<span className="text-muted-foreground">Mostrar</span>
								<Select defaultValue="10">
									<SelectTrigger className="w-20">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="10">10</SelectItem>
										<SelectItem value="25">25</SelectItem>
										<SelectItem value="50">50</SelectItem>
										<SelectItem value="100">100</SelectItem>
									</SelectContent>
								</Select>
								<span className="text-muted-foreground">
									de {2} registros
								</span>
							</div>

							{/* Controles de paginación */}
							<div className="flex items-center justify-center gap-1 sm:gap-2">
								<Button variant="outline" size="icon" className="h-8 w-8" disabled>
									<ChevronsLeft className="w-4 h-4" />
								</Button>
								<Button variant="outline" size="icon" className="h-8 w-8" disabled>
									<ChevronLeft className="w-4 h-4" />
								</Button>

								<span className="text-sm px-2 sm:px-4">
									Página 1 de 2
								</span>

								<Button variant="outline" size="icon" className="h-8 w-8" disabled>
									<ChevronRight className="w-4 h-4" />
								</Button>
								<Button variant="outline" size="icon" className="h-8 w-8" disabled>
									<ChevronsRight className="w-4 h-4" />
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
			{/* View Consent Dialog */}
			<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
				<DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">

					<EditConsentDialog
						onClose={closeEditConsentDialog}
						expedienteId={expedienteId}
						pacienteId={pacienteId}
						consentimiento={selectedConsent!}
					/>
				</DialogContent>
			</Dialog>
		</div>

	)
}
