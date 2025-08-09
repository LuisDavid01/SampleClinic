import ThemeToggle from "@/components/ThemeToggle";
import MobileMenu from "@/components/MobileMenu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BarChart3,
  Settings,
  Grid3X3,
  Inbox,
  TrendingUp,
  ExternalLink,
  Home,
  User
} from "lucide-react";
import Image from "next/image";
export const DasboardHeader = async () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
     <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center">
          <Image
        src="https://pub-ea02a55403d04609aeb9b3b618e1c834.r2.dev/logo.webp"
        alt="Clínica Esteban Porras"
        width={95}
        height={48}
        className="object-contain"
        priority
      />
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-6">
        <Link
          href="#"
          className="flex items-center gap-1 text-sm text-text-primary"
        >
          Ayuda <ExternalLink className="w-4 h-4" />
        </Link>
        <div className="flex justify-center items-center">
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile Menu - Solo visible en móvil */}
      <div className="md:hidden">
        <MobileMenu>
           <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
              asChild
            >
              <Link href={"/admin"}>
                <BarChart3 className="w-4 h-4 mr-3" />
                Vista general
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
              asChild
            >
              <Link href={"/admin/ManageUsers"}>
                <User className="w-4 h-4 mr-3" />
                <span>Gestionar usuarios</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
              asChild
            >
              <Link href={"/admin/appointments"}>
                <Inbox className="w-4 h-4 mr-3" />
                <span>Citas</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
              asChild
            >
              <Link href={"/admin/files"}>
                <Grid3X3 className="w-4 h-4 mr-3" />
                <span>Expedientes</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
              asChild
            >
              <Link href={"/admin/audit"}>
                <TrendingUp className="w-4 h-4 mr-3" />
                <span>Auditoria</span>
              </Link>
            </Button>

            

            <Button
              variant="ghost"
              className="w-full  justify-start text-text-primary hover:bg-gray-800"
              asChild
            >
              <Link href={"/user"}>
                <Settings className="w-4 h-4 mr-3" />
                Cuenta
              </Link>
            </Button>

            
            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
              asChild
            >
              <Link href={"/"}>
                <Home className="w-4 h-4 mr-3" />
                Regresar al inicio
              </Link>
            </Button>

          <Button
            variant="link"
            className="w-full justify-start text-text-primary "
            asChild
          >
            <Link
              href="#"
              className="flex items-center gap-1 text-sm text-text-primary"
            >
              <ExternalLink className="w-4 h-4" />
              Ayuda
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
