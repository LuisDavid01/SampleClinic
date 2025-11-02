import { Servicio } from "./Service";
import { Usuario } from "./Usuario";

export type StatusTestimony = 'activo' | 'inactivo' 

export interface HistoriaExito {
  idHistoria: number;
  idServicio: number;
  idMedico: number;
  idPaciente: number;
  fechaTratamiento: string;
  fechaInicio: Date;
  fechaFin: Date;
  resultado:string;
  experiencia: string;
  publicado: boolean;
  fechaPublicacion: string;
  servicio: Servicio;
  medico: Usuario;
  paciente: Usuario;
}


export const TESTIMONY_STATUS = {
  activo: { label: 'Activo', value: 'activo' },
  inActivo: { label: 'Inactivo', value: 'inactivo' },
}
