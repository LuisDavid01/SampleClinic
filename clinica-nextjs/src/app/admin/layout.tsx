import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { DasboardHeader } from "@/components/DashboardHeader";
import ThemeToggle from "@/components/ThemeToggle";
import {
	BarChart3,
	Settings,
	User,
	Home,
	Star,
	Folder,
	CalendarDays,
	Shield,
	Users,
	UserPlus,
	Stethoscope,
	SearchCheck
} from "lucide-react";
import Link from "next/link";

import UserButtonClient from "@/components/UserButtonClient";
import { checkRoles } from "@/utils/roles";

export default async function dasboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {


	return (
		<div className="flex min-h-screen flex-col">
			<DasboardHeader />

			<div className="flex min-w-0 relative">
				{/* Aside fixed - queda fijo debajo del header */}
				<aside
					className="
            hidden md:flex flex-col w-64 shrink-0 p-6 border-r border-[#2B8181]/20
            fixed left-0 top-[73px] h-[calc(100vh-73px)] overflow-x-hidden
            bg-gradient-to-b from-[#2B8181]/5 to-background
			text-foreground z-40
          "
				>
					<nav className="space-y-2 flex-1 overflow-y-auto">
						<p className="text-xs tracking-wider text-gray-400 mb-4 uppercase">
							Navegación
						</p>

						<Button

							variant="ghost"
							className="w-full justify-start py-2 hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
							asChild
						>
							<Link href={"/admin"}>
								<BarChart3 className="w-4 h-4 mr-3" />
								Vista general
							</Link>
						</Button>

						<Button
							variant="ghost"
							className="w-full justify-start hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
							asChild
						>
							<Link href={"/admin/appointmentsRecords"}>
								<CalendarDays className="w-4 h-4 mr-3" />
								<span>Historial Citas</span>
							</Link>
						</Button>
						<Button
							variant="ghost"
							className="w-full justify-start hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
							asChild
						>
							<Link href={"/admin/appointments"}>
								<CalendarDays className="w-4 h-4 mr-3" />
								<span>Agendar Citas</span>
							</Link>
						</Button>

						<Button
							variant="ghost"
							className="w-full justify-start hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
							asChild
						>
							<Link href={"/admin/files"}>
								<Folder className="w-4 h-4 mr-3" />
								<span>Expedientes</span>
							</Link>
						</Button>

						{await checkRoles(['admin', 'recepcionista']) &&
							<>
								<Button
									variant="ghost"
									className="w-full justify-start hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
									asChild
								>
									<Link href={"/admin/ManageUsers"}>
										<User className="w-4 h-4 mr-3" />
										<span>Gestionar usuarios</span>
									</Link>
								</Button>

								<Button
									variant="ghost"
									className="w-full justify-start hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
									asChild
								>
									<Link href={"/admin/pacientes"}>
										<UserPlus className="w-4 h-4 mr-3" />
										<span>Pacientes</span>
									</Link>
								</Button>
								<Button
									variant="ghost"
									className="w-full justify-start hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
									asChild
								>
									<Link href={"/admin/team"}>
										<Users className="w-4 h-4 mr-3 " />
										<span>Equipo</span>
									</Link>
								</Button>
								<Button
									variant="ghost"
									className="w-full justify-start hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
									asChild
								>
									<Link href={"/admin/services"}>
										<Stethoscope className="w-4 h-4 mr-3" />
										<span>Servicios</span>
									</Link>
								</Button>
								<Button
									variant="ghost"
									className="w-full justify-start hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
									asChild
								>
									<Link href={"/admin/testimonials"}>
										<Star className="w-4 h-4 mr-3 " />
										<span>Testimonios</span>
									</Link>
								</Button>


								<Button
									variant="ghost"
									className="w-full justify-start hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
									asChild
								>
									<Link href={"/admin/audit"}>
										<SearchCheck className="w-4 h-4 mr-3 " />
										<span>Auditoria de Sistema</span>
									</Link>
								</Button>
							</>}

						<div className="my-4 border-t border-[#2B8181]/15" />


						<Button
							variant="ghost"
							className="w-full justify-start hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
							asChild
						>
							<Link href={"/user"} prefetch={false}>
								<Settings className="w-4 h-4 mr-3" />
								Cuenta
							</Link>
						</Button>

						<Button
							variant="ghost"
							className="w-full justify-start hover:bg-[#EE7132]/10 hover:text-[#EE7132] transition-colors"
							asChild
						>
							<Link href={"/"}>
								<Home className="w-4 h-4 mr-3" />
								Regresar al inicio
							</Link>
						</Button>

					</nav>

					{/* Theme Toggle al final del sidebar */}
					<div className="mt-auto pt-4 border-t border-[#2B8181]/20">
						<div className="flex items-center justify-center px-3 py-2 rounded-lg bg-card border-2 border-[#2B8181]/20 hover:bg-[#2B8181]/10 hover:border-[#2B8181]/40 transition-all duration-300">
							<ThemeToggle />
						</div>
					</div>
				</aside>

				{/* Contenido principal; permite scroll sin afectar el fixed sidebar */}
				<main className="flex-1 min-w-0 md:ml-64 min-h-screen overflow-x-hidden bg-gradient-to-br from-[#E8CF9C]/5 via-background to-[#2B8181]/5" style={{ paddingTop: '85px' }}>
					{children}
				</main>
			</div>
		</div>
	);
}
