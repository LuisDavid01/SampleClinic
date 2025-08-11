// Tipos para el equipo
export type StatusTeam = 'Programada' | 'Completada' | 'En progreso' | 'Cancelada'
export type Team = {

  id: number,
      name: string,
      role: string,
      status: StatusTeam,
      createdAt: Date,
      experience: string,
      description: string,
      specialties: string[],
  // resto de campos

}



export const TEAM_STATUS = {
  activo: { label: 'Activo', value: 'activo' },
  inActivo: { label: 'Inactivo', value: 'inactivo' },
}