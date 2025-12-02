import { body, param, query, validationResult } from 'express-validator';

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			error: 'Datos de entrada inválidos',
			message: 'Por favor, revise los datos enviados',
			details: errors.array()
		});
	}
	next();
};

// Validaciones para usuarios (crear)
const validateUsuario = [
	body('nombre')
		.notEmpty()
		.withMessage('El nombre es requerido')
		.isLength({ min: 2, max: 100 })
		.withMessage('El nombre debe tener entre 2 y 100 caracteres'),

	body('apellido1')
		.notEmpty()
		.withMessage('El primer apellido es requerido')
		.isLength({ min: 2, max: 100 })
		.withMessage('El primer apellido debe tener entre 2 y 100 caracteres'),

	body('apellido2')
		.optional()
		.isLength({ max: 100 })
		.withMessage('El segundo apellido no puede exceder 100 caracteres'),

	body('correoElectronico')
		.isEmail()
		.withMessage('Debe proporcionar un correo electrónico válido')
		.normalizeEmail(),

	body('contrasena')
		.optional()
		.isLength({ min: 6 })
		.withMessage('La contraseña debe tener al menos 6 caracteres'),

	body('telefonoPrincipal')
		.optional()
		.isLength({ max: 20 })
		.withMessage('El teléfono principal no puede exceder 20 caracteres'),

	body('telefonoSecundario')
		.optional()
		.isLength({ max: 20 })
		.withMessage('El teléfono secundario no puede exceder 20 caracteres'),

	body('direccionResidencia')
		.optional()
		.isLength({ max: 255 })
		.withMessage('La dirección no puede exceder 255 caracteres'),

	body('idRol')
		.optional()
		.isInt({ min: 1 })
		.withMessage('El ID del rol debe ser un número entero positivo'),

	handleValidationErrors
];

// Validaciones para actualizar usuarios (sin contraseña requerida)
const validateUsuarioUpdate = [
	body('nombre')
		.notEmpty()
		.withMessage('El nombre es requerido')
		.isLength({ min: 2, max: 100 })
		.withMessage('El nombre debe tener entre 2 y 100 caracteres'),

	body('apellido1')
		.notEmpty()
		.withMessage('El primer apellido es requerido')
		.isLength({ min: 2, max: 100 })
		.withMessage('El primer apellido debe tener entre 2 y 100 caracteres'),

	body('apellido2')
		.optional()
		.isLength({ max: 100 })
		.withMessage('El segundo apellido no puede exceder 100 caracteres'),

	body('fechaNacimiento')
		.optional()
		.isISO8601()
		.withMessage('La fecha de nacimiento debe ser válida'),

	body('correoElectronico')
		.isEmail()
		.withMessage('Debe proporcionar un correo electrónico válido')
		.normalizeEmail(),

	body('contrasena')
		.optional()
		.isLength({ min: 6 })
		.withMessage('La contraseña debe tener al menos 6 caracteres'),

	body('telefonoPrincipal')
		.optional()
		.isLength({ max: 20 })
		.withMessage('El teléfono principal no puede exceder 20 caracteres'),

	body('telefonoSecundario')
		.optional()
		.isLength({ max: 20 })
		.withMessage('El teléfono secundario no puede exceder 20 caracteres'),

	body('direccionResidencia')
		.optional()
		.isLength({ max: 255 })
		.withMessage('La dirección no puede exceder 255 caracteres'),

	body('idRol')
		.optional()
		.isInt({ min: 1 })
		.withMessage('El ID del rol debe ser un número entero positivo'),

	body('activo')
		.optional()
		.isBoolean()
		.withMessage('El campo activo debe ser verdadero o falso'),

	handleValidationErrors
];

// Validaciones para citas
const validateCita = [
	body('fechaCita')
		.isISO8601()
		.withMessage('La fecha de la cita debe ser válida'),

	body('idPaciente')
		.isInt({ min: 1 })
		.withMessage('El ID del paciente debe ser un número entero positivo'),

	body('idMedico')
		.isInt({ min: 1 })
		.withMessage('El ID del médico debe ser un número entero positivo'),

	body('idServicio')
		.optional()
		.isInt({ min: 1 })
		.withMessage('El ID del servicio debe ser un número entero positivo'),

	body('descripcion')
		.optional()
		.isLength({ max: 1000 })
		.withMessage('La descripción no puede exceder 1000 caracteres'),

	body('estadoCita')
		.optional()
		.isIn(['borrador', 'programada', 'confirmada', 'en_progreso', 'completada', 'cancelada'])
		.withMessage('El estado de la cita debe ser uno de: borrador, programada, confirmada, en_progreso, completada, cancelada'),

	handleValidationErrors
];

// Validaciones para servicios
const validateServicio = [
	body('nombre')
		.notEmpty()
		.withMessage('El nombre del servicio es requerido')
		.isLength({ min: 2, max: 100 })
		.withMessage('El nombre del servicio debe tener entre 2 y 100 caracteres'),

	body('descripcion')
		.optional()
		.isLength({ max: 1000 })
		.withMessage('La descripción no puede exceder 1000 caracteres'),

	body('precio')
		.optional()
		.isDecimal({ decimal_digits: '0,2' })
		.withMessage('El precio debe ser un número decimal válido'),

	body('activo')
		.optional()
		.isBoolean()
		.withMessage('El campo activo debe ser verdadero o falso'),

	handleValidationErrors
];

// Validaciones para perfiles
const validatePerfil = [
	body('idMedico')
		.isInt({ min: 1 })
		.withMessage('El ID del médico debe ser un número entero positivo'),

	body('fotografia')
		.optional()
		.isLength({ max: 255 })
		.withMessage('La ruta de la fotografía no puede exceder 255 caracteres'),

	body('experienciaProfesional')
		.optional()
		.isLength({ max: 2000 })
		.withMessage('La experiencia profesional no puede exceder 2000 caracteres'),

	body('descripcionBreve')
		.optional()
		.isLength({ max: 500 })
		.withMessage('La descripción breve no puede exceder 500 caracteres'),

	body('especialidad')
		.optional()
		.isLength({ max: 100 })
		.withMessage('La especialidad no puede exceder 100 caracteres'),

	handleValidationErrors
];

// Validaciones para historias de éxito
const validateHistoriaExito = [

	body('rating')
		.optional()
		.isInt({ min: 1 ,max: 5})
		.withMessage('El rating debe ser un numero entre 1 y 5'),

	body('idPaciente')
		.optional()
		.isInt({ min: 1 })
		.withMessage('El ID del paciente debe ser un número entero positivo'),

	body('fechaTratamiento')
		.optional()
		.isISO8601()
		.withMessage('La fecha del tratamiento debe ser válida'),

	body('experiencia')
		.optional()
		.isLength({ max: 5000 })
		.withMessage('La experiencia no puede exceder 5000 caracteres'),

	body('publicado')
		.optional()
		.isBoolean()
		.withMessage('El campo publicado debe ser verdadero o falso'),

	handleValidationErrors
];

// Validaciones para expedientes (crear)
const validateExpediente = [
	body('idPaciente')
		.isInt({ min: 1 })
		.withMessage('El ID del paciente debe ser un número entero positivo'),

	body('cedula')
		.notEmpty()
		.withMessage('La cédula es requerida')
		.isLength({ min: 5, max: 50 })
		.withMessage('La cédula debe tener entre 5 y 50 caracteres')
		.matches(/^[A-Za-z0-9-]+$/)
		.withMessage('La cédula solo puede contener letras, números y guiones'),

	body('estado')
		.notEmpty()
		.withMessage('El estado es requerido')
		.isLength({ min: 2, max: 50 })
		.withMessage('El estado debe tener entre 2 y 50 caracteres'),

	body('idMedico')
		.optional()
		.isInt({ min: 1 })
		.withMessage('El ID del médico debe ser un número entero positivo'),

	body('descripcion')
		.optional()
		.isLength({ max: 1000 })
		.withMessage('La descripción no puede exceder 1000 caracteres'),

	handleValidationErrors
];

// Validaciones para expedientes (actualizar)
const validateExpedienteUpdate = [
	body('cedula')
		.optional()
		.isLength({ min: 5, max: 50 })
		.withMessage('La cédula debe tener entre 5 y 50 caracteres')
		.matches(/^[A-Za-z0-9-]+$/)
		.withMessage('La cédula solo puede contener letras, números y guiones'),

	body('estado')
		.optional()
		.isLength({ min: 2, max: 50 })
		.withMessage('El estado debe tener entre 2 y 50 caracteres'),

	body('idMedico')
		.optional()
		.isInt({ min: 1 })
		.withMessage('El ID del médico debe ser un número entero positivo'),

	body('descripcion')
		.optional()
		.isLength({ max: 1000 })
		.withMessage('La descripción no puede exceder 1000 caracteres'),

	handleValidationErrors
];

// Validaciones para diagnósticos (crear)
const validateDiagnostico = [
	body('idPaciente')
		.isInt({ min: 1 })
		.withMessage('El ID del paciente debe ser un número entero positivo'),

	body('idDoctor')
		.optional()
		.isInt({ min: 1 })
		.withMessage('El ID del doctor debe ser un número entero positivo'),

	body('diagnostico')
		.notEmpty()
		.withMessage('El diagnóstico es requerido')
		.isLength({ min: 10, max: 5000 })
		.withMessage('El diagnóstico debe tener entre 10 y 5000 caracteres'),

	body('idExpediente')
		.optional()
		.isInt({ min: 1 })
		.withMessage('El ID del expediente debe ser un número entero positivo'),

	body('fecha')
		.notEmpty()
		.withMessage('La fecha es requerida')
		.matches(/^\d{4}-\d{2}-\d{2}$/)
		.withMessage('La fecha debe tener el formato YYYY-MM-DD'),

	handleValidationErrors
];

// Validaciones para diagnósticos (actualizar)
const validateDiagnosticoUpdate = [
	body('diagnostico')
		.optional()
		.isLength({ min: 10, max: 5000 })
		.withMessage('El diagnóstico debe tener entre 10 y 5000 caracteres'),

	body('idDoctor')
		.optional()
		.isInt({ min: 1 })
		.withMessage('El ID del doctor debe ser un número entero positivo'),

	body('idExpediente')
		.optional()
		.isInt({ min: 1 })
		.withMessage('El ID del expediente debe ser un número entero positivo'),

	handleValidationErrors
];

// Validaciones para parámetros de ID
const validateId = [
	param('id')
		.isInt({ min: 1 })
		.withMessage('El ID debe ser un número entero positivo'),

	handleValidationErrors
];

// Validaciones para antecedentes clínicos (crear)
const validateAntecedentes = [
	body('historialMedico')
		.optional()
		.isLength({ max: 2000 })
		.withMessage('El historial médico no puede exceder 2000 caracteres'),

	body('condicionesPreexistentes')
		.optional()
		.isLength({ max: 2000 })
		.withMessage('Las condiciones preexistentes no pueden exceder 2000 caracteres'),

	body('alergiasMedicamentos')
		.optional()
		.isLength({ max: 1000 })
		.withMessage('Las alergias a medicamentos no pueden exceder 1000 caracteres'),

	body('alergiasAlimentos')
		.optional()
		.isLength({ max: 1000 })
		.withMessage('Las alergias alimentarias no pueden exceder 1000 caracteres'),

	body('alergiasAmbientales')
		.optional()
		.isLength({ max: 1000 })
		.withMessage('Las alergias ambientales no pueden exceder 1000 caracteres'),

	body('alergiasOtras')
		.optional()
		.isLength({ max: 1000 })
		.withMessage('Otras alergias no pueden exceder 1000 caracteres'),

	body('medicamentosActuales')
		.optional()
		.isLength({ max: 2000 })
		.withMessage('Los medicamentos actuales no pueden exceder 2000 caracteres'),

	body('medicamentosPrevios')
		.optional()
		.isLength({ max: 2000 })
		.withMessage('Los medicamentos previos no pueden exceder 2000 caracteres'),

	body('cirugiasPrevias')
		.optional()
		.isLength({ max: 2000 })
		.withMessage('Las cirugías previas no pueden exceder 2000 caracteres'),

	body('procedimientosMedicos')
		.optional()
		.isLength({ max: 2000 })
		.withMessage('Los procedimientos médicos no pueden exceder 2000 caracteres'),

	body('hospitalizacionesPrevias')
		.optional()
		.isLength({ max: 2000 })
		.withMessage('Las hospitalizaciones previas no pueden exceder 2000 caracteres'),

	body('antecedentesFamiliares')
		.optional()
		.isLength({ max: 2000 })
		.withMessage('Los antecedentes familiares no pueden exceder 2000 caracteres'),

	body('habitosToxicos')
		.optional()
		.isLength({ max: 1000 })
		.withMessage('Los hábitos tóxicos no pueden exceder 1000 caracteres'),

	body('urgenciasMedicas')
		.optional()
		.isLength({ max: 1000 })
		.withMessage('Las urgencias médicas no pueden exceder 1000 caracteres'),

	body('contactoEmergenciaNombre')
		.optional()
		.isLength({ max: 100 })
		.withMessage('El nombre del contacto de emergencia no puede exceder 100 caracteres'),

	body('contactoEmergenciaTelefono')
		.optional()
		.isLength({ max: 20 })
		.withMessage('El teléfono del contacto de emergencia no puede exceder 20 caracteres'),

	body('contactoEmergenciaRelacion')
		.optional()
		.isLength({ max: 50 })
		.withMessage('La relación del contacto de emergencia no puede exceder 50 caracteres'),

	body('notasAdicionales')
		.optional()
		.isLength({ max: 2000 })
		.withMessage('Las notas adicionales no pueden exceder 2000 caracteres'),

	handleValidationErrors
];

// Validaciones para encuestas
const validateEncuesta = [
	body('calificacion')
		.notEmpty()
		.withMessage('La calificación es requerida')
		.isInt({ min: 1, max: 5 })
		.withMessage('La calificación debe ser un número entero entre 1 y 5'),

	body('comentario')
		.optional()
		.isLength({ max: 2000 })
		.withMessage('El comentario no puede exceder 2000 caracteres'),

	body('idUsuario')
		.notEmpty()
		.withMessage('El Id de Clerk es requerido'),

	handleValidationErrors
];


export {
	handleValidationErrors,
	validateUsuario,
	validateUsuarioUpdate,
	validateCita,
	validateServicio,
	validatePerfil,
	validateHistoriaExito,
	validateExpediente,
	validateExpedienteUpdate,
	validateDiagnostico,
	validateDiagnosticoUpdate,
	validateAntecedentes,
	validateEncuesta,
	validateId
};

