import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import DiagnosisForm from '@/components/NewDiagnosis'

export default function EditDiagnosisPage() {
    const mock = {
        id: 1,
         expediente: "EXP-001", 
        paciente: "Luis Miguel", 
        fecha: new Date(2025, 5, 2), 
        doctor: "Dra. María García", 
        diagnostico: "Dislocación severa"}

   return (
       <div className="min-h-screen bg-background p-6">
         <Link
        href="/admin/files"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
      >
        <ArrowLeftIcon size={16} className="mr-1" />
        Regresar al expediente
      </Link>

      <h1 className="text-2xl font-bold mb-6">Editar diagnostico</h1>

        <Suspense fallback={<div>Loading...</div>}>
        <Card>
          <CardContent>
            <DiagnosisForm diagnostico={mock} isEditing/>
          </CardContent>
          
        </Card>
          
        </Suspense>

    </div>
   )
}