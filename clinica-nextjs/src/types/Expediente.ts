
// Tipos para los expedientes
export type Status = 'Activo' | 'Inactico'
export type Expediente = {

	id: number,
	idPaciente: string,
	cedula: string,
	descripcion?: string,
	idDoctor: string
	estado: Status
	createdAt: Date,
	updatedAt: Date,
	// resto de campos

}



export const ISSUE_STATUS = {
	activo: { label: 'Activo', value: 'activo' },
	inactivo: { label: 'Inactivo', value: 'inactivo' },
}
