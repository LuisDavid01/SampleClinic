// Constantes para IDs de roles del sistema
const ROLES = {
	ADMINISTRADOR: 1,
	FISIOTERAPEUTA: 2,
	RECEPCIONISTA: 3,
	PACIENTE: 4
};

// Nombres de roles para referencia
const ROLE_NAMES = {
	[ROLES.ADMINISTRADOR]: 'Administrador',
	[ROLES.FISIOTERAPEUTA]: 'Fisioterapeuta',
	[ROLES.RECEPCIONISTA]: 'Recepcionista',
	[ROLES.PACIENTE]: 'Paciente'
};

// Descripciones de roles
const ROLE_DESCRIPTIONS = {
	[ROLES.ADMINISTRADOR]: 'Gestión total del sistema',
	[ROLES.FISIOTERAPEUTA]: 'Profesional de la salud encargado de terapias',
	[ROLES.RECEPCIONISTA]: 'Atención al cliente y gestión de citas',
	[ROLES.PACIENTE]: 'Usuarios que reciben los servicios'
};

// Función para obtener nombre del rol por ID
const getRoleName = (roleId) => {
	return ROLE_NAMES[roleId] || 'unknown';
};

// Función para obtener descripción del rol por ID
const getRoleDescription = (roleId) => {
	return ROLE_DESCRIPTIONS[roleId] || 'Rol no definido';
};

// Función para verificar si un usuario tiene un rol específico
const hasRole = (user, roleId) => {
	return user.rol?.idRol === roleId;
};

// Funciones específicas para cada rol
const isAdministrador = (user) => {
	return hasRole(user, ROLES.Admin);
};

const isFisioterapeuta = (user) => {
	return hasRole(user, ROLES.FISIOTERAPEUTA);
};

const isRecepcionista = (user) => {
	return hasRole(user, ROLES.RECEPCIONISTA);
};

const isPaciente = (user) => {
	return hasRole(user, ROLES.PACIENTE);
};

// Función para verificar si es personal médico (Fisioterapeuta o Administrador)
const isPersonalMedico = (user) => {
	return isFisioterapeuta(user) || isAdministrador(user);
};

// Función para verificar si puede gestionar citas (Administrador, Fisioterapeuta, Recepcionista)
const canManageAppointments = (user) => {
	return isAdministrador(user) || isFisioterapeuta(user) || isRecepcionista(user);
};

export {
	ROLES,
	ROLE_NAMES,
	ROLE_DESCRIPTIONS,
	getRoleName,
	getRoleDescription,
	hasRole,
	isAdministrador,
	isFisioterapeuta,
	isRecepcionista,
	isPaciente,
	isPersonalMedico,
	canManageAppointments
};
