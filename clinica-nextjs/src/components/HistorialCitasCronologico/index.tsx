"use client";

import { useState, useEffect, JSX } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  User,
  Eye,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  Activity,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  Filter,
  Search,
  Expand,
  Minimize,
  Edit,
  Save,
  X,
  FileText,
} from "lucide-react";

import { downloadHistorialPDF, printHistorial } from "@/components/PDFGenerator/PDFGenerator";
import { useApiClient } from "@/utils/apiClient";
import { useUser } from "@clerk/nextjs";

export interface Expediente {
  idExpediente: number;
  idPaciente: number;
  cedula: string;
  estado: string;
  idMedico: number;
  descripcion?: string;
  fechaCreacion: string;
  evaluaciones: Evaluacion[];
  documentos: any[];
  archivos: any[];
}

export interface Paciente {
  idUsuario: number;
  nombre: string;
  apellido1: string;
  apellido2?: string | null;
  fechaNacimiento: string;
  fechaRegistro: string;
  telefonoPrincipal: string;
  telefonoSecundario?: string | null;
  correoElectronico: string;
  contrasena: string;
  direccionResidencia?: string | null;
  clerkId?: string | null;
  idRol: number;
  activo: boolean;
  expedientesComoPaciente?: Expediente[];
}

interface Evaluacion {
  idEvaluacion?: number;
  idCita?: number;
  idPaciente: number;
  idDoctor?: number | null;
  fecha?: string;
  sintomasReportados?: string;
  evaluacionFisica?: string;
  diagnosticoPrincipal?: string;
  planTratamiento?: string;
  recomendaciones?: string;
  idExpediente?: number | null;
}

interface Cita {
  idCita: number;
  fechaCita: string | Date | null;
  duracionMinutos: number | null;
  estadoCita: string | null;
  idMedico: number | null;
  idServicio: number | null;
  tipo?: string;
  descripcion?: string | null;
  idPaciente: number;
  paciente?: Paciente | null;
  medico?: {
    idUsuario: number;
    nombre: string;
    apellido1: string;
    apellido2?: string | null;
  } | null;
  servicio?: {
    idServicio: number;
    nombreServicio: string;
    descripcion?: string | null;
  } | null;
  evaluaciones: Evaluacion[];
}

function useRoleConfig(role: string | undefined) {
  const esPaciente = role === "paciente";
  const esStaff = role === "admin" || role === "fisioterapeuta";
 
  const endpoint = esPaciente
    ? "/citas/historial/paciente"
    : "/citas/hoy/mis-citas";
 
  return { esPaciente, esStaff, endpoint };
}

export default function HistorialCitasCronologico() {
  const api = useApiClient();
  const { user } = useUser();

  const userRole = user?.publicMetadata?.role as string | undefined;
  const { esPaciente, esStaff, endpoint } = useRoleConfig(userRole);

  const [citas, setCitas] = useState<Cita[]>([]);
  const [doctor, setDoctor] = useState<{ nombre?: string; apellido1?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedCitas, setExpandedCitas] = useState<Set<number>>(new Set());
  const [editingCitaId, setEditingCitaId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Evaluacion>({
    idPaciente: 0,
    sintomasReportados: "",
    evaluacionFisica: "",
    diagnosticoPrincipal: "",
    planTratamiento: "",
    recomendaciones: "",
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // Cargar citas del día
  useEffect(() => {
    if (!user || !api) return;
    if (!esPaciente && !esStaff) return;

    let isMounted = true;

    const cargarCitas = async () => {
      try {
        setLoading(true);
        setError(null);

        //const response = await api.get("/citas/hoy/mis-citas");
        const response = await api.get(endpoint);

        if (!isMounted) return;

        const citasConEvaluaciones = (response.citas || []).map((c: any) => {
          const eva =
            c.evaluaciones && Array.isArray(c.evaluaciones)
              ? c.evaluaciones
              : c.diagnosticos && Array.isArray(c.diagnosticos)
              ? c.diagnosticos
              : c.diagnostico
              ? [c.diagnostico] 
              : [];

          return {
            ...c,
            evaluaciones: eva,
          };
        });

        setCitas(citasConEvaluaciones);

        setDoctor({
          nombre: user.firstName || "Fisioterapeuta",
          apellido1: user.lastName || "",
        });
      } catch (err) {
        if (isMounted) {
          setError("Error al cargar las citas del día");
          console.error(err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    cargarCitas();

    return () => {
      isMounted = false;
    };
  }, [user, endpoint]);


  const toggleExpansion = (id: number) => {
    setExpandedCitas((prev) => {
      const nuevo = new Set(prev);
      const expanded = nuevo.has(id);

      if (expanded) {
        // Si estaba expandida → colapsar
        nuevo.delete(id);
      } else {
        // Si se va a expandir → cargar evaluación si existe
        nuevo.add(id);

        const cita = citas.find((c) => c.idCita === id);
        if (cita && !editingCitaId) {
          const evaluacion = obtenerEvaluacion(cita);

          if (evaluacion) {
            setFormData({
              idEvaluacion: evaluacion.idEvaluacion,
              idCita: cita.idCita,
              idPaciente: cita.idPaciente,
              fecha: evaluacion.fecha || new Date().toISOString().split("T")[0],
              sintomasReportados: evaluacion.sintomasReportados || "",
              evaluacionFisica: evaluacion.evaluacionFisica || "",
              diagnosticoPrincipal: evaluacion.diagnosticoPrincipal || "",
              planTratamiento: evaluacion.planTratamiento || "",
              recomendaciones: evaluacion.recomendaciones || "",
            });
          }
        }
      }

      return nuevo;
    });
  };


  const obtenerEvaluacion = (cita: Cita): Evaluacion | null => {
    return cita.evaluaciones.length > 0 ? cita.evaluaciones[0] : null;
  };

  const evaluacionCompleta = (evalData: Evaluacion | null): boolean => {
    if (!evalData) return false;
    return !!(
      evalData.sintomasReportados?.trim() &&
      evalData.evaluacionFisica?.trim() &&
      evalData.diagnosticoPrincipal?.trim() &&
      evalData.planTratamiento?.trim() &&
      evalData.recomendaciones?.trim()
    );
  };

  const iniciarEdicion = (cita: Cita) => {
    const evaluacion = obtenerEvaluacion(cita);
    const idExpediente =
    cita.paciente?.expedientesComoPaciente?.[0]?.idExpediente ?? null;
    setEditingCitaId(cita.idCita);
    setFormData({
      idEvaluacion: evaluacion?.idEvaluacion || undefined,
      idCita: cita.idCita,
      idPaciente: cita.idPaciente,
      idDoctor: cita.idMedico,
      idExpediente,
      fecha: new Date().toISOString().split("T")[0],
      sintomasReportados: evaluacion?.sintomasReportados || "",
      evaluacionFisica: evaluacion?.evaluacionFisica || "",
      diagnosticoPrincipal: evaluacion?.diagnosticoPrincipal || "",
      planTratamiento: evaluacion?.planTratamiento || "",
      recomendaciones: evaluacion?.recomendaciones || "",
    });
  };

  const cancelarEdicion = () => {
    setEditingCitaId(null);
    setFormData({
      idPaciente: 0,
      sintomasReportados: "",
      evaluacionFisica: "",
      diagnosticoPrincipal: "",
      planTratamiento: "",
      recomendaciones: "",
    });
  };

  const guardarEvaluacion = async () => {
    if (!editingCitaId) return;

    try {
      let evaluacionGuardada;

      if (formData.idEvaluacion) {
        // Actualizar
        evaluacionGuardada = await api.put(`/diagnosticos/diagCita/${formData.idEvaluacion}`, formData);
      } else {
        // Crear nueva
        evaluacionGuardada = await api.post("/diagnosticos/diagCita", formData);
      }

      // Normalizar respuesta      
      const nuevaEval = evaluacionGuardada.data || evaluacionGuardada;

      // Guardar idEvaluacion en formData para futuras ediciones
      setFormData((prev) => ({
        ...prev,
        idEvaluacion: nuevaEval.idEvaluacion,
      }));

      //Actualizar la cita en el estado
      setCitas((prev) =>
      prev.map((c) =>
        c.idCita === editingCitaId
          ? { ...c, evaluaciones: [nuevaEval] }
          : c
      )
    );

      cancelarEdicion();
    } catch (err: any) {
      console.error("Error guardando evaluación:", err);
      
      // Intentar obtener el mensaje de error específico
      let errorMessage = "No se pudo guardar la evaluación";
      
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      alert(errorMessage);
    }
  };

  const cambiarEstadoCita = async (cita: Cita, estado: "completada" | "cancelada") => {
    if (estado === "completada" && !evaluacionCompleta(obtenerEvaluacion(cita))) {
      alert("Debes completar toda la evaluación antes de marcar como Completada");
      return;
    }

    try {
      await api.put(`/citas/${cita.idCita}`, { estadoCita: estado });

      setCitas((prev) =>
        prev.map((c) => (c.idCita === cita.idCita ? { ...c, estadoCita: estado } : c))
      );
    } catch (err) {
      alert("Error al actualizar el estado de la cita");
    }
  };

  const citasFiltradas = citas.filter((c) => {
    const matchEstado = filtroEstado === "todos" || c.estadoCita === filtroEstado;
    const matchTipo = filtroTipo === "todos" || c.tipo === filtroTipo;
    // Pacientes buscan por nombre del médico; staff busca por nombre del paciente
    const textoBusqueda = esPaciente
      ? `${c.medico?.nombre ?? ""} ${c.medico?.apellido1 ?? ""}`.toLowerCase()
      : `${c.paciente?.nombre ?? ""} ${c.paciente?.apellido1 ?? ""}`.toLowerCase();

    const matchTexto =
      !busqueda ||
      textoBusqueda.includes(busqueda.toLowerCase()) ||
      c.descripcion?.toLowerCase().includes(busqueda.toLowerCase());

    return matchEstado && matchTipo && matchTexto;
  });

  const formatFecha = (fecha: string | Date | null) => {
    if (!fecha) return "Fecha no disponible";
    try {
      const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
      if (isNaN(fechaObj.getTime())) return "Fecha inválida";
      
      return new Intl.DateTimeFormat("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(fechaObj);
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return "Fecha inválida";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {esPaciente ? "Cargando tu historial de citas..." : "Cargando citas del día..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <AlertCircle className="w-16 h-16 mx-auto mx-auto mb-4" />
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-3 mb-6">
        <Button variant="outline" onClick={() => setMostrarFiltros(!mostrarFiltros)}>
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>

        <Button
          variant="outline"
          onClick={() => setExpandedCitas(new Set(citas.map((c) => c.idCita)))}
        >
          <Expand className="w-4 h-4 mr-2" />
          Expandir todas
        </Button>

        <Button variant="outline" onClick={() => setExpandedCitas(new Set())}>
          <Minimize className="w-4 h-4 mr-2" />
          Colapsar todas
        </Button>
      </div>

      {/* Filtros */}
        {mostrarFiltros && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Búsqueda: paciente busca médico, staff busca paciente */}
                
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={esPaciente ? "Buscar médico..." : "Buscar paciente..."}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
                


                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-background"
                  aria-label="Filtrar por estado de cita"
                  title="Filtrar por estado de cita"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="programada">Programada</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>

                {esStaff && (

                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-background"
                  aria-label="Filtrar por tipo de cita"
                  title="Filtrar por tipo de cita"
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="consulta">Consulta</option>
                  <option value="tratamiento">Tratamiento</option>
                  <option value="evaluacion">Evaluación</option>
                  <option value="seguimiento">Seguimiento</option>
                </select>
                )}

              </div>
            </CardContent>
          </Card>
      )}

      {/* Lista de citas */}
      <div className="space-y-4">
        {citasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <CalendarDays className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">
                  {esPaciente ? "No tienes citas registradas" : "No hay citas para hoy"}
                </p>
              </CardContent>
            </Card>
        ) : (
          citasFiltradas.map((cita) => {
              const isExpanded = expandedCitas.has(cita.idCita);
              const isEditing = editingCitaId === cita.idCita;
              const evaluacion = obtenerEvaluacion(cita);
              const puedeEditar =
                esStaff &&
                ["programada", "confirmada", "en_proceso"].includes(cita.estadoCita ?? "");

            return (
              <Card key={cita.idCita} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" onClick={() => toggleExpansion(cita.idCita)}>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </Button>

                      <div className="flex items-center gap-3">
                        {cita.tipo ? getTipoIcon(cita.tipo) : <Stethoscope className="w-5 h-5" />}
                        <div>
                          {/* Paciente ve el nombre del médico; staff ve el nombre del paciente */}
                          <div className="font-semibold">
                            {esPaciente
                              ? cita.medico
                                ? `Dr. ${cita.medico.nombre} ${cita.medico.apellido1}`
                                : "Médico no asignado"
                              : cita.paciente
                              ? `${cita.paciente.nombre} ${cita.paciente.apellido1}`
                              : "Paciente no disponible"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatFecha(cita.fechaCita)}
                            {cita.duracionMinutos && ` · ${cita.duracionMinutos} min`}
                            {cita.servicio && ` · ${cita.servicio.nombreServicio}`}
                          </div>
                        </div>

                        <Badge className={getEstadoColor(cita.estadoCita ?? '')}>
                          {getEstadoText(cita.estadoCita ?? '')}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {puedeEditar && (
                        <>
                          <Button
                            size="sm"
                            disabled={!evaluacionCompleta(evaluacion)}
                            onClick={() => cambiarEstadoCita(cita, "completada")}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Completar
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cambiarEstadoCita(cita, "cancelada")}
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </>
                      )}

                      <Button variant="ghost" size="sm" onClick={() => toggleExpansion(cita.idCita)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="border-t pt-6">
                    <div className="space-y-6">
                      {/* Evaluación Diagnóstica */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Stethoscope className="w-5 h-5" />
                            Evaluación Diagnóstica
                          </h3>

                          {puedeEditar && (
                            <div className="flex gap-2">
                              {isEditing ? (
                                <>
                                  <Button size="sm" onClick={guardarEvaluacion}>
                                    <Save className="w-4 h-4 mr-2" /> Guardar
                                  </Button>

                                  <Button size="sm" variant="outline" onClick={cancelarEdicion}>
                                    <X className="w-4 h-4 mr-2" /> Cancelar
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => iniciarEdicion(cita)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  {evaluacion ? "Editar" : "Crear"} Evaluación
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* FORM EDICIÓN */}
                        {isEditing ? (
                          <div className="space-y-4">
                            {[
                              { key: "sintomasReportados", label: "Síntomas Reportados" },
                              { key: "evaluacionFisica", label: "Evaluación Física" },
                              { key: "diagnosticoPrincipal", label: "Diagnóstico Principal" },
                              { key: "planTratamiento", label: "Plan de Tratamiento" },
                              { key: "recomendaciones", label: "Recomendaciones" },
                            ].map(({ key, label }) => (
                              <div key={key}>
                                <Label>{label}</Label>
                                <Textarea
                                  value={formData[key as keyof Evaluacion] || ""}
                                  onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, [key]: e.target.value }))
                                  }
                                  className="mt-1"
                                  rows={3}
                                />
                              </div>
                            ))}
                          </div>
                        ) : evaluacion ? (
                          <div className="space-y-3 text-sm text-muted-foreground">
                            <p>
                              <strong>Síntomas:</strong>{" "}
                              {evaluacion.sintomasReportados || "—"}
                            </p>
                            <p>
                              <strong>Evaluación Física:</strong>{" "}
                              {evaluacion.evaluacionFisica || "—"}
                            </p>
                            <p>
                              <strong>Diagnóstico:</strong>{" "}
                              {evaluacion.diagnosticoPrincipal}
                            </p>
                            <p>
                              <strong>Plan:</strong>{" "}
                              {evaluacion.planTratamiento || "—"}
                            </p>
                            <p>
                              <strong>Recomendaciones:</strong>{" "}
                              {evaluacion.recomendaciones || "—"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic">
                            No hay evaluación registrada para esta cita
                          </p>
                        )}
                      </div>

                      {/* BOTONES PDF
                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            printHistorial([cita as any], (doctor?.nombre ?? "") + " " + (doctor?.apellido1 ?? ""))
                          }
                        >
                          Imprimir Cita
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            downloadHistorialPDF(
                              [cita as any],
                              (doctor?.nombre ?? "") + " " + (doctor?.apellido1 ?? "")
                            )
                          }
                        >
                          PDF Cita
                        </Button>
                      </div> */}
                    </div>
                  </CardContent>
                )}
                </Card>
              );
            })
          )}
        </div>
    </div>
  );
}

/* -------------------------
   FUNCIONES AUXILIARES
-------------------------- */

function getEstadoColor(estado?: string) {
  const colors: Record<string, string> = {
    programada: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
    confirmada: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
    en_proceso: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
    completada: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    cancelada: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  };
  if(!estado || estado === ''){
	  return "bg-gray-100 text-gray-800"
  }
  return colors[estado] || "bg-gray-100 text-gray-800";
}

function getEstadoText(estado: string) {
  const textos: Record<string, string> = {
    programada: "Programada",
    confirmada: "Confirmada",
    en_proceso: "En Proceso",
    completada: "Completada",
    cancelada: "Cancelada",
  };
  return textos[estado] || estado;
}

function getTipoIcon(tipo?: string) {
  const icons: Record<string, JSX.Element> = {
    consulta: <Stethoscope className="w-5 h-5" />,
    tratamiento: <Activity className="w-5 h-5" />,
    evaluacion: <FileText className="w-5 h-5" />,
    seguimiento: <TrendingUp className="w-5 h-5" />,
  };
  return icons[tipo || ""] || <Calendar className="w-5 h-5" />;
}
