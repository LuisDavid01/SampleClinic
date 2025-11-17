import { Usuario } from "./Usuario";



export interface HistoriaExito {
  idHistoria: number;
  idPaciente?: number;
  rating: number;
  experiencia: string;
  publicado: boolean;
  fechaTratamiento: string;
  paciente?: Usuario;
}


