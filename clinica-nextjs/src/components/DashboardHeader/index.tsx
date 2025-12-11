import MobileMenu from "@/components/MobileMenu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/ThemeToggle";
import UserRoleDisplay from "@/components/UserRoleDisplay";
import { LogoImage } from "@/components/LogoImage";
import {
	BarChart3,
	Settings,
	Grid3X3,
	Inbox,
	TrendingUp,
	ExternalLink,
	Home,
	User,
	Shield,
	Star,
	Users,
	Folder,
    Stethoscope,
    SearchCheck,
	CalendarDays
} from "lucide-react";
import { checkRole, checkRoles } from "@/utils/roles";


export const DasboardHeader = async () => {
	return (
		<header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 border-b-2 border-[#2B8181] bg-gradient-to-r from-[#2B8181]/15 via-background to-[#EE7132]/15 backdrop-blur-md shadow-lg">
			<div className="flex items-center gap-3">
				<Link
					href={"/"}
					className="flex items-center gap-3 group transition-all duration-300"
				>
					<div className="relative flex items-center justify-center p-2">
						{/* Marco - alrededor del contenedor */}
						<div className="absolute inset-0 border-2 border-[#2B8181] rounded-xl group-hover:border-[#EE7132] transition-all duration-300 -z-[1]"></div>
						{/* Logo */}
						<LogoImage 
							width={44}
							height={44}
							className="h-11 w-auto object-contain relative z-10 group-hover:scale-110 transition-transform duration-300"
						/>
					</div>
					<div className="flex flex-col">
						<span className="text-lg md:text-xl font-bold bg-gradient-to-r from-[#2B8181] via-[#2B8181] to-[#EE7132] bg-clip-text text-transparent drop-shadow-sm">
							Clínica Salena
						</span>
						<span className="text-[10px] text-foreground font-semibold hidden md:block tracking-wide">
							Panel de Administración
						</span>
					</div>
				</Link>
			</div>

			<nav className="hidden md:flex items-center gap-3">
				<div className="flex items-center gap-2">
					<UserRoleDisplay />
					<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-[#2B8181]/40 hover:border-[#2B8181] transition-all duration-300 bg-card/80 shadow-sm">
						<UserButton 
							showName
							userProfileUrl="/user"
							appearance={{
								elements: {
									avatarBox: "w-8 h-8 border-2 border-[#2B8181] hover:border-[#EE7132] transition-colors shadow-sm",
									userButtonPopoverCard: "bg-background border-2 border-[#2B8181]/40 shadow-xl",
									userButtonTrigger: "flex items-center gap-2",
									userButtonBox: "flex items-center gap-2",
								}
							}}
						/>
					</div>
				</div>
			</nav>

			{/* Mobile Menu - Solo visible en móvil */}
			<div className="md:hidden">
				<MobileMenu>
					<Button
						variant="ghost"
						className="w-full justify-start text-text-primary hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
						asChild
					>
						<Link href={"/admin"}>
							<BarChart3 className="w-4 h-4 mr-3" />
							Vista general
						</Link>
					</Button>

					{await checkRole('admin') &&


						<Button
							variant="ghost"
							className="w-full justify-start text-text-primary hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
							asChild
						>
							<Link href={"/admin/ManageUsers"}>
								<User className="w-4 h-4 mr-3" />
								<span>Gestionar usuarios</span>
							</Link>
						</Button>
					}

					{await checkRoles(['admin', 'recepcionista']) &&
						<>
							<Button
								variant="ghost"
								className="w-full justify-start text-text-primary hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
								asChild
							>
								<Link href={"/admin/team"}>
									<Users className="w-4 h-4 mr-3 " />
									<span>Equipo</span>
								</Link>
							</Button>

							<Button
								variant="ghost"
								className="w-full justify-start text-text-primary hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
								asChild
							>
								<Link href={"/admin/pacientes"}>
									<User className="w-4 h-4 mr-3" />
									<span>Pacientes</span>
								</Link>
							</Button>

							<Button
  								variant="ghost"
  								className="w-full justify-start text-text-primary hover:bg-gray-800"
  								asChild
>
  								<Link href={"/admin/appointmentsRecords"}>
   								<CalendarDays className="w-4 h-4 mr-3" />
    							<span>Historial Citas</span>
  							</Link>
							</Button>

						</>
					}
					<Button
						variant="ghost"
						className="w-full justify-start text-text-primary hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
						asChild
					>
						<Link href={"/admin/appointments"}>
							<CalendarDays className="w-4 h-4 mr-3" />
							<span>Citas</span>
						</Link>
					</Button>

					<Button
						variant="ghost"
						className="w-full justify-start text-text-primary hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
						asChild
					>
						<Link href={"/admin/files"}>
							<Folder className="w-4 h-4 mr-3" />
							<span>Expedientes</span>
						</Link>
					</Button>

					<Button
  						variant="ghost"
  						className="w-full justify-start text-text-primary hover:bg-gray-800"
  						asChild
>
  						<Link href={"/admin/services"}>
   						<Stethoscope className="w-4 h-4 mr-3" />
    					<span>Servicios</span>
  					</Link>
				</Button>


					<Button
						variant="ghost"
						className="w-full justify-start text-text-primary hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
						asChild
					>
						<Link href={"/admin/testimonials"}>
							<Star className="w-4 h-4 mr-3 " />
							<span>Testimonios</span>
						</Link>
					</Button>



					<Button
						variant="ghost"
						className="w-full justify-start text-text-primary hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
						asChild
					>
						<Link href={"/user"}
							prefetch={false}>
							<Settings className="w-4 h-4 mr-3" />
							Cuenta
						</Link>
					</Button>

					{await checkRoles(["admin"]) && (
  					<Button
    					variant="ghost"
    					className="w-full justify-start text-text-primary hover:bg-gray-800"
    					asChild
  >
    				<Link href={"/admin/audit"}>
      				<SearchCheck className="w-4 h-4 mr-3" />
      				<span>Auditoria de Sistema</span>
    			</Link>
  				</Button>
)}

					<Button
						variant="ghost"
						className="w-full justify-start text-text-primary hover:bg-[#EE7132]/10 hover:text-[#EE7132] transition-colors"
						asChild
					>
						<Link href={"/"}>
							<Home className="w-4 h-4 mr-3" />
							Regresar al inicio
						</Link>
					</Button>

					<div className="flex justify-start items-start my-3 gap-3">
						<div className="flex items-center">
							<UserButton 
								userProfileUrl="/user"
								appearance={{
									elements: {
										avatarBox: "w-10 h-10 border-2 border-[#2B8181]/30",
										userButtonPopoverCard: "bg-background border-2 border-[#2B8181]/20 shadow-lg",
									}
								}}
							/>
						</div>
					</div>
					<div className="mt-2 pt-3 border-t border-[#2B8181]/20 flex items-center gap-3">
  <span className="text-xs text-gray-400">Tema</span>
  <ThemeToggle />
</div>

				</MobileMenu>
			</div>
		</header>
	);
};
