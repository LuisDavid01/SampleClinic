// import EditAppointment from '@/components/EditAppointment'
// import { StatusAppointment } from '@/types/Appointment'
// import { ArrowLeftIcon, Edit } from 'lucide-react'
// import Link from 'next/link'
// import { Suspense } from 'react'
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"



// export default function CitaPorId(){
//        const mock = {
        
//           id: 1,
//           pacienteID: 1,
//           doctor: "guillermo",
//           fecha: new Date(2025, 6, 7),
//           status: 'En progreso' as StatusAppointment ,
//           nota: 'esto es una prueba'
//     }

//    return (
//        <div className="min-h-screen bg-background p-6">
//          <Link
//         href="/admin/appointments"
//         className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
//       >
//         <ArrowLeftIcon size={16} className="mr-1" />
//         Regresar a expedientes
//       </Link>
//       <Card className="bg-card shadow-sm">
//               <CardHeader className="pb-4">
//                 <CardTitle>
//                   <div className="flex items-center gap-2">
//               <Edit className="w-5 h-5 text-text-primary" />
//               <h2 className="text-lg lg:text-2xl font-semibold text-text-primary">
//                 Editar cita
//               </h2>
//             </div>
//                 </CardTitle>
//                 <CardDescription>Editar la cita de un paciente</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <Suspense fallback={<div>loading...</div>}>
//                 <EditAppointment isEditing={true} appointment={mock}/>
//                 </Suspense>
//               </CardContent>
//             </Card>
//     </div>
//     )
// }