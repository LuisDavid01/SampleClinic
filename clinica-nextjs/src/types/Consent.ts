import { Expediente } from "./Expediente";

export interface Archivo {
	idArchivo: number;
	nombreOriginal: string;
	nombreArchivo: string;
	rutaArchivo: string;
	tipoMime: string;
	tamanoArchivo: number;
	extension: string;
	descripcion: string;
	categoria: string;
	etiquetas: string;
	esPublico: boolean;
	fechaSubida: string; // ISO 8601 date string
	fechaModificacion: string; // ISO 8601 date string
	idUsuario: number;
	idExpediente: number;
	activo: boolean;
	expediente: Expediente; // Asumiendo que este tipo ya existe
}
