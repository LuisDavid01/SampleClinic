const express = require('express');
const prisma = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ROLES, isPaciente, isAdministrador } = require('../constants/roles');
const { validateHistoriaExito, validateId } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /historias-exito:
 *   get:
 *     summary: Obtener todas las historias de éxito
 *     description: Obtiene una lista paginada de historias de éxito. Requiere autenticación.
 *     tags: [Historias de Éxito]
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
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      publicado, 
      idServicio, 
      idMedico, 
      idPaciente 
    } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {};

    if (search) {
      where.OR = [
        { experiencia: { contains: search, mode: 'insensitive' } },
        { paciente: { 
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { apellido1: { contains: search, mode: 'insensitive' } },
            { apellido2: { contains: search, mode: 'insensitive' } }
          ]
        }},
        { medico: { 
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { apellido1: { contains: search, mode: 'insensitive' } },
            { apellido2: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ];
    }

    if (publicado !== undefined) {
      where.publicado = publicado === 'true';
    }

    if (idServicio) {
      where.idServicio = parseInt(idServicio);
    }

    if (idMedico) {
      where.idMedico = parseInt(idMedico);
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
          servicio: true,
          medico: {
            select: { 
              idUsuario: true, 
              nombre: true, 
              apellido1: true, 
              apellido2: true
            }
          },
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

// GET /api/historias-exito/:id - Obtener historia de éxito por ID
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const historia = await prisma.historiaExito.findUnique({
      where: { idHistoria: parseInt(id) },
      include: {
        servicio: true,
        medico: {
          select: { 
            idUsuario: true, 
            nombre: true, 
            apellido1: true, 
            apellido2: true
          }
        },
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

// POST /api/historias-exito - Crear nueva historia de éxito
router.post('/', authenticateToken, validateHistoriaExito, async (req, res) => {
  try {
    const { 
      idServicio, 
      idMedico, 
      idPaciente, 
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

    // Verificar que el servicio existe si se proporciona
    if (idServicio) {
      const servicio = await prisma.servicio.findUnique({ 
        where: { idServicio } 
      });
      if (!servicio) {
        return res.status(400).json({
          error: 'Servicio no encontrado',
          message: 'El servicio especificado no existe'
        });
      }
    }

    // Verificar que el médico existe si se proporciona
    if (idMedico) {
      const medico = await prisma.usuario.findUnique({ 
        where: { idUsuario: idMedico } 
      });
      if (!medico) {
        return res.status(400).json({
          error: 'Médico no encontrado',
          message: 'El médico especificado no existe'
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
        idServicio,
        idMedico,
        idPaciente: idPaciente || req.user.idUsuario, // Si es paciente, usar su ID
        fechaTratamiento: fechaTratamiento ? new Date(fechaTratamiento) : null,
        experiencia,
        publicado,
        fechaPublicacion: publicado ? new Date() : null
      },
      include: {
        servicio: true,
        medico: {
          select: { 
            idUsuario: true, 
            nombre: true, 
            apellido1: true, 
            apellido2: true
          }
        },
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

// PUT /api/historias-exito/:id - Actualizar historia de éxito
router.put('/:id', authenticateToken, validateId, async (req, res) => {
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
    const isMedico = historiaExistente.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isPaciente && !isMedico && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo el paciente, médico o un administrador pueden actualizar la historia'
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
        servicio: true,
        medico: {
          select: { 
            idUsuario: true, 
            nombre: true, 
            apellido1: true, 
            apellido2: true
          }
        },
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

// DELETE /api/historias-exito/:id - Eliminar historia de éxito
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
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
    const isMedico = historiaExistente.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isPaciente && !isMedico && !isAdmin) {
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

// POST /api/historias-exito/:id/publicar - Publicar historia de éxito (solo admin)
router.post('/:id/publicar', authenticateToken, requireRole([ROLES.ADMINISTRADOR]), validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const historia = await prisma.historiaExito.update({
      where: { idHistoria: parseInt(id) },
      data: { 
        publicado: true,
        fechaPublicacion: new Date()
      },
      include: {
        servicio: true,
        medico: {
          select: { 
            idUsuario: true, 
            nombre: true, 
            apellido1: true, 
            apellido2: true
          }
        },
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

// POST /api/historias-exito/:id/despublicar - Despublicar historia de éxito (solo admin)
router.post('/:id/despublicar', authenticateToken, requireRole([ROLES.ADMINISTRADOR]), validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const historia = await prisma.historiaExito.update({
      where: { idHistoria: parseInt(id) },
      data: { 
        publicado: false,
        fechaPublicacion: null
      },
      include: {
        servicio: true,
        medico: {
          select: { 
            idUsuario: true, 
            nombre: true, 
            apellido1: true, 
            apellido2: true
          }
        },
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

module.exports = router;
