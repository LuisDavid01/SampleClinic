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
} from "lucide-react";
export const UserDasboardHeader = async () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <Link
              href={"/"}
              className="text-lg md:text-2xl text-text-primary font-semibold"
            >
              Clinica Esteban Porras
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
            variant="link"
            className="w-full justify-start text-text-primary "
            asChild
          >
            <Link href={"/dashboard"}>
              <BarChart3 className="w-4 h-4 mr-3" />
              Vista general
            </Link>
          </Button>
          <Button
            variant="link"
            className="w-full justify-start text-text-primary "
          >
            <TrendingUp className="w-4 h-4 mr-3" />
            Gestionar citas
          </Button>
          <Button
            variant="link"
            className="w-full justify-start text-text-primary "
          >
            <Inbox className="w-4 h-4 mr-3" />
            Notificaciones
          </Button>
          <Button
            variant="link"
            className="w-full justify-start text-text-primary "
          >
            <Grid3X3 className="w-4 h-4 mr-3" />
            Expediente
          </Button>
          <Button
            variant="link"
            className="w-full justify-start text-text-primary "
            asChild
          >
            <Link href={"/user"}>
              <Settings className="w-4 h-4 mr-3" />
              Cuenta
            </Link>
          </Button>

          <Button
            variant="link"
            className="w-full justify-start text-text-primary "
            asChild
          >
            <Link href={"/"}>
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
