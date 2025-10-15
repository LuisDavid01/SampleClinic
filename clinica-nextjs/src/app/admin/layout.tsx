import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { DasboardHeader } from "@/components/DashboardHeader";
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
	Stethoscope
} from "lucide-react";
import Link from "next/link";
import { checkRole } from "@/utils/roles";
import { redirect } from "next/navigation";
import UserButtonClient from "@/components/UserButtonClient";

export default async function dasboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// ahora validamos las rutas de admin por el layout
	const isAdmin = await checkRole("admin");
	if (!isAdmin) {
		redirect("/");
	}

	return (
		<div className="flex min-h-screen flex-col">
			<DasboardHeader />

			{/* Contenedor principal debajo del header */}
			<div className="flex">
				{/* Aside sticky */}
				<aside
					className="
            hidden md:block w-64 p-6 border-r border-gray-800
            sticky top-0 self-start h-[calc(100vh)] overflow-auto
            bg-background
			text-foreground
          "
				>

					<UserButtonClient />


					<nav className="space-y-2">
						<Button
							variant="ghost"
							className="w-full justify-start  hover:bg-gray-800"
							asChild
						>
							<Link href={"/admin"}>
								<BarChart3 className="w-4 h-4 mr-3" />
								Vista general
							</Link>
						</Button>

						<Button
							variant="ghost"
							className="w-full justify-start  hover:bg-gray-800"
							asChild
						>
							<Link href={"/admin/ManageUsers"}>
								<User className="w-4 h-4 mr-3" />
								<span>Gestionar usuarios</span>
							</Link>
						</Button>

						<Button
							variant="ghost"
							className="w-full justify-start  hover:bg-gray-800"
							asChild
						>
							<Link href={"/admin/pacientes"}>
								<UserPlus className="w-4 h-4 mr-3" />
								<span>Pacientes</span>
							</Link>
						</Button>

						<Button
							variant="ghost"
							className="w-full justify-start  hover:bg-gray-800"
							asChild
						>
							<Link href={"/admin/appointments"}>
								<CalendarDays className="w-4 h-4 mr-3" />
								<span>Citas</span>
							</Link>
						</Button>

						<Button
							variant="ghost"
							className="w-full justify-start  hover:bg-gray-800"
							asChild
						>
							<Link href={"/admin/files"}>
								<Folder className="w-4 h-4 mr-3" />
								<span>Expedientes</span>
							</Link>
						</Button>
						<Button
							variant="ghost"
							className="w-full justify-start  hover:bg-gray-800"
							asChild
						>
							<Link href={"/admin/team"}>
								<Users className="w-4 h-4 mr-3 " />
								<span>Equipo</span>
							</Link>
						</Button>
						<Button
 							 variant="ghost"
  							 className="w-full justify-start hover:bg-gray-800"
  							 asChild
>
 							 <Link href={"/admin/services"}>
   							 <Stethoscope className="w-4 h-4 mr-3" />
    						<span>Servicios</span>
 							 </Link>
						</Button>
						<Button
							variant="ghost"
							className="w-full justify-start  hover:bg-gray-800"
							asChild
						>
							<Link href={"/admin/testimonials"}>
								<Star className="w-4 h-4 mr-3 " />
								<span>Testimonios</span>
							</Link>
						</Button>

						<Button
							variant="ghost"
							className="w-full justify-start  hover:bg-gray-800"
							asChild
						>
							<Link href={"/admin/audit"}>
								<Shield className="w-4 h-4 mr-3" />
								<span>Auditoria</span>
							</Link>
						</Button>



						<Button
							variant="ghost"
							className="w-full  justify-start  hover:bg-gray-800"
							asChild
						>
							<Link href={"/user"} prefetch={false}>
								<Settings className="w-4 h-4 mr-3" />
								Cuenta
							</Link>
						</Button>


						<Button
							variant="ghost"
							className="w-full justify-start  hover:bg-gray-800"
							asChild
						>
							<Link href={"/"}>
								<Home className="w-4 h-4 mr-3" />
								Regresar al inicio
							</Link>
						</Button>

					</nav>
				</aside>

				{/* Contenido principal; permite scroll sin afectar el sticky */}
				<main className="flex-1 p-6 min-h-[calc(100vh)]">{children}</main>
			</div>
		</div>
	);
}
