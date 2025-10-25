"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  FileText,
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
  Pill,
  FileImage,
  FileVideo,
  FileAudio,
  File
} from "lucide-react";
import { Cita, Diagnostico, Medicamento, Archivo } from "@/types/PacienteTypes";
import { useCitasCronologicas } from "@/hooks/useCitasCronologicas";
import { downloadHistorialPDF, printHistorial } from "@/components/PDFGenerator/PDFGenerator";

// Función para obtener datos de diagnóstico desde la cita
const obtenerDatosDiagnostico = (cita: Cita): Diagnostico | null => {
  console.log('🔍 obtenerDatosDiagnostico - Analizando cita:', cita.id);
  console.log('   - evaluacionCompleta:', cita.evaluacionCompleta);
  
  if (!cita.evaluacionCompleta) {
    console.log('   ❌ No tiene evaluacionCompleta - retornando null');
    return null;
  }
  
  console.log('   ✅ Tiene evaluacionCompleta:', cita.evaluacionCompleta);

  return {
    id: cita.evaluacionCompleta.idEvaluacion.toString(),
    citaId: cita.id,
    pacienteId: cita.pacienteId,
    fisioterapeutaId: cita.fisioterapeutaId,
    fisioterapeutaNombre: cita.evaluacionCompleta.doctorEvaluacion,
    fecha: cita.evaluacionCompleta.fechaEvaluacion,
    sintomas: cita.evaluacionCompleta.sintomasReportados || '',
    evaluacion: cita.evaluacionCompleta.evaluacionFisica || '',
    diagnostico: cita.evaluacionCompleta.diagnosticoPrincipal || '',
    planTratamiento: cita.evaluacionCompleta.planTratamiento || '',
    recomendaciones: cita.evaluacionCompleta.recomendaciones || '',
    medicamentos: [], // Se puede implementar más adelante
    archivos: [] // Se puede implementar más adelante
  };
};

// Funciones auxiliares
const getArchivoIcon = (extension: string) => {
  const ext = extension.toLowerCase().replace('.', '');
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
    return <FileImage className="w-5 h-5 text-green-600 dark:text-green-400" />;
  }
  if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) {
    return <FileVideo className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
  }
  if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) {
    return <FileAudio className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
  }
  if (['pdf'].includes(ext)) {
    return <File className="w-5 h-5 text-red-600 dark:text-red-400" />;
  }
  if (['doc', 'docx'].includes(ext)) {
    return <File className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
  }
  if (['txt', 'rtf'].includes(ext)) {
    return <File className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
  }
  return <File className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Funciones para exportar e imprimir
const handleExportPDF = (citas: Cita[], paciente: any) => {
  try {
    const nombrePaciente = paciente ? `${paciente.nombre} ${paciente.apellido1}`.trim() : 'Paciente';
    downloadHistorialPDF(citas, nombrePaciente);
    console.log('✅ PDF generado exitosamente');
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
  }
};

const handlePrint = (citas: Cita[], paciente: any) => {
  try {
    const nombrePaciente = paciente ? `${paciente.nombre} ${paciente.apellido1}`.trim() : 'Paciente';
    printHistorial(citas, nombrePaciente);
    console.log('✅ Impresión iniciada');
  } catch (error) {
    console.error('❌ Error iniciando impresión:', error);
  }
};

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

const getEstadoIcon = (estado: Cita['estado']) => {
  switch (estado) {
    case 'programada':
      return <Calendar className="w-4 h-4" />;
    case 'confirmada':
      return <CheckCircle className="w-4 h-4" />;
    case 'en_proceso':
      return <Activity className="w-4 h-4" />;
    case 'completada':
      return <CheckCircle className="w-4 h-4" />;
    case 'cancelada':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Calendar className="w-4 h-4" />;
  }
};


export default function HistorialCitasCronologico() {
  const {
    citas,
    paciente,
    loading,
    error,
    filtroEstado,
    filtroTipo,
    busqueda,
    setFiltroEstado,
    setFiltroTipo,
    setBusqueda,
    toggleExpansion,
    expandirTodas,
    colapsarTodas,
    citasFiltradas,
    estadisticas
  } = useCitasCronologicas();

  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(false);

  // Debug: Log de datos para verificar datos reales
  useEffect(() => {
    if (citas.length > 0) {
      console.log('🔍 Datos de citas en el componente:', citas.map(c => ({
        id: c.id,
        fisioterapeutaNombre: c.fisioterapeutaNombre,
        fecha: c.fecha,
        hora: c.hora,
        estado: c.estado,
        tipo: c.tipo
      })));
    }
  }, [citas]);

  const formatFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(fecha);
  };

  const formatFechaCorta = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(fecha);
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando historial de citas...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Error al cargar las citas
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con diseño médico */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <CalendarDays className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Historial Cronológico de Citas
                </h1>
                <p className="text-muted-foreground mt-1">
                  Visualiza cronológicamente todas tus citas médicas con vista de árbol
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="border-primary/20 text-accent hover:bg-primary/5 hover:text-accent"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={expandirTodas}
                className="border-primary/20 text-accent hover:bg-primary/5 hover:text-accent"
              >
                <Expand className="w-4 h-4 mr-2" />
                Expandir Todas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={colapsarTodas}
                className="border-primary/20 text-accent hover:bg-primary/5 hover:text-accent"
              >
                <Minimize className="w-4 h-4 mr-2" />
                Colapsar Todas
              </Button>
            </div>
          </div>
          
          {/* Botones de exportación - FUERA del header principal */}
          <div className="mt-6 flex justify-center">
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrint(citas, paciente)}
                className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
              >
                🖨️ Imprimir Historial
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportPDF(citas, paciente)}
                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
              >
                📄 Exportar PDF
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
                  <p className="text-2xl font-bold text-foreground">{estadisticas.total}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{estadisticas.completadas}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Programadas</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{estadisticas.programadas}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Próxima Cita</p>
                  <p className="text-lg font-semibold text-foreground">
                    {estadisticas.proximaCita ? formatFechaCorta(estadisticas.proximaCita.fecha) : 'No programada'}
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
        {mostrarFiltros && (
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
        )}

        {/* Lista de Citas en Vista de Árbol */}
        <div className="space-y-4">
          {citasFiltradas.length === 0 ? (
            <Card className="bg-card border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <CalendarDays className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  {citas.length === 0 ? 'No tienes citas registradas' : 'No hay citas que coincidan con los filtros'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {citas.length === 0 
                    ? 'Cuando tengas citas programadas, aparecerán aquí de forma cronológica.'
                    : 'Intenta ajustar los filtros para ver más resultados.'
                  }
                </p>
                {citas.length === 0 && (
                  <Button 
                    variant="outline" 
                    className="border-primary/20 text-accent hover:bg-primary/5"
                    onClick={() => window.location.href = '/pacientes'}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Programar Cita
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            citasFiltradas.map((cita, index) => (
              <Card key={cita.id} className="bg-card border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpansion(cita.id)}
                        className="p-1 h-auto hover:bg-primary/10"
                      >
                        {cita.expandida ? (
                          <ChevronDown className="w-5 h-5 text-accent" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-accent" />
                        )}
                      </Button>
                      <div className="p-3 bg-primary/10 rounded-full">
                        {getTipoIcon(cita.tipo)}
                      </div>
                      <div>
                        <CardTitle className="text-xl text-foreground flex items-center gap-3">
                          {getTipoText(cita.tipo)} - {formatFecha(cita.fecha)}
                          <Badge className={`${getEstadoColor(cita.estado)} border text-xs`}>
                            {getEstadoIcon(cita.estado)}
                            <span className="ml-1">{getEstadoText(cita.estado)}</span>
                          </Badge>
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {cita.duracion} min
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {cita.fisioterapeutaNombre}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpansion(cita.id)}
                        className="border-primary/20 text-accent hover:bg-primary/5 hover:text-accent"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {cita.expandida ? 'Ocultar Detalles' : 'Ver Detalles'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Contenido expandible - Detalles completos como en /pacientes/citas/[id] */}
                {cita.expandida && (
                  <CardContent className="pt-0">
                    <div className="space-y-6 border-t border-border pt-4">
                      {/* Información General de la Cita */}
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Información General
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div>
                              <h5 className="font-medium text-xs text-foreground mb-1">Fecha</h5>
                              <p className="text-xs text-muted-foreground bg-background p-2 rounded">
                                {formatFecha(cita.fecha)}
                              </p>
                            </div>
                            <div>
                              <h5 className="font-medium text-xs text-foreground mb-1">Nombre del Paciente</h5>
                              <p className="text-xs text-muted-foreground bg-background p-2 rounded">Ana García López</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-xs text-foreground mb-1">Estado</h5>
                              <Badge className={`${getEstadoColor(cita.estado)} border text-xs`}>
                                {getEstadoText(cita.estado)}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <h5 className="font-medium text-xs text-foreground mb-1">Fisioterapeuta</h5>
                              <p className="text-xs text-muted-foreground bg-background p-2 rounded">{cita.fisioterapeutaNombre}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-xs text-foreground mb-1">Tipo de Cita</h5>
                              <p className="text-xs text-muted-foreground bg-background p-2 rounded">{getTipoText(cita.tipo)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Diagnóstico y Evaluación */}
                      {(() => {
                        const diagnostico = obtenerDatosDiagnostico(cita);
                        if (!diagnostico) {
                          return (
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                                <Stethoscope className="w-4 h-4" />
                                Diagnóstico y Evaluación
                              </h4>
                              <p className="text-xs text-muted-foreground text-center py-4">
                                No hay evaluación registrada para esta cita
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                              <Stethoscope className="w-4 h-4" />
                              Diagnóstico y Evaluación
                            </h4>
                            <div className="space-y-4">
                              {diagnostico.sintomas && (
                                <div>
                                  <h5 className="font-medium text-xs text-foreground mb-2 flex items-center gap-2">
                                    <Activity className="w-3 h-3" />
                                    Síntomas Reportados
                                  </h5>
                                  <p className="text-xs text-muted-foreground bg-background p-3 rounded-lg">{diagnostico.sintomas}</p>
                                </div>
                              )}
                              {diagnostico.evaluacion && (
                                <div>
                                  <h5 className="font-medium text-xs text-foreground mb-2 flex items-center gap-2">
                                    <FileText className="w-3 h-3" />
                                    Evaluación Física
                                  </h5>
                                  <p className="text-xs text-muted-foreground bg-background p-3 rounded-lg">{diagnostico.evaluacion}</p>
                                </div>
                              )}
                              {diagnostico.diagnostico && (
                                <div>
                                  <h5 className="font-medium text-xs text-foreground mb-2 flex items-center gap-2">
                                    <Stethoscope className="w-3 h-3" />
                                    Diagnóstico
                                  </h5>
                                  <p className="text-xs text-muted-foreground bg-green-500/5 dark:bg-green-400/10 p-3 rounded-lg">{diagnostico.diagnostico}</p>
                                </div>
                              )}
                              {diagnostico.planTratamiento && (
                                <div>
                                  <h5 className="font-medium text-xs text-foreground mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" />
                                    Plan de Tratamiento
                                  </h5>
                                  <p className="text-xs text-muted-foreground bg-purple-500/5 dark:bg-purple-400/10 p-3 rounded-lg whitespace-pre-line">{diagnostico.planTratamiento}</p>
                                </div>
                              )}
                              {diagnostico.recomendaciones && (
                                <div>
                                  <h5 className="font-medium text-xs text-foreground mb-2 flex items-center gap-2">
                                    <Activity className="w-3 h-3" />
                                    Recomendaciones
                                  </h5>
                                  <p className="text-xs text-muted-foreground bg-yellow-500/5 dark:bg-yellow-400/10 p-3 rounded-lg whitespace-pre-line">{diagnostico.recomendaciones}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Medicamentos - Se puede implementar más adelante */}
                      {(() => {
                        const diagnostico = obtenerDatosDiagnostico(cita);
                        if (diagnostico?.medicamentos && diagnostico.medicamentos.length > 0) {
                          return (
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                                <Pill className="w-4 h-4" />
                                Medicamentos Recetados
                              </h4>
                              <div className="space-y-3">
                                {diagnostico.medicamentos.map((medicamento) => (
                                  <div key={medicamento.id} className="border border-border rounded-lg p-3 bg-background">
                                    <div className="flex justify-between items-start mb-2">
                                      <h5 className="font-medium text-xs text-foreground">{medicamento.nombre}</h5>
                                      {medicamento.receta && (
                                        <Badge className="bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 text-xs border-orange-200 dark:border-orange-800">
                                          Requiere Receta
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                                      <div>
                                        <span className="font-medium">Dosis:</span> {medicamento.dosis}
                                      </div>
                                      <div>
                                        <span className="font-medium">Frecuencia:</span> {medicamento.frecuencia}
                                      </div>
                                      <div>
                                        <span className="font-medium">Duración:</span> {medicamento.duracion}
                                      </div>
                                    </div>
                                    {medicamento.instrucciones && (
                                      <div className="mt-2">
                                        <span className="font-medium text-xs text-foreground">Instrucciones:</span>
                                        <p className="text-xs text-muted-foreground mt-1 bg-muted p-2 rounded">{medicamento.instrucciones}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Archivos Adjuntos */}
                      {cita.archivos && cita.archivos.length > 0 && (
                        <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-base text-foreground">
                                Archivos Adjuntos
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {cita.archivos.length} {cita.archivos.length === 1 ? 'archivo' : 'archivos'} adjunto{cita.archivos.length === 1 ? '' : 's'}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cita.archivos.map((archivo) => (
                              <div key={archivo.id} className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-600">
                                {/* Header del archivo */}
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-lg group-hover:from-blue-200 group-hover:to-indigo-200 dark:group-hover:from-blue-800/50 dark:group-hover:to-indigo-800/50 transition-colors">
                                    {getArchivoIcon(archivo.extension)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold text-sm text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                      {archivo.nombreOriginal}
                                    </h5>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(archivo.fechaSubida).toLocaleDateString('es-ES')}
                                      </span>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <span className="text-xs text-muted-foreground font-medium">
                                        {formatFileSize(archivo.tamanoArchivo)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Descripción */}
                                {archivo.descripcion && (
                                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                    {archivo.descripcion}
                                  </p>
                                )}

                                {/* Categoría */}
                                {archivo.categoria && (
                                  <div className="mb-3">
                                    <Badge 
                                      variant="secondary" 
                                      className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                                    >
                                      {archivo.categoria.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                )}

                                {/* Botón de descarga */}

                                {/* Efecto de hover sutil */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Botones de exportación para esta cita específica */}
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrint([cita], paciente)}
                            className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                          >
                            🖨️ Imprimir Cita
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportPDF([cita], paciente)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                          >
                            📄 Exportar Cita
                          </Button>
                        </div>
                      </div>

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
