
import { ArrowLeftIcon, Edit } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import NewTeam from '@/components/NewTeam'



export default function NuevoEquipo(){
       

   return (
       <div className="min-h-screen bg-background p-6">
          <Link
        href="/admin/team"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
      >
        <ArrowLeftIcon size={16} className="mr-1" />
        Regresar al equipo
      </Link>
      <Card className="bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle>
                  <div className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-text-primary" />
              <h2 className="text-lg lg:text-2xl font-semibold text-text-primary">
                Nuevo miembro del equipo
              </h2>
            </div>
                </CardTitle>
                <CardDescription>Agregar nuevo miembro al equipo</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>loading...</div>}>
                <NewTeam />
                </Suspense>
              </CardContent>
            </Card>
    </div>
    )
}