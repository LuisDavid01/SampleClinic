import EditAppointment from '@/components/EditAppointment'
import { StatusAppointment } from '@/types/Appointment'
import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'




export default function CitaPorId(){
       const mock = {
        
          id: 1,
          pacienteID: 1,
          doctor: "guillermo",
          fecha: new Date(2025, 6, 7),
          status: 'En progreso' as StatusAppointment ,
          nota: 'esto es una prueba'
    }

   return (
       <div className="min-h-screen bg-background p-6">
         <Link
        href="/admin/appointments"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
      >
        <ArrowLeftIcon size={16} className="mr-1" />
        Regresar a expedientes
      </Link>

      <h1 className="text-2xl font-bold mb-6">Editar cita</h1>

      <div className="bg-card  rounded-lg shadow-sm p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <EditAppointment isEditing={true} appointment={mock}/>
        </Suspense>
        </div>
    </div>
    )
}