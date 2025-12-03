'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {

	User,
	RefreshCw,
	Filter,
	Search,
	ChevronRight,
	ChevronLeft,
} from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import { Expediente } from "@/types/Expediente"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteExpediente, getExpedientes } from "@/actions/expedientes"
import { useState } from "react"
import { useExpedientesRefresh } from "@/hooks/useExpedientesRefresh"
import { useNotification } from "../UseNotification";
// Mock data






const statusConfig = {
	activo: {
		label: "Activo",
		color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
	},
	inactivo: {
		label: "Inactivo",
		color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
	}
}

export const ExpedientesList = () => {
	const { showNotification } = useNotification()
	//	const apiClient = useApiClient();
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [search, setSearch] = useState("");
	const queryClient = useQueryClient();
	const { refreshExpedientes } = useExpedientesRefresh();

	// se trae los datos del backend
	const { isLoading, data = [], refetch } = useQuery<Expediente[]>({
		queryKey: [`expedientes`, page, search, limit],
		queryFn: async () => {
			const res = await getExpedientes(page, search, limit);
			console.log(res);
			return res.expedientes
		},
		staleTime: 1 * 60 * 1000,

	})

	// El hook useExpedientesRefresh maneja automáticamente la invalidación
	return (
		<>
			{/* Filters */}
			<Card className="w-full overflow-hidden">
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Filter className="w-5 h-5" />
							Filtros y Búsqueda
						</div>
						<Button 
							variant="outline" 
							size="sm"
							onClick={refreshExpedientes}
							className="flex items-center gap-2"
						>
							<RefreshCw className="w-4 h-4" />
							Actualizar
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent className="overflow-visible">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
						{/* Búsqueda - Ocupa 2 columnas en desktop */}
						<div className="lg:col-span-2 min-w-0">
							<div className="relative w-full">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground w-4 h-4" />
								<input
									placeholder="Buscar en registros..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-background border border-muted rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
								/>
							</div>
						</div>

						{/* Diagnóstico - 1 columna */}
						<div className="min-w-0">
							<Select value="all">
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Diagnostico" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todas los diagnosticos</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Usuario - 1 columna */}
						<div className="min-w-0">
							<Select value="all">
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Usuario" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todos los doctores</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Estado y botón de refresh - 1 columna, flex en desktop, columna completa en móvil */}
						<div className="flex flex-col sm:flex-row gap-2 w-full min-w-0">
							<Select defaultValue="all">
								<SelectTrigger className="w-full sm:flex-1 min-w-0">
									<SelectValue placeholder="Estado" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todos los estados</SelectItem>
									<SelectItem value="exitoso">Activo</SelectItem>
									<SelectItem value="fallido">Inactivo</SelectItem>
								</SelectContent>
							</Select>

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
					<div >
						<Table className=" overflow-x-auto">
							<TableHeader>
								<TableRow>
									<TableHead className="text-center">Paciente</TableHead>
									<TableHead className="text-center">Estado</TableHead>
									<TableHead className="text-center">Médico</TableHead>
									<TableHead className="text-center">Actualizado</TableHead>
									<TableHead className="text-center">Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>

								{isLoading ? (
									<TableRow>
										<TableCell colSpan={5} className="text-center">
											Cargando...
										</TableCell>
									</TableRow>
								) :

									!data || data.length === 0 ? (
										<TableRow>
											<TableCell colSpan={5} className="text-center">No hay registros</TableCell>
										</TableRow>
									) :

										data.map((file) => {
											const statusConfig_ = statusConfig[file.estado as keyof typeof statusConfig]

											return (
												<TableRow key={file.idExpediente} className="hover:bg-muted/50">
													<TableCell className="text-center font-medium">
															{file.paciente.nombre + " " + file.paciente.apellido1}
													</TableCell>
													<TableCell className="flex justify-center items-center">
														<Badge className={statusConfig_?.color}>
															{statusConfig_?.label}
														</Badge>
													</TableCell>
													<TableCell className="text-center">
													{file.medico?.nombre ?? 'no hay medico'}
													</TableCell>
													<TableCell className=" text-center text-sm">
														{formatRelativeTime(file.fechaCreacion)}
													</TableCell>
													<TableCell>
														<div className="flex justify-center items-center gap-2">
															<Link href={`files/${file.idExpediente}/view`}>
																<Button variant="outline" size="sm">
																	Ver
																</Button>
															</Link>

															<Button variant="destructive" size="sm"
																onClick={async () => {
																	const result = await deleteExpediente(file.idExpediente);
																	if (result.success) {
																		showNotification({
																			type: 'success',
																			title: 'Éxito',
																			message: result.message || 'Expediente inactivado correctamente'
																		});
																	} else {
																		showNotification({
																			type: 'error',
																			title: 'Error',
																			message: result.message || 'Error al inactivar el expediente'
																		});
																	}
																	refetch();
																}}
															>
																Archivar
															</Button>
														</div>
													</TableCell>
												</TableRow>
											)
										})


								}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card >

			{/* Mobile Cards */}
			< div className="lg:hidden space-y-4" >
				{isLoading ? (
					<div className="text-center">
						cargando...
					</div>
				) :

					!data || data.length === 0 ? (
						<div className="text-center">
							No hay registros
						</div>
					) : (

						data.map((file) => {
							const statusConfig_ = statusConfig[file.estado as keyof typeof statusConfig]

							return (
								<Card key={file.idExpediente}>
									<CardContent className="p-4">
										<div className="flex items-start justify-between mb-3">
											<div className="flex items-center gap-2">
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
													<User className="h-4 w-4 text-muted-foreground" />
												</div>
												<div>
													<h3 className="font-medium">{file.paciente.nombre + " " + file.paciente.apellido1}</h3>
													<p className="text-sm text-muted-foreground">{file.idMedico}</p>
												</div>
											</div>
											<Badge className={statusConfig_?.color}>
												{statusConfig_?.label}
											</Badge>
										</div>

										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<p className="text-sm text-muted-foreground">Actualizado</p>
												<p className="text-sm font-medium">{file.fechaCreacion}</p>
											</div>

											<div className="flex gap-2 pt-2">
												<Link href={`files/${file.idExpediente}/edit`} className="flex-1">
													<Button variant="outline" className="w-full mb-3">
														Ver expediente
													</Button>
												</Link>
												<Button variant="destructive" size="sm" className="w-full mb-3"
													onClick={async () => {
														const result = await deleteExpediente(file.idExpediente);
														if (result.success) {
															showNotification({
																type: 'success',
																title: 'Éxito',
																message: result.message || 'Expediente inactivado correctamente'
															});
														} else {
															showNotification({
																type: 'error',
																title: 'Error',
																message: result.message || 'Error al inactivar el expediente'
															});
														}
														// Usar la función de refresh del hook
														refreshExpedientes();
													}}

												>
													Inactivar
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							)
						}))
				}
			</div >

			{/* Pagination */}
			< Card >
				<CardContent className="p-4">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">Mostrar</span>
							<Select defaultValue={limit.toString()} onValueChange={(value) => {
								setLimit(parseInt(value));
							}}>
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
								de {data.length} registros
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

							<span className="text-sm px-4">
								Página {page}
							</span>

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
			</Card >
		</>
	)
}
