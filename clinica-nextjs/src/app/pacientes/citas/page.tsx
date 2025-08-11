"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Download, 
  Eye,
  Search,
  Filter,
  CalendarDays,
  Stethoscope,
  Activity,
  TrendingUp,
  Plus,
  CheckCircle
} from "lucide-react";
import { Cita } from "@/types/paciente";
import Link from "next/link";

// Datos de ejemplo - en producción vendrían de una API
const citasEjemplo: Cita[] = [
  {
    id: "1",
    pacienteId: "paciente1",
    fisioterapeutaId: "fisio1",
    fisioterapeutaNombre: "Dr. Esteban Porras",
    fecha: new Date("2024-01-15"),
    hora: "09:00",
    duracion: 60,
    estado: "completada",
    tipo: "consulta",
    sintomas: "Dolor en la rodilla derecha",
    diagnostico: "Tendinitis rotuliana",
    tratamiento: "Terapia manual y ejercicios de fortalecimiento",
    recomendaciones: "Aplicar hielo 3 veces al día, evitar actividades de alto impacto"
  },
  {
    id: "2",
    pacienteId: "paciente1",
    fisioterapeutaId: "fisio1",
    fisioterapeutaNombre: "Dr. Esteban Porras",
    fecha: new Date("2024-01-22"),
    hora: "10:30",
    duracion: 45,
    estado: "completada",
    tipo: "tratamiento",
    sintomas: "Mejora del dolor, pero aún presente",
    diagnostico: "Tendinitis rotuliana - Mejoría",
    tratamiento: "Continuar con ejercicios de fortalecimiento, agregar estiramientos",
    recomendaciones: "Mantener rutina de ejercicios, evitar escaleras"
  },
  {
    id: "3",
    pacienteId: "paciente1",
    fisioterapeutaId: "fisio2",
    fisioterapeutaNombre: "Dra. María González",
    fecha: new Date("2024-02-05"),
    hora: "14:00",
    duracion: 60,
    estado: "programada",
    tipo: "seguimiento",
    sintomas: "Dolor reducido significativamente",
    diagnostico: "Tendinitis rotuliana - Recuperación avanzada",
    tratamiento: "Evaluación de progreso y ajuste de tratamiento",
    recomendaciones: "Continuar con ejercicios, programar próxima cita"
  },
  {
    id: "4",
    pacienteId: "paciente1",
    fisioterapeutaId: "fisio1",
    fisioterapeutaNombre: "Dr. Esteban Porras",
    fecha: new Date("2024-02-12"),
    hora: "11:00",
    duracion: 60,
    estado: "confirmada",
    tipo: "evaluacion",
    sintomas: "Evaluación de progreso post-tratamiento",
    diagnostico: "Evaluación de recuperación",
    tratamiento: "Evaluación completa del estado actual",
    recomendaciones: "Preparar preguntas para la evaluación"
  }
];

const getEstadoColor = (estado: Cita['estado']) => {
  switch (estado) {
    case 'programada':
      return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'confirmada':
      return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
    case 'en_proceso':
      return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    case 'completada':
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    case 'cancelada':
      return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  }
};

const getEstadoText = (estado: Cita['estado']) => {
  switch (estado) {
    case 'programada':
      return 'Programada';
    case 'confirmada':
      return 'Confirmada';
    case 'en_proceso':
      return 'En Proceso';
    case 'completada':
      return 'Completada';
    case 'cancelada':
      return 'Cancelada';
    default:
      return estado;
  }
};

const getTipoText = (tipo: Cita['tipo']) => {
  switch (tipo) {
    case 'consulta':
      return 'Consulta';
    case 'tratamiento':
      return 'Tratamiento';
    case 'evaluacion':
      return 'Evaluación';
    case 'seguimiento':
      return 'Seguimiento';
    default:
      return tipo;
  }
};

const getTipoIcon = (tipo: Cita['tipo']) => {
  switch (tipo) {
    case 'consulta':
      return <Stethoscope className="w-5 h-5" />;
    case 'tratamiento':
      return <Activity className="w-5 h-5" />;
    case 'evaluacion':
      return <FileText className="w-5 h-5" />;
    case 'seguimiento':
      return <TrendingUp className="w-5 h-5" />;
    default:
      return <Calendar className="w-5 h-5" />;
  }
};

export default function CitasPage() {
  const { user } = useUser();
  const [citas, setCitas] = useState<Cita[]>(citasEjemplo);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  // Filtrar citas
  const citasFiltradas = citas.filter(cita => {
    const cumpleEstado = filtroEstado === 'todos' || cita.estado === filtroEstado;
    const cumpleTipo = filtroTipo === 'todos' || cita.tipo === filtroTipo;
    const cumpleBusqueda = busqueda === '' || 
      cita.fisioterapeutaNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cita.tipo.toLowerCase().includes(busqueda.toLowerCase()) ||
      cita.sintomas?.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleEstado && cumpleTipo && cumpleBusqueda;
  });

  // Ordenar por fecha (más reciente primero)
  const citasOrdenadas = [...citasFiltradas].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  const formatFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(fecha);
  };

  // Estadísticas
  const totalCitas = citas.length;
  const citasProgramadas = citas.filter(c => c.estado === 'programada').length;
  const citasConfirmadas = citas.filter(c => c.estado === 'confirmada').length;
  const proximaCita = citas.filter(c => c.estado === 'programada' || c.estado === 'confirmada').sort((a, b) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  )[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con diseño médico */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Mis Citas
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gestiona y revisa todas tus citas médicas
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="border-primary/20 text-primary hover:bg-primary/5"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cita
              </Button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Citas</p>
                  <p className="text-2xl font-bold text-foreground">{totalCitas}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Programadas</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{citasProgramadas}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmadas</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{citasConfirmadas}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Próxima Cita</p>
                  <p className="text-lg font-semibold text-foreground">
                    {proximaCita ? formatFecha(proximaCita.fecha) : 'No programada'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-card border-0 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por fisioterapeuta, tipo de cita o síntomas..."
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground placeholder:text-muted-foreground"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="programada">Programada</option>
                <option value="confirmada">Confirmada</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
              <select
                className="px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="todos">Todos los tipos</option>
                <option value="consulta">Consulta</option>
                <option value="tratamiento">Tratamiento</option>
                <option value="evaluacion">Evaluación</option>
                <option value="seguimiento">Seguimiento</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Citas */}
        <div className="space-y-4">
          {citasOrdenadas.length === 0 ? (
            <Card className="bg-card border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <CalendarDays className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  No hay citas encontradas
                </h3>
                <p className="text-muted-foreground">
                  No se encontraron citas con los filtros aplicados.
                </p>
              </CardContent>
            </Card>
          ) : (
            citasOrdenadas.map((cita) => (
              <Card key={cita.id} className="bg-card border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        {getTipoIcon(cita.tipo)}
                      </div>
                      <div>
                        <CardTitle className="text-xl text-foreground">
                          {getTipoText(cita.tipo)} - {formatFecha(cita.fecha)}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {cita.hora} ({cita.duracion} min)
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {cita.fisioterapeutaNombre}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getEstadoColor(cita.estado)} border`}>
                        {getEstadoText(cita.estado)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-primary/20 text-primary hover:bg-primary/5"
                      >
                        <Link href={`/pacientes/citas/${cita.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalles
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {cita.sintomas && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Stethoscope className="w-4 h-4" />
                          Síntomas Reportados:
                        </h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{cita.sintomas}</p>
                      </div>
                      {cita.diagnostico && (
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Diagnóstico:
                          </h4>
                          <p className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg">{cita.diagnostico}</p>
                        </div>
                      )}
                      {cita.recomendaciones && (
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Recomendaciones:
                          </h4>
                          <p className="text-sm text-muted-foreground bg-green-500/5 dark:bg-green-400/10 p-3 rounded-lg">{cita.recomendaciones}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 