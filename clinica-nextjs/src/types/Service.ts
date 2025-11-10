// src/types/service.ts
export const SERVICE_STATUS = {
  ACTIVO:   { label: 'Activo',   value: 'activo' },
  INACTIVO: { label: 'Inactivo', value: 'inactivo' },
} as const

export type ServiceStatus = (typeof SERVICE_STATUS)[keyof typeof SERVICE_STATUS]['value']

export type Servicio = {
  id: number
  nombre: string
  detalle: string
  precio: number
  estado: ServiceStatus
  fechaModificacion?: string | Date
}
