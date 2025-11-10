// Tipos para las citas
/*export type StatusAppointment = 'Programada' | 'Completada' | 'En progreso' | 'Cancelada'
export type Appointment = {

  id: number,
  pacienteID: number,
  doctor: string,
  fecha: Date,
  status: StatusAppointment,
  nota?: string
  // resto de campos

}



export const APPOINTMENT_STATUS = {
  programada: { label: 'Programada', value: 'programada' },
  completa: { label: 'Completada', value: 'completada' },
  enProgreso: { label: 'En progreso', value: 'enProgreso' },
  cancelada: { label: 'Cancelada', value: 'cancelada' },
}*/
import { Usuario } from "./Usuario";
import { Service } from "./Service";

/**
 * Representa una cita médica del sistema.
 * Estructura fiel al JSON proveniente del backend.
 */
export interface Appointment {
  idCita: number;            // ID único de la cita
  fechaCita: string;         // Fecha y hora de la cita en formato ISO
  idPaciente: number;        // ID del paciente asociado
  idMedico: number;          // ID del médico asignado
  idServicio: number;        // ID del servicio solicitado
  descripcion: string;       // Descripción o motivo de la cita
  estadoCita: string;        // Estado actual (programada, cancelada, completada, etc.)
  paciente: Usuario;         // Información del paciente (relación con Usuario)
  medico: Usuario;           // Información del médico (relación con Usuario)
  servicio: Service;        // Información del servicio asociado
  notas: any[];              // Arreglo de notas relacionadas
  resultados: any[];         // Arreglo de resultados relacionados
}
