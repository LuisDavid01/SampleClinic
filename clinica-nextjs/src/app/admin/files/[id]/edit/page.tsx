import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import NewExpediente from '@/components/NewExpediente'
import { Status } from '@/types/Expediente'
import { Card, CardContent } from '@/components/ui/card'
import DocumentosExpediente from '@/components/DocuementosExpediente'

export default function EditFilePage() {
    const mock = {
        id: 2,
          pacienteID: 3123,
          descripcion: "Prueba de funcionalidad",
          cedula: "2-8732-0032",
          doctor: "Maria",
          status: 'Activo' as Status
    }

   return (
       <div className="min-h-screen bg-background p-6">
         <Link
        href="/admin/files"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
      >
        <ArrowLeftIcon size={16} className="mr-1" />
        Regresar a expedientes
      </Link>

      <h1 className="text-2xl font-bold mb-6">Editar expediente</h1>

      <div className="bg-card  rounded-lg shadow-sm p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <NewExpediente expediente={mock} isEditing/>
        </Suspense>
        </div>

        <div className='my-6'>

          <h2 className="text-2xl font-bold mb-6">Contenido del expediente</h2>
        
          <Card>
              <CardContent className="p-6">
                <Suspense fallback={<div>Loading...</div>}>
                <DocumentosExpediente />
                </Suspense>
              </CardContent>
          </Card>
        </div>

    </div>
    )
}