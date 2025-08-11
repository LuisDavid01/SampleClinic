// Tipos para las citas
export type StatusAppointment = 'Programada' | 'Completada' | 'En progreso' | 'Cancelada'
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
}