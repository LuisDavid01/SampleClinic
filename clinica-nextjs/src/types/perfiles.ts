import { Service } from "./Service";
import { Usuario } from "./Usuario";

export type teamProfile = {
	idMedico: number;
	idPerfil: number;
	fotografia? : string;
	experienciaProfesional: string;
	especialidad: string;
	descripcionBreve: string;
	servicios: Service[]
	medico: Usuario
}
