export type StatusTestimony = 'activo' | 'inactivo' 

export type Testimony = {
    id: number,
      name: string,
      role: string,
      text: string,
      rating: number,
      avatar: string,
      created: Date,
      status: string
}


export const TESTIMONY_STATUS = {
  activo: { label: 'Activo', value: 'activo' },
  inActivo: { label: 'Inactivo', value: 'inactivo' },
}