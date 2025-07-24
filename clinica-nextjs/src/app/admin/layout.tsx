import MobileMenu from "@/components/MobileMenu"
import { UserButton } from "@clerk/nextjs"
import ThemeToggle from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Settings,
  Grid3X3,
  Inbox,
  TrendingUp,
  MoreHorizontal,
  ExternalLink,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"

export default async function dasboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Link href={"/"} className="text-lg md:text-2xl text-text-primary font-semibold">
            Clinica Esteban Porras
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#" className="flex items-center gap-1 text-sm hover:text-primary">
            Ayuda <ExternalLink className="w-4 h-4" />
          </Link>
          <div className="flex justify-center items-center">
            <ThemeToggle/>
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
              <Link href={'/admin'}>
                <BarChart3 className="w-4 h-4 mr-3" />
                Vista general
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
            >
              <TrendingUp className="w-4 h-4 mr-3" />
              Analíticas
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
              asChild
            >
              <Link href={'/admin/ManageUsers'}>
                <BarChart3 className="w-4 h-4 mr-3" />
                <span>Gestionar usuarios</span>
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
            >
              <Inbox className="w-4 h-4 mr-3" />
              Citas
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
            >
              <Grid3X3 className="w-4 h-4 mr-3" />
              Registros
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
            >
              <Settings className="w-4 h-4 mr-3" />
              Preferencias
            </Button>
          </MobileMenu>
        </div>
      </header>

      <div className="flex">
        
        <aside className="hidden md:block w-64 p-6 border-r border-gray-800">
          <div className="flex items-center justify-center gap-3 mb-8">
            <UserButton
              showName
              userProfileUrl="/dashboard/user"
            />
          </div>

          <nav className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
              asChild
            >
              <Link href={'/admin'}>
                <BarChart3 className="w-4 h-4 mr-3" />
                Vista general
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
            >
              <TrendingUp className="w-4 h-4 mr-3" />
              Analíticas
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
              asChild
            >
              <Link href={'/admin/ManageUsers'}>
                <BarChart3 className="w-4 h-4 mr-3" />
                <span>Gestionar usuarios</span>
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
            >
              <Inbox className="w-4 h-4 mr-3" />
              Citas
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
            >
              <Grid3X3 className="w-4 h-4 mr-3" />
              Registros
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
            >
              <Settings className="w-4 h-4 mr-3" />
              Preferencias
            </Button>
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}