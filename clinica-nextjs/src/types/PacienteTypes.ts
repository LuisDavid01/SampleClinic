export interface Paciente {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  fechaNacimiento: Date;
  genero: 'masculino' | 'femenino' | 'otro';
  direccion: string;
  cedula: string;
  fechaRegistro: Date;
  estado: 'activo' | 'inactivo';
  foto?: string;
}

export interface Archivo {
  id: number;
  nombreArchivo: string;
  nombreOriginal: string;
  rutaArchivo: string;
  tipoMime: string;
  tamanoArchivo: number;
  extension: string;
  descripcion?: string;
  categoria?: string;
  etiquetas?: string;
  fechaSubida: Date;
}

export interface Cita {
  id: string;
  pacienteId: string;
  fisioterapeutaId: string;
  fisioterapeutaNombre: string;
  fecha: Date;
  hora: string;
  duracion: number; // en minutos
  estado: 'programada' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada';
  tipo: 'consulta' | 'tratamiento' | 'evaluacion' | 'seguimiento';
  notas?: string;
  sintomas?: string;
  diagnostico?: string;
  evaluacionFisica?: string;
  planTratamiento?: string;
  recomendaciones?: string;
  archivos?: Archivo[];
  evaluacionCompleta?: {
    idEvaluacion: number;
    fechaEvaluacion: Date;
    doctorEvaluacion: string;
    diagnosticoPrincipal?: string;
    sintomasReportados?: string;
    evaluacionFisica?: string;
    planTratamiento?: string;
    recomendaciones?: string;
  };
}

export interface Diagnostico {
  diagnosticoPrincipal: any;
  id: string;
  citaId: string;
  pacienteId: string;
  fisioterapeutaId: string;
  fisioterapeutaNombre: string;
  fecha: Date;
  sintomas: string;
  evaluacion: string;
  diagnostico: string;
  planTratamiento: string;
  recomendaciones: string;
  medicamentos?: Medicamento[];
  archivos?: Archivo[];
}

export interface Medicamento {
  id: string;
  diagnosticoId: string;
  nombre: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  instrucciones: string;
  receta: boolean;
}

export interface Archivo {
  id: number;
  diagnosticoId?: number;
  nombre: string;
  tipo: 'imagen' | 'documento' | 'video' | 'audio';
  url: string;
  fechaSubida: Date;
  descripcion?: string;
}

export interface Consentimiento {
  id: string;
  pacienteId: string;
  tipo: 'tratamiento' | 'procedimiento' | 'confidencialidad' | 'otros';
  titulo: string;
  contenido: string;
  fechaFirma: Date;
  estado: 'pendiente' | 'firmado' | 'expirado';
  archivoUrl?: string;
  version: string;
}

export interface Tratamiento {
  id: string;
  pacienteId: string;
  diagnosticoId: string;
  nombre: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin?: Date;
  estado: 'activo' | 'completado' | 'suspendido';
  sesiones: SesionTratamiento[];
}

export interface SesionTratamiento {
  id: string;
  tratamientoId: string;
  citaId: string;
  fecha: Date;
  descripcion: string;
  ejercicios: Ejercicio[];
  observaciones?: string;
}

export interface Ejercicio {
  id: string;
  sesionId: string;
  nombre: string;
  descripcion: string;
  series: number;
  repeticiones: number;
  duracion?: number; // en segundos
  instrucciones: string;
  completado: boolean;
} 