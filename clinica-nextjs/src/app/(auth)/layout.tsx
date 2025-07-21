
import Link from "next/link"
import ThemeToggle from "@/components/ThemeToggle"
export default async function AuthPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
        <header className="bg-background shadow-sm sticky z-60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center sm:px-6 lg:px-8 h-20">
          <div className="flex items-center  ">
            <Link href={"/"} className=" text-2xl text-text-primary font-semibold">
              Clinica Esteban Porras
            </Link>
          </div>

          <div className="hidden md:flex md:justify-center space-x-4 md:space-x-8">
            <ul className="flex justify-between items-center space-x-4 md:space-x-8 text-text-primary">
              <li><ThemeToggle/></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
      <main className="flex-1">{children}</main>
      
      
    </div>
  )
}