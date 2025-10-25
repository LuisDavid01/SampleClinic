import { Usuario } from "./Usuario";

// Tipos para los expedientes
export type Status = 'Activo' | 'Inactico'

// Definición del tipo principal para un Expediente
export interface Expediente {
	idExpediente: number;
	idPaciente: number;
	cedula: string;
	estado: Status;
	idMedico: number;
	descripcion: string;
	fechaCreacion: string; // formato: ISO 8601
	paciente: Usuario;
	medico: Usuario;
	documentos: Documento[];
	diagnosticos: Diagnostico[];
}

export const EXPEDIENTE_STATUS = {
	activo: { label: 'Activo', value: 'activo' },
	inactivo: { label: 'Inactivo', value: 'inactivo' },
}




// Definición del tipo para un Documento
interface Documento {
	idDocumento: number;
	url: string;
	tipoDocumento: string; // ej: "expediente"
	fechaCreacion: string; // formato: ISO 8601
}

// Definición del tipo para una Evaluación y Diagnóstico
export interface Diagnostico {
	idEvaluacion: number;
	idPaciente: number;
	fecha: string; // formato: YYYY-MM-DD
	idDoctor: number;
	diagnosticoPrincipal: string;
	sintomasReportados?: string;
	evaluacionFisica?: string;
	planTratamiento?: string;
	recomendaciones?: string;
	doctor: Usuario; // El médico que hizo la evaluación
}




