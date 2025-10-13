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

// Definición del tipo para un Diagnóstico
interface Diagnostico {
	idDiagnostico: number;
	idPaciente: number;
	fecha: string; // formato: YYYY-MM-DD
	idDoctor: number;
	diagnostico: string;
	doctor: Usuario; // El médico que hizo el diagnóstico
}




