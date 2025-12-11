"use client"
import { clerkClient } from "@clerk/nextjs/server";
import { getUsersClerk, removeRole, setRole } from "@/actions/_actions";
import { SearchUsers } from "@/components/SearchUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
	Users,
	Shield,
	UserCheck,
	Mail,
	Stethoscope,
	Activity,
	ChevronRight,
	ChevronLeft,
	ChevronsLeft,
	ChevronsRight,
	X,
	Search,
	Loader2
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Cambiar la firma del componente para recibir searchParams como prop
export default function ManageUser() {
	const queryClient = useQueryClient()
	const [limit, setLimit] = useState(10);
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const { data, isLoading } = useQuery({
		queryKey: ['users', limit, page, search],
		queryFn: async () => {
			const userData = await getUsersClerk(search, limit, page)

			return userData
		}
	})
	const users = data?.data ?? [];
	const stats = {
		total: users.length,
		admins: users.filter((u) => u.role === "admin").length,
		moderators: users.filter((u) => u.role === "fisioterapeuta")
			.length,
		regular: users.filter((u) => u.role === "paciente").length,
	};

	return (
		<>
			{/* Barra de búsqueda con Buscar y Limpiar */}
			<Card className="my-6 border-input bg-card">
				<CardContent className="p-4 sm:p-6">
					<div className="w-full">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								const form = e.currentTarget;
								const formData = new FormData(form);
								const queryTerm = formData.get("search") as string;
								setSearch(queryTerm);
							}}
							className="space-y-3 sm:space-y-4"
						>
							<div className="space-y-2">
								<label
									htmlFor="search"
									className="block text-sm font-medium text-foreground"
								>
									Buscar usuarios
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
									</div>
									<input
										disabled={isLoading}
										id="search"
										name="search"
										type="text"
										placeholder="Nombre, email o ID..."
										className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-background border border-muted rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
									/>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
								<button
									type="submit"
									disabled={isLoading}
									className="flex-1 sm:flex-initial px-4 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors duration-200 focus:ring-2 focus:ring-accent/20 flex items-center justify-center gap-2"
								>
									<Search className="h-4 w-4" />
									<span>Buscar</span>
								</button>

								<button
									type="button"
									disabled={isLoading}
									onClick={() => {
										const form = document.querySelector("form") as HTMLFormElement;
										if (form) {
											form.reset();
										}
										setSearch("");
									}}
									className="flex-1 sm:flex-initial px-4 py-2.5 bg-muted text-muted-foreground rounded-lg font-medium text-sm hover:bg-muted/80 transition-colors duration-200 focus:ring-2 focus:ring-muted/20 flex items-center justify-center gap-2"
								>
									<X className="h-4 w-4" />
									<span>Limpiar</span>
								</button>
							</div>
						</form>
					</div>
				</CardContent>
			</Card>

			{/* Bloque de estadísticas compacto */}
			<div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
				<StatTile
					title="Usuarios"
					value={stats.total}
					icon={<Users className="h-4 w-4" />}
					tone="neutral"
				/>
				<StatTile
					title="Admins"
					value={stats.admins}
					icon={<Shield className="h-4 w-4" />}
					tone="accent"
				/>
				<StatTile
					title="Moderadores"
					value={stats.moderators}
					icon={<UserCheck className="h-4 w-4" />}
					tone="secondary"
				/>
				<StatTile
					title="Regulares"
					value={stats.regular}
					icon={<Activity className="h-4 w-4" />}
					tone="muted"
				/>
			</div>

			{/* Lista de usuarios */}
			<section className="space-y-3 sm:space-y-4">
				{
					isLoading ? (
						<Card
							className="border-input bg-background transition-shadow hover:shadow-sm"
						>
							<CardContent className="p-4 sm:p-5">
								<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-center">
									<Loader2 className="h-6 w-6 animate-spin" />
								</div>
							</CardContent>
						</Card>

					) : users.length === 0 ? (
						<Card className="border-input bg-card">
							<CardContent className="p-10 text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
									<Users className="h-8 w-8 text-muted-foreground" />
								</div>
								<h3 className="text-base sm:text-lg font-medium text-text-primary">
									No se encontraron usuarios
								</h3>
								<p className="text-sm text-muted-foreground">
									Intenta con un nombre o correo diferente
								</p>
							</CardContent>
						</Card>
					) : (
						users.map((user) => {
							const currentRole = user.role as string | undefined;
							const primaryEmail = user.email

							return (
								<Card
									key={user.id}
									className="border-input bg-background transition-shadow hover:shadow-sm"
								>
									<CardContent className="p-4 sm:p-5">
										<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
											{/* Info principal */}
											<div className="flex min-w-0 items-start gap-3 sm:gap-4">
												<Avatar className="h-12 w-12 sm:h-14 sm:w-14">
													<AvatarImage
														src={user?.imageUrl || "/placeholder.svg"}
														alt={user?.firstName + " " + user?.lastName || "Usuario"}
													/>
													<AvatarFallback className="bg-muted text-text-primary">
														{user.firstName?.[0]}
														{user.lastName?.[0]}
													</AvatarFallback>
												</Avatar>
												<div className="min-w-0 space-y-1">
													<div className="flex flex-wrap items-center gap-2">
														<h3 className="truncate text-base sm:text-lg font-semibold text-text-primary">
															{user.firstName} {user.lastName}
														</h3>
														<RoleBadge role={currentRole} />
													</div>
													<div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
														<Mail className="h-4 w-4" />
														<span className="truncate">{primaryEmail}</span>
													</div>
												</div>
											</div>

											{/* Acciones */}
											<div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">

												<Button
													size="sm"
													onClick={async () => {
														await setRole(user.id, "admin")
														queryClient.invalidateQueries({
															queryKey: ['users']
														})
													}}
													disabled={currentRole === "admin"}
													className="w-full min-w-0 truncate bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-muted disabled:text-muted-foreground text-xs sm:text-sm"
												>
													<span className="truncate">Hacer Administrador</span>
												</Button>


												<Button
													size="sm"
													onClick={async () => {
														await setRole(user.id, "fisioterapeuta")
														queryClient.invalidateQueries({
															queryKey: ['users']
														})
													}}
													disabled={currentRole === "fisioterapeuta"}
													className="w-full min-w-0 truncate bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:bg-muted disabled:text-muted-foreground text-xs sm:text-sm"
												>
													<span className="truncate">Hacer fisioterapeuta</span>
												</Button>



												<Button
													size="sm"
													onClick={async () => {
														await setRole(user.id, "recepcionista")
														queryClient.invalidateQueries({
															queryKey: ['users']
														})
													}}
													disabled={currentRole === "recepcionista"}
													className="w-full min-w-0 truncate bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:bg-muted disabled:text-muted-foreground text-xs sm:text-sm"
												>
													<span className="truncate">Hacer recepcionista</span>
												</Button>

												<Button
													size="sm"
													variant={"destructive"}
													onClick={async () => {
														await setRole(user.id, "paciente")
														queryClient.invalidateQueries({
															queryKey: ['users']
														})
													}}
													disabled={currentRole === "paciente"}
													className="w-full min-w-0 truncate disabled:bg-muted disabled:text-muted-foreground text-xs sm:text-sm"
												>
													<span className="truncate">Paciente</span>
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})
					)}

				{/* Pagination */}
				<Card>
					<CardContent className="p-4">
						<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">Mostrar</span>
								<Select defaultValue="10"
									onValueChange={(value) => setLimit(Number(value))}
								>
									<SelectTrigger className="w-30">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="10">10</SelectItem>
										<SelectItem value="25">25</SelectItem>
										<SelectItem value="50">50</SelectItem>
										<SelectItem value="100">100</SelectItem>
										<SelectItem value={String(data?.totalCount)}>Todos</SelectItem>
									</SelectContent>
								</Select>
								<span className="text-sm text-muted-foreground">
									de {data?.totalCount} registros
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
									onClick={() => setPage(page - 1)}

									disabled={page === 1}
								>
									<ChevronLeft className="w-4 h-4" />
								</Button>

								<span className="text-sm px-4">
									Página 1 de {data?.totalPages}
								</span>

								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(page + 1)}
									disabled={page === data?.totalPages}
								>
									<ChevronRight className="w-4 h-4" />
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(data?.totalPages ?? 1)}
									disabled={page === data?.totalPages}
								>
									<ChevronsRight className="w-4 h-4" />
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</section>
		</>
	);
}

function RoleBadge({ role }: { role?: string }) {
	if (role === "admin") {
		return (
			<Badge className="gap-1 bg-accent text-accent-foreground border-accent">
				<Shield className="h-3.5 w-3.5" />
				Administrador
			</Badge>
		);
	}
	if (role === "moderator") {
		return (
			<Badge className="gap-1 bg-secondary text-secondary-foreground border-secondary">
				<UserCheck className="h-3.5 w-3.5" />
				Moderador
			</Badge>
		);
	}
	return <Badge variant="outline">Usuario</Badge>;
}

function StatTile({
	title,
	value,
	icon,
	tone,
}: {
	title: string;
	value: number;
	icon: React.ReactNode;
	tone: "neutral" | "accent" | "secondary" | "muted";
}) {
	const toneClasses =
		tone === "accent"
			? "bg-accent text-accent-foreground border-accent"
			: tone === "secondary"
				? "bg-secondary text-secondary-foreground border-secondary"
				: tone === "muted"
					? "bg-card text-card-foreground border-input"
					: "bg-card text-card-foreground border-input";
	const iconTone =
		tone === "accent"
			? "text-accent-foreground/80"
			: tone === "secondary"
				? "text-secondary-foreground/80"
				: "text-muted-foreground";

	return (
		<Card className={`transition-shadow hover:shadow-sm ${toneClasses}`}>
			<CardContent className="flex items-center justify-between p-3 sm:p-4">
				<div>
					<div className="text-xs sm:text-sm">{title}</div>
					<div className="text-xl sm:text-2xl font-semibold">{value}</div>
				</div>
				<div className={iconTone}>{icon}</div>
			</CardContent>
		</Card>
	);
}
