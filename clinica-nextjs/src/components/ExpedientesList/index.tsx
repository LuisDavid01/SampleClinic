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
	ChevronsLeft,
	ChevronsRight
} from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import { Expediente } from "@/types/Expediente"
import { useQuery } from "@tanstack/react-query"
import { useApiClient } from "@/utils/apiClient"
import { deleteExpediente, getExpedientes } from "@/actions/expedientes"
import { useState } from "react"
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
	const apiClient = useApiClient();
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [search, setSearch] = useState("");

	// se trae los datos del backend
	const { isLoading, data = [] } = useQuery<Expediente[]>({
		queryKey: [`expedientes-${page}-${search}-${limit}`],
		queryFn: () => getExpedientes(page, search, limit),
		staleTime: 2 * 60 * 1000,

	})
	return (
		<>
			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="w-5 h-5" />
						Filtros y Búsqueda
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
						<div className="lg:col-span-2">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground w-4 h-4" />
								<input
									placeholder="Buscar en registros..."
									className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-background border border-muted rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
								/>
							</div>
						</div>

						<Select value="all" >
							<SelectTrigger>
								<SelectValue placeholder="Diagnostico" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todas los diagnosticos</SelectItem>

							</SelectContent>
						</Select>

						<Select value="all">
							<SelectTrigger>
								<SelectValue placeholder="Usuario" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos los doctores</SelectItem>

							</SelectContent>
						</Select>

						<div className="flex gap-2">
							<Select defaultValue="all">
								<SelectTrigger>
									<SelectValue placeholder="Estado" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todos los estados</SelectItem>
									<SelectItem value="exitoso">Activo</SelectItem>
									<SelectItem value="fallido">Inactivo</SelectItem>
								</SelectContent>
							</Select>

							<Button variant="outline" size="icon">
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
									<TableHead>Paciente</TableHead>
									<TableHead>Estado</TableHead>
									<TableHead>Médico</TableHead>
									<TableHead>Actualizado</TableHead>
									<TableHead>Acciones</TableHead>
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
												<TableRow key={file.id} className="hover:bg-muted/50">
													<TableCell className="font-medium">
														<div className="flex items-center gap-2">
															{file.idPaciente}
														</div>
													</TableCell>
													<TableCell>
														<Badge className={statusConfig_?.color}>
															{statusConfig_?.label}
														</Badge>
													</TableCell>
													<TableCell>{file.idDoctor}</TableCell>
													<TableCell className=" text-sm">
														{formatRelativeTime(file.updatedAt)}
													</TableCell>
													<TableCell>
														<Link href={`data/${file.id}/edit`}>
															<Button variant="outline" size="sm" className="mr-3">
																Ver
															</Button>
														</Link>


														<Button variant="destructive" size="sm" className="mr-3"
															onClick={() => {
																deleteExpediente(file.id);
															}}
														>
															Eliminar
														</Button>
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
								<Card key={file.id}>
									<CardContent className="p-4">
										<div className="flex items-start justify-between mb-3">
											<div className="flex items-center gap-2">
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
													<User className="h-4 w-4 text-muted-foreground" />
												</div>
												<div>
													<h3 className="font-medium">{file.idPaciente}</h3>
													<p className="text-sm text-muted-foreground">{file.idDoctor}</p>
												</div>
											</div>
											<Badge className={statusConfig_?.color}>
												{statusConfig_?.label}
											</Badge>
										</div>

										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<p className="text-sm text-muted-foreground">Actualizado</p>
												<p className="text-sm font-medium">{file.updatedAt.getDate()}</p>
											</div>

											<div className="flex gap-2 pt-2">
												<Link href={`files/${file.id}/edit`} className="flex-1">
													<Button variant="outline" className="w-full mb-3">
														Ver expediente
													</Button>
												</Link>
												<Button variant="destructive" size="sm" className="w-full mb-3"
													onClick={() => {
														deleteExpediente(file.id);
													}}
												>
													Eliminar
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
							<span className="text-sm text-muted-foreground">
								de {2} registros
							</span>
						</div>

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"

								disabled
							>
								<ChevronsLeft className="w-4 h-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"

								disabled
							>
								<ChevronLeft className="w-4 h-4" />
							</Button>

							<span className="text-sm px-4">
								Página 1 de 2
							</span>

							<Button
								variant="outline"
								size="sm"
								disabled
							>
								<ChevronRight className="w-4 h-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled
							>
								<ChevronsRight className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card >
		</>
	)
}
