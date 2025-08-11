"use client"
import './index.css'
import { useState, useMemo } from "react"
import { Calendar,  View, Views, dateFnsLocalizer } from "react-big-calendar"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {  Clock, User, Stethoscope, Phone, Mail,Filter } from 'lucide-react'
import {
format as dfFormat,
parse as dfParse,
startOfWeek,
getDay,
} from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'

const locales = { es }

const localizer = dateFnsLocalizer({
  format: (date, formatStr, options) =>
    dfFormat(date, formatStr, { locale: es, ...options }),
  parse: (value, formatStr, referenceDate, options) =>
    dfParse(value, formatStr, referenceDate, { locale: es, ...options }),
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales,
})

// Mock data structure as specified
const mockAppointments = [
  {
    id: 1,
    title: "Consulta - Juan Pérez",
    patient: {
      name: "Juan Pérez",
      phone: "+506 8888-8888",
      email: "juan.perez@email.com"
    },
    doctor: {
      name: "Dra. María García",
      specialty: "Cardiología"
    },
    start: new Date(2025, 7, 8, 10, 0),
    end: new Date(2025, 7, 8, 10, 30),
    status: "programada",
    type: "consulta-general",
    notes: "Revisión de rutina"
  },
  {
    id: 2,
    title: "Emergencia - Ana López",
    patient: {
      name: "Ana López",
      phone: "+506 7777-7777",
      email: "ana.lopez@email.com"
    },
    doctor: {
      name: "Dr. Carlos Rodríguez",
      specialty: "Medicina General"
    },
    start: new Date(2025, 7, 8, 14, 0),
    end: new Date(2025, 7, 8, 15, 0),
    status: "en-proceso",
    type: "emergencia",
    notes: "Dolor abdominal agudo"
  },
  {
    id: 3,
    title: "Especialidad - Carlos Mendez",
    patient: {
      name: "Carlos Mendez",
      phone: "+506 6666-6666",
      email: "carlos.mendez@email.com"
    },
    doctor: {
      name: "Dr. Luis Fernández",
      specialty: "Dermatología"
    },
    start: new Date(2025, 7, 9, 9, 0),
    end: new Date(2025, 7, 9, 10, 0),
    status: "completada",
    type: "especialidad",
    notes: "Revisión de lunares"
  },
  {
    id: 4,
    title: "Consulta - María Rodríguez",
    patient: {
      name: "María Rodríguez",
      phone: "+506 5555-5555",
      email: "maria.rodriguez@email.com"
    },
    doctor: {
      name: "Dra. Patricia Jiménez",
      specialty: "Pediatría"
    },
    start: new Date(2025, 7, 10, 11, 0),
    end: new Date(2025, 7, 10, 11, 30),
    status: "cancelada",
    type: "consulta-general",
    notes: "Control de crecimiento"
  },
  {
    id: 5,
    title: "Emergencia - Roberto Silva",
    patient: {
      name: "Roberto Silva",
      phone: "+506 4444-4444",
      email: "roberto.silva@email.com"
    },
    doctor: {
      name: "Dr. Miguel Torres",
      specialty: "Traumatología"
    },
    start: new Date(2025, 7, 8, 16, 30),
    end: new Date(2025, 7, 8, 17, 30),
    status: "programada",
    type: "emergencia",
    notes: "Fractura en brazo"
  }
]

const statusColors = {
  "programada": "bg-primary text-text-primary",
  "completada": "bg-accent text-accent-foreground",
  "cancelada": "bg-muted text-muted-foreground",
  "en-proceso": "bg-secondary text-secondary-foreground"
}

const statusLabels = {
  "programada": "Programada",
  "completada": "Completada",
  "cancelada": "Cancelada",
  "en-proceso": "En Proceso"
}

const typeLabels = {
  "consulta-general": "Consulta General",
  "especialidad": "Especialidad",
  "emergencia": "Emergencia"
}



export default function CalendarAdmin() {
    const [currentView, setCurrentView] = useState<View>(Views.MONTH)
      const [currentDate, setCurrentDate] = useState(new Date())
      const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
      const [isDialogOpen, setIsDialogOpen] = useState(false)
      const [doctorFilter, setDoctorFilter] = useState<string>("all")
      const [statusFilter, setStatusFilter] = useState<string>("all")
    
      // Get unique doctors for filter
      const doctors = useMemo(() => {
        const uniqueDoctors = Array.from(new Set(mockAppointments.map(apt => apt.doctor.name)))
        return uniqueDoctors
      }, [])
    
      // Filter appointments based on selected filters
      const filteredAppointments = useMemo(() => {
        return mockAppointments.filter(apt => {
          const doctorMatch = doctorFilter === "all" || apt.doctor.name === doctorFilter
          const statusMatch = statusFilter === "all" || apt.status === statusFilter
          return doctorMatch && statusMatch
        })
      }, [doctorFilter, statusFilter])
    
      // Calculate statistics
      const stats = useMemo(() => {
        const today = new Date()
        const todayAppointments = filteredAppointments.filter(apt => 
          apt.start.toDateString() === today.toDateString()
        )
        
        return {
          total: filteredAppointments.length,
          today: todayAppointments.length,
          programadas: filteredAppointments.filter(apt => apt.status === "programada").length,
          completadas: filteredAppointments.filter(apt => apt.status === "completada").length,
          canceladas: filteredAppointments.filter(apt => apt.status === "cancelada").length,
          enProceso: filteredAppointments.filter(apt => apt.status === "en-proceso").length
        }
      }, [filteredAppointments])
    
      const handleSelectEvent = (event: any) => {
        setSelectedAppointment(event)
        setIsDialogOpen(true)
      }
    
      const handleNavigate = (newDate: Date) => {
        setCurrentDate(newDate)
      }
    
      const handleViewChange = (view: View) => {
        setCurrentView(view)
      }
    
      const eventStyleGetter = (event: any) => {
        let backgroundColor = '#3174ad'
        let textColor = 'text-text-primary'
        
        switch (event.status) {
          case 'programada':
            backgroundColor = 'oklch(85.24% 0.14 178.87)'
            textColor = 'black'
            break
          case 'completada':
            backgroundColor = 'oklch(46.924% 0.07835 159.789)'
            textColor = 'white'
            break
          case 'cancelada':
            backgroundColor = 'oklch(0.95 0.01 240)'
            textColor = 'black'
            break
          case 'en-proceso':
            backgroundColor = 'oklab(64.63% 0.145 0.12)'
            textColor = 'white'
            break
        }
    
        return {
          style: {
            backgroundColor,
            borderRadius: '4px',
            opacity: 0.8,
            color: textColor,
            border: '0px',
            display: 'block'
          }
        }
      }
    
      return (
          <div>
            
    
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-4">
                
    
                {/* Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filtros
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Doctor</label>
                      <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los doctores</SelectItem>
                          {doctors.map(doctor => (
                            <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
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
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="programada">Programada</SelectItem>
                          <SelectItem value="completada">Completada</SelectItem>
                          <SelectItem value="en-proceso">En Proceso</SelectItem>
                          <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
    
                
              </div>
    
              {/* Calendar */}
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="p-6">
                    <div className="h-[600px]">
                      <Calendar
                        localizer={localizer}
                        events={filteredAppointments}
                        startAccessor="start"
                        endAccessor="end"
                        view={currentView}
                        onView={handleViewChange}
                        date={currentDate}
                        onNavigate={handleNavigate}
                        onSelectEvent={handleSelectEvent}
                        eventPropGetter={eventStyleGetter}
                        messages={{
                          next: "Siguiente",
                          previous: "Anterior",
                          today: "Hoy",
                          month: "Mes",
                          week: "Semana",
                          day: "Día",
                          agenda: "Agenda",
                          date: "Fecha",
                          time: "Hora",
                          event: "Evento",
                          noEventsInRange: "No hay citas en este rango de fechas",
                          showMore: (total) => `+ Ver ${total} más`
                        }}
                        formats={{
                          timeGutterFormat: "HH:mm",
                          eventTimeRangeFormat: ({ start, end }) =>
                            `${dfFormat(start, "HH:mm", { locale: es })} - ${dfFormat(end, "HH:mm", { locale: es })}`,
                          dayHeaderFormat: "EEEE dd/MM",
                          monthHeaderFormat: "MMMM yyyy",
                          dayRangeHeaderFormat: ({ start, end }) =>
                            `${dfFormat(start, "dd/MM", { locale: es })} - ${dfFormat(end, "dd/MM/yyyy", { locale: es })}`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
    
            {/* Appointment Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Detalles de la Cita</DialogTitle>
                    <DialogDescription>
                        Información detallada sobre la cita médica seleccionada
                    </DialogDescription>
                    <Link
                    href="/admin/appointments/1"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
                  >
                    
                    Editar cita
                  </Link>
                </DialogHeader>
                {selectedAppointment && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={statusColors[selectedAppointment.status as keyof typeof statusColors]}>
                        {statusLabels[selectedAppointment.status as keyof typeof statusLabels]}
                      </Badge>
                      <Badge variant="outline">
                        {typeLabels[selectedAppointment.type as keyof typeof typeLabels]}
                      </Badge>
                    </div>
    
                    <div className="space-y-3">
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
    
                      <div className="flex items-start gap-3">
                        <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">{selectedAppointment.doctor.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedAppointment.doctor.specialty}</p>
                        </div>
                      </div>
    
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                         <p className="font-medium">
                          {dfFormat(selectedAppointment.start, "dd/MM/yyyy", { locale: es })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {dfFormat(selectedAppointment.start, "HH:mm")} - {dfFormat(selectedAppointment.end, "HH:mm")}
                        </p>
                        </div>
                      </div>
    
                      {selectedAppointment.notes && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm font-medium mb-1">Notas:</p>
                          <p className="text-sm text-muted-foreground">{selectedAppointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

      )
    }