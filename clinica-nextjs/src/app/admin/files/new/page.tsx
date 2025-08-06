import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import NewExpediente from '@/components/NewExpediente'

export default function NewFilePage () {
    return (
       <div className="min-h-screen bg-background p-6">
         <Link
        href="/admin/files"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
      >
        <ArrowLeftIcon size={16} className="mr-1" />
        Regresar a expedientes
      </Link>

      <h1 className="text-2xl font-bold mb-6">Crear nuevo expediente</h1>

      <div className="bg-card  rounded-lg shadow-sm p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <NewExpediente/>
        </Suspense>
        </div>
    </div>
    )
}