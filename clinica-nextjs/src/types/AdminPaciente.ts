export interface AdminPaciente {
  idUsuario: number;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  fechaNacimiento?: string;
  fechaRegistro: string;
  telefonoPrincipal?: string;
  telefonoSecundario?: string;
  correoElectronico: string;
  direccionResidencia?: string;
  clerkId?: string;
  idRol?: number;
  activo: boolean;
  rol?: {
    idRol: number;
    nombreRol: string;
    descripcion?: string;
  };
}

export interface CreatePacienteRequest {
  nombre: string;
  apellido1: string;
  apellido2?: string;
  fechaNacimiento?: string;
  telefonoPrincipal: string;
  telefonoSecundario?: string;
  correoElectronico: string;
  direccionResidencia?: string;
  contrasena: string;
  idRol: number;
  activo?: boolean;
}

export interface PacientesResponse {
  usuarios: AdminPaciente[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export interface CreatePacienteResponse {
  message: string;
  usuario: AdminPaciente;
}
