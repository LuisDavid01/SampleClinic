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
  TrendingUp
} from "lucide-react";
import { Cita, Diagnostico } from "@/types/paciente";
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
  }
];

const getEstadoColor = (estado: Cita['estado']) => {
  switch (estado) {
    case 'programada':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'confirmada':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'en_proceso':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completada':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'cancelada':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
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

export default function PacientesPage() {
  const { user } = useUser();
  const [citas, setCitas] = useState<Cita[]>(citasEjemplo);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  // Filtrar citas
  const citasFiltradas = citas.filter(cita => {
    const cumpleEstado = filtroEstado === 'todos' || cita.estado === filtroEstado;
    const cumpleBusqueda = busqueda === '' || 
      cita.fisioterapeutaNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cita.tipo.toLowerCase().includes(busqueda.toLowerCase()) ||
      cita.sintomas?.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleEstado && cumpleBusqueda;
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
  const citasCompletadas = citas.filter(c => c.estado === 'completada').length;
  const proximaCita = citas.filter(c => c.estado === 'programada').sort((a, b) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  )[0];

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con diseño médico */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-accent">
                  Mi Historial Médico
                </h1>
                <p className="text-text-primary mt-1">
                  Seguimiento de tus citas y tratamientos en la clínica
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Historial
              </Button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">Total de Citas</p>
                  <p className="text-2xl font-bold text-accent">{totalCitas}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">Citas Completadas</p>
                  <p className="text-2xl font-bold text-green-600">{citasCompletadas}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">Próxima Cita</p>
                  <p className="text-lg font-semibold text-accent">
                    {proximaCita ? formatFecha(proximaCita.fecha) : 'No programada'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Clock className="w-6 h-6 text-purple-600" />
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por fisioterapeuta, tipo de cita o síntomas..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent "
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-3 border border-gray-200 text-text-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent "
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
            </div>
          </CardContent>
        </Card>

        {/* Lista de Citas */}
        <div className="space-y-4">
          {citasOrdenadas.length === 0 ? (
            <Card className="bg-card border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <CalendarDays className="w-16 h-16 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  No hay citas encontradas
                </h3>
                <p className="text-gray-500">
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
                      <div className="p-3 bg-blue-100 text-accent rounded-full">
                        {getTipoIcon(cita.tipo)}
                      </div>
                      <div>
                        <CardTitle className="text-xl text-accent">
                          {getTipoText(cita.tipo)} - {formatFecha(cita.fecha)}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-text-primary">
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
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
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
                        <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                          <Stethoscope className="w-4 h-4" />
                          Síntomas Reportados:
                        </h4>
                        <p className="text-sm text-text-primary  p-3 rounded-lg">{cita.sintomas}</p>
                      </div>
                      {cita.diagnostico && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Diagnóstico:
                          </h4>
                          <p className="text-sm text-text-primary bg-blue-50 p-3 rounded-lg">{cita.diagnostico}</p>
                        </div>
                      )}
                      {cita.recomendaciones && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Recomendaciones:
                          </h4>
                          <p className="text-sm text-text-primary bg-green-50 p-3 rounded-lg">{cita.recomendaciones}</p>
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