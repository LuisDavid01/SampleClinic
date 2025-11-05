import { Servicio } from "./Service";
import { Usuario } from "./Usuario";



export interface HistoriaExito {
  idHistoria: number;
  idServicio: number;
  idMedico: number;
  idPaciente: number;
  experiencia: string;
  publicado: boolean;
  fechaTratamiento: string;
  servicio: Servicio;
  medico: Usuario;
  paciente: Usuario;
}


