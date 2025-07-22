import { UserButton } from "@clerk/nextjs"
import ThemeToggle from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/Footer"
import {
  BarChart3,
  Settings,
  Grid3X3,
  Inbox,
  TrendingUp,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

export default async function dasboardUserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    
    <div className="flex min-h-screen flex-col">
         <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary"></div>
          <Link href={"/"} className=" text-2xl text-text-primary font-semibold">
              Clinica Esteban Porras
            </Link>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="#" className="flex items-center gap-1 text-sm hover:text-primary">
            Ayuda <ExternalLink className="w-4 h-4" />
          </Link>
          <div className="flex justify-center items-center">
              <ThemeToggle/>
          </div>
        </nav>
      </header>

      <div className="flex">
        <aside className="w-64 p-6 border-r border-gray-800">
          <div className="flex items-center justify-center gap-3 mb-8">
            <UserButton
            showName
            userProfileUrl="/dashboard/user"
            userProfileMode="navigation"
            />
          </div>

          <nav className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
            asChild
            >
              <Link href={'/dashboard'}>
              <BarChart3 className="w-4 h-4 mr-3" />
              Vista general
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
            >
              <TrendingUp className="w-4 h-4 mr-3" />
              Gestionar citas
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
            >
              <Inbox className="w-4 h-4 mr-3" />
              Notificaciones
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
            >
              <Grid3X3 className="w-4 h-4 mr-3" />
              Expediente
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-text-primary hover:bg-gray-800"
            asChild
            >
              <Link href={'/dashboard/user'}>
              <Settings className="w-4 h-4 mr-3" />
              Cuenta
              </Link>
            </Button>
            
            
          </nav>
        </aside>
        <main className="flex-1 p-6">
        {children}
        </main>
      </div>
      <Footer></Footer>
    </div>
  )
}