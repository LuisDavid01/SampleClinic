import { Router } from 'express';
import prisma from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ROLES } from '../constants/roles.js';
import { validateServicio, validateId } from '../middleware/validation.js';

const router = Router();

/**
 * @swagger
 * /servicios:
 *   get:
 *     summary: Obtener todos los servicios
 *     description: Obtiene una lista paginada de servicios disponibles. Requiere autenticación.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
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
 *         description: Buscar por nombre del servicio
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Lista de servicios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 servicios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Servicio'
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
// GET /api/servicios - Obtener todos los servicios
router.get('/', authenticateToken, async (req, res) => {
	try {
		const { page = 1, limit = 10, search, activo } = req.query;
		const skip = (page - 1) * limit;

		// Construir filtros
		const where = {};

		if (search) {
			where.OR = [
				{ nombreServicio: { contains: search, mode: 'insensitive' } },
				{ descripcion: { contains: search, mode: 'insensitive' } }
			];
		}

		if (activo !== undefined) {
			where.activo = activo === 'true';
		}

		const [servicios, total] = await Promise.all([
			prisma.servicio.findMany({
				where,
				skip: parseInt(skip),
				take: parseInt(limit),
				orderBy: { nombreServicio: 'asc' }
			}),
			prisma.servicio.count({ where })
		]);

		res.json({
			servicios,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit)
			}
		});

	} catch (error) {
		console.error('Error al obtener servicios:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudieron obtener los servicios'
		});
	}
});

/**
 * @swagger
 * /servicios/{id}:
 *   get:
 *     summary: Obtener servicio por ID
 *     description: Obtiene los detalles de un servicio específico por su ID. Requiere autenticación.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *         example: 1
 *     responses:
 *       200:
 *         description: Servicio obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 servicio:
 *                   $ref: '#/components/schemas/Servicio'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Servicio no encontrado
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
// GET /api/servicios/:id - Obtener servicio por ID
router.get('/:id', authenticateToken, validateId, async (req, res) => {
	try {
		const { id } = req.params;

		const servicio = await prisma.servicio.findUnique({
			where: { idServicio: parseInt(id) },
			include: {
				perfiles: {
					include: {
						perfil: {
							include: {
								medico: {
									select: {
										idUsuario: true,
										nombre: true,
										apellido1: true,
										apellido2: true
									}
								}
							}
						}
					}
				},
				citas: {
					where: { estadoCita: { not: 'cancelada' } },
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
					orderBy: { fechaCita: 'desc' },
					take: 5
				},
				historiasExito: {
					where: { publicado: true },
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
					orderBy: { fechaPublicacion: 'desc' },
					take: 3
				}
			}
		});

		if (!servicio) {
			return res.status(404).json({
				error: 'Servicio no encontrado',
				message: 'No existe un servicio con el ID proporcionado'
			});
		}

		res.json(servicio);

	} catch (error) {
		console.error('Error al obtener servicio:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo obtener el servicio'
		});
	}
});

/**
 * @swagger
 * /servicios:
 *   post:
 *     summary: Crear nuevo servicio
 *     description: Crea un nuevo servicio. Solo los administradores pueden crear servicios.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreServicio
 *             properties:
 *               nombreServicio:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nombre del servicio
 *                 example: "Fisioterapia de Rodilla"
 *               descripcion:
 *                 type: string
 *                 maxLength: 500
 *                 description: Descripción del servicio
 *                 example: "Tratamiento especializado para lesiones de rodilla"
 *               precio:
 *                 type: number
 *                 format: decimal
 *                 description: Precio del servicio
 *                 example: 50.00
 *               activo:
 *                 type: boolean
 *                 default: true
 *                 description: Estado del servicio
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Servicio creado exitosamente"
 *                 servicio:
 *                   $ref: '#/components/schemas/Servicio'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - solo administradores
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
// POST /api/servicios - Crear nuevo servicio (solo admin)
router.post('/', authenticateToken, requireRole([ROLES.ADMINISTRADOR]), validateServicio, async (req, res) => {
	try {
		const { nombreServicio, descripcion, precio, activo = true } = req.body;

		const servicio = await prisma.servicio.create({
			data: {
				nombreServicio,
				descripcion,
				precio: precio ? parseFloat(precio) : null,
				activo
			}
		});

		res.status(201).json({
			message: 'Servicio creado exitosamente',
			servicio
		});

	} catch (error) {
		console.error('Error al crear servicio:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo crear el servicio'
		});
	}
});

/**
 * @swagger
 * /servicios/{id}:
 *   put:
 *     summary: Actualizar servicio
 *     description: Actualiza un servicio existente. Solo los administradores pueden actualizar servicios.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreServicio:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nombre del servicio
 *                 example: "Fisioterapia de Rodilla Actualizada"
 *               descripcion:
 *                 type: string
 *                 maxLength: 500
 *                 description: Descripción del servicio
 *                 example: "Tratamiento especializado para lesiones de rodilla con técnicas avanzadas"
 *               precio:
 *                 type: number
 *                 format: decimal
 *                 description: Precio del servicio
 *                 example: 75.00
 *               activo:
 *                 type: boolean
 *                 description: Estado del servicio
 *                 example: true
 *     responses:
 *       200:
 *         description: Servicio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Servicio actualizado exitosamente"
 *                 servicio:
 *                   $ref: '#/components/schemas/Servicio'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - solo administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Servicio no encontrado
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
// PUT /api/servicios/:id - Actualizar servicio (solo admin)
router.put('/:id', authenticateToken, requireRole([ROLES.ADMINISTRADOR]), validateId, validateServicio, async (req, res) => {
	try {
		const { id } = req.params;
		const updateData = { ...req.body };

		// Convertir precio a decimal si se proporciona
		if (updateData.precio !== undefined) {
			updateData.precio = updateData.precio ? parseFloat(updateData.precio) : null;
		}

		const servicio = await prisma.servicio.update({
			where: { idServicio: parseInt(id) },
			data: updateData
		});

		res.json({
			message: 'Servicio actualizado exitosamente',
			servicio
		});

	} catch (error) {
		if (error.code === 'P2025') {
			return res.status(404).json({
				error: 'Servicio no encontrado',
				message: 'No existe un servicio con el ID proporcionado'
			});
		}

		console.error('Error al actualizar servicio:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo actualizar el servicio'
		});
	}
});

/**
 * @swagger
 * /servicios/{id}:
 *   delete:
 *     summary: Desactivar servicio
 *     description: Desactiva un servicio (soft delete). Solo los administradores pueden desactivar servicios.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *         example: 1
 *     responses:
 *       200:
 *         description: Servicio desactivado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Servicio desactivado exitosamente"
 *                 servicio:
 *                   $ref: '#/components/schemas/Servicio'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - solo administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Servicio no encontrado
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
// DELETE /api/servicios/:id - Desactivar servicio (solo admin)
router.delete('/:id', authenticateToken, requireRole([ROLES.ADMINISTRADOR]), validateId, async (req, res) => {
	try {
		const { id } = req.params;

		// Verificar si el servicio tiene citas activas
		const citasActivas = await prisma.cita.count({
			where: {
				idServicio: parseInt(id),
				estadoCita: { not: 'cancelada' }
			}
		});

		if (citasActivas > 0) {
			return res.status(400).json({
				error: 'No se puede desactivar',
				message: 'El servicio tiene citas activas. Primero cancele o complete las citas.'
			});
		}

		const servicio = await prisma.servicio.update({
			where: { idServicio: parseInt(id) },
			data: { activo: false }
		});

		res.json({
			message: 'Servicio desactivado exitosamente'
		});

	} catch (error) {
		if (error.code === 'P2025') {
			return res.status(404).json({
				error: 'Servicio no encontrado',
				message: 'No existe un servicio con el ID proporcionado'
			});
		}

		console.error('Error al desactivar servicio:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo desactivar el servicio'
		});
	}
});

/**
 * @swagger
 * /servicios/{id}/perfiles:
 *   get:
 *     summary: Obtener perfiles asociados al servicio
 *     description: Obtiene todos los perfiles de fisioterapeutas asociados a un servicio específico. Requiere autenticación.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *         example: 1
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
 *     responses:
 *       200:
 *         description: Perfiles del servicio obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 perfiles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Perfil'
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
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Servicio no encontrado
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
// GET /api/servicios/:id/perfiles - Obtener perfiles que ofrecen el servicio
router.get('/:id/perfiles', authenticateToken, validateId, async (req, res) => {
	try {
		const { id } = req.params;
		const { page = 1, limit = 10 } = req.query;
		const skip = (page - 1) * limit;

		const [perfiles, total] = await Promise.all([
			prisma.perfilServicio.findMany({
				where: { idServicio: parseInt(id) },
				include: {
					perfil: {
						include: {
							medico: {
								select: {
									idUsuario: true,
									nombre: true,
									apellido1: true,
									apellido2: true,
									telefonoPrincipal: true,
									correoElectronico: true
								}
							},
							certificaciones: {
								include: { certificacion: true }
							}
						}
					}
				},
				skip: parseInt(skip),
				take: parseInt(limit)
			}),
			prisma.perfilServicio.count({ where: { idServicio: parseInt(id) } })
		]);

		res.json({
			perfiles: perfiles.map(p => p.perfil),
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit)
			}
		});

	} catch (error) {
		console.error('Error al obtener perfiles del servicio:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudieron obtener los perfiles del servicio'
		});
	}
});

/**
 * @swagger
 * /servicios/{id}/perfiles:
 *   post:
 *     summary: Asociar perfil con servicio
 *     description: Asocia un perfil de fisioterapeuta con un servicio específico. Solo los administradores pueden realizar esta acción.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idPerfil
 *             properties:
 *               idPerfil:
 *                 type: integer
 *                 description: ID del perfil de fisioterapeuta
 *                 example: 1
 *     responses:
 *       201:
 *         description: Perfil asociado al servicio exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Perfil asociado al servicio exitosamente"
 *                 asociacion:
 *                   type: object
 *                   properties:
 *                     idServicio:
 *                       type: integer
 *                     idPerfil:
 *                       type: integer
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - solo administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Servicio o perfil no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: La asociación ya existe
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
// POST /api/servicios/:id/perfiles - Asociar perfil con servicio (solo admin)
router.post('/:id/perfiles', authenticateToken, requireRole([ROLES.ADMINISTRADOR]), validateId, async (req, res) => {
	try {
		const { id } = req.params;
		const { idPerfil } = req.body;

		if (!idPerfil) {
			return res.status(400).json({
				error: 'Datos inválidos',
				message: 'El ID del perfil es requerido'
			});
		}

		// Verificar que el servicio y perfil existen
		const [servicio, perfil] = await Promise.all([
			prisma.servicio.findUnique({ where: { idServicio: parseInt(id) } }),
			prisma.perfil.findUnique({ where: { idPerfil: parseInt(idPerfil) } })
		]);

		if (!servicio) {
			return res.status(404).json({
				error: 'Servicio no encontrado',
				message: 'No existe un servicio con el ID proporcionado'
			});
		}

		if (!perfil) {
			return res.status(404).json({
				error: 'Perfil no encontrado',
				message: 'No existe un perfil con el ID proporcionado'
			});
		}

		// Verificar si ya existe la asociación
		const asociacionExistente = await prisma.perfilServicio.findUnique({
			where: {
				idPerfil_idServicio: {
					idPerfil: parseInt(idPerfil),
					idServicio: parseInt(id)
				}
			}
		});

		if (asociacionExistente) {
			return res.status(409).json({
				error: 'Asociación ya existe',
				message: 'El perfil ya está asociado con este servicio'
			});
		}

		const perfilServicio = await prisma.perfilServicio.create({
			data: {
				idPerfil: parseInt(idPerfil),
				idServicio: parseInt(id)
			}
		});

		res.status(201).json({
			message: 'Perfil asociado con el servicio exitosamente',
			perfilServicio
		});

	} catch (error) {
		console.error('Error al asociar perfil con servicio:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo asociar el perfil con el servicio'
		});
	}
});

/**
 * @swagger
 * /servicios/{id}/perfiles/{idPerfil}:
 *   delete:
 *     summary: Desasociar perfil del servicio
 *     description: Desasocia un perfil de fisioterapeuta de un servicio específico. Solo los administradores pueden realizar esta acción.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *         example: 1
 *       - in: path
 *         name: idPerfil
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del perfil de fisioterapeuta
 *         example: 1
 *     responses:
 *       200:
 *         description: Perfil desasociado del servicio exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Perfil desasociado del servicio exitosamente"
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - solo administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Servicio, perfil o asociación no encontrada
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
// DELETE /api/servicios/:id/perfiles/:idPerfil - Desasociar perfil del servicio (solo admin)
router.delete('/:id/perfiles/:idPerfil', authenticateToken, requireRole([ROLES.ADMINISTRADOR]), validateId, async (req, res) => {
	try {
		const { id, idPerfil } = req.params;

		// Verificar si existe la asociación
		const asociacion = await prisma.perfilServicio.findUnique({
			where: {
				idPerfil_idServicio: {
					idPerfil: parseInt(idPerfil),
					idServicio: parseInt(id)
				}
			}
		});

		if (!asociacion) {
			return res.status(404).json({
				error: 'Asociación no encontrada',
				message: 'El perfil no está asociado con este servicio'
			});
		}

		await prisma.perfilServicio.delete({
			where: {
				idPerfil_idServicio: {
					idPerfil: parseInt(idPerfil),
					idServicio: parseInt(id)
				}
			}
		});

		res.json({
			message: 'Perfil desasociado del servicio exitosamente'
		});

	} catch (error) {
		console.error('Error al desasociar perfil del servicio:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo desasociar el perfil del servicio'
		});
	}
});

export default router;

