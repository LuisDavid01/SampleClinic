import { Router } from 'express';
import reminderService from '../services/reminderService.js';
import prisma from '../config/database.js';

const router = Router();

/**
 * @swagger
 * /citas/{id}/confirmar:
 *   post:
 *     summary: Confirmar cita mediante token
 *     description: Permite a un paciente confirmar su asistencia a una cita usando el token recibido por email
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de confirmación recibido por email
 *     responses:
 *       200:
 *         description: Cita confirmada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cita confirmada exitosamente"
 *                 cita:
 *                   $ref: '#/components/schemas/Cita'
 *       400:
 *         description: Token inválido o datos incorrectos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Token inválido o cita no disponible"
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/confirmar', async (req, res) => {
	try {
		const { id } = req.params;
		const { token } = req.query;

		if (!token) {
			return res.status(400).json({
				success: false,
				error: 'Token de confirmación requerido'
			});
		}

		const idCita = parseInt(id);
		if (isNaN(idCita)) {
			return res.status(400).json({
				success: false,
				error: 'ID de cita inválido'
			});
		}

		const resultado = await reminderService.confirmarCita(idCita, token);

		if (resultado.success) {
			res.json({
				success: true,
				message: 'Cita confirmada exitosamente',
				cita: resultado.cita
			});
		} else {
			res.status(400).json({
				success: false,
				error: resultado.error
			});
		}
	} catch (error) {
		console.error('Error confirmando cita:', error);
		res.status(500).json({
			success: false,
			error: 'Error interno del servidor',
			message: error.message
		});
	}
});

/**
 * @swagger
 * /citas/{id}/rechazar:
 *   post:
 *     summary: Rechazar cita mediante token
 *     description: Permite a un paciente rechazar/cancelar su cita usando el token recibido por email
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de confirmación recibido por email
 *     responses:
 *       200:
 *         description: Cita rechazada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cita rechazada exitosamente"
 *                 cita:
 *                   $ref: '#/components/schemas/Cita'
 *       400:
 *         description: Token inválido o datos incorrectos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Token inválido o cita no disponible"
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/rechazar', async (req, res) => {
	try {
		const { id } = req.params;
		const { token } = req.query;

		if (!token) {
			return res.status(400).json({
				success: false,
				error: 'Token de confirmación requerido'
			});
		}

		const idCita = parseInt(id);
		if (isNaN(idCita)) {
			return res.status(400).json({
				success: false,
				error: 'ID de cita inválido'
			});
		}

		const resultado = await reminderService.rechazarCita(idCita, token);

		if (resultado.success) {
			res.json({
				success: true,
				message: 'Cita rechazada exitosamente',
				cita: resultado.cita
			});
		} else {
			res.status(400).json({
				success: false,
				error: resultado.error
			});
		}
	} catch (error) {
		console.error('Error rechazando cita:', error);
		res.status(500).json({
			success: false,
			error: 'Error interno del servidor',
			message: error.message
		});
	}
});

/**
 * @swagger
 * /citas/{id}/validar-token:
 *   get:
 *     summary: Validar token de confirmación
 *     description: Verifica si un token de confirmación es válido para una cita
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de confirmación
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valido:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Parámetros inválidos
 */
router.get('/:id/validar-token', async (req, res) => {
	try {
		const { id } = req.params;
		const { token } = req.query;

		if (!token) {
			return res.status(400).json({
				valido: false,
				error: 'Token requerido'
			});
		}

		const idCita = parseInt(id);
		if (isNaN(idCita)) {
			return res.status(400).json({
				valido: false,
				error: 'ID de cita inválido'
			});
		}

		const valido = await reminderService.validarToken(idCita, token);

		res.json({ valido });
	} catch (error) {
		console.error('Error validando token:', error);
		res.status(500).json({
			valido: false,
			error: 'Error interno del servidor'
		});
	}
});

/**
 * @swagger
 * /citas/{id}/info:
 *   get:
 *     summary: Obtener información de cita con token (público)
 *     description: Obtiene la información de una cita usando el token de confirmación. Endpoint público para uso desde emails.
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de confirmación
 *     responses:
 *       200:
 *         description: Información de la cita
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 cita:
 *                   $ref: '#/components/schemas/Cita'
 *       400:
 *         description: Token inválido o parámetros incorrectos
 *       404:
 *         description: Cita no encontrada
 */
router.get('/:id/info', async (req, res) => {
	try {
		const { id } = req.params;
		const { token } = req.query;

		if (!token) {
			return res.status(400).json({
				success: false,
				error: 'Token requerido'
			});
		}

		const idCita = parseInt(id);
		if (isNaN(idCita)) {
			return res.status(400).json({
				success: false,
				error: 'ID de cita inválido'
			});
		}

		// Validar token
		const valido = await reminderService.validarToken(idCita, token);
		if (!valido) {
			return res.status(400).json({
				success: false,
				error: 'Token inválido o expirado'
			});
		}

		// Obtener información de la cita
		const prisma = (await import('../config/database.js')).default;
		const cita = await prisma.cita.findUnique({
			where: { idCita },
			include: {
				paciente: {
					select: {
						idUsuario: true,
						nombre: true,
						apellido1: true,
						apellido2: true
					}
				},
				medico: {
					select: {
						idUsuario: true,
						nombre: true,
						apellido1: true,
						apellido2: true
					}
				},
				servicio: {
					select: {
						idServicio: true,
						nombreServicio: true
					}
				}
			}
		});

		if (!cita) {
			return res.status(404).json({
				success: false,
				error: 'Cita no encontrada'
			});
		}

		res.json({
			success: true,
			cita
		});
	} catch (error) {
		console.error('Error obteniendo información de cita:', error);
		res.status(500).json({
			success: false,
			error: 'Error interno del servidor'
		});
	}
});

export default router;

