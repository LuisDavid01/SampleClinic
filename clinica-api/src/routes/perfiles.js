const express = require('express');
const prisma = require('../config/database');
const { authenticateToken, requireRole, requireOwnershipOrAdmin } = require('../middleware/auth');
const { ROLES, isAdministrador } = require('../constants/roles');
const { validatePerfil, validateId } = require('../middleware/validation');

const router = express.Router();

// GET /api/perfiles - Obtener todos los perfiles
router.get('/', authenticateToken, async (req, res) => {
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

// GET /api/perfiles/:id - Obtener perfil por ID
router.get('/:id', authenticateToken, validateId, async (req, res) => {
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

// POST /api/perfiles - Crear nuevo perfil
router.post('/', authenticateToken, validatePerfil, async (req, res) => {
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

// PUT /api/perfiles/:id - Actualizar perfil
router.put('/:id', authenticateToken, validateId, async (req, res) => {
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

// DELETE /api/perfiles/:id - Eliminar perfil
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
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
router.post('/:id/certificaciones', authenticateToken, validateId, async (req, res) => {
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
router.delete('/:id/certificaciones/:idCertificacion', authenticateToken, validateId, async (req, res) => {
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
router.post('/:id/servicios', authenticateToken, validateId, async (req, res) => {
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
router.delete('/:id/servicios/:idServicio', authenticateToken, validateId, async (req, res) => {
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

module.exports = router;

