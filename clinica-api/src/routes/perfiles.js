import express from 'express';
import prisma from '../config/database.js';
import { requireOwnershipOrAdmin } from '../middleware/auth.js';
import { clerkAuth, requireClerkRole } from '../middleware/clerkAuth.js';
import { ROLES, isAdministrador } from '../constants/roles.js';
import { validatePerfil, validateId } from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /perfiles:
 *   get:
 *     summary: Obtener todos los perfiles
 *     description: Obtiene una lista paginada de perfiles médicos. Requiere autenticación Clerk.
 *     tags: [Perfiles]
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
 *         description: Buscar por especialidad, descripción o nombre del médico
 *       - in: query
 *         name: especialidad
 *         schema:
 *           type: string
 *         description: Filtrar por especialidad
 *     responses:
 *       200:
 *         description: Lista de perfiles obtenida exitosamente
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
 *                     pages:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// GET /api/perfiles - Obtener todos los perfiles
router.get('/', clerkAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, especialidad } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {};

    if (search) {
      where.OR = [
        { especialidad: { contains: search, mode: 'insensitive' } },
        { descripcionBreve: { contains: search, mode: 'insensitive' } },
        { medico: { 
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { apellido1: { contains: search, mode: 'insensitive' } },
            { apellido2: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ];
    }

    if (especialidad) {
      where.especialidad = { contains: especialidad, mode: 'insensitive' };
    }

    const [perfiles, total] = await Promise.all([
      prisma.perfil.findMany({
        where,
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
          },
          servicios: {
            include: { servicio: true }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { especialidad: 'asc' }
      }),
      prisma.perfil.count({ where })
    ]);

    res.json({
      perfiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener perfiles:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los perfiles'
    });
  }
});

/**
 * @swagger
 * /perfiles/{id}:
 *   get:
 *     summary: Obtener perfil por ID
 *     description: Obtiene un perfil médico específico por su ID. Requiere autenticación Clerk.
 *     tags: [Perfiles]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del perfil
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Perfil'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// GET /api/perfiles/:id - Obtener perfil por ID
router.get('/:id', clerkAuth, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const perfil = await prisma.perfil.findUnique({
      where: { idPerfil: parseInt(id) },
      include: {
        medico: {
          select: { 
            idUsuario: true, 
            nombre: true, 
            apellido1: true, 
            apellido2: true,
            telefonoPrincipal: true,
            telefonoSecundario: true,
            correoElectronico: true,
            direccionResidencia: true
          }
        },
        certificaciones: {
          include: { certificacion: true }
        },
        servicios: {
          include: { servicio: true }
        }
      }
    });

    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil no encontrado',
        message: 'No existe un perfil con el ID proporcionado'
      });
    }

    res.json(perfil);

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el perfil'
    });
  }
});

/**
 * @swagger
 * /perfiles:
 *   post:
 *     summary: Crear nuevo perfil
 *     description: Crea un nuevo perfil médico. Requiere autenticación Clerk y rol de administrador.
 *     tags: [Perfiles]
 *     security:
 *       - clerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idMedico
 *               - especialidad
 *             properties:
 *               idMedico:
 *                 type: integer
 *                 description: ID del médico
 *               fotografia:
 *                 type: string
 *                 description: URL de la fotografía del médico
 *               experienciaProfesional:
 *                 type: string
 *                 description: Experiencia profesional del médico
 *               descripcionBreve:
 *                 type: string
 *                 description: Descripción breve del perfil
 *               especialidad:
 *                 type: string
 *                 description: Especialidad del médico
 *     responses:
 *       201:
 *         description: Perfil creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Perfil'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// POST /api/perfiles - Crear nuevo perfil
router.post('/', clerkAuth, validatePerfil, async (req, res) => {
  try {
    const { idMedico, fotografia, experienciaProfesional, descripcionBreve, especialidad } = req.body;

    // Verificar que el médico existe y es un médico
    const medico = await prisma.usuario.findUnique({
      where: { idUsuario: idMedico },
      include: { rol: true }
    });

    if (!medico) {
      return res.status(404).json({
        error: 'Médico no encontrado',
        message: 'No existe un usuario con el ID proporcionado'
      });
    }

    if (medico.rol?.nombreRol !== 'medico') {
      return res.status(400).json({
        error: 'Tipo de usuario inválido',
        message: 'El usuario debe ser un médico para crear un perfil'
      });
    }

    // Verificar si ya existe un perfil para este médico
    const perfilExistente = await prisma.perfil.findUnique({
      where: { idMedico }
    });

    if (perfilExistente) {
      return res.status(409).json({
        error: 'Perfil ya existe',
        message: 'Ya existe un perfil para este médico'
      });
    }

    const perfil = await prisma.perfil.create({
      data: {
        idMedico,
        fotografia,
        experienciaProfesional,
        descripcionBreve,
        especialidad
      },
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
    });

    res.status(201).json({
      message: 'Perfil creado exitosamente',
      perfil
    });

  } catch (error) {
    console.error('Error al crear perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo crear el perfil'
    });
  }
});

/**
 * @swagger
 * /perfiles/{id}:
 *   put:
 *     summary: Actualizar perfil
 *     description: Actualiza un perfil médico existente. Requiere autenticación Clerk.
 *     tags: [Perfiles]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del perfil
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fotografia:
 *                 type: string
 *                 description: URL de la fotografía del médico
 *               experienciaProfesional:
 *                 type: string
 *                 description: Experiencia profesional del médico
 *               descripcionBreve:
 *                 type: string
 *                 description: Descripción breve del perfil
 *               especialidad:
 *                 type: string
 *                 description: Especialidad del médico
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Perfil'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// PUT /api/perfiles/:id - Actualizar perfil
router.put('/:id', clerkAuth, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Verificar que el perfil existe
    const perfilExistente = await prisma.perfil.findUnique({
      where: { idPerfil: parseInt(id) },
      include: { medico: true }
    });

    if (!perfilExistente) {
      return res.status(404).json({
        error: 'Perfil no encontrado',
        message: 'No existe un perfil con el ID proporcionado'
      });
    }

    // Verificar permisos: solo el médico propietario o admin pueden actualizar
    const isOwner = perfilExistente.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo el médico propietario o un administrador pueden actualizar el perfil'
      });
    }

    const perfil = await prisma.perfil.update({
      where: { idPerfil: parseInt(id) },
      data: updateData,
      include: {
        medico: {
          select: { 
            idUsuario: true, 
            nombre: true, 
            apellido1: true, 
            apellido2: true
          }
        },
        certificaciones: {
          include: { certificacion: true }
        },
        servicios: {
          include: { servicio: true }
        }
      }
    });

    res.json({
      message: 'Perfil actualizado exitosamente',
      perfil
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el perfil'
    });
  }
});

/**
 * @swagger
 * /perfiles/{id}:
 *   delete:
 *     summary: Eliminar perfil
 *     description: Elimina un perfil médico. Solo el propietario o administrador pueden eliminar.
 *     tags: [Perfiles]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del perfil
 *     responses:
 *       200:
 *         description: Perfil eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Perfil eliminado exitosamente"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// DELETE /api/perfiles/:id - Eliminar perfil
router.delete('/:id', clerkAuth, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el perfil existe
    const perfilExistente = await prisma.perfil.findUnique({
      where: { idPerfil: parseInt(id) },
      include: { medico: true }
    });

    if (!perfilExistente) {
      return res.status(404).json({
        error: 'Perfil no encontrado',
        message: 'No existe un perfil con el ID proporcionado'
      });
    }

    // Verificar permisos: solo el médico propietario o admin pueden eliminar
    const isOwner = perfilExistente.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo el médico propietario o un administrador pueden eliminar el perfil'
      });
    }

    await prisma.perfil.delete({
      where: { idPerfil: parseInt(id) }
    });

    res.json({
      message: 'Perfil eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar el perfil'
    });
  }
});

// POST /api/perfiles/:id/certificaciones - Agregar certificación al perfil
router.post('/:id/certificaciones', clerkAuth, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { idCertificacion } = req.body;

    if (!idCertificacion) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'El ID de la certificación es requerido'
      });
    }

    // Verificar que el perfil existe
    const perfil = await prisma.perfil.findUnique({
      where: { idPerfil: parseInt(id) },
      include: { medico: true }
    });

    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil no encontrado',
        message: 'No existe un perfil con el ID proporcionado'
      });
    }

    // Verificar permisos
    const isOwner = perfil.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo el médico propietario o un administrador pueden agregar certificaciones'
      });
    }

    // Verificar que la certificación existe
    const certificacion = await prisma.certificacion.findUnique({
      where: { idCertificacion: parseInt(idCertificacion) }
    });

    if (!certificacion) {
      return res.status(404).json({
        error: 'Certificación no encontrada',
        message: 'No existe una certificación con el ID proporcionado'
      });
    }

    // Verificar si ya existe la asociación
    const asociacionExistente = await prisma.perfilCertificacion.findUnique({
      where: {
        idPerfil_idCertificacion: {
          idPerfil: parseInt(id),
          idCertificacion: parseInt(idCertificacion)
        }
      }
    });

    if (asociacionExistente) {
      return res.status(409).json({
        error: 'Asociación ya existe',
        message: 'El perfil ya tiene esta certificación'
      });
    }

    const perfilCertificacion = await prisma.perfilCertificacion.create({
      data: {
        idPerfil: parseInt(id),
        idCertificacion: parseInt(idCertificacion)
      }
    });

    res.status(201).json({
      message: 'Certificación agregada al perfil exitosamente',
      perfilCertificacion
    });

  } catch (error) {
    console.error('Error al agregar certificación:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo agregar la certificación'
    });
  }
});

// DELETE /api/perfiles/:id/certificaciones/:idCertificacion - Remover certificación del perfil
router.delete('/:id/certificaciones/:idCertificacion', clerkAuth, validateId, async (req, res) => {
  try {
    const { id, idCertificacion } = req.params;

    // Verificar que el perfil existe
    const perfil = await prisma.perfil.findUnique({
      where: { idPerfil: parseInt(id) },
      include: { medico: true }
    });

    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil no encontrado',
        message: 'No existe un perfil con el ID proporcionado'
      });
    }

    // Verificar permisos
    const isOwner = perfil.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo el médico propietario o un administrador pueden remover certificaciones'
      });
    }

    // Verificar si existe la asociación
    const asociacion = await prisma.perfilCertificacion.findUnique({
      where: {
        idPerfil_idCertificacion: {
          idPerfil: parseInt(id),
          idCertificacion: parseInt(idCertificacion)
        }
      }
    });

    if (!asociacion) {
      return res.status(404).json({
        error: 'Asociación no encontrada',
        message: 'El perfil no tiene esta certificación'
      });
    }

    await prisma.perfilCertificacion.delete({
      where: {
        idPerfil_idCertificacion: {
          idPerfil: parseInt(id),
          idCertificacion: parseInt(idCertificacion)
        }
      }
    });

    res.json({
      message: 'Certificación removida del perfil exitosamente'
    });

  } catch (error) {
    console.error('Error al remover certificación:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo remover la certificación'
    });
  }
});

// POST /api/perfiles/:id/servicios - Agregar servicio al perfil
router.post('/:id/servicios', clerkAuth, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { idServicio } = req.body;

    if (!idServicio) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'El ID del servicio es requerido'
      });
    }

    // Verificar que el perfil existe
    const perfil = await prisma.perfil.findUnique({
      where: { idPerfil: parseInt(id) },
      include: { medico: true }
    });

    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil no encontrado',
        message: 'No existe un perfil con el ID proporcionado'
      });
    }

    // Verificar permisos
    const isOwner = perfil.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo el médico propietario o un administrador pueden agregar servicios'
      });
    }

    // Verificar que el servicio existe
    const servicio = await prisma.servicio.findUnique({
      where: { idServicio: parseInt(idServicio) }
    });

    if (!servicio) {
      return res.status(404).json({
        error: 'Servicio no encontrado',
        message: 'No existe un servicio con el ID proporcionado'
      });
    }

    // Verificar si ya existe la asociación
    const asociacionExistente = await prisma.perfilServicio.findUnique({
      where: {
        idPerfil_idServicio: {
          idPerfil: parseInt(id),
          idServicio: parseInt(idServicio)
        }
      }
    });

    if (asociacionExistente) {
      return res.status(409).json({
        error: 'Asociación ya existe',
        message: 'El perfil ya ofrece este servicio'
      });
    }

    const perfilServicio = await prisma.perfilServicio.create({
      data: {
        idPerfil: parseInt(id),
        idServicio: parseInt(idServicio)
      }
    });

    res.status(201).json({
      message: 'Servicio agregado al perfil exitosamente',
      perfilServicio
    });

  } catch (error) {
    console.error('Error al agregar servicio:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo agregar el servicio'
    });
  }
});

// DELETE /api/perfiles/:id/servicios/:idServicio - Remover servicio del perfil
router.delete('/:id/servicios/:idServicio', clerkAuth, validateId, async (req, res) => {
  try {
    const { id, idServicio } = req.params;

    // Verificar que el perfil existe
    const perfil = await prisma.perfil.findUnique({
      where: { idPerfil: parseInt(id) },
      include: { medico: true }
    });

    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil no encontrado',
        message: 'No existe un perfil con el ID proporcionado'
      });
    }

    // Verificar permisos
    const isOwner = perfil.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo el médico propietario o un administrador pueden remover servicios'
      });
    }

    // Verificar si existe la asociación
    const asociacion = await prisma.perfilServicio.findUnique({
      where: {
        idPerfil_idServicio: {
          idPerfil: parseInt(id),
          idServicio: parseInt(idServicio)
        }
      }
    });

    if (!asociacion) {
      return res.status(404).json({
        error: 'Asociación no encontrada',
        message: 'El perfil no ofrece este servicio'
      });
    }

    await prisma.perfilServicio.delete({
      where: {
        idPerfil_idServicio: {
          idPerfil: parseInt(id),
          idServicio: parseInt(idServicio)
        }
      }
    });

    res.json({
      message: 'Servicio removido del perfil exitosamente'
    });

  } catch (error) {
    console.error('Error al remover servicio:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo remover el servicio'
    });
  }
});

export default router;

