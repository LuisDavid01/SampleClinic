
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
import EditTestimony from '@/components/EditTestimony'



export default function TestomonioPorId(){
       const mock = {
        
         id: 1,
      name: "María González",
      role: "Paciente desde 2023",
      text: "Después de mi lesión de rodilla, pensé que no volvería a caminar normalmente. El tratamiento personalizado y la dedicación del equipo me ayudaron a recuperar completamente mi movilidad. ¡Incluso puedo correr otra vez!",
      rating: 5,
      avatar: "M",
      created: new Date(2025, 0, 3),
      status: 'activo'
    }

   return (
       <div className="min-h-screen bg-background p-6">
         <Link
        href="/admin/testimonials"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
      >
        <ArrowLeftIcon size={16} className="mr-1" />
        Regresar a testimonios
      </Link>
      <Card className="bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle>
                  <div className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-text-primary" />
              <h2 className="text-lg lg:text-2xl font-semibold text-text-primary">
                Editar Testimonio
              </h2>
            </div>
                </CardTitle>
                <CardDescription>Moderando el testimonio de un paciente</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>loading...</div>}>
                <EditTestimony isEditing={true} testimony={mock}/>
                </Suspense>
              </CardContent>
            </Card>
    </div>
    )
}