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
  Plus
} from "lucide-react";
import Link from "next/link";

export default async function pacientesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PacienteRouteGuard>
      <UserDasboardHeader />
      <div className="flex">
        <aside className="hidden md:block w-64 p-6 border-r border-border bg-card">
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
            <Button
              variant="ghost"
              className="w-full justify-start text-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              asChild
            >
              <Link href="/pacientes/citas">
                <Calendar className="w-4 h-4 mr-3" />
                Citas
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
          </nav>
        </aside>
        <main className="flex-1 p-6 bg-background">{children}</main>
      </div>
      <Footer />
    </PacienteRouteGuard>
  );
} 