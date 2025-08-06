
// Tipos para los expedientes
export type Status = 'Activo' | 'Inavtico' 
export type Expediente = {

  id: number,
  pacienteID?: number,
  descripcion: string,
  status: Status
  // resto de campos

}



export const ISSUE_STATUS = {
  activo: { label: 'Activo', value: 'activo' },
  inactivo: { label: 'Inactivo', value: 'inactivo' },
}