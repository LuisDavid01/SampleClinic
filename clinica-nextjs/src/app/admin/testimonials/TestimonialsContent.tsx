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
	PlusIcon,
	Folder,
	User,
	RefreshCw,
	Filter,
	Search,
	ChevronRight,
	ChevronLeft,
	ChevronsLeft,
	ChevronsRight,
	Star,
	Loader2,
	Eye,
	EyeOff,
	Globe,
} from "lucide-react"
import { cn, formatRelativeTime } from "@/lib/utils"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { deleteTestimony, getTestimonies, publishTestimony, unpublishTestimony, getTestimony } from "@/actions/historiasExito"
import { HistoriaExito } from "@/types/Testimony"
import EditTestimonyDialog from "@/components/EditTestimonyDialog"

const statusConfig = {
	true: {
		label: "Activo",
		color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
	},
	false: {
		label: "Inactivo",
		color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
	}
}

export default function TestimonialsContent() {
	const queryClient = useQueryClient()
	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(10)
	const [search, setSearch] = useState("")
	const [published, setPublished] = useState<boolean | undefined>(undefined)
	const [ratingSearch, setRatingSearch] = useState<number>(0)
	const [processingTestimonyId, setProcessingTestimonyId] = useState<number | null>(null)
	const [editingTestimony, setEditingTestimony] = useState<HistoriaExito | null>(null)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const { isLoading, data, error } = useQuery({
		queryKey: ['testimonials', page, limit, search, published],
		queryFn: async () => {
			const res = await getTestimonies(page, limit, search, published)
			console.log(res.historias);
			return res
		},
		staleTime: 60 * 1000
	}
	)
	const filteredTestimonies = (
		data?.historias?.filter((testimonio: HistoriaExito) =>
			(ratingSearch === 0 || testimonio.rating === ratingSearch)
		)

	);
	return (
		<div className="min-h-screen bg-background p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
							<Star className="h-6 w-6 fill-accent text-accent" />
						</div>
						<div>
							<h1 className="text-3xl font-bold">Testimonios</h1>
							<p className="text-muted-foreground">
								Modera los testimonios que envian los pacientes
							</p>
						</div>
					</div>

					<Link href="/admin/testimonials/new">
						<Button className="cursor-pointer">
							<PlusIcon className="w-4 h-4 mr-2" />
							Nuevo testimonio
						</Button>
					</Link>
				</div>

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
										placeholder="Buscar en registros..."
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-background border border-muted rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
									/>
								</div>
							</div>

							{/* Usuarios - 1 columna */}
							<div className="min-w-0">
								<Select defaultValue="all">
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Usuarios" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Todas los Usuarios</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Rating - 1 columna */}
							<div className="min-w-0">
								<Select 
									value={ratingSearch.toString()}
									onValueChange={(value) => {
										setRatingSearch(Number(value));
									}}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Rating" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="0">Todas las reseñas</SelectItem>
										<SelectItem value="1">1 estrella</SelectItem>
										<SelectItem value="2">2 estrellas</SelectItem>
										<SelectItem value="3">3 estrellas</SelectItem>
										<SelectItem value="4">4 estrellas</SelectItem>
										<SelectItem value="5">5 estrellas</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Estado y Refresh - 1 columna, flex en desktop */}
							<div className="flex flex-col sm:flex-row gap-2 w-full min-w-0">
								<Select 
									value={published === undefined ? "all" : published.toString()}
									onValueChange={(value) => {
										if (value === 'all') {
											setPublished(undefined)
										} else {
											setPublished(value === "true");
										}
									}}
								>
									<SelectTrigger className="w-full sm:flex-1 min-w-0">
										<SelectValue placeholder="Estado" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Todos</SelectItem>
										<SelectItem value="true">Activos</SelectItem>
										<SelectItem value="false">Inactivos</SelectItem>
									</SelectContent>
								</Select>

								<Button 
									variant="outline" 
									size="icon" 
									onClick={() => {
										setSearch("");
										setPublished(undefined);
										setRatingSearch(0);
										queryClient.invalidateQueries({
											queryKey: ['testimonials']
										});
									}}
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
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow >
										<TableHead>Usuario</TableHead>
										<TableHead>Estado</TableHead>
										<TableHead>Rating</TableHead>
										<TableHead>Fecha de tratmiento</TableHead>
										<TableHead>resumen</TableHead>
										<TableHead>Acciones</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{isLoading ? (
										<TableRow>
											<TableCell colSpan={6} className="text-center">
												Cargando...
											</TableCell>
										</TableRow>
									) :

										!filteredTestimonies || filteredTestimonies.length === 0 ? (
											<TableRow>
												<TableCell colSpan={6} className="text-center">
													No hay registros, prueba cambiando los filtros o buscando en otra pagina.
												</TableCell>
											</TableRow>
										) :

											filteredTestimonies.map((review: HistoriaExito) => {

												return (
													<TableRow key={review.idHistoria + review.fechaTratamiento + review.idPaciente} className="hover:bg-muted/50">
														<TableCell className="font-medium">
															<div className="flex items-center gap-2">
																{
																	`${review.paciente?.nombre ?? 'anonimo'} ${review.paciente?.apellido1 ?? ''} ${review.paciente?.apellido2 ?? ''}`
																}
															</div>
														</TableCell>
														<TableCell>
															<Badge className={cn({
																"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300": review.publicado,
																"bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300": !review.publicado

															})}>
																{review.publicado ? "Activo" : "Inactivo"}
															</Badge>
														</TableCell>
														<TableCell>
															<div className="flex items-center gap-1">
																<Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
																<span className="font-mono text-sm whitespace-nowrap">
																	{review.rating}
																</span>
															</div>
														</TableCell>
														<TableCell className="text-sm">
															{formatRelativeTime(review.fechaTratamiento)}
														</TableCell>
														<TableCell className="max-w-xs overflow-hidden truncate">
															{review.experiencia}
														</TableCell>
														<TableCell>
															<Button 
																variant="outline" 
																size="sm"
																className="h-8 w-8 p-0 mr-3"
																onClick={async () => {
																	const testimonyData = await getTestimony(review.idHistoria)
																	setEditingTestimony(testimonyData)
																	setIsEditDialogOpen(true)
																}}
															>
																<Eye className="h-4 w-4" />
															</Button>
															{review.publicado ? (
																<Button 
																	variant="destructive" 
																	size="sm"
																	className="h-8 w-8 p-0 mr-3"
																	disabled={processingTestimonyId === review.idHistoria}
																	onClick={async () => {
																		setProcessingTestimonyId(review.idHistoria)
																		try {
																			const deletedHistoria = await unpublishTestimony(review.idHistoria)
																			console.log(deletedHistoria)
																			await queryClient.invalidateQueries({
																				queryKey: ['testimonials', page, limit, search]
																			})
																		} finally {
																			setProcessingTestimonyId(null)
																		}
																	}}
																>
																	{processingTestimonyId === review.idHistoria ? (
																		<Loader2 className="w-4 h-4 animate-spin" />
																	) : (
																		<EyeOff className="h-4 w-4" />
																	)}
																</Button>
															) : (
																<Button 
																	variant="secondary" 
																	size="sm"
																	className="h-8 w-8 p-0 mr-3"
																	disabled={processingTestimonyId === review.idHistoria}
																	onClick={async () => {
																		setProcessingTestimonyId(review.idHistoria)
																		try {
																			const publishHistoria = await publishTestimony(review.idHistoria)
																			console.log(publishHistoria)
																			await queryClient.invalidateQueries({
																				queryKey: ['testimonials', page, limit, search]
																			})
																		} finally {
																			setProcessingTestimonyId(null)
																		}
																	}}
																>
																	{processingTestimonyId === review.idHistoria ? (
																		<Loader2 className="w-4 h-4 animate-spin" />
																	) : (
																		<Globe className="h-4 w-4" />
																	)}
																</Button>
															)}

														</TableCell>
													</TableRow>
												)
											})
									}

								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>

				<div className="lg:hidden space-y-4">
					{isLoading ? (<div className="text-center">Cargando...</div>)
						: filteredTestimonies.map((review: HistoriaExito) => {

							return (
								<Card key={review.idHistoria + review.fechaTratamiento + review.idPaciente + 'mobile'}>
									<CardContent className="p-4">
										<div className="flex items-start justify-between mb-3">
											<div className="flex items-center gap-2">
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
													<User className="h-4 w-4 text-muted-foreground" />
												</div>
												<div>
													<h3 className="font-medium">
														{`${review.paciente?.nombre ?? 'anonimo'} ${review.paciente?.apellido1} ${review.paciente?.apellido2}`}
													</h3>

												</div>
											</div>
											<Badge className={cn({
												"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300": review.publicado,
												"bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300": !review.publicado

											})}>
												{review.publicado ? "Activo" : "Inactivo"}
											</Badge>
										</div>

										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<p className="text-sm text-muted-foreground">Fecha</p>
												<p className="text-sm font-medium">{formatRelativeTime(review.fechaTratamiento)}</p>
											</div>

											<div className="flex gap-2 pt-2">
												<Button 
													variant="outline" 
													className="flex-1"
													onClick={async () => {
														const testimonyData = await getTestimony(review.idHistoria)
														setEditingTestimony(testimonyData)
														setIsEditDialogOpen(true)
													}}
												>
													<Eye className="h-4 w-4 mr-2" />
													Ver testimonio
												</Button>

												{review.publicado ? (
													<Button 
														variant="destructive" 
														className="flex-1"
														disabled={processingTestimonyId === review.idHistoria}
														onClick={async () => {
															setProcessingTestimonyId(review.idHistoria)
															try {
																const deletedHistoria = await unpublishTestimony(review.idHistoria)
																console.log(deletedHistoria)
																await queryClient.invalidateQueries({
																	queryKey: ['testimonials', page, limit, search]
																})
															} finally {
																setProcessingTestimonyId(null)
															}
														}}
													>
														{processingTestimonyId === review.idHistoria ? (
															<div className="flex items-center justify-center gap-2">
																<Loader2 className="w-4 h-4 animate-spin" />
															</div>
														) : (
															<EyeOff className="h-4 w-4 mr-2" />
														)}
														Despublicar
													</Button>
												) : (
													<Button 
														variant="secondary" 
														className="flex-1"
														disabled={processingTestimonyId === review.idHistoria}
														onClick={async () => {
															setProcessingTestimonyId(review.idHistoria)
															try {
																const publishHistoria = await publishTestimony(review.idHistoria)
																console.log(publishHistoria)
																await queryClient.invalidateQueries({
																	queryKey: ['testimonials', page, limit, search]
																})
															} finally {
																setProcessingTestimonyId(null)
															}
														}}
													>
														{processingTestimonyId === review.idHistoria ? (
															<div className="flex items-center justify-center gap-2">
																<Loader2 className="w-4 h-4 animate-spin" />
															</div>
														) : (
															<Globe className="h-4 w-4 mr-2" />
														)}
														Publicar
													</Button>
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							)
						})}
				</div>

				{/* Pagination */}
				<Card>
					<CardContent className="p-4">
						<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
							{isLoading ? (
								<div className="flex items-center justify-center w-full">
									<Loader2 className="w-4 h-4 animate-spin" />
									<span>Cargando...</span>
								</div>
							) : (
								<>
									{/* Primera parte: Select */}
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">Mostrar</span>
										<Select
											value={limit.toString()}
											onValueChange={(value) => {
												setLimit(Number(value));
												setPage(1);
											}}
										>
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
											de {data?.pagination?.total || 0} registros
										</span>
									</div>

									{/* Segunda parte: Botones de paginación */}
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage(1)}
											disabled={page === 1}
										>
											<ChevronsLeft className="w-4 h-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage(page - 1)}
											disabled={page === 1}
										>
											<ChevronLeft className="w-4 h-4" />
										</Button>

										<span className="text-sm px-4">
											Página {page} de {data?.pagination?.pages || 1}
										</span>

										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage(page + 1)}
											disabled={page >= (data?.pagination?.pages || 1)}
										>
											<ChevronRight className="w-4 h-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage(data?.pagination?.pages || 1)}
											disabled={page >= (data?.pagination?.pages || 1)}
										>
											<ChevronsRight className="w-4 h-4" />
										</Button>
									</div>
								</>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Edit Testimony Dialog */}
				{editingTestimony && (
					<EditTestimonyDialog
						testimony={editingTestimony}
						isEditing={true}
						open={isEditDialogOpen}
						onOpenChange={(open) => {
							setIsEditDialogOpen(open)
							if (!open) {
								setEditingTestimony(null)
								queryClient.invalidateQueries({
									queryKey: ['testimonials']
								})
							}
						}}
					/>
				)}
			</div >
		</div >
	)
}

