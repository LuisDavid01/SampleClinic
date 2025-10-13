// Definición del tipo para un Rol
export interface Rol {
	idRol: number;
	nombreRol: string;
	descripcion: string;
}

// Definición del tipo base para un Usuario (Paciente o Médico)
export interface Usuario {
	idUsuario: number;
	nombre: string;
	apellido1: string;
	apellido2: string;
	fechaNacimiento: string; // formato: YYYY-MM-DD
	fechaRegistro: string;   // formato: YYYY-MM-DD
	telefonoPrincipal: string;
	telefonoSecundario: string;
	correoElectronico: string;
	direccionResidencia: string;
	idRol: number;
	activo: boolean;
	rol: Rol;
}
