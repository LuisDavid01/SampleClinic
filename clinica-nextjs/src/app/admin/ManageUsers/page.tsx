import { redirect } from "next/navigation";
import { checkRole } from "@/utils/roles";
import { Suspense } from "react";
import ManageUserSkeleton from "@/components/ManageUserSkeleton";
import ManageUser from "@/components/ManageUser";
import { Card, CardContent } from "@/components/ui/card";
import { SearchUsers } from "@/components/SearchUsers";
import {
  User,
} from "lucide-react";
export default function AdminUsersPage(params: {
  searchParams: Promise<{ search?: string }>;
}) {
  if (!checkRole("admin")) {
    redirect("/");
  }

  

  return (

    
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      {/* Encabezado minimalista */}
      <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
              <User className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Expedientes</h1>
              <p className="text-muted-foreground">
                Gestiona los expedientes de los pacientes
              </p>
            </div>
          </div>

      {/* Barra de búsqueda con Buscar y Limpiar */}
      <Card className="my-6 border-input bg-card">
        <CardContent className="p-4 sm:p-6">
          <SearchUsers />
        </CardContent>
      </Card>
      <Suspense fallback={<ManageUserSkeleton/>}>
      <ManageUser searchParams={params.searchParams} />
      </Suspense>
      </div>
    </main>
    
  );
}

