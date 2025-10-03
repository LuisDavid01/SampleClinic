import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken, generateTokenPayload } from '../utils/jwt.js';
import sessionService from '../services/sessionService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión en el sistema
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             correoElectronico: "usuario@ejemplo.com"
 *             contrasena: "password123"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               message: "Inicio de sesión exitoso"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               usuario:
 *                 idUsuario: 1
 *                 nombre: "Juan"
 *                 apellido1: "Pérez"
 *                 correoElectronico: "usuario@ejemplo.com"
 *                 rol:
 *                   nombreRol: "paciente"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Validaciones para login
const validateLogin = [
	body('correoElectronico')
		.isEmail()
		.withMessage('Debe proporcionar un correo electrónico válido')
		.normalizeEmail(),

	body('contrasena')
		.notEmpty()
		.withMessage('La contraseña es requerida'),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				error: 'Datos de entrada inválidos',
				message: 'Por favor, revise los datos enviados',
				details: errors.array()
			});
		}
		next();
	}
];

// Validaciones para registro
const validateRegister = [
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
		.isLength({ min: 6 })
		.withMessage('La contraseña debe tener al menos 6 caracteres'),

	body('telefonoPrincipal')
		.optional()
		.isLength({ max: 20 })
		.withMessage('El teléfono principal no puede exceder 20 caracteres'),

	body('direccionResidencia')
		.optional()
		.isLength({ max: 255 })
		.withMessage('La dirección no puede exceder 255 caracteres'),

	body('idRol')
		.optional()
		.isInt({ min: 1 })
		.withMessage('El ID del rol debe ser un número entero positivo'),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				error: 'Datos de entrada inválidos',
				message: 'Por favor, revise los datos enviados',
				details: errors.array()
			});
		}
		next();
	}
];

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             nombre: "Juan"
 *             apellido1: "Pérez"
 *             apellido2: "García"
 *             correoElectronico: "usuario@ejemplo.com"
 *             contrasena: "password123"
 *             telefonoPrincipal: "555-1234"
 *             direccionResidencia: "Calle 123, Ciudad"
 *             idRol: 2
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               message: "Usuario registrado exitosamente"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               usuario:
 *                 idUsuario: 1
 *                 nombre: "Juan"
 *                 apellido1: "Pérez"
 *                 correoElectronico: "usuario@ejemplo.com"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Usuario ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// POST /api/auth/login - Iniciar sesión
router.post('/login', validateLogin, async (req, res) => {
	try {
		const { correoElectronico, contrasena } = req.body;

		// Buscar usuario por correo electrónico
		const usuario = await prisma.usuario.findUnique({
			where: { correoElectronico },
			include: { rol: true }
		});

		if (!usuario) {
			return res.status(401).json({
				error: 'Credenciales inválidas',
				message: 'El correo electrónico o la contraseña son incorrectos'
			});
		}

		if (!usuario.activo) {
			return res.status(401).json({
				error: 'Cuenta inactiva',
				message: 'Su cuenta está inactiva. Contacte al administrador'
			});
		}

		// Verificar contraseña
		const isPasswordValid = await verifyPassword(contrasena, usuario.contrasena);

		if (!isPasswordValid) {
			return res.status(401).json({
				error: 'Credenciales inválidas',
				message: 'El correo electrónico o la contraseña son incorrectos'
			});
		}

		// Generar token JWT
		const tokenPayload = generateTokenPayload(usuario);
		const token = generateToken(tokenPayload);

		// Crear sesión en base de datos
		await sessionService.createSession(usuario.idUsuario, token, req);

		// Remover contraseña de la respuesta
		const { contrasena: _, ...usuarioSinContrasena } = usuario;

		res.json({
			message: 'Inicio de sesión exitoso',
			token,
			usuario: usuarioSinContrasena
		});

	} catch (error) {
		console.error('Error en login:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo procesar el inicio de sesión'
		});
	}
});

// POST /api/auth/register - Registro de usuario
router.post('/register', validateRegister, async (req, res) => {
	try {
		const {
			nombre,
			apellido1,
			apellido2,
			correoElectronico,
			contrasena,
			telefonoPrincipal,
			direccionResidencia,
			idRol
		} = req.body;

		// Verificar si el usuario ya existe
		const usuarioExistente = await prisma.usuario.findUnique({
			where: { correoElectronico }
		});

		if (usuarioExistente) {
			return res.status(409).json({
				error: 'Usuario ya existe',
				message: 'Ya existe un usuario con este correo electrónico'
			});
		}

		// Hashear contraseña
		const contrasenaHasheada = await hashPassword(contrasena);

		// Crear usuario
		const nuevoUsuario = await prisma.usuario.create({
			data: {
				nombre,
				apellido1,
				apellido2,
				correoElectronico,
				contrasena: contrasenaHasheada,
				telefonoPrincipal,
				direccionResidencia,
				idRol: idRol || 2, // Por defecto rol de paciente (asumiendo que 2 es paciente)
				activo: true
			},
			include: { rol: true }
		});

		// Generar token JWT
		const tokenPayload = generateTokenPayload(nuevoUsuario);
		const token = generateToken(tokenPayload);

		// Remover contraseña de la respuesta
		const { contrasena: _, ...usuarioSinContrasena } = nuevoUsuario;

		res.status(201).json({
			message: 'Usuario registrado exitosamente',
			token,
			usuario: usuarioSinContrasena
		});

	} catch (error) {
		console.error('Error en registro:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo procesar el registro'
		});
	}
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar token de acceso
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token JWT actual
 *           example:
 *             token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token renovado exitosamente"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Token requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// POST /api/auth/refresh - Renovar token
router.post('/refresh', async (req, res) => {
	try {
		const { token } = req.body;

		if (!token) {
			return res.status(400).json({
				error: 'Token requerido',
				message: 'Debe proporcionar un token para renovar'
			});
		}

		// Verificar token actual
		const decoded = jwt.verify(token, config.jwtSecret);

		// Buscar usuario actualizado
		const usuario = await prisma.usuario.findUnique({
			where: { idUsuario: decoded.idUsuario },
			include: { rol: true }
		});

		if (!usuario || !usuario.activo) {
			return res.status(401).json({
				error: 'Token inválido',
				message: 'El usuario no existe o está inactivo'
			});
		}

		// Generar nuevo token
		const tokenPayload = generateTokenPayload(usuario);
		const newToken = generateToken(tokenPayload);

		res.json({
			message: 'Token renovado exitosamente',
			token: newToken
		});

	} catch (error) {
		console.error('Error en refresh token:', error);
		res.status(401).json({
			error: 'Token inválido',
			message: 'No se pudo renovar el token'
		});
	}
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Cierra la sesión actual del usuario invalidando el token.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sesión cerrada exitosamente"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', async (req, res) => {
	try {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];

		if (token) {
			await sessionService.invalidateSessionByToken(token);
		}

		res.json({
			message: 'Sesión cerrada exitosamente'
		});
	} catch (error) {
		console.error('Error en logout:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo cerrar la sesión'
		});
	}
});

/**
 * @swagger
 * /auth/session/status:
 *   get:
 *     summary: Verificar estado de sesión
 *     description: Verifica el estado actual de la sesión del usuario.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de sesión obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 session:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "clx1234567890"
 *                     lastActivity:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00Z"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T11:00:00Z"
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Sesión inválida o expirada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// GET /api/auth/session/status - Verificar estado de sesión
router.get('/session/status', async (req, res) => {
	try {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];

		if (!token) {
			return res.status(401).json({
				error: 'Token requerido',
				message: 'Debe proporcionar un token para verificar la sesión'
			});
		}

		const sessionInfo = await sessionService.getSessionInfo(token);

		if (!sessionInfo || !sessionInfo.activa) {
			return res.status(401).json({
				error: 'Sesión inválida',
				message: 'La sesión no existe o está inactiva'
			});
		}

		res.json({
			valid: true,
			session: {
				id: sessionInfo.idSesion,
				lastActivity: sessionInfo.ultimaActividad,
				expiresAt: sessionInfo.expiraEn
			},
			user: {
				idUsuario: sessionInfo.usuario.idUsuario,
				nombre: sessionInfo.usuario.nombre,
				apellido1: sessionInfo.usuario.apellido1,
				correoElectronico: sessionInfo.usuario.correoElectronico,
				rol: sessionInfo.usuario.rol
			}
		});
	} catch (error) {
		console.error('Error verificando estado de sesión:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo verificar el estado de la sesión'
		});
	}
});

/**
 * @swagger
 * /auth/session/sessions:
 *   get:
 *     summary: Obtener sesiones activas del usuario
 *     description: Obtiene todas las sesiones activas del usuario actual.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesiones activas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "clx1234567890"
 *                       fechaCreacion:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:00:00Z"
 *                       ultimaActividad:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00Z"
 *                       expiraEn:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T11:00:00Z"
 *                       ipAddress:
 *                         type: string
 *                         example: "192.168.1.100"
 *                       userAgent:
 *                         type: string
 *                         example: "Mozilla/5.0..."
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// GET /api/auth/session/sessions - Obtener sesiones activas
router.get('/session/sessions', authenticateToken, async (req, res) => {
	try {
		const sessions = await sessionService.getUserActiveSessions(req.user.idUsuario);

		res.json({
			sessions: sessions.map(session => ({
				id: session.idSesion,
				fechaCreacion: session.fechaCreacion,
				ultimaActividad: session.ultimaActividad,
				expiraEn: session.expiraEn,
				ipAddress: session.ipAddress,
				userAgent: session.userAgent
			}))
		});
	} catch (error) {
		console.error('Error obteniendo sesiones:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudieron obtener las sesiones'
		});
	}
});

/**
 * @swagger
 * /auth/session/invalidate-all:
 *   post:
 *     summary: Invalidar todas las sesiones del usuario
 *     description: Invalida todas las sesiones activas del usuario actual.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las sesiones invalidadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Todas las sesiones han sido invalidadas"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// POST /api/auth/session/invalidate-all - Invalidar todas las sesiones
router.post('/session/invalidate-all', authenticateToken, async (req, res) => {
	try {
		await sessionService.invalidateUserSessions(req.user.idUsuario);

		res.json({
			message: 'Todas las sesiones han sido invalidadas'
		});
	} catch (error) {
		console.error('Error invalidando sesiones:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudieron invalidar las sesiones'
		});
	}
});

export default router;
