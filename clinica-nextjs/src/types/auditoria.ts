import { Usuario } from "./Usuario";

export interface Auditoria {
  id: number;                  // ID autoincremental del registro
  accion: string;              // Acción realizada (CREAR, ACTUALIZAR, CONSULTAR, ELIMINAR)
  recurso: string;             // Recurso afectado (ej. "ANTECEDENTES_CLINICOS")
  recursoId?: number | null;   // ID del recurso afectado (ej. paciente, expediente, etc.)
  metodo: string;              // Método HTTP (GET, POST, PUT, DELETE)
  url: string;                 // URL completa del endpoint auditado
  statusCode: number;          // Código de respuesta HTTP
  usuarioId?: number | null;   // ID del usuario que realizó la acción
  usuarioInfo?: any;           // Información JSON del usuario Clerk
  ipAddress?: string | null;   // IP de origen
  userAgent?: string | null;   // Navegador o cliente usado
  timestamp: string;           // Fecha y hora en formato ISO 8601
  detalles?: any;              // Request/Response sanitizados
  usuario?: Usuario | null;    // Relación con el usuario en BD
}