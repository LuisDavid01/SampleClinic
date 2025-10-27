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
		<PacienteRouteGuard>
			<UserDasboardHeader />
			<div className="flex">

				<aside className="hidden md:block w-64 p-6 border-r border-gray-800
            sticky top-0 self-start h-[calc(100vh)] overflow-auto
            bg-background">

					<div className="flex items-center justify-center gap-3 mb-8">
						<UserButton
							showName
							userProfileUrl="/user"
							userProfileMode="navigation"
						/>
					</div>

					<nav className="space-y-2">
						<Button
							variant="ghost"
							className="w-full justify-start text-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							asChild
						>
							<Link href="/pacientes">
								<Users className="w-4 h-4 mr-3" />
								Mis Cita
							</Link>
						</Button>
						{/* <Button
							variant="ghost"
							className="w-full justify-start text-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							asChild
						>
							<Link href="/pacientes/citas">
								<Calendar className="w-4 h-4 mr-3" />
								Citas
							</Link>
						</Button> */}
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
							<Link href="/pacientes/expedientes">
								<FileText className="w-4 h-4 mr-3" />
								Expedientes
							</Link>
						</Button>
						<Button
							variant="ghost"
							className="w-full justify-start text-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							asChild
						>
							<Link href="/pacientes/tratamientos">
								<Activity className="w-4 h-4 mr-3" />
								Tratamientos
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
					</nav>
				</aside>
				<main className="flex-1 p-6 bg-background">{children}</main>
			</div>
		</PacienteRouteGuard>
	);
} 
