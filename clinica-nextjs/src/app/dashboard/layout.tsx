import { UserButton } from "@clerk/nextjs";
import { UserDasboardHeader } from "@/components/UserDashboardHeader";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { BarChart3, Settings, Grid3X3, Inbox, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function dasboardUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UserDasboardHeader />
      <div className="flex">
        <aside className=" hidden md:block w-64 p-6 border-r border-gray-800">
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
              className="w-full justify-start text-text-primary hover:bg-gray-800"
              asChild
            >
              <Link href={"/dashboard"}>
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
              <Link href={"/user"}>
                <Settings className="w-4 h-4 mr-3" />
                Cuenta
              </Link>
            </Button>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
      <Footer />
    </>
  );
}
