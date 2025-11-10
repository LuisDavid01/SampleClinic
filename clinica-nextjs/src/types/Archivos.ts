import { Usuario } from "./Usuario";

/**
 * Representa un archivo del expediente médico del sistema.
 * Estructura fiel al JSON proveniente del backend.
 */
export interface Archivo {
  idArchivo: number;         // ID único del archivo
  idUsuario: number;         // ID del usuario propietario o asociado
  nombre: string;            // Nombre base del archivo (sin extensión)
  extension: string;         // Extensión del archivo (pdf, jpg, docx, etc.)
  categoria: string;         // Categoría o tipo de documento (Receta, Imagen, Laboratorio, Otro)
  descripcion?: string;      // Descripción opcional del archivo
  url: string;               // URL pública o privada para descargar/visualizar
  tamaño: string;            // Tamaño formateado del archivo (ej. "245 KB")
  fechaSubida: string;       // Fecha de carga en formato ISO
  esPublico: boolean;        // Indica si el archivo es público o privado
  etiquetas?: string;        // Palabras clave separadas por comas
  usuario?: Usuario;         // Relación con el usuario propietario
}
