import { UserButton } from "@clerk/nextjs";
import { UserDasboardHeader } from "@/components/UserDashboardHeader";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { PacienteRouteGuard } from "@/components/PacienteRouteGuard/PacienteRouteGuard";
import {
	Users,
	Calendar,
	FileText,
	Activity,
	Settings,
	Plus,
	Home
} from "lucide-react";
import Link from "next/link";
import { checkRoles } from "@/utils/roles";
import { redirect } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default async function pacientesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const isEmployee = await checkRoles(['admin', 'fisioterapeuta', 'recepcionista']);
	if (isEmployee) {
		redirect('/admin');
	}
	return (
		<div className="flex min-h-screen flex-col">
			<PacienteRouteGuard>
				<UserDasboardHeader />
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
								className="w-full justify-start text-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
								asChild
							>
								<Link href="/pacientes">
									<Users className="w-4 h-4 mr-3" />
									Mis Historial
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
					<main className="flex-1 min-w-0 md:ml-64 min-h-screen overflow-x-hidden bg-gradient-to-br from-[#E8CF9C]/5 via-background to-[#2B8181]/5" style={{ paddingTop: '85px' }}>
						{children}
					</main>
				</div>
			</PacienteRouteGuard >
		</div >
	);
} 
