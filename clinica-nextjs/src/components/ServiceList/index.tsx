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
	RefreshCw, Filter, Search, ChevronRight, ChevronLeft, Package
} from "lucide-react"
import { useNotification } from "@/components/UseNotification"

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

	const { isLoading, data = [], refetch } = useQuery<Servicio[]>({
		queryKey: ['servicios', page, search, limit],
		queryFn: async () => {
			// adapta a tu shape: res.servicios || res.items || res
			const res = await getServicios(page, search, limit)
			return (res?.servicios)
		},
		staleTime: 60 * 1000,
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
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground w-4 h-4" />
								<input
									placeholder="Buscar servicios..."
									className="w-full pl-10 pr-4 py-2.5 bg-background border border-muted rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>
						</div>

						<Select defaultValue="all">
							<SelectTrigger>
								<SelectValue placeholder="Categoría" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todas las categorías</SelectItem>
							</SelectContent>
						</Select>

						<Select defaultValue="all">
							<SelectTrigger>
								<SelectValue placeholder="Estado" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos los estados</SelectItem>
								<SelectItem value="activo">Activo</SelectItem>
								<SelectItem value="inactivo">Inactivo</SelectItem>
							</SelectContent>
						</Select>

						<div className="flex gap-2">

							<Button variant="outline" size="icon" onClick={() => refetch()}>
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
									<TableHead>Servicio</TableHead>
									<TableHead>Estado</TableHead>
									<TableHead>Precio</TableHead>
									<TableHead>Actualizado</TableHead>
									<TableHead>Acciones</TableHead>
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
												<TableCell className="font-medium">
													<div className="flex items-center gap-2">
														<Package className="w-4 h-4 text-muted-foreground" />
														<div>
															<div>{service.nombre}</div>
															<div className="text-xs text-muted-foreground">{service.detalle || 'Sin descripción'}</div>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<Badge className={cfg?.color}>{cfg?.label}</Badge>
												</TableCell>
												<TableCell>{formatCRC(service.precio)}</TableCell>
												<TableCell className="text-sm">{formatRelative((service as any).updatedAt)}</TableCell>
												<TableCell>
													<Link href={`/admin/services/${service.id}/edit`}>
														<Button variant="outline" size="sm" className="mr-3">Editar</Button>
													</Link>
													<Button
														variant="destructive" size="sm"
														onClick={async () => {
															await deleteServicio(service.id)
															await refetch()
															showNotification?.({
																title: "Servicio eliminado",
																message: `Se eliminó "${service.nombre}"`,
																type: "success",
															})
														}}
													>
														Inactivar
													</Button>
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
												<p className="text-sm text-muted-foreground">{service.detalle || 'Sin descripción'}</p>
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
											<p className="text-sm font-medium">{formatRelative((service as any).updatedAt)}</p>
										</div>

										<div className="flex gap-2 pt-2">
											<Link href={`/admin/services/${service.id}/edit`} className="flex-1">
												<Button variant="outline" className="w-full mb-3">Editar</Button>
											</Link>
											<Button
												variant="destructive" className="w-full mb-3"
												onClick={async () => {
													await deleteServicio(service.id)
													await refetch()
													showNotification?.({
														title: "Servicio eliminado",
														message: `Se eliminó "${service.nombre}"`,
														type: "success",
													})
												}}
											>
												Inactivar
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
		</>
	)
}
