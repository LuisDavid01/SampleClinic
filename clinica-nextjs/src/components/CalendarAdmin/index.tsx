// "use client"
// import './index.css'
// import { useState, useMemo } from "react"
// import { Calendar,  View, Views, dateFnsLocalizer } from "react-big-calendar"
// import "react-big-calendar/lib/css/react-big-calendar.css"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import {  Clock, User, Stethoscope, Phone, Mail,Filter } from 'lucide-react'
// import {
// format as dfFormat,
// parse as dfParse,
// startOfWeek,
// getDay,
// } from "date-fns"
// import { es } from "date-fns/locale"
// import { ArrowLeftIcon } from 'lucide-react'
// import Link from 'next/link'

// const locales = { es }

// const localizer = dateFnsLocalizer({
//   format: (date, formatStr, options) =>
//     dfFormat(date, formatStr, { locale: es, ...options }),
//   parse: (value, formatStr, referenceDate, options) =>
//     dfParse(value, formatStr, referenceDate, { locale: es, ...options }),
//   startOfWeek: () => startOfWeek(new Date(), { locale: es }),
//   getDay,
//   locales,
// })

// // Mock data structure as specified
// const mockAppointments = [
//   {
//     id: 1,
//     title: "Consulta - Juan Pérez",
//     patient: {
//       name: "Juan Pérez",
//       phone: "+506 8888-8888",
//       email: "juan.perez@email.com"
//     },
//     doctor: {
//       name: "Dra. María García",
//       specialty: "Cardiología"
//     },
//     start: new Date(2025, 7, 8, 10, 0),
//     end: new Date(2025, 7, 8, 10, 30),
//     status: "programada",
//     type: "consulta-general",
//     notes: "Revisión de rutina"
//   },
//   {
//     id: 2,
//     title: "Emergencia - Ana López",
//     patient: {
//       name: "Ana López",
//       phone: "+506 7777-7777",
//       email: "ana.lopez@email.com"
//     },
//     doctor: {
//       name: "Dr. Carlos Rodríguez",
//       specialty: "Medicina General"
//     },
//     start: new Date(2025, 7, 8, 14, 0),
//     end: new Date(2025, 7, 8, 15, 0),
//     status: "en-proceso",
//     type: "emergencia",
//     notes: "Dolor abdominal agudo"
//   },
//   {
//     id: 3,
//     title: "Especialidad - Carlos Mendez",
//     patient: {
//       name: "Carlos Mendez",
//       phone: "+506 6666-6666",
//       email: "carlos.mendez@email.com"
//     },
//     doctor: {
//       name: "Dr. Luis Fernández",
//       specialty: "Dermatología"
//     },
//     start: new Date(2025, 7, 9, 9, 0),
//     end: new Date(2025, 7, 9, 10, 0),
//     status: "completada",
//     type: "especialidad",
//     notes: "Revisión de lunares"
//   },
//   {
//     id: 4,
//     title: "Consulta - María Rodríguez",
//     patient: {
//       name: "María Rodríguez",
//       phone: "+506 5555-5555",
//       email: "maria.rodriguez@email.com"
//     },
//     doctor: {
//       name: "Dra. Patricia Jiménez",
//       specialty: "Pediatría"
//     },
//     start: new Date(2025, 7, 10, 11, 0),
//     end: new Date(2025, 7, 10, 11, 30),
//     status: "cancelada",
//     type: "consulta-general",
//     notes: "Control de crecimiento"
//   },
//   {
//     id: 5,
//     title: "Emergencia - Roberto Silva",
//     patient: {
//       name: "Roberto Silva",
//       phone: "+506 4444-4444",
//       email: "roberto.silva@email.com"
//     },
//     doctor: {
//       name: "Dr. Miguel Torres",
//       specialty: "Traumatología"
//     },
//     start: new Date(2025, 7, 8, 16, 30),
//     end: new Date(2025, 7, 8, 17, 30),
//     status: "programada",
//     type: "emergencia",
//     notes: "Fractura en brazo"
//   }
// ]

// const statusColors = {
//   "programada": "bg-primary text-black",
//   "completada": "bg-accent text-accent-foreground",
//   "cancelada": "bg-muted text-muted-foreground",
//   "en-proceso": "bg-secondary text-secondary-foreground"
// }

// const statusLabels = {
//   "programada": "Programada",
//   "completada": "Completada",
//   "cancelada": "Cancelada",
//   "en-proceso": "En Proceso"
// }

// const typeLabels = {
//   "consulta-general": "Consulta General",
//   "especialidad": "Especialidad",
//   "emergencia": "Emergencia"
// }



// export default function CalendarAdmin() {
//     const [currentView, setCurrentView] = useState<View>(Views.MONTH)
//       const [currentDate, setCurrentDate] = useState(new Date())
//       const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
//       const [isDialogOpen, setIsDialogOpen] = useState(false)
//       const [doctorFilter, setDoctorFilter] = useState<string>("all")
//       const [statusFilter, setStatusFilter] = useState<string>("all")
    
//       // Get unique doctors for filter
//       const doctors = useMemo(() => {
//         const uniqueDoctors = Array.from(new Set(mockAppointments.map(apt => apt.doctor.name)))
//         return uniqueDoctors
//       }, [])
    
//       // Filter appointments based on selected filters
//       const filteredAppointments = useMemo(() => {
//         return mockAppointments.filter(apt => {
//           const doctorMatch = doctorFilter === "all" || apt.doctor.name === doctorFilter
//           const statusMatch = statusFilter === "all" || apt.status === statusFilter
//           return doctorMatch && statusMatch
//         })
//       }, [doctorFilter, statusFilter])
    
//       // Calculate statistics
//       const stats = useMemo(() => {
//         const today = new Date()
//         const todayAppointments = filteredAppointments.filter(apt => 
//           apt.start.toDateString() === today.toDateString()
//         )
        
//         return {
//           total: filteredAppointments.length,
//           today: todayAppointments.length,
//           programadas: filteredAppointments.filter(apt => apt.status === "programada").length,
//           completadas: filteredAppointments.filter(apt => apt.status === "completada").length,
//           canceladas: filteredAppointments.filter(apt => apt.status === "cancelada").length,
//           enProceso: filteredAppointments.filter(apt => apt.status === "en-proceso").length
//         }
//       }, [filteredAppointments])
    
//       const handleSelectEvent = (event: any) => {
//         setSelectedAppointment(event)
//         setIsDialogOpen(true)
//       }
    
//       const handleNavigate = (newDate: Date) => {
//         setCurrentDate(newDate)
//       }
    
//       const handleViewChange = (view: View) => {
//         setCurrentView(view)
//       }
    
//       const eventStyleGetter = (event: any) => {
//         let backgroundColor = '#3174ad'
//         let textColor = 'text-text-primary'
        
//         switch (event.status) {
//           case 'programada':
//             backgroundColor = 'oklch(85.24% 0.14 178.87)'
//             textColor = 'black'
//             break
//           case 'completada':
//             backgroundColor = 'oklch(46.924% 0.07835 159.789)'
//             textColor = 'white'
//             break
//           case 'cancelada':
//             backgroundColor = 'oklch(0.95 0.01 240)'
//             textColor = 'black'
//             break
//           case 'en-proceso':
//             backgroundColor = 'oklab(64.63% 0.145 0.12)'
//             textColor = 'white'
//             break
//         }
    
//         return {
//           style: {
//             backgroundColor,
//             borderRadius: '4px',
//             opacity: 0.8,
//             color: textColor,
//             border: '0px',
//             display: 'block'
//           }
//         }
//       }
    
//       return (
//           <div>
            
    
//             <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//               {/* Sidebar */}
//               <div className="lg:col-span-1 space-y-4">
                
    
//                 {/* Filters */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg flex items-center gap-2">
//                       <Filter className="h-4 w-4" />
//                       Filtros
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div>
//                       <label className="text-sm font-medium mb-2 block">Doctor</label>
//                       <Select value={doctorFilter} onValueChange={setDoctorFilter}>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Seleccionar doctor" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="all">Todos los doctores</SelectItem>
//                           {doctors.map(doctor => (
//                             <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
                    
//                     <div>
//                       <label className="text-sm font-medium mb-2 block">Estado</label>
//                       <Select value={statusFilter} onValueChange={setStatusFilter}>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Seleccionar estado" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="all">Todos los estados</SelectItem>
//                           <SelectItem value="programada">Programada</SelectItem>
//                           <SelectItem value="completada">Completada</SelectItem>
//                           <SelectItem value="en-proceso">En Proceso</SelectItem>
//                           <SelectItem value="cancelada">Cancelada</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </CardContent>
//                 </Card>
    
                
//               </div>
    
//               {/* Calendar */}
//               <div className="lg:col-span-3">
//                 <Card>
//                   <CardContent className="p-6">
//                     <div className="h-[600px]">
//                       <Calendar
//                         localizer={localizer}
//                         events={filteredAppointments}
//                         startAccessor="start"
//                         endAccessor="end"
//                         view={currentView}
//                         onView={handleViewChange}
//                         date={currentDate}
//                         onNavigate={handleNavigate}
//                         onSelectEvent={handleSelectEvent}
//                         eventPropGetter={eventStyleGetter}
//                         messages={{
//                           next: "Siguiente",
//                           previous: "Anterior",
//                           today: "Hoy",
//                           month: "Mes",
//                           week: "Semana",
//                           day: "Día",
//                           agenda: "Agenda",
//                           date: "Fecha",
//                           time: "Hora",
//                           event: "Evento",
//                           noEventsInRange: "No hay citas en este rango de fechas",
//                           showMore: (total) => `+ Ver ${total} más`
//                         }}
//                         formats={{
//                           timeGutterFormat: "HH:mm",
//                           eventTimeRangeFormat: ({ start, end }) =>
//                             `${dfFormat(start, "HH:mm", { locale: es })} - ${dfFormat(end, "HH:mm", { locale: es })}`,
//                           dayHeaderFormat: "EEEE dd/MM",
//                           monthHeaderFormat: "MMMM yyyy",
//                           dayRangeHeaderFormat: ({ start, end }) =>
//                             `${dfFormat(start, "dd/MM", { locale: es })} - ${dfFormat(end, "dd/MM/yyyy", { locale: es })}`,
//                         }}
//                       />
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>
    
//             {/* Appointment Details Dialog */}
//             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//               <DialogContent className="max-w-md">
//                 <DialogHeader>
//                   <DialogTitle>Detalles de la Cita</DialogTitle>
//                     <DialogDescription>
//                         Información detallada sobre la cita médica seleccionada
//                     </DialogDescription>
//                     <Link
//                     href="/admin/appointments/1"
//                     className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
//                   >
                    
//                     Editar cita
//                   </Link>
//                 </DialogHeader>
//                 {selectedAppointment && (
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <Badge className={statusColors[selectedAppointment.status as keyof typeof statusColors]}>
//                         {statusLabels[selectedAppointment.status as keyof typeof statusLabels]}
//                       </Badge>
//                       <Badge variant="outline">
//                         {typeLabels[selectedAppointment.type as keyof typeof typeLabels]}
//                       </Badge>
//                     </div>
    
//                     <div className="space-y-3">
//                       <div className="flex items-start gap-3">
//                         <User className="h-5 w-5 text-muted-foreground mt-0.5" />
//                         <div>
//                           <p className="font-medium">{selectedAppointment.patient.name}</p>
//                           <div className="text-sm text-muted-foreground space-y-1">
//                             <div className="flex items-center gap-2">
//                               <Phone className="h-3 w-3" />
//                               {selectedAppointment.patient.phone}
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <Mail className="h-3 w-3" />
//                               {selectedAppointment.patient.email}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
    
//                       <div className="flex items-start gap-3">
//                         <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
//                         <div>
//                           <p className="font-medium">{selectedAppointment.doctor.name}</p>
//                           <p className="text-sm text-muted-foreground">{selectedAppointment.doctor.specialty}</p>
//                         </div>
//                       </div>
    
//                       <div className="flex items-start gap-3">
//                         <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
//                         <div>
//                          <p className="font-medium">
//                           {dfFormat(selectedAppointment.start, "dd/MM/yyyy", { locale: es })}
//                         </p>
//                         <p className="text-sm text-muted-foreground">
//                           {dfFormat(selectedAppointment.start, "HH:mm")} - {dfFormat(selectedAppointment.end, "HH:mm")}
//                         </p>
//                         </div>
//                       </div>
    
//                       {selectedAppointment.notes && (
//                         <div className="bg-muted p-3 rounded-lg">
//                           <p className="text-sm font-medium mb-1">Notas:</p>
//                           <p className="text-sm text-muted-foreground">{selectedAppointment.notes}</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </DialogContent>
//             </Dialog>
//           </div>

//       )
//     }







// "use client";

// import "./index.css";
// import { useState, useMemo, useEffect } from "react";
// import {
//   Calendar,
//   View,
//   Views,
//   dateFnsLocalizer,
// } from "react-big-calendar";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Filter,
//   Clock,
//   User,
//   Stethoscope,
//   Phone,
//   Mail,
// } from "lucide-react";
// import {
//   format as dfFormat,
//   parse as dfParse,
//   startOfWeek,
//   getDay,
// } from "date-fns";
// import { es } from "date-fns/locale";
// import { useApiClient, apiEndpoints } from "@/utils/apiClient";
// import { useNotification } from "@/components/UseNotification";

// // 🔹 Configuración regional (español)
// const locales = { es };
// const localizer = dateFnsLocalizer({
//   format: (date, formatStr, options) =>
//     dfFormat(date, formatStr, { locale: es, ...options }),
//   parse: (value, formatStr, referenceDate, options) =>
//     dfParse(value, formatStr, referenceDate, { locale: es, ...options }),
//   startOfWeek: () => startOfWeek(new Date(), { locale: es }),
//   getDay,
//   locales,
// });

// // 🔹 Colores y etiquetas de estado
// const statusColors = {
//   programada: "bg-primary text-black",
//   completada: "bg-accent text-accent-foreground",
//   cancelada: "bg-muted text-muted-foreground",
//   "en-proceso": "bg-secondary text-secondary-foreground",
// };

// const statusLabels = {
//   programada: "Programada",
//   completada: "Completada",
//   cancelada: "Cancelada",
//   "en-proceso": "En Proceso",
// };

// export default function CalendarAdmin() {
//   const apiClient = useApiClient();
//   const { showNotification } = useNotification();

//   const [appointments, setAppointments] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [doctorFilter, setDoctorFilter] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [currentView, setCurrentView] = useState<View>(Views.MONTH);
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   // 🔹 Cargar citas
//   const loadAppointments = async () => {
//     try {
//       setIsLoading(true);
//       const params = new URLSearchParams({
//         ...(doctorFilter !== "all" ? { medico: doctorFilter } : {}),
//         ...(statusFilter !== "all" ? { estado: statusFilter } : {}),
//       });

//       const response = await apiClient.get(`${apiEndpoints.getCitas()}?${params}`);
//       const citas = (response.citas || []).map((cita: any) => ({
//         id: cita.idCita,
//         title: `${cita.servicio?.nombreServicio || "Cita"} - ${cita.paciente?.nombre || ""}`,
//         start: new Date(cita.fechaCita),
//         end: new Date(new Date(cita.fechaCita).getTime() + 30 * 60000),
//         status: cita.estadoCita?.toLowerCase() || "programada",
//         patient: {
//           name: `${cita.paciente?.nombre || ""} ${cita.paciente?.apellido1 || ""}`,
//           phone: cita.paciente?.telefonoPrincipal || "Sin teléfono",
//           email: cita.paciente?.correoElectronico || "Sin correo",
//         },
//         doctor: {
//           name: `${cita.medico?.nombre || ""} ${cita.medico?.apellido1 || ""}`,
//           specialty: cita.servicio?.nombreServicio || "General",
//         },
//         notes: cita.descripcion,
//       }));

//       setAppointments(citas);
//     } catch (error) {
//       console.error("❌ Error cargando citas:", error);
//       showNotification({
//         type: "error",
//         title: "Error",
//         message: "No se pudo cargar la lista de citas",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadAppointments();
//   }, [doctorFilter, statusFilter]);

//   // 🔹 Lista de doctores únicos
//   const doctors = useMemo(() => {
//     const names = Array.from(new Set(appointments.map((a) => a.doctor.name)));
//     return names;
//   }, [appointments]);

//   // 🔹 Filtrado local
//   const filteredAppointments = useMemo(() => {
//     return appointments.filter((apt) => {
//       const matchDoctor = doctorFilter === "all" || apt.doctor.name === doctorFilter;
//       const matchStatus = statusFilter === "all" || apt.status === statusFilter;
//       return matchDoctor && matchStatus;
//     });
//   }, [appointments, doctorFilter, statusFilter]);

//   // 🔹 Estilo de eventos
//   const eventStyleGetter = (event: any) => {
//     let backgroundColor = "#3174ad";
//     switch (event.status) {
//       case "programada":
//         backgroundColor = "oklch(85.24% 0.14 178.87)";
//         break;
//       case "completada":
//         backgroundColor = "oklch(46.924% 0.07835 159.789)";
//         break;
//       case "cancelada":
//         backgroundColor = "oklch(0.95 0.01 240)";
//         break;
//       case "en-proceso":
//         backgroundColor = "oklab(64.63% 0.145 0.12)";
//         break;
//     }
//     return {
//       style: {
//         backgroundColor,
//         borderRadius: "4px",
//         opacity: 0.8,
//         color: "black",
//         border: "0px",
//         display: "block",
//       },
//     };
//   };

//   // 🔹 Navegación personalizada
//   const handleToday = () => setCurrentDate(new Date());
//   const handlePrev = () => {
//     if (currentView === Views.MONTH)
//       setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
//     else if (currentView === Views.WEEK)
//       setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7));
//     else
//       setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1));
//   };
//   const handleNext = () => {
//     if (currentView === Views.MONTH)
//       setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
//     else if (currentView === Views.WEEK)
//       setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7));
//     else
//       setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1));
//   };
//   const handleViewChange = (newView: View) => setCurrentView(newView);

//   return (
//     <div className="min-h-screen bg-background p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="flex items-center gap-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
//             <Filter className="h-5 w-5 text-accent" />
//           </div>
//           <div>
//             <h1 className="text-3xl font-bold">Calendario de Citas</h1>
//             <p className="text-muted-foreground">Visualiza y gestiona todas las citas médicas</p>
//           </div>
//         </div>

//         {/* Filtros */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Filter className="w-5 h-5" />
//               Filtros
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="text-sm font-medium mb-2 block">Doctor</label>
//               <Select value={doctorFilter} onValueChange={setDoctorFilter}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Seleccionar doctor" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">Todos</SelectItem>
//                   {doctors.map((doc) => (
//                     <SelectItem key={doc} value={doc}>
//                       {doc}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <label className="text-sm font-medium mb-2 block">Estado</label>
//               <Select value={statusFilter} onValueChange={setStatusFilter}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Seleccionar estado" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">Todos</SelectItem>
//                   <SelectItem value="programada">Programada</SelectItem>
//                   <SelectItem value="completada">Completada</SelectItem>
//                   <SelectItem value="cancelada">Cancelada</SelectItem>
//                   <SelectItem value="en-proceso">En Proceso</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Controles personalizados */}
//         <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
//           {/* Navegación */}
//           <div className="flex items-center gap-2">
//             <Button variant="outline" onClick={handleToday}>
//               Hoy
//             </Button>
//             <Button variant="outline" onClick={handlePrev}>
//               Anterior
//             </Button>



//             <Button variant="outline" onClick={handleNext}>
//               Siguiente
//             </Button>
//           </div>

//             {/* 🔹 Fecha actual mostrada aquí */}
//             <span className="text-base font-semibold text-muted-foreground px-3">
//               {dfFormat(
//                 currentDate,
//                 currentView === Views.MONTH
//                   ? "MMMM yyyy"
//                   : currentView === Views.WEEK
//                   ? "'Semana del' dd 'de' MMMM yyyy"
//                   : "EEEE d 'de' MMMM yyyy",
//                 { locale: es }
//               )}
//             </span>

//           {/* Vistas */}
//           <div className="flex gap-2">
//             <Button
//               variant={currentView === Views.MONTH ? "default" : "outline"}
//               onClick={() => handleViewChange(Views.MONTH)}
//             >
//               Mes
//             </Button>
//             <Button
//               variant={currentView === Views.WEEK ? "default" : "outline"}
//               onClick={() => handleViewChange(Views.WEEK)}
//             >
//               Semana
//             </Button>
//             <Button
//               variant={currentView === Views.DAY ? "default" : "outline"}
//               onClick={() => handleViewChange(Views.DAY)}
//             >
//               Día
//             </Button>
//             <Button
//               variant={currentView === Views.AGENDA ? "default" : "outline"}
//               onClick={() => handleViewChange(Views.AGENDA)}
//             >
//               Agenda
//             </Button>
//           </div>
//         </div>

//         {/* Calendario */}
//         <Card>
//           <CardContent className="p-6">
//             {isLoading ? (
//               <p className="text-center text-muted-foreground">Cargando citas...</p>
//             ) : (
//               <div className="h-[600px]">
//                 <Calendar
//                   localizer={localizer}
//                   events={filteredAppointments}
//                   startAccessor="start"
//                   endAccessor="end"
//                   date={currentDate}
//                   view={currentView}
//                   onNavigate={setCurrentDate}
//                   onView={setCurrentView}
//                   onSelectEvent={(e) => {
//                     setSelectedAppointment(e);
//                     setIsDialogOpen(true);
//                   }}
//                   eventPropGetter={eventStyleGetter}
//                   toolbar={false} // 👈 Evita la toolbar duplicada
//                   popup
//                   messages={{
//                     next: "Siguiente",
//                     previous: "Anterior",
//                     today: "Hoy",
//                     month: "Mes",
//                     week: "Semana",
//                     day: "Día",
//                     agenda: "Agenda",
//                     noEventsInRange: "No hay citas para mostrar.",
//                   }}
//                 />
//               </div>
//             )}
//           </CardContent>
//         </Card>

        // {/* Diálogo de detalles */}
        // {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        //   <DialogContent className="max-w-md">
        //     <DialogHeader>
        //       <DialogTitle>Detalles de la Cita</DialogTitle>
        //       <DialogDescription>
        //         Información de la cita seleccionada
        //       </DialogDescription>
        //     </DialogHeader>

        //     {selectedAppointment && (
        //       <div className="space-y-4">
        //         <div className="flex items-center justify-between">
        //           <Badge
        //             className={
        //               statusColors[
        //                 selectedAppointment.status as keyof typeof statusColors
        //               ]
        //             }
        //           >
        //             {
        //               statusLabels[
        //                 selectedAppointment.status as keyof typeof statusLabels
        //               ]
        //             }
        //           </Badge>
        //         </div>

        //         <div className="flex items-start gap-3">
        //           <User className="h-5 w-5 text-muted-foreground mt-0.5" />
        //           <div>
        //             <p className="font-medium">
        //               {selectedAppointment.patient.name}
        //             </p>
        //             <div className="text-sm text-muted-foreground space-y-1">
        //               <div className="flex items-center gap-2">
        //                 <Phone className="h-3 w-3" />
        //                 {selectedAppointment.patient.phone}
        //               </div>
        //               <div className="flex items-center gap-2">
        //                 <Mail className="h-3 w-3" />
        //                 {selectedAppointment.patient.email}
        //               </div>
        //             </div>
        //           </div>
        //         </div>

        //         <div className="flex items-start gap-3">
        //           <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
        //           <div>
        //             <p className="font-medium">
        //               {selectedAppointment.doctor.name}
        //             </p>
        //             <p className="text-sm text-muted-foreground">
        //               {selectedAppointment.doctor.specialty}
        //             </p>
        //           </div>
        //         </div>

        //         <div className="flex items-start gap-3">
        //           <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
        //           <div>
        //             <p className="text-sm text-muted-foreground">
        //               {dfFormat(selectedAppointment.start, "dd/MM/yyyy HH:mm")}
        //             </p>
        //           </div>
        //         </div>

        //         {selectedAppointment.notes && (
        //           <div className="bg-muted p-3 rounded-lg">
        //             <p className="text-sm font-medium mb-1">Notas:</p>
        //             <p className="text-sm text-muted-foreground">
        //               {selectedAppointment.notes}
        //             </p>
        //           </div>
        //         )}
        //       </div>
        //     )}
        //   </DialogContent>
        // </Dialog> */}
        // {/* Diálogo de detalles */}
        // <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        //   <DialogContent className="max-w-md">
        //     <DialogHeader>
        //       <DialogTitle>Detalles de la Cita</DialogTitle>
        //       <DialogDescription>
        //         Información de la cita seleccionada
        //       </DialogDescription>
        //     </DialogHeader>

        //     {selectedAppointment && (
        //       <div className="space-y-4">
        //         {/* Estado */}
        //         <div className="flex items-center justify-between">
        //           <Badge
        //             className={
        //               statusColors[
        //                 selectedAppointment.status as keyof typeof statusColors
        //               ]
        //             }
        //           >
        //             {
        //               statusLabels[
        //                 selectedAppointment.status as keyof typeof statusLabels
        //               ]
        //             }
        //           </Badge>
        //         </div>

        //         {/* Paciente */}
        //         <div className="flex items-start gap-3">
        //           <User className="h-5 w-5 text-muted-foreground mt-0.5" />
        //           <div>
        //             <p className="font-medium">{selectedAppointment.patient.name}</p>
        //             <div className="text-sm text-muted-foreground space-y-1">
        //               <div className="flex items-center gap-2">
        //                 <Phone className="h-3 w-3" />
        //                 {selectedAppointment.patient.phone}
        //               </div>
        //               <div className="flex items-center gap-2">
        //                 <Mail className="h-3 w-3" />
        //                 {selectedAppointment.patient.email}
        //               </div>
        //             </div>
        //           </div>
        //         </div>

        //         {/* Doctor */}
        //         <div className="flex items-start gap-3">
        //           <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
        //           <div>
        //             <p className="font-medium">{selectedAppointment.doctor.name}</p>
        //             <p className="text-sm text-muted-foreground">
        //               {selectedAppointment.doctor.specialty}
        //             </p>
        //           </div>
        //         </div>

        //         {/* Fecha editable */}
        //         <div className="flex items-start gap-3">
        //           <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
        //           <div>
        //             <p className="text-sm font-medium mb-1">Fecha y hora:</p>
        //             <input
        //               type="datetime-local"
        //               className="border rounded-md px-2 py-1 w-full text-sm"
        //               value={dfFormat(selectedAppointment.start, "yyyy-MM-dd'T'HH:mm")}
        //               onChange={(e) =>
        //                 setSelectedAppointment({
        //                   ...selectedAppointment,
        //                   start: new Date(e.target.value),
        //                   end: new Date(new Date(e.target.value).getTime() + 30 * 60000),
        //                 })
        //               }
        //             />
        //           </div>
        //         </div>

        //         {/* Notas */}
        //         {selectedAppointment.notes && (
        //           <div className="bg-muted p-3 rounded-lg">
        //             <p className="text-sm font-medium mb-1">Notas:</p>
        //             <p className="text-sm text-muted-foreground">
        //               {selectedAppointment.notes}
        //             </p>
        //           </div>
        //         )}

        //         {/* Botón guardar cambios */}
        //         <div className="pt-3 flex justify-end">
        //           <Button
        //             onClick={async () => {
        //               try {
        //                 const updated = {
        //                   fechaCita: selectedAppointment.start.toISOString(),
        //                 };

        //                 await apiClient.put(
        //                   apiEndpoints.updateCita(String(selectedAppointment.id)),
        //                   updated
        //                 );

        //                 showNotification({
        //                   type: "success",
        //                   title: "Cita actualizada",
        //                   message: "La fecha de la cita fue modificada correctamente.",
        //                 });

        //                 setIsDialogOpen(false);
        //                 await loadAppointments(); // recarga el calendario
        //               } catch (err: any) {
        //                 console.error("❌ Error al actualizar cita:", err);
        //                 showNotification({
        //                   type: "error",
        //                   title: "Error al actualizar",
        //                   message:
        //                     err.message ||
        //                     "No se pudo actualizar la fecha de la cita.",
        //                 });
        //               }
        //             }}
        //           >
        //             Guardar cambios
        //           </Button>
        //         </div>
        //       </div>
        //     )}
        //   </DialogContent>
        // </Dialog>
//       </div>
//     </div>
//   );
// }






"use client";

import "./index.css";
import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  View,
  Views,
  dateFnsLocalizer,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Filter,
  Clock,
  User,
  Stethoscope,
  Phone,
  Mail,
  Plus,
} from "lucide-react";
import {
  format as dfFormat,
  parse as dfParse,
  startOfWeek,
  getDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { useApiClient, apiEndpoints } from "@/utils/apiClient";
import { useNotification } from "@/components/UseNotification";

// 🔹 Configuración regional (español)
const locales = { es };
const localizer = dateFnsLocalizer({
  format: (date, formatStr, options) =>
    dfFormat(date, formatStr, { locale: es, ...options }),
  parse: (value, formatStr, referenceDate, options) =>
    dfParse(value, formatStr, referenceDate, { locale: es, ...options }),
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales,
});

// 🔹 Colores y etiquetas de estado
const statusColors = {
  borrador: "bg-amber-400 text-black",
  programada: "bg-primary text-black",
  completada: "bg-accent text-accent-foreground",
  cancelada: "bg-muted text-muted-foreground",
  "en-proceso": "bg-secondary text-secondary-foreground",
};

const statusLabels = {
  borrador: "Borrador",
  programada: "Programada",
  completada: "Completada",
  cancelada: "Cancelada",
  "en-proceso": "En Proceso",
};

export default function CalendarAdmin() {
  const apiClient = useApiClient();
  const { showNotification } = useNotification();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

  // 🔹 Nuevo: estado del modal de creación
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    idPaciente: "" as number | "",
    idMedico: "" as number | "",
    idServicio: "" as number | "",
    fechaCita: "",
    descripcion: "",
  });

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);

  // 🔹 Cargar citas
  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        ...(doctorFilter !== "all" ? { medico: doctorFilter } : {}),
        ...(statusFilter !== "all" ? { estado: statusFilter } : {}),
      });

      const response = await apiClient.get(`${apiEndpoints.getCitas()}?${params}`);
      const citas = (response.citas || []).map((cita: any) => ({
        id: cita.idCita,
        title: `${cita.servicio?.nombreServicio || "Cita"} - ${cita.paciente?.nombre || ""}`,
        start: new Date(cita.fechaCita),
        end: new Date(new Date(cita.fechaCita).getTime() + 30 * 60000),
        status: cita.estadoCita?.toLowerCase() || "programada",
        idMedico: cita.idMedico || null,
        idPaciente: cita.idPaciente,
        idServicio: cita.idServicio || null,
        patient: {
          name: `${cita.paciente?.nombre || ""} ${cita.paciente?.apellido1 || ""}`,
          phone: cita.paciente?.telefonoPrincipal || "Sin teléfono",
          email: cita.paciente?.correoElectronico || "Sin correo",
        },
        doctor: {
          name: cita.medico 
            ? `${cita.medico.nombre || ""} ${cita.medico.apellido1 || ""}`.trim() || "Sin asignar"
            : "Sin asignar",
          specialty: cita.servicio?.nombreServicio || "General",
          id: cita.medico?.idUsuario || null,
        },
        notes: cita.descripcion,
      }));

      setAppointments(citas);
    } catch (error) {
      console.error("❌ Error cargando citas:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: "No se pudo cargar la lista de citas",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Cargar listas de usuarios y servicios para crear citas
  const loadUsersAndServices = async () => {
    try {
      const [usersRes, servicesRes] = await Promise.all([
        apiClient.get(`${apiEndpoints.getUsuarios()}?limit=1000&activo=true`), // Cargar todos los usuarios activos
        apiClient.get(apiEndpoints.getServicios()),
      ]);
      const usuariosCargados = usersRes.usuarios || [];
      console.log("📋 Usuarios cargados:", usuariosCargados.length);
      console.log("👨‍⚕️ Médicos encontrados:", usuariosCargados.filter((u: any) => u.idRol === 2 || u.rol?.idRol === 2).length);
      setUsuarios(usuariosCargados);
      setServicios(servicesRes.servicios || []);
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [doctorFilter, statusFilter]);

  useEffect(() => {
    loadUsersAndServices();
  }, []);

  // 🔹 Crear cita nueva
  const handleCreateAppointment = async () => {
    try {
      if (!newAppointment.idPaciente || !newAppointment.idMedico || !newAppointment.fechaCita) {
        showNotification({
          type: "error",
          title: "Campos requeridos",
          message: "Por favor completa paciente, médico y fecha.",
        });
        return;
      }

      await apiClient.post(apiEndpoints.createCita(), {
        ...newAppointment,
        estadoCita: "programada",
      });

      showNotification({
        type: "success",
        title: "Cita creada",
        message: "La cita fue registrada exitosamente.",
      });

      setIsCreateDialogOpen(false);
      setNewAppointment({
        idPaciente: "",
        idMedico: "",
        idServicio: "",
        fechaCita: "",
        descripcion: "",
      });

      await loadAppointments();
    } catch (err: any) {
      console.error("❌ Error creando cita:", err);
      showNotification({
        type: "error",
        title: "Error al crear cita",
        message: err.message || "No se pudo registrar la cita.",
      });
    }
  };

  // 🔹 Lista de doctores únicos
  const doctors = useMemo(() => {
    const names = Array.from(new Set(appointments.map((a) => a.doctor.name)));
    return names;
  }, [appointments]);

  // 🔹 Filtrado local
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchDoctor = doctorFilter === "all" || apt.doctor.name === doctorFilter;
      const matchStatus = statusFilter === "all" || apt.status === statusFilter;
      return matchDoctor && matchStatus;
    });
  }, [appointments, doctorFilter, statusFilter]);

  // 🔹 Estilo de eventos
  const eventStyleGetter = (event: any) => {
    let backgroundColor = "#3174ad";
    // switch (event.status) {
    //   case "programada":
    //     backgroundColor = "oklch(85.24% 0.14 178.87)";
    //     break;
    //   case "completada":
    //     backgroundColor = "oklch(46.924% 0.07835 159.789)";
    //     break;
    //   case "cancelada":
    //     backgroundColor = "oklch(0.95 0.01 240)";
    //     break;
    //   case "en-proceso":
    //     backgroundColor = "oklab(64.63% 0.145 0.12)";
    //     break;
    // }
      switch (event.status) {
        case "borrador":
          backgroundColor = "#FBBF24"; // bg-amber-400 - Color amarillo para borrador
          break;
        case "programada":
          backgroundColor = "#27786B"; // bg-primary
          break;
        case "completada":
          backgroundColor = "#E26E52"; // bg-accent
          break;
        case "cancelada":
          backgroundColor = "#E4D1B8"; // bg-muted
          break;
        case "en-proceso":
          backgroundColor = "#D1D5DC"; // bg-secondary
          break;
      }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "black",
        border: "0px",
        display: "block",
      },
    };
  };

  // 🔹 Navegación personalizada
  const handleToday = () => setCurrentDate(new Date());
  const handlePrev = () => {
    if (currentView === Views.MONTH)
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    else if (currentView === Views.WEEK)
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7));
    else
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1));
  };
  const handleNext = () => {
    if (currentView === Views.MONTH)
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    else if (currentView === Views.WEEK)
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7));
    else
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1));
  };
  const handleViewChange = (newView: View) => setCurrentView(newView);

  return (
    <div className="min-h-screen bg-background p-1">
      <div className="max-w-7xl mx-auto space-y-2">
        {/* 🔹 Botón nueva cita */}
        <div className="flex justify-end flex-col md:flex-row gap-4">
          <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nueva Cita
          </Button>
          </div>

          

        {/* Filtros */}
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Doctor</label>
              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {doctors.map((doc) => (
                    <SelectItem key={doc} value={doc}>
                      {doc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            

            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="programada">Programada</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                  <SelectItem value="en-proceso">En Proceso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        </div>
        
        
        <div className="md:w-3/4 flex flex-col gap-x-4 gap-y-1">
          

        {/* Calendario */}
        <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-2 shadow-sm">
        
          <CardContent className="p-1">
              {/* Controles */}
        <div className="flex flex-wrap items-center justify-between p-1 gap-x-3 gap-y-1 mb-2">
          <div className="flex items-center gap-1.5">
            <Button variant="outline" onClick={handleToday}>Hoy</Button>
            <Button variant="outline" onClick={handlePrev}>Anterior</Button>
            <Button variant="outline" onClick={handleNext}>Siguiente</Button>
          </div>

          <span className="text-base font-semibold text-muted-foreground px-3">
            {dfFormat(currentDate, "MMMM yyyy", { locale: es })}
          </span>

          <div className="flex gap-1.5">
            <Button variant={currentView === Views.MONTH ? "default" : "outline"} onClick={() => handleViewChange(Views.MONTH)}>Mes</Button>
            <Button variant={currentView === Views.WEEK ? "default" : "outline"} onClick={() => handleViewChange(Views.WEEK)}>Semana</Button>
            <Button variant={currentView === Views.DAY ? "default" : "outline"} onClick={() => handleViewChange(Views.DAY)}>Día</Button>
            <Button variant={currentView === Views.AGENDA ? "default" : "outline"} onClick={() => handleViewChange(Views.AGENDA)}>Agenda</Button>
          </div>

          
        </div>
            {/* Legend - Minimalista */}
					<div className="flex items-center justify-end gap-3 text-xs">
						<div className="flex items-center gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
							<span>Borrador</span>
						</div>
						<div className="flex items-center gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
							<span>Programada</span>
						</div>
						<div className="flex items-center gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full bg-accent"></div>
							<span>Completada</span>
						</div>
						<div className="flex items-center gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
							<span>En Proceso</span>
						</div>
						<div className="flex items-center gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
							<span>Cancelada</span>
						</div>
					</div>
            {isLoading ? (
              <p className="text-center text-muted-foreground">Cargando citas...</p>
            ) : (
              <div className="h-[550px]">
                <Calendar
                  localizer={localizer}
                  events={filteredAppointments}
                  startAccessor="start"
                  endAccessor="end"
                  date={currentDate}
                  view={currentView}
                  onNavigate={setCurrentDate}
                  onView={setCurrentView}
                  onSelectEvent={(e) => {
                    setSelectedAppointment(e);
                    setSelectedDoctorId(e.idMedico || null);
                    setIsDialogOpen(true);
                  }}
                  eventPropGetter={eventStyleGetter}
                  toolbar={false}
                  popup
                  messages={{
                    next: "Siguiente",
                    previous: "Anterior",
                    today: "Hoy",
                    month: "Mes",
                    week: "Semana",
                    day: "Día",
                    agenda: "Agenda",
                    noEventsInRange: "No hay citas para mostrar.",
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
        </div>
        </div>


        {/* 🔹 Dialogo crear nueva cita */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Cita</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <label htmlFor="paciente-select" className="block text-sm font-medium mb-1">Paciente</label>
                <select
                  id="paciente-select"
                  className="border rounded-md px-2 py-1 w-full"
                  value={newAppointment.idPaciente}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      idPaciente: Number(e.target.value),
                    })
                  }
                  aria-label="Seleccionar paciente"
                >
                  <option value="">Seleccione un paciente</option>
                  {usuarios.map((u) => (
                    <option key={u.idUsuario} value={u.idUsuario}>
                      {u.nombre} {u.apellido1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="medico-select" className="block text-sm font-medium mb-1">Médico</label>
                <select
                  id="medico-select"
                  className="border rounded-md px-2 py-1 w-full"
                  value={newAppointment.idMedico}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      idMedico: Number(e.target.value),
                    })
                  }
                  aria-label="Seleccionar médico"
                >
                  <option value="">Seleccione un médico</option>
                  {usuarios
                    .filter((u) => (u.idRol === 2 || u.rol?.idRol === 2)) // mostrar solo usuarios con rol 2 (médicos/fisioterapeutas)
                    .map((u) => (
                      <option key={u.idUsuario} value={u.idUsuario}>
                        {u.nombre} {u.apellido1}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label htmlFor="servicio-select" className="block text-sm font-medium mb-1">Servicio</label>
                <select
                  id="servicio-select"
                  className="border rounded-md px-2 py-1 w-full"
                  value={newAppointment.idServicio}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      idServicio: Number(e.target.value),
                    })
                  }
                  aria-label="Seleccionar servicio"
                >
                  <option value="">Seleccione un servicio</option>
                  {servicios.map((s) => (
                    <option key={s.idServicio} value={s.idServicio}>
                      {s.nombreServicio}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="fecha-cita-input" className="block text-sm font-medium mb-1">Fecha y hora</label>
                <input
                  id="fecha-cita-input"
                  type="datetime-local"
                  className="border rounded-md px-2 py-1 w-full"
                  value={newAppointment.fechaCita}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      fechaCita: e.target.value,
                    })
                  }
                  aria-label="Fecha y hora de la cita"
                />
              </div>

              <div>
                <label htmlFor="descripcion-textarea" className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  id="descripcion-textarea"
                  className="border rounded-md px-2 py-1 w-full"
                  rows={2}
                  value={newAppointment.descripcion}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      descripcion: e.target.value,
                    })
                  }
                  aria-label="Descripción de la cita"
                />
              </div>

              <div className="flex justify-end pt-3">
                <Button onClick={handleCreateAppointment}>Guardar Cita</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>




{/* 🔹 Dialogo ver detalles de cita
<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent className="max-w-md">
    {selectedAppointment && (
      <>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Detalles de la Cita
          </DialogTitle>
          <DialogDescription>
            Información completa de la cita seleccionada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Servicio</p>
            <p className="text-base font-semibold">{selectedAppointment.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <User className="w-4 h-4" /> Paciente
              </p>
              <p className="text-sm">{selectedAppointment.patient.name}</p>
              <p className="text-xs text-muted-foreground">
                📞 {selectedAppointment.patient.phone}
              </p>
              <p className="text-xs text-muted-foreground">
                ✉️ {selectedAppointment.patient.email}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Stethoscope className="w-4 h-4" /> Médico
              </p>
              <p className="text-sm">{selectedAppointment.doctor.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedAppointment.doctor.specialty}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" /> Fecha y hora
            </p>
            <p className="text-sm">
              {dfFormat(selectedAppointment.start, "PPPp", { locale: es })}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Estado
            </p>
            <Badge
              className={`${statusColors[selectedAppointment.status] || ""}`}
            >
              {statusLabels[selectedAppointment.status] || selectedAppointment.status}
            </Badge>
          </div>

          {selectedAppointment.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Notas
              </p>
              <p className="text-sm">{selectedAppointment.notes}</p>
            </div>
          )}
        </div>
      </>
    )}
  </DialogContent>
</Dialog> */}




        {/* Diálogo de detalles */}
        {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detalles de la Cita</DialogTitle>
              <DialogDescription>
                Información de la cita seleccionada
              </DialogDescription>
            </DialogHeader>

            {selectedAppointment && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge
                    className={
                      statusColors[
                        selectedAppointment.status as keyof typeof statusColors
                      ]
                    }
                  >
                    {
                      statusLabels[
                        selectedAppointment.status as keyof typeof statusLabels
                      ]
                    }
                  </Badge>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {selectedAppointment.patient.name}
                    </p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {selectedAppointment.patient.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {selectedAppointment.patient.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {selectedAppointment.doctor.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.doctor.specialty}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {dfFormat(selectedAppointment.start, "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Notas:</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog> */}
        {/* Diálogo de detalles */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detalles de la Cita</DialogTitle>
              <DialogDescription>
                Información de la cita seleccionada
              </DialogDescription>
            </DialogHeader>

            {selectedAppointment && (
              <div className="space-y-4">
                {/* Estado */}
                <div className="flex items-center justify-between">
                  <Badge
                    className={
                      statusColors[
                        selectedAppointment.status as keyof typeof statusColors
                      ]
                    }
                  >
                    {
                      statusLabels[
                        selectedAppointment.status as keyof typeof statusLabels
                      ]
                    }
                  </Badge>
                </div>

                {/* Paciente */}
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedAppointment.patient.name}</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {selectedAppointment.patient.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {selectedAppointment.patient.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctor */}
                <div className="flex items-start gap-3">
                  <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    {selectedAppointment.status === "borrador" ? (
                      <div>
                        <label htmlFor="doctor-select" className="text-sm font-medium mb-1 block">
                          Asignar Médico *
                        </label>
                        <select
                          id="doctor-select"
                          className="border rounded-md px-2 py-1 w-full text-sm"
                          value={selectedDoctorId || selectedAppointment.idMedico || ""}
                          onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                          required
                          aria-label="Seleccionar médico para confirmar la cita"
                        >
                          <option value="">Seleccione un médico</option>
                          {usuarios.length === 0 ? (
                            <option value="" disabled>Cargando médicos...</option>
                          ) : (
                            usuarios
                              .filter((u: any) => {
                                const esMedico = u.idRol === 2 || u.rol?.idRol === 2;
                                return esMedico && u.activo !== false;
                              })
                              .map((u: any) => (
                                <option key={u.idUsuario} value={u.idUsuario}>
                                  {u.nombre} {u.apellido1}
                                </option>
                              ))
                          )}
                          {usuarios.length > 0 && usuarios.filter((u: any) => u.idRol === 2 || u.rol?.idRol === 2).length === 0 && (
                            <option value="" disabled>No hay médicos disponibles</option>
                          )}
                        </select>
                        {!selectedDoctorId && !selectedAppointment.idMedico && (
                          <p className="text-xs text-red-500 mt-1">
                            Debe seleccionar un médico para confirmar la cita
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">{selectedAppointment.doctor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAppointment.doctor.specialty}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fecha editable */}
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <label htmlFor="fecha-cita-edit-input" className="text-sm font-medium mb-1 block">Fecha y hora:</label>
                    <input
                      id="fecha-cita-edit-input"
                      type="datetime-local"
                      className="border rounded-md px-2 py-1 w-full text-sm"
                      value={dfFormat(selectedAppointment.start, "yyyy-MM-dd'T'HH:mm")}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={(e) =>
                        setSelectedAppointment({
                          ...selectedAppointment,
                          start: new Date(e.target.value),
                          end: new Date(new Date(e.target.value).getTime() + 30 * 60000),
                        })
                      }
                      aria-label="Fecha y hora de la cita"
                    />
                  </div>
                </div>

                {/* Notas */}
                {selectedAppointment.notes && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Notas:</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}

                {/* Botón guardar cambios / confirmar cita */}
                <div className="pt-3 flex justify-end">
                  <Button
                    onClick={async () => {
                      try {
                        const isBorrador = selectedAppointment.status === "borrador";
                        const doctorId = selectedDoctorId || selectedAppointment.idMedico;

                        // Validar que si es borrador, debe tener médico asignado
                        if (isBorrador && !doctorId) {
                          showNotification({
                            type: "error",
                            title: "Error de validación",
                            message: "Debe seleccionar un médico para confirmar la cita.",
                          });
                          return;
                        }

                        const updated: any = {
                          fechaCita: selectedAppointment.start.toISOString(),
                        };

                        // Si es borrador, cambiar estado a programada y asignar médico
                        if (isBorrador) {
                          updated.estadoCita = "programada";
                          updated.idMedico = doctorId;
                        } else if (selectedDoctorId) {
                          // Si no es borrador pero se cambió el médico, actualizarlo
                          updated.idMedico = selectedDoctorId;
                        }

                        await apiClient.put(
                          apiEndpoints.updateCita(String(selectedAppointment.id)),
                          updated
                        );

                        showNotification({
                          type: "success",
                          title: isBorrador ? "Cita confirmada" : "Cita actualizada",
                          message: isBorrador
                            ? "La cita ha sido confirmada y el médico asignado correctamente."
                            : "La cita fue modificada correctamente.",
                        });

                        setIsDialogOpen(false);
                        setSelectedDoctorId(null);
                        await loadAppointments(); // recarga el calendario
                      } catch (err: any) {
                        console.error("❌ Error al actualizar cita:", err);
                        showNotification({
                          type: "error",
                          title: "Error al actualizar",
                          message:
                            err.message ||
                            "No se pudo actualizar la cita.",
                        });
                      }
                    }}
                  >
                    {selectedAppointment.status === "borrador" ? "Confirmar cita" : "Guardar cambios"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
