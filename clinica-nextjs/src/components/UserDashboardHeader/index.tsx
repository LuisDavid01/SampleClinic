import ThemeToggle from "@/components/ThemeToggle";
import MobileMenu from "@/components/MobileMenu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
	BarChart3,
	Settings,
	Grid3X3,
	Inbox,
	TrendingUp,
	ExternalLink,
	Home,
	FileText,
	Calendar,
	Users,
} from "lucide-react";
import { LogoImage } from "../LogoImage";
import UserRoleDisplay from "../UserRoleDisplay";
import { UserButton } from "@clerk/nextjs";
export const UserDasboardHeader = async () => {
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
							Area paciente
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
							className="w-full justify-start text-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							asChild
						>
							<Link href="/pacientes">
								<Users className="w-4 h-4 mr-3" />
								Mi Historial
							</Link>
						</Button>

						<Button
							variant="ghost"
							className="w-full justify-start text-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							asChild
						>
							<Link href="/pacientes/historial-citas">
								<Calendar className="w-4 h-4 mr-3" />
								Citas historial
							</Link>
						</Button>


						<Button
							variant="ghost"
							className="w-full justify-start text-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							asChild
						>
							<Link href="/pacientes/consentimientos">
								<FileText className="w-4 h-4 mr-3" />
								Consentimientos
							</Link>
						</Button>
						<Button
							variant="ghost"
							className="w-full justify-start text-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							asChild
						>
							<Link href="/user">
								<Settings className="w-4 h-4 mr-3" />
								Configuración
							</Link>
						</Button>

						<Button
							variant="ghost"
							className="w-full justify-start text-text-primary hover:bg-gray-800"
							asChild
						>
							<Link href="/">
								<Home className="w-4 h-4 mr-3" />
								Regresar al inicio
							</Link>
						</Button>
						<div className="flex justify-start items-start my-3">
							<ThemeToggle />
						</div>
				</MobileMenu>
			</div>
		</header>
	);
};
