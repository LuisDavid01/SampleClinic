'use client'

import Link from "next/link"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getServicios, deleteServicio } from "@/actions/servicios"
import { Servicio } from "@/types/Service"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
	RefreshCw, Filter, Search, ChevronRight, ChevronLeft, Package, Plus
} from "lucide-react"
import { useNotification } from "@/components/UseNotification"
import EditServiceDialog from "@/components/EditServiceDialog"
import NewServiceDialog from "@/components/NewServiceDialog"

// --- util pequeño para moneda y fecha ---
const formatCRC = (n: number) =>
	new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(n)

const formatRelative = (date?: string | Date) => {
	if (!date) return "—"
	const d = typeof date === "string" ? new Date(date) : date
	const diff = (Date.now() - d.getTime()) / 1000
	if (diff < 60) return "hace unos segundos"
	if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
	if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
	return d.toLocaleDateString("es-CR")
}

// para pintar estado (acepta 'Activo'/'Inactivo' o minúsculas)
const statusConfig = {
	activo: { label: "Activo", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
	inactivo: { label: "Inactivo", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" }
} as const

export default function ServiceList() {
	const { showNotification } = useNotification?.() ?? { showNotification: () => { } }
	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(10)
	const [search, setSearch] = useState("")
	const [editingService, setEditingService] = useState<Servicio | null>(null)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isNewServiceDialogOpen, setIsNewServiceDialogOpen] = useState(false)
	const [processingServiceId, setProcessingServiceId] = useState<number | null>(null)

	const { isLoading, data = [], refetch } = useQuery<Servicio[]>({
		queryKey: ['servicios', page, search, limit],
		queryFn: async () => {
			const res = await getServicios(page, search, limit)
			// Transformar los datos del backend al formato esperado por el frontend
			const servicios = res?.servicios || []
			return servicios.map((servicio: any) => {


				return {
					id: servicio.idServicio,
					nombre: servicio.nombreServicio,
					detalle: servicio.descripcion || '',
					precio: servicio.precio ? Number(servicio.precio) : 0,
					estado: servicio.activo ? 'Activo' : 'Inactivo' as 'Activo' | 'Inactivo',
					fechaModificacion: servicio.fechaModificacion || servicio.fechaActualizacion || servicio.fechaCreacion || null
				}
			})
		},
		staleTime: 60 * 1000,
	})

	return (
		<>
			{/* Filters */}
			<Card className="w-full overflow-hidden">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="w-5 h-5" />
						Filtros y Búsqueda
					</CardTitle>
				</CardHeader>
				<CardContent className="overflow-visible">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
						{/* Búsqueda - Ocupa 2 columnas en desktop */}
						<div className="lg:col-span-2 min-w-0">
							<div className="relative w-full">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground w-4 h-4" />
								<input
									placeholder="Buscar servicios..."
									className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-background border border-muted rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>
						</div>

						{/* Categoría - 1 columna */}
						<div className="min-w-0">
							<Select defaultValue="all">
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Categoría" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todas las categorías</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Estado - 1 columna */}
						<div className="min-w-0">
							<Select defaultValue="all">
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Estado" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todos los estados</SelectItem>
									<SelectItem value="activo">Activo</SelectItem>
									<SelectItem value="inactivo">Inactivo</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Botones de acción - 1 columna, flex en desktop, columna completa en móvil */}
						<div className="flex flex-col sm:flex-row gap-2 w-full min-w-0">
							<Button 
								variant="default" 
								onClick={() => setIsNewServiceDialogOpen(true)}
								className="flex items-center justify-center gap-2 w-full sm:flex-1 min-w-0"
							>
								<Plus className="w-4 h-4 flex-shrink-0" />
								<span className="hidden sm:inline truncate">Nuevo Servicio</span>
								<span className="sm:hidden">Nuevo</span>
							</Button>
							<Button 
								variant="outline" 
								size="icon" 
								onClick={() => refetch()}
								className="flex-shrink-0 aspect-square w-full sm:w-auto"
							>
								<RefreshCw className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Desktop Table */}
			<Card className="hidden lg:block">
				<CardContent className="p-0">
					<div>
						<Table className="overflow-x-auto">
							<TableHeader>
								<TableRow>
									<TableHead className="max-w-[200px]">Servicio</TableHead>
									<TableHead className="w-[100px]">Estado</TableHead>
									<TableHead className="w-[120px]">Precio</TableHead>
									<TableHead className="w-[140px]">Actualizado</TableHead>
									<TableHead className="w-[180px]">Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={5} className="text-center">Cargando...</TableCell>
									</TableRow>
								) : !data || data.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="text-center">No hay servicios</TableCell>
									</TableRow>
								) : (
									data.map((service, index) => {
										const key = String(service.estado).toLowerCase() as 'activo' | 'inactivo'
										const cfg = statusConfig[key]
										return (
											<TableRow key={`service-${index}`} className="hover:bg-muted/50">
												<TableCell className="font-medium max-w-[300px]">
													<div className="flex items-center gap-2">
														<Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
														<div className="min-w-0 flex-1">
															<div className="truncate">{service.nombre}</div>
															<div className="text-xs text-muted-foreground truncate">{service.detalle || 'Sin descripción'}</div>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<Badge className={cfg?.color}>{cfg?.label}</Badge>
												</TableCell>
												<TableCell>{formatCRC(service.precio)}</TableCell>
												<TableCell className="text-sm">{formatRelative(service.fechaModificacion)}</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Button 
															variant="outline" 
															size="sm" 
															className="w-[90px]"
															onClick={() => {
																setEditingService(service)
																setIsEditDialogOpen(true)
															}}
														>
															Editar
														</Button>
														<Button
															variant={service.estado === 'Activo' ? "destructive" : "default"} 
															size="sm"
															className="w-[90px]"
															disabled={processingServiceId === service.id}
															onClick={async () => {
																setProcessingServiceId(service.id)
																try {
																	const result = await deleteServicio(service.id)
																	if (result.success) {
																		showNotification?.({
																			title: service.estado === 'Activo' ? "Servicio inactivado" : "Servicio activado",
																			message: result.message || (service.estado === 'Activo' ? `Se inactivó "${service.nombre}"` : `Se activó "${service.nombre}"`),
																			type: "success",
																		})
																	} else {
																		showNotification?.({
																			title: "Error",
																			message: result.message || `Error al ${service.estado === 'Activo' ? 'inactivar' : 'activar'} "${service.nombre}"`,
																			type: "error",
																		})
																	}
																	await refetch()
																} finally {
																	setProcessingServiceId(null)
																}
															}}
														>
															{processingServiceId === service.id ? (
																<div className="flex items-center gap-1">
																	<div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
																</div>
															) : (
																service.estado === 'Activo' ? 'Inactivar' : 'Activar'
															)}
														</Button>
													</div>
												</TableCell>
											</TableRow>
										)
									})
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* Mobile Cards */}
			<div className="lg:hidden space-y-4">
				{isLoading ? (
					<div className="text-center">Cargando...</div>
				) : !data || data.length === 0 ? (
					<div className="text-center">No hay servicios</div>
				) : (
					data.map((service, index) => {
						const key = String(service.estado).toLowerCase() as 'activo' | 'inactivo'
						const cfg = statusConfig[key]
						return (
							<Card key={`service-card-${index}`} >
								<CardContent className="p-4">
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center gap-2">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
												<Package className="h-4 w-4 text-muted-foreground" />
											</div>
											<div>
												<h3 className="font-medium">{service.nombre}</h3>
												<p className="text-sm text-muted-foreground line-clamp-2">{service.detalle || 'Sin descripción'}</p>
											</div>
										</div>
										<Badge className={cfg?.color}>{cfg?.label}</Badge>
									</div>

									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<p className="text-sm text-muted-foreground">Precio</p>
											<p className="text-sm font-medium">{formatCRC(service.precio)}</p>
										</div>
										<div className="flex items-center justify-between">
											<p className="text-sm text-muted-foreground">Actualizado</p>
											<p className="text-sm font-medium">{formatRelative(service.fechaModificacion)}</p>
										</div>

										<div className="flex gap-2 pt-2">
											<Button 
												variant="outline" 
												className="w-full mb-3"
												onClick={() => {
													setEditingService(service)
													setIsEditDialogOpen(true)
												}}
											>
												Editar
											</Button>
											<Button
												variant={service.estado === 'Activo' ? "destructive" : "default"} 
												className="w-full mb-3"
												disabled={processingServiceId === service.id}
												onClick={async () => {
													setProcessingServiceId(service.id)
													try {
														const result = await deleteServicio(service.id)
														if (result.success) {
															showNotification?.({
																title: service.estado === 'Activo' ? "Servicio inactivado" : "Servicio activado",
																message: result.message || (service.estado === 'Activo' ? `Se inactivó "${service.nombre}"` : `Se activó "${service.nombre}"`),
																type: "success",
															})
														} else {
															showNotification?.({
																title: "Error",
																message: result.message || `Error al ${service.estado === 'Activo' ? 'inactivar' : 'activar'} "${service.nombre}"`,
																type: "error",
															})
														}
														await refetch()
													} finally {
														setProcessingServiceId(null)
													}
												}}
											>
												{processingServiceId === service.id ? (
													<div className="flex items-center justify-center gap-2">
														<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
														<span>Procesando...</span>
													</div>
												) : (
													service.estado === 'Activo' ? 'Inactivar' : 'Activar'
												)}
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						)
					})
				)}
			</div>

			{/* Pagination */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">Mostrar</span>
							<Select defaultValue={String(limit)} onValueChange={(v) => setLimit(parseInt(v))}>
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
							<span className="text-sm text-muted-foreground">
								de {data.length} servicios
							</span>
						</div>

						<div className="flex items-center gap-2">
							<Button
								className="cursor-pointer"
								variant="outline"
								size="sm"
								disabled={page <= 1}
								onClick={() => setPage(page - 1)}
							>
								<ChevronLeft className="w-4 h-4" />
							</Button>

							<span className="text-sm px-4">Página {page}</span>

							<Button
								className="cursor-pointer"
								variant="outline"
								size="sm"
								disabled={data.length < limit}
								onClick={() => setPage(page + 1)}
							>
								<ChevronRight className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Edit Service Dialog */}
			{editingService && (
				<EditServiceDialog
					servicio={editingService}
					open={isEditDialogOpen}
					onOpenChange={(open) => {
						setIsEditDialogOpen(open)
						if (!open) {
							setEditingService(null)
							refetch()
						}
					}}
				/>
			)}

			{/* New Service Dialog */}
			<NewServiceDialog
				open={isNewServiceDialogOpen}
				onOpenChange={(open) => {
					setIsNewServiceDialogOpen(open)
					if (!open) {
						refetch()
					}
				}}
			/>
		</>
	)
}
