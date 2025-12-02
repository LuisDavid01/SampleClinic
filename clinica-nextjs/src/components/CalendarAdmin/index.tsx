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
  addMinutes,
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

  // Modal de creación
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    idPaciente: "" as number | "",
    idMedico: "" as number | "",
    idServicio: "" as number | "",
    fechaCita: "",
    duracionMinutos: 30,
    descripcion: "",
  });

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);

  // Cargar citas
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

  // Cargar listas de usuarios y servicios para crear citas
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

  // Crear cita nueva
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

      // preparar payload
      const payload = {
        idPaciente: Number(newAppointment.idPaciente),
        idMedico: Number(newAppointment.idMedico),
        idServicio: newAppointment.idServicio ? Number(newAppointment.idServicio) : null,
        fechaCita: new Date(newAppointment.fechaCita).toISOString(),
        duracionMinutos: Number(newAppointment.duracionMinutos || 30),
        descripcion: newAppointment.descripcion || "",
        estadoCita: "programada",
      };

      const response = await apiClient.post(apiEndpoints.createCita(), payload);

      // Verificar si hay un conflicto de horario (respuesta informativa)
      if (response.success === false && response.info === 'Conflicto de horario') {
        showNotification({
          type: "warning",
          title: "Conflicto de horario",
          message: response.message || "No es posible agendar dos citas en el mismo horario.",
        });
        return; // No cerrar el diálogo ni recargar citas
      }

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
        duracionMinutos: 30,
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

  // Lista de doctores para el filtro
  const doctors = useMemo(() => {
    const names = Array.from(new Set(appointments.map((a) => a.doctor.name)));
    return names;
  }, [appointments]);

  // Filtrado local
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchDoctor = doctorFilter === "all" || apt.doctor.name === doctorFilter;
      const matchStatus = statusFilter === "all" || apt.status === statusFilter;
      return matchDoctor && matchStatus;
    });
  }, [appointments, doctorFilter, statusFilter]);

  // Estilo de eventos
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

  // Navegación personalizada
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


        {/* Dialogo crear nueva cita */}
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

        {/* Diálogo de detalles / editar cita */}
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
                      value={selectedAppointment.start ? dfFormat(selectedAppointment.start, "yyyy-MM-dd'T'HH:mm") : ""}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={(e) =>
                        setSelectedAppointment({
                          ...selectedAppointment,
                          start: new Date(e.target.value),
                          end: new Date(new Date(e.target.value).getTime() + (selectedAppointment.raw?.duracionMinutos ?? 30) * 60000),
                          raw: {
                            ...selectedAppointment.raw,
                            fechaCita: new Date(e.target.value).toISOString(),
                          }
                        })
                      }
                      aria-label="Fecha y hora de la cita"
                    />
                    <label htmlFor="duracion-select" className="block text-sm font-medium mb-1 mt-2">Duración</label>
                    <select
                      id="duracion-select"
                      className="border rounded-md px-2 py-1 w-full"
                      value={selectedAppointment.raw?.duracionMinutos ?? 30}
                      onChange={(e) =>
                        setSelectedAppointment({
                          ...selectedAppointment,
                          end: new Date(new Date(selectedAppointment.start).getTime() + Number(e.target.value) * 60000),
                          raw: {
                            ...selectedAppointment.raw,
                            duracionMinutos: Number(e.target.value),
                          }
                        })
                      }
                    >
                      <option value={30}>30 minutos</option>
                      <option value={60}>1 hora</option>
                    </select>
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
                          title: err?.status === 409 ? "Conflicto de horario" : "Error al actualizar",
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
