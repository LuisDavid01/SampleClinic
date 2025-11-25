import express from 'express';
import prisma from '../config/database.js';
import { clerkAuth, requireClerkRole } from '../middleware/clerkAuth.js';
import { ROLES, isPaciente, isAdministrador, isRecepcionista } from '../constants/roles.js';
import { validateHistoriaExito, validateId } from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /historias-exito:
 *   get:
 *     summary: Obtener todas las historias de éxito
 *     description: Obtiene una lista paginada de historias de éxito. Requiere autenticación.
 *     tags: [Historias de Éxito]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por título o descripción
 *       - in: query
 *         name: publicada
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de publicación
 *     responses:
 *       200:
 *         description: Lista de historias de éxito obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 historias:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/HistoriaExito'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
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
// GET /api/historias-exito - Obtener todas las historias de éxito
router.get('/', clerkAuth, async (req, res) => {
	try {
		const {
			page = 1,
			limit = 10,
			search,
			publicado,
			idPaciente
		} = req.query;
		const skip = (page - 1) * limit;

		// Construir filtros
		const where = {};

		if (search) {
			where.OR = [
				{ rating: { contains: search } },
				{ experiencia: { contains: search, mode: 'insensitive' } },
				{
					paciente: {
						OR: [
							{ nombre: { contains: search, mode: 'insensitive' } },
							{ apellido1: { contains: search, mode: 'insensitive' } },
							{ apellido2: { contains: search, mode: 'insensitive' } }
						]
					}
				},
			];
		}

		if (publicado !== undefined) {
			where.publicado = publicado === 'true';
		}


		if (idPaciente) {
			where.idPaciente = parseInt(idPaciente);
		}

		// Si es paciente, solo mostrar sus propias historias
		if (isPaciente(req.user)) {
			where.idPaciente = req.user.idUsuario;
		}

		const [historias, total] = await Promise.all([
			prisma.historiaExito.findMany({
				where,
				include: {
					paciente: {
						select: {
							idUsuario: true,
							nombre: true,
							apellido1: true,
							apellido2: true
						}
					}
				},
				skip: parseInt(skip),
				take: parseInt(limit),
				orderBy: { fechaPublicacion: 'desc' }
			}),
			prisma.historiaExito.count({ where })
		]);

		res.json({
			historias,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit)
			}
		});

	} catch (error) {
		console.error('Error al obtener historias de éxito:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudieron obtener las historias de éxito'
		});
	}
});

/**
 * @swagger
 * /historias-exito/{id}:
 *   get:
 *     summary: Obtener historia de éxito por ID
 *     description: Obtiene una historia de éxito específica por su ID. Requiere autenticación Clerk.
 *     tags: [Historias de Éxito]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la historia de éxito
 *     responses:
 *       200:
 *         description: Historia de éxito obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoriaExito'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// GET /api/historias-exito/:id - Obtener historia de éxito por ID
router.get('/:id', clerkAuth, validateId, async (req, res) => {
	try {
		const { id } = req.params;

		const historia = await prisma.historiaExito.findUnique({
			where: { idHistoria: parseInt(id) },
			include: {
				paciente: {
					select: {
						idUsuario: true,
						nombre: true,
						apellido1: true,
						apellido2: true
					}
				}
			}
		});

		if (!historia) {
			return res.status(404).json({
				error: 'Historia de éxito no encontrada',
				message: 'No existe una historia de éxito con el ID proporcionado'
			});
		}

		// Si es paciente, solo puede ver sus propias historias
		if (isPaciente(req.user) && historia.idPaciente !== req.user.idUsuario) {
			return res.status(403).json({
				error: 'Acceso denegado',
				message: 'Solo puede ver sus propias historias de éxito'
			});
		}

		res.json(historia);

	} catch (error) {
		console.error('Error al obtener historia de éxito:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo obtener la historia de éxito'
		});
	}
});

/**
 * @swagger
 * /historias-exito:
 *   post:
 *     summary: Crear nueva historia de éxito
 *     description: Crea una nueva historia de éxito. Requiere autenticación Clerk.
 *     tags: [Historias de Éxito]
 *     security:
 *       - clerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idServicio
 *               - idMedico
 *               - idPaciente
 *               - titulo
 *               - descripcion
 *             properties:
 *               idServicio:
 *                 type: integer
 *                 description: ID del servicio
 *               idMedico:
 *                 type: integer
 *                 description: ID del médico
 *               idPaciente:
 *                 type: integer
 *                 description: ID del paciente
 *               titulo:
 *                 type: string
 *                 description: Título de la historia de éxito
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada de la historia
 *               fechaInicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio del tratamiento
 *               fechaFin:
 *                 type: string
 *                 format: date
 *                 description: Fecha de finalización del tratamiento
 *               resultado:
 *                 type: string
 *                 description: Resultado obtenido
 *               testimonio:
 *                 type: string
 *                 description: Testimonio del paciente
 *     responses:
 *       201:
 *         description: Historia de éxito creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoriaExito'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// POST /api/historias-exito - Crear nueva historia de éxito
router.post('/', clerkAuth, validateHistoriaExito, async (req, res) => {
	try {
		const {
			idPaciente,
			rating,
			fechaTratamiento,
			experiencia,
			publicado = false
		} = req.body;

		// Si es paciente, solo puede crear historias para sí mismo
		if (isPaciente(req.user)) {
			if (idPaciente && idPaciente !== req.user.idUsuario) {
				return res.status(403).json({
					error: 'Acceso denegado',
					message: 'Solo puede crear historias de éxito para sí mismo'
				});
			}
		}


		// Verificar que el paciente existe si se proporciona
		if (idPaciente) {
			const paciente = await prisma.usuario.findUnique({
				where: { idUsuario: idPaciente }
			});
			if (!paciente) {
				return res.status(400).json({
					error: 'Paciente no encontrado',
					message: 'El paciente especificado no existe'
				});
			}
		}

		const historia = await prisma.historiaExito.create({
			data: {
				idPaciente: idPaciente || req.user.idUsuario, // Si es paciente, usar su ID
				fechaTratamiento: fechaTratamiento ? new Date(fechaTratamiento) : null,
				rating,
				experiencia,
				publicado,
				fechaPublicacion: publicado ? new Date() : null
			},
			include: {
				paciente: {
					select: {
						idUsuario: true,
						nombre: true,
						apellido1: true,
						apellido2: true
					}
				}
			}
		});

		res.status(201).json({
			message: 'Historia de éxito creada exitosamente',
			historia
		});

	} catch (error) {
		console.error('Error al crear historia de éxito:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo crear la historia de éxito'
		});
	}
});

/**
 * @swagger
 * /historias-exito/{id}:
 *   put:
 *     summary: Actualizar historia de éxito
 *     description: Actualiza una historia de éxito existente. Requiere autenticación Clerk.
 *     tags: [Historias de Éxito]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la historia de éxito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idServicio:
 *                 type: integer
 *                 description: ID del servicio
 *               idMedico:
 *                 type: integer
 *                 description: ID del médico
 *               idPaciente:
 *                 type: integer
 *                 description: ID del paciente
 *               titulo:
 *                 type: string
 *                 description: Título de la historia de éxito
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada de la historia
 *               fechaInicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio del tratamiento
 *               fechaFin:
 *                 type: string
 *                 format: date
 *                 description: Fecha de finalización del tratamiento
 *               resultado:
 *                 type: string
 *                 description: Resultado obtenido
 *               testimonio:
 *                 type: string
 *                 description: Testimonio del paciente
 *     responses:
 *       200:
 *         description: Historia de éxito actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoriaExito'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// PUT /api/historias-exito/:id - Actualizar historia de éxito
router.put('/:id', clerkAuth, validateId, async (req, res) => {
	try {
		const { id } = req.params;
		const updateData = { ...req.body };

		// Verificar que la historia existe
		const historiaExistente = await prisma.historiaExito.findUnique({
			where: { idHistoria: parseInt(id) }
		});

		if (!historiaExistente) {
			return res.status(404).json({
				error: 'Historia de éxito no encontrada',
				message: 'No existe una historia de éxito con el ID proporcionado'
			});
		}

		// Verificar permisos
		const isPaciente = historiaExistente.idPaciente === req.user.idUsuario;
		const isAdmin = isAdministrador(req.user);
		const isRecep = isRecepcionista(req.user);

		if (!isPaciente && !isRecep && !isAdmin) {
			return res.status(403).json({
				error: 'Acceso denegado',
				message: 'Solo el paciente, médico o un administrador pueden eliminar la historia'
			});
		}

		// Si se está publicando, establecer fecha de publicación
		if (updateData.publicado && !historiaExistente.publicado) {
			updateData.fechaPublicacion = new Date();
		}

		// Convertir fecha si se proporciona
		if (updateData.fechaTratamiento) {
			updateData.fechaTratamiento = new Date(updateData.fechaTratamiento);
		}

		const historia = await prisma.historiaExito.update({
			where: { idHistoria: parseInt(id) },
			data: updateData,
			include: {
				paciente: {
					select: {
						idUsuario: true,
						nombre: true,
						apellido1: true,
						apellido2: true
					}
				}
			}
		});

		res.json({
			message: 'Historia de éxito actualizada exitosamente',
			historia
		});

	} catch (error) {
		console.error('Error al actualizar historia de éxito:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo actualizar la historia de éxito'
		});
	}
});

/**
 * @swagger
 * /historias-exito/{id}:
 *   delete:
 *     summary: Eliminar historia de éxito
 *     description: Elimina una historia de éxito. Requiere autenticación Clerk.
 *     tags: [Historias de Éxito]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la historia de éxito
 *     responses:
 *       200:
 *         description: Historia de éxito eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Historia de éxito eliminada exitosamente"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// DELETE /api/historias-exito/:id - Eliminar historia de éxito
router.delete('/:id', clerkAuth, validateId, async (req, res) => {
	try {
		const { id } = req.params;

		// Verificar que la historia existe
		const historiaExistente = await prisma.historiaExito.findUnique({
			where: { idHistoria: parseInt(id) }
		});

		if (!historiaExistente) {
			return res.status(404).json({
				error: 'Historia de éxito no encontrada',
				message: 'No existe una historia de éxito con el ID proporcionado'
			});
		}

		// Verificar permisos
		const isPaciente = historiaExistente.idPaciente === req.user.idUsuario;
		const isAdmin = isAdministrador(req.user);
		const isRecep = isRecepcionista(req.user);

		if (!isPaciente && !isRecep && !isAdmin) {
			return res.status(403).json({
				error: 'Acceso denegado',
				message: 'Solo el paciente, médico o un administrador pueden eliminar la historia'
			});
		}


		await prisma.historiaExito.delete({
			where: { idHistoria: parseInt(id) }
		});

		res.json({
			message: 'Historia de éxito eliminada exitosamente'
		});

	} catch (error) {
		console.error('Error al eliminar historia de éxito:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo eliminar la historia de éxito'
		});
	}
});

/**
 * @swagger
 * /historias-exito/{id}/publicar:
 *   post:
 *     summary: Publicar historia de éxito
 *     description: Publica una historia de éxito. Solo administradores pueden publicar.
 *     tags: [Historias de Éxito]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la historia de éxito
 *     responses:
 *       200:
 *         description: Historia de éxito publicada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoriaExito'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// POST /api/historias-exito/:id/publicar - Publicar historia de éxito (solo admin)
router.post('/:id/publicar', clerkAuth, requireClerkRole(['admin']), validateId, async (req, res) => {
	try {
		const { id } = req.params;

		const historia = await prisma.historiaExito.update({
			where: { idHistoria: parseInt(id) },
			data: {
				publicado: true,
				fechaPublicacion: new Date()
			},
			include: {
				paciente: {
					select: {
						idUsuario: true,
						nombre: true,
						apellido1: true,
						apellido2: true
					}
				}
			}
		});

		res.json({
			message: 'Historia de éxito publicada exitosamente',
			historia
		});

	} catch (error) {
		if (error.code === 'P2025') {
			return res.status(404).json({
				error: 'Historia de éxito no encontrada',
				message: 'No existe una historia de éxito con el ID proporcionado'
			});
		}

		console.error('Error al publicar historia de éxito:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo publicar la historia de éxito'
		});
	}
});

/**
 * @swagger
 * /historias-exito/{id}/despublicar:
 *   post:
 *     summary: Despublicar historia de éxito
 *     description: Despublica una historia de éxito. Solo administradores pueden despublicar.
 *     tags: [Historias de Éxito]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la historia de éxito
 *     responses:
 *       200:
 *         description: Historia de éxito despublicada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoriaExito'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// POST /api/historias-exito/:id/despublicar - Despublicar historia de éxito (solo admin)
router.post('/:id/despublicar', clerkAuth, requireClerkRole(['admin']), validateId, async (req, res) => {
	try {
		const { id } = req.params;

		const historia = await prisma.historiaExito.update({
			where: { idHistoria: parseInt(id) },
			data: {
				publicado: false,
				fechaPublicacion: null
			},
			include: {
				paciente: {
					select: {
						idUsuario: true,
						nombre: true,
						apellido1: true,
						apellido2: true
					}
				}
			}
		});

		res.json({
			message: 'Historia de éxito despublicada exitosamente',
			historia
		});

	} catch (error) {
		if (error.code === 'P2025') {
			return res.status(404).json({
				error: 'Historia de éxito no encontrada',
				message: 'No existe una historia de éxito con el ID proporcionado'
			});
		}

		console.error('Error al despublicar historia de éxito:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo despublicar la historia de éxito'
		});
	}
});

export default router;
