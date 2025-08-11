
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
import { StatusTeam } from '@/types/Team'



export default function NuevoEquipo(){
       const mock = {
        id: 1,
      name: "Dr. María González",
      role: "Fisioterapeuta Principal",
      status: 'activo' as StatusTeam,
      createdAt: new Date(2025,0,3),
      experience: "12+ años",
      description:
        "Especialista en terapia manual y rehabilitación deportiva con más de 12 años de experiencia",
      specialties: [
        "Terapia Manual",
        "Rehabilitación Deportiva",
        "Electroterapia",
      ],
       }

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
                Editar miembro del equipo
              </h2>
            </div>
                </CardTitle>
                <CardDescription>Editar a un miembro al equipo</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>loading...</div>}>
                <NewTeam member={mock} isEditing/>
                </Suspense>
              </CardContent>
            </Card>
    </div>
    )
}