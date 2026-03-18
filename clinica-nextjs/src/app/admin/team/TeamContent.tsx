'use client'

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
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
	User,
	RefreshCw,
	Filter,
	Search,
	ChevronRight,
	ChevronLeft,
	ChevronsLeft,
	ChevronsRight,
	Star,
	Users,
	Edit,
	UserX,
} from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import { useApiClient, apiEndpoints } from "@/utils/apiClient"
import { inactivarUsuario } from "@/actions/usuarios"
import { useNotification } from "@/components/UseNotification"
import NewFisioterapeutaDialog from "@/components/NewFisioterapeutaDialog"
import { deleteTeamMember, getEquipo } from "@/actions/equipo"
import { teamProfile } from "@/types/perfiles"
import { checkRoles } from "@/utils/roles"
import NewServiceDialog from "@/components/NewServiceDialog"

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



export default function TeamContent() {
	const { showNotification } = useNotification?.() ?? { showNotification: () => { } }
	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(10)
	const [search, setSearch] = useState("")
	const [processingUserId, setProcessingUserId] = useState<number | null>(null)
	const [isNewFisioterapeutaDialogOpen, setIsNewFisioterapeutaDialogOpen] = useState(false)
	const [memberStatus, setMemberStatus] = useState(true)
	const [editingMember, setEditingMember] = useState<teamProfile | null>(null)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const { isLoading, data: teamData, refetch } = useQuery<{
		perfiles: teamProfile[]
		total: number
		totalPaginas: number
	}>({
		queryKey: ['team-members', page, search, limit, memberStatus],
		queryFn: async () => {
			const res = await getEquipo(page, limit, search, memberStatus)
			console.log(res)
			return {
				perfiles: res.perfiles,
				total: res.pagination.total || 0,
				totalPaginas: res.pagination.pages || 1
			}
		},
		staleTime: 60 * 1000,
	})

	const teamMembers = teamData?.perfiles || []


	const total = teamData?.total || 0
	const totalPaginas = teamData?.totalPaginas || 1

	return (
		<main className="min-h-screen bg-background">
			<div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
				{/* Encabezado minimalista */}
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
						<Users className="h-6 w-6 text-accent" />
					</div>
					<div>
						<h1 className="text-3xl font-bold">Equipo</h1>
						<p className="text-muted-foreground">
							Gestiona el personal de la clinica
						</p>
					</div>
				</div>

				<Button
					className="cursor-pointer mt-6"
					onClick={() => setIsNewFisioterapeutaDialogOpen(true)}
				>
					<PlusIcon className="w-4 h-4 mr-2" />
					Nuevo miembro del equipo
				</Button>

				{/* Filters */}
				<Card className="mt-6">
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
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>
						</div>

						<div className="flex gap-2">
							<Select defaultValue="true"
								onValueChange={(value) => {
									setMemberStatus(value === "true");
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Estado" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="true">Activos</SelectItem>
									<SelectItem value="false">Inactivos</SelectItem>
								</SelectContent>
							</Select>

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
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Usuario</TableHead>
									<TableHead>descripcion</TableHead>
									<TableHead>experiencia</TableHead>
									<TableHead>especialidad</TableHead>
									<TableHead>Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center">Cargando...</TableCell>
									</TableRow>
								) : teamMembers.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center">No hay miembros del equipo</TableCell>
									</TableRow>
								) : (
									teamMembers.map((member) => {
										const statusConfig_ = statusConfig[member.medico.activo ? 'activo' : 'inactivo']
										const fullName = `${member.medico.nombre} ${member.medico.apellido1}${member.medico.apellido2 ? ' ' + member.medico.apellido2 : ''}`

										return (
											<TableRow key={member.medico.idUsuario} className="hover:bg-muted/50">
												<TableCell className="font-medium">
													<div className="flex items-center gap-2">
														{fullName}
													</div>
												</TableCell>


												<TableCell className="max-w-xs text-xs overflow-hidden break-words truncate">
													{member.descripcionBreve}
												</TableCell>
												<TableCell className="max-w-xs text-xs overflow-hidden  break-words truncate">
													{member.experienciaProfesional}
												</TableCell>
												<TableCell className="max-w-xs overflow-hidden truncate">
													{member.especialidad}
												</TableCell>
												<TableCell className="gap-2">
													<Button
														variant={"outline"}
														size="sm"
														className="h-8 w-8 p-0"
														disabled={processingUserId === member.medico.idUsuario}
														onClick={() => {
															setEditingMember(member)
															setIsEditDialogOpen(true)
														}}

													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="destructive"
														size="sm"
														className="h-8 w-8 p-0"
														disabled={processingUserId === member.medico.idUsuario}
														onClick={async () => {
															setProcessingUserId(member.medico.idUsuario)
															try {
																const result = await deleteTeamMember(member.idPerfil)
																if (result.success) {
																	showNotification({
																		title: "Perfil de equipo eliminado",
																		message: result.message || `Se inactivó "${fullName}"`,
																		type: "success",
																	})
																	await refetch()
																} else {
																	showNotification({
																		title: "Error",
																		message: result.message || `Error al inactivar "${fullName}"`,
																		type: "error",
																	})
																}
															} finally {
																setProcessingUserId(null)
															}
														}}
													>
														{processingUserId === member.medico.idUsuario ? (
															<div className="flex items-center gap-1">
																<div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
															</div>
														) : (
															<UserX className="h-4 w-4" />
														)}
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
				) : teamMembers.length === 0 ? (
					<div className="text-center">No hay miembros del equipo</div>
				) : (
					teamMembers.map((member) => {
						const statusConfig_ = statusConfig[member.medico.activo ? 'activo' : 'inactivo']
						const fullName = `${member.medico.nombre} ${member.medico.apellido1}${member.medico.apellido2 ? ' ' + member.medico.apellido2 : ''}`

						return (
							<Card key={member.medico.idUsuario}>
								<CardContent className="p-4">
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center gap-2">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
												<User className="h-4 w-4 text-muted-foreground" />
											</div>
											<div>
												<h3 className="font-medium">{fullName}</h3>
												<div className="flex items-center gap-1 text-sm text-muted-foreground">
													<span className="font-mono text-sm whitespace-nowrap">
														{member.medico.rol?.nombreRol || 'Fisioterapeuta'}
													</span>
												</div>
											</div>
										</div>
										<Badge className={statusConfig_?.color}>
											{statusConfig_?.label}
										</Badge>
									</div>

									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<p className="text-sm text-muted-foreground">Email</p>
											<p className="text-sm font-medium truncate">{member.medico.correoElectronico}</p>
										</div>
										<div className="flex items-center justify-between">
											<p className="text-sm text-muted-foreground">Registrado</p>
										</div>

												<div className="flex gap-2 pt-2">
											<Button
												variant="destructive"
												className="flex-1"
												disabled={processingUserId === member.medico.idUsuario || !member.medico.activo}
												onClick={async () => {
													setProcessingUserId(member.medico.idUsuario)
													try {
														const result = await deleteTeamMember(member.idPerfil)
														if (result.success) {
															showNotification({
																title: "Perfil de equipo eliminado",
																message: result.message || `Se inactivó "${fullName}"`,
																type: "success",
															})
															await refetch()
														} else {
															showNotification({
																title: "Error",
																message: result.message || `Error al inactivar "${fullName}"`,
																type: "error",
															})
														}
													} finally {
														setProcessingUserId(null)
													}
												}}
											>
												{processingUserId === member.medico.idUsuario ? (
													<div className="flex items-center justify-center gap-2">
														<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
													</div>
												) : (
													<><UserX className="h-4 w-4 mr-2" />Inactivar</>
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
							<Select value={String(limit)} onValueChange={(v) => setLimit(parseInt(v))}>
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
								de {total} registros
							</span>
						</div>

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
								onClick={() => setPage(prev => Math.max(1, prev - 1))}
								disabled={page === 1}
							>
								<ChevronLeft className="w-4 h-4" />
							</Button>

							<span className="text-sm px-4">
								Página {page} de {totalPaginas}
							</span>

							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(prev => Math.min(totalPaginas, prev + 1))}
								disabled={page >= totalPaginas}
							>
								<ChevronRight className="w-4 h-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(totalPaginas)}
								disabled={page >= totalPaginas}
							>
								<ChevronsRight className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Edit Service Dialog */}
			{editingMember && (
				<NewFisioterapeutaDialog
					miembro={editingMember}
					isEditing
					open={isEditDialogOpen}
					onOpenChange={(open) => {
						setIsEditDialogOpen(open)
						if (!open) {
							setEditingMember(null)
							refetch()
						}
					}}
				/>
			)}




			{/* Modal para crear nuevo fisioterapeuta */}
			<NewFisioterapeutaDialog
				open={isNewFisioterapeutaDialogOpen}
				onOpenChange={(open) => {
					setIsNewFisioterapeutaDialogOpen(open)
					if (!open) {
						// Refrescar datos cuando se cierre el modal
						refetch()
					}
				}}
			/>
			</div>
		</main>
	)
}
