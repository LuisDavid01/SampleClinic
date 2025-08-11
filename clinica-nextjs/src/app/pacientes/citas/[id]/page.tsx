"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  ArrowLeft,
  Pill,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Printer,
  Stethoscope,
  Activity,
  TrendingUp
} from "lucide-react";
import { Cita, Diagnostico, Medicamento, Archivo } from "@/types/paciente";
import Link from "next/link";

// Datos de ejemplo - en producción vendrían de una API
const citaEjemplo: Cita = {
  id: "1",
  pacienteId: "paciente1",
  fisioterapeutaId: "fisio1",
  fisioterapeutaNombre: "Dr. Esteban Porras",
  fecha: new Date("2024-01-15"),
  hora: "09:00",
  duracion: 60,
  estado: "completada",
  tipo: "consulta",
  sintomas: "Dolor agudo en la rodilla derecha, especialmente al subir y bajar escaleras. El dolor se intensifica después de actividades físicas y mejora con el reposo.",
  diagnostico: "Tendinitis rotuliana en rodilla derecha, posiblemente causada por sobrecarga mecánica y movimientos repetitivos.",
  tratamiento: "Terapia manual para reducir la tensión muscular, ejercicios de fortalecimiento del cuádriceps, estiramientos específicos y aplicación de hielo.",
  recomendaciones: "Aplicar hielo 3 veces al día por 15-20 minutos, evitar actividades de alto impacto como correr o saltar, realizar ejercicios de fortalecimiento 3 veces por semana, mantener reposo relativo durante 2 semanas."
};

const diagnosticoEjemplo: Diagnostico = {
  id: "diag1",
  citaId: "1",
  pacienteId: "paciente1",
  fisioterapeutaId: "fisio1",
  fecha: new Date("2024-01-15"),
  sintomas: "Dolor agudo en la rodilla derecha, especialmente al subir y bajar escaleras. El dolor se intensifica después de actividades físicas y mejora con el reposo.",
  evaluacion: "Examen físico revela dolor a la palpación en el polo inferior de la rótula, dolor al realizar sentadillas y al subir escaleras. Rango de movimiento normal, pero doloroso en flexión completa.",
  diagnostico: "Tendinitis rotuliana en rodilla derecha, posiblemente causada por sobrecarga mecánica y movimientos repetitivos.",
  planTratamiento: "1. Terapia manual para reducir tensión muscular\n2. Ejercicios de fortalecimiento progresivo\n3. Estiramientos específicos\n4. Modificación de actividades\n5. Seguimiento en 2 semanas",
  recomendaciones: "Aplicar hielo 3 veces al día por 15-20 minutos, evitar actividades de alto impacto como correr o saltar, realizar ejercicios de fortalecimiento 3 veces por semana, mantener reposo relativo durante 2 semanas.",
  medicamentos: [
    {
      id: "med1",
      diagnosticoId: "diag1",
      nombre: "Ibuprofeno",
      dosis: "400mg",
      frecuencia: "Cada 8 horas",
      duracion: "7 días",
      instrucciones: "Tomar con alimentos para evitar irritación estomacal",
      receta: false
    },
    {
      id: "med2",
      diagnosticoId: "diag1",
      nombre: "Paracetamol",
      dosis: "500mg",
      frecuencia: "Cada 6 horas si es necesario",
      duracion: "Según necesidad",
      instrucciones: "Solo si el dolor persiste después del ibuprofeno",
      receta: false
    }
  ],
  archivos: [
    {
      id: "arch1",
      diagnosticoId: "diag1",
      nombre: "Radiografía rodilla derecha",
      tipo: "imagen",
      url: "/archivos/radiografia-rodilla.jpg",
      fechaSubida: new Date("2024-01-15"),
      descripcion: "Radiografía AP y lateral de rodilla derecha"
    },
    {
      id: "arch2",
      diagnosticoId: "diag1",
      nombre: "Ejercicios de rehabilitación",
      tipo: "documento",
      url: "/archivos/ejercicios-rehabilitacion.pdf",
      fechaSubida: new Date("2024-01-15"),
      descripcion: "Guía de ejercicios para tendinitis rotuliana"
    }
  ]
};

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

const getArchivoIcon = (tipo: Archivo['tipo']) => {
  switch (tipo) {
    case 'imagen':
      return <FileImage className="w-5 h-5" />;
    case 'video':
      return <FileVideo className="w-5 h-5" />;
    case 'audio':
      return <FileAudio className="w-5 h-5" />;
    case 'documento':
      return <File className="w-5 h-5" />;
    default:
      return <File className="w-5 h-5" />;
  }
};

export default function CitaDetallePage() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const [cita, setCita] = useState<Cita | null>(null);
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setCita(citaEjemplo);
      setDiagnostico(diagnosticoEjemplo);
      setLoading(false);
    }, 500);
  }, [params.id]);

  const formatFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(fecha);
  };

  const handleExportPDF = () => {
    console.log('Exportando diagnóstico a PDF...');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalles de la cita...</p>
        </div>
      </div>
    );
  }

  if (!cita) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Cita no encontrada
          </h2>
          <p className="text-gray-500 mb-4">
            La cita que buscas no existe o no tienes permisos para verla.
          </p>
          <Button asChild>
            <Link href="/pacientes">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Mis Citas
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con diseño médico */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Link href="/pacientes">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Link>
              </Button>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  {getTipoIcon(cita.tipo)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Detalles de la Cita
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {getTipoText(cita.tipo)} - {formatFecha(cita.fecha)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrint}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportPDF}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Información General de la Cita */}
        <Card className="bg-white border-0 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Calendar className="w-5 h-5 text-blue-600" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">Fecha y Hora</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {formatFecha(cita.fecha)} a las {cita.hora}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">Duración</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{cita.duracion} minutos</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">Estado</h4>
                  <Badge className={`${getEstadoColor(cita.estado)} border`}>
                    {getEstadoText(cita.estado)}
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">Fisioterapeuta</h4>
                  <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">{cita.fisioterapeutaNombre}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">Tipo de Cita</h4>
                  <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">{getTipoText(cita.tipo)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnóstico */}
        {diagnostico && (
          <Card className="bg-white border-0 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Diagnóstico y Evaluación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Síntomas Reportados
                </h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{diagnostico.sintomas}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Evaluación Física
                </h4>
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{diagnostico.evaluacion}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Diagnóstico
                </h4>
                <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">{diagnostico.diagnostico}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Plan de Tratamiento
                </h4>
                <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg whitespace-pre-line">{diagnostico.planTratamiento}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Recomendaciones
                </h4>
                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg whitespace-pre-line">{diagnostico.recomendaciones}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medicamentos */}
        {diagnostico?.medicamentos && diagnostico.medicamentos.length > 0 && (
          <Card className="bg-white border-0 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Pill className="w-5 h-5 text-blue-600" />
                Medicamentos Recetados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diagnostico.medicamentos.map((medicamento) => (
                  <div key={medicamento.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-sm text-gray-700">{medicamento.nombre}</h4>
                      {medicamento.receta && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs border-orange-200">
                          Requiere Receta
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
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
                      <div className="mt-3">
                        <span className="font-medium text-sm text-gray-700">Instrucciones:</span>
                        <p className="text-sm text-gray-600 mt-1 bg-white p-2 rounded">{medicamento.instrucciones}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Archivos */}
        {diagnostico?.archivos && diagnostico.archivos.length > 0 && (
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <FileText className="w-5 h-5 text-blue-600" />
                Archivos Adjuntos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {diagnostico.archivos.map((archivo) => (
                  <div key={archivo.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
                    <div className="flex items-center gap-3 mb-3">
                      {getArchivoIcon(archivo.tipo)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-700 truncate">
                          {archivo.nombre}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(archivo.fechaSubida).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    {archivo.descripcion && (
                      <p className="text-xs text-gray-600 mb-3">{archivo.descripcion}</p>
                    )}
                    <Button variant="outline" size="sm" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 