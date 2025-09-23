const express = require('express');
const prisma = require('../config/database');
const { authenticateToken, requireRole, requireOwnershipOrAdmin } = require('../middleware/auth');
const { ROLES, isPaciente, isFisioterapeuta, isAdministrador, canManageAppointments } = require('../constants/roles');
const { validateCita, validateId } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /citas:
 *   get:
 *     summary: Obtener todas las citas
 *     description: Obtiene una lista paginada de citas con filtros opcionales. Los pacientes solo ven sus propias citas, los fisioterapeutas pueden ver todas o solo las suyas.
 *     tags: [Citas]
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
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar citas
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar citas
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [programada, confirmada, en_progreso, completada, cancelada]
 *         description: Estado de la cita
 *       - in: query
 *         name: idPaciente
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *       - in: query
 *         name: idMedico
 *         schema:
 *           type: integer
 *         description: ID del fisioterapeuta
 *       - in: query
 *         name: idServicio
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *       - in: query
 *         name: soloMias
 *         schema:
 *           type: boolean
 *         description: Solo para fisioterapeutas - mostrar solo sus citas
 *     responses:
 *       200:
 *         description: Lista de citas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 citas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cita'
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
// GET /api/citas - Obtener todas las citas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      fechaInicio, 
      fechaFin, 
      estado, 
      idPaciente, 
      idMedico,
      idServicio 
    } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {};

    if (fechaInicio || fechaFin) {
      where.fechaCita = {};
      if (fechaInicio) where.fechaCita.gte = new Date(fechaInicio);
      if (fechaFin) where.fechaCita.lte = new Date(fechaFin);
    }

    if (estado) {
      where.estadoCita = estado;
    }

    if (idPaciente) {
      where.idPaciente = parseInt(idPaciente);
    }

    if (idMedico) {
      where.idMedico = parseInt(idMedico);
    }

    if (idServicio) {
      where.idServicio = parseInt(idServicio);
    }

    // Si es paciente, solo mostrar sus propias citas
    if (isPaciente(req.user)) {
      where.idPaciente = req.user.idUsuario;
    } else if (isFisioterapeuta(req.user)) {
      // Los fisioterapeutas pueden ver todas las citas o solo las suyas
      if (req.query.soloMias === 'true') {
        where.idMedico = req.user.idUsuario;
      }
    }

    const [citas, total] = await Promise.all([
      prisma.cita.findMany({
        where,
        include: {
          paciente: {
            select: { 
              idUsuario: true, 
              nombre: true, 
              apellido1: true, 
              apellido2: true,
              telefonoPrincipal: true,
              correoElectronico: true
            }
          },
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
          servicio: true,
          notas: {
            orderBy: { fechaCreacion: 'desc' },
            take: 1
          },
          resultados: {
            orderBy: { fechaRegistro: 'desc' },
            take: 1
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { fechaCita: 'desc' }
      }),
      prisma.cita.count({ where })
    ]);

    res.json({
      citas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las citas'
    });
  }
});

/**
 * @swagger
 * /citas/{id}:
 *   get:
 *     summary: Obtener cita específica
 *     description: Obtiene los detalles de una cita específica por su ID. Los pacientes solo pueden ver sus propias citas.
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *         example: 1
 *     responses:
 *       200:
 *         description: Cita obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cita:
 *                   $ref: '#/components/schemas/Cita'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - no puede ver esta cita
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cita no encontrada
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
// GET /api/citas/:id - Obtener cita por ID
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await prisma.cita.findUnique({
      where: { idCita: parseInt(id) },
      include: {
        paciente: {
          select: { 
            idUsuario: true, 
            nombre: true, 
            apellido1: true, 
            apellido2: true,
            telefonoPrincipal: true,
            correoElectronico: true
          }
        },
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
        servicio: true,
        notas: {
          orderBy: { fechaCreacion: 'desc' }
        },
        resultados: {
          orderBy: { fechaRegistro: 'desc' }
        }
      }
    });

    if (!cita) {
      return res.status(404).json({
        error: 'Cita no encontrada',
        message: 'No existe una cita con el ID proporcionado'
      });
    }

    // Verificar permisos: solo el paciente, médico o admin pueden ver la cita
    const isPaciente = cita.idPaciente === req.user.idUsuario;
    const isMedico = cita.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isPaciente && !isMedico && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tiene permisos para ver esta cita'
      });
    }

    res.json(cita);

  } catch (error) {
    console.error('Error al obtener cita:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo obtener la cita'
    });
  }
});

/**
 * @swagger
 * /citas:
 *   post:
 *     summary: Crear nueva cita
 *     description: Crea una nueva cita. Solo administradores, recepcionistas y fisioterapeutas pueden crear citas.
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fechaCita
 *               - idPaciente
 *               - idMedico
 *             properties:
 *               fechaCita:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de la cita
 *                 example: "2024-01-15T10:00:00Z"
 *               idPaciente:
 *                 type: integer
 *                 description: ID del paciente
 *                 example: 1
 *               idMedico:
 *                 type: integer
 *                 description: ID del fisioterapeuta
 *                 example: 2
 *               idServicio:
 *                 type: integer
 *                 description: ID del servicio (opcional)
 *                 example: 1
 *               descripcion:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Descripción de la cita
 *                 example: "Sesión de fisioterapia para lesión de rodilla"
 *               estadoCita:
 *                 type: string
 *                 enum: [programada, confirmada, en_progreso, completada, cancelada]
 *                 default: programada
 *                 description: Estado inicial de la cita
 *     responses:
 *       201:
 *         description: Cita creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cita creada exitosamente"
 *                 cita:
 *                   $ref: '#/components/schemas/Cita'
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
 *         description: Acceso denegado - rol insuficiente
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
// POST /api/citas - Crear nueva cita
router.post('/', authenticateToken, requireRole([ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA, ROLES.FISIOTERAPEUTA]), validateCita, async (req, res) => {
  try {
    const { fechaCita, idPaciente, idMedico, idServicio, descripcion, estadoCita } = req.body;

    // Verificar que el paciente y médico existen
    const [paciente, medico] = await Promise.all([
      prisma.usuario.findUnique({ where: { idUsuario: idPaciente } }),
      prisma.usuario.findUnique({ where: { idUsuario: idMedico } })
    ]);

    if (!paciente || !medico) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'El paciente o médico especificado no existe'
      });
    }

    // Verificar que el servicio existe si se proporciona
    if (idServicio) {
      const servicio = await prisma.servicio.findUnique({ where: { idServicio } });
      if (!servicio) {
        return res.status(400).json({
          error: 'Datos inválidos',
          message: 'El servicio especificado no existe'
        });
      }
    }

    const cita = await prisma.cita.create({
      data: {
        fechaCita: fechaCita ? new Date(fechaCita) : null,
        idPaciente,
        idMedico,
        idServicio,
        descripcion,
        estadoCita: estadoCita || 'programada'
      },
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
        servicio: true
      }
    });

    res.status(201).json({
      message: 'Cita creada exitosamente',
      cita
    });

  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo crear la cita'
    });
  }
});

/**
 * @swagger
 * /citas/{id}:
 *   put:
 *     summary: Actualizar cita
 *     description: Actualiza una cita existente. Solo administradores, recepcionistas y fisioterapeutas pueden actualizar citas.
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fechaCita:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva fecha y hora de la cita
 *                 example: "2024-01-15T10:00:00Z"
 *               idPaciente:
 *                 type: integer
 *                 description: ID del paciente
 *                 example: 4
 *               idMedico:
 *                 type: integer
 *                 description: ID del fisioterapeuta
 *                 example: 2
 *               idServicio:
 *                 type: integer
 *                 description: ID del servicio (opcional)
 *                 example: 1
 *               descripcion:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Descripción de la cita
 *                 example: "Sesión de fisioterapia para lesión de rodilla"
 *               estadoCita:
 *                 type: string
 *                 enum: [programada, confirmada, en_progreso, completada, cancelada]
 *                 description: Estado de la cita
 *                 example: "confirmada"
 *     responses:
 *       200:
 *         description: Cita actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cita actualizada exitosamente"
 *                 cita:
 *                   $ref: '#/components/schemas/Cita'
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
 *         description: Acceso denegado - rol insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cita no encontrada
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
// PUT /api/citas/:id - Actualizar cita
router.put('/:id', authenticateToken, requireRole([ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA, ROLES.FISIOTERAPEUTA]), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Verificar que la cita existe
    const citaExistente = await prisma.cita.findUnique({
      where: { idCita: parseInt(id) }
    });

    if (!citaExistente) {
      return res.status(404).json({
        error: 'Cita no encontrada',
        message: 'No existe una cita con el ID proporcionado'
      });
    }

    // Verificar permisos: solo el médico o admin pueden actualizar la cita
    const isMedico = citaExistente.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isMedico && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo el médico asignado o un administrador pueden actualizar la cita'
      });
    }

    // Convertir fecha si se proporciona
    if (updateData.fechaCita) {
      updateData.fechaCita = new Date(updateData.fechaCita);
    }

    const cita = await prisma.cita.update({
      where: { idCita: parseInt(id) },
      data: updateData,
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
        servicio: true
      }
    });

    res.json({
      message: 'Cita actualizada exitosamente',
      cita
    });

  } catch (error) {
    console.error('Error al actualizar cita:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar la cita'
    });
  }
});

/**
 * @swagger
 * /citas/{id}:
 *   delete:
 *     summary: Cancelar cita
 *     description: Cancela una cita existente. Solo administradores y recepcionistas pueden cancelar citas.
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *         example: 1
 *     responses:
 *       200:
 *         description: Cita cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cita cancelada exitosamente"
 *                 cita:
 *                   $ref: '#/components/schemas/Cita'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - solo administradores y recepcionistas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cita no encontrada
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
// DELETE /api/citas/:id - Cancelar cita
router.delete('/:id', authenticateToken, requireRole([ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA]), validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const citaExistente = await prisma.cita.findUnique({
      where: { idCita: parseInt(id) }
    });

    if (!citaExistente) {
      return res.status(404).json({
        error: 'Cita no encontrada',
        message: 'No existe una cita con el ID proporcionado'
      });
    }

    // Verificar permisos: paciente, médico o admin pueden cancelar
    const isPaciente = citaExistente.idPaciente === req.user.idUsuario;
    const isMedico = citaExistente.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isPaciente && !isMedico && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tiene permisos para cancelar esta cita'
      });
    }

    // Actualizar estado a cancelada en lugar de eliminar
    const cita = await prisma.cita.update({
      where: { idCita: parseInt(id) },
      data: { estadoCita: 'cancelada' }
    });

    res.json({
      message: 'Cita cancelada exitosamente'
    });

  } catch (error) {
    console.error('Error al cancelar cita:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo cancelar la cita'
    });
  }
});

/**
 * @swagger
 * /citas/{id}/notas:
 *   post:
 *     summary: Agregar nota a cita
 *     description: Agrega una nota médica a una cita existente. Solo administradores y fisioterapeutas pueden agregar notas.
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nota
 *             properties:
 *               nota:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Nota médica para la cita
 *                 example: "Paciente presenta mejoría en la movilidad de la rodilla. Continuar con ejercicios de fortalecimiento."
 *     responses:
 *       200:
 *         description: Nota agregada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Nota agregada exitosamente"
 *                 cita:
 *                   $ref: '#/components/schemas/Cita'
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
 *         description: Acceso denegado - solo administradores y fisioterapeutas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cita no encontrada
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
// POST /api/citas/:id/notas - Agregar nota a cita
router.post('/:id/notas', authenticateToken, requireRole([ROLES.ADMINISTRADOR, ROLES.FISIOTERAPEUTA]), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { nota } = req.body;

    if (!nota || nota.trim().length === 0) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'La nota no puede estar vacía'
      });
    }

    // Verificar que la cita existe
    const citaExistente = await prisma.cita.findUnique({
      where: { idCita: parseInt(id) }
    });

    if (!citaExistente) {
      return res.status(404).json({
        error: 'Cita no encontrada',
        message: 'No existe una cita con el ID proporcionado'
      });
    }

    // Verificar permisos: solo el médico o admin pueden agregar notas
    const isMedico = citaExistente.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isMedico && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo el médico asignado o un administrador pueden agregar notas'
      });
    }

    const notaCita = await prisma.notaCita.create({
      data: {
        idCita: parseInt(id),
        nota: nota.trim()
      }
    });

    res.status(201).json({
      message: 'Nota agregada exitosamente',
      nota: notaCita
    });

  } catch (error) {
    console.error('Error al agregar nota:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo agregar la nota'
    });
  }
});

/**
 * @swagger
 * /citas/{id}/resultados:
 *   post:
 *     summary: Agregar resultado a cita
 *     description: Agrega un resultado médico a una cita existente. Solo administradores y fisioterapeutas pueden agregar resultados.
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resultado
 *             properties:
 *               resultado:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Resultado médico de la cita
 *                 example: "Paciente completó exitosamente la sesión de fisioterapia. Rango de movimiento mejorado en 20%."
 *               resumenResultado:
 *                 type: string
 *                 maxLength: 500
 *                 description: Resumen del resultado
 *                 example: "Mejora significativa en movilidad de rodilla"
 *     responses:
 *       200:
 *         description: Resultado agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Resultado agregado exitosamente"
 *                 cita:
 *                   $ref: '#/components/schemas/Cita'
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
 *         description: Acceso denegado - solo administradores y fisioterapeutas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cita no encontrada
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
// POST /api/citas/:id/resultados - Agregar resultado a cita
router.post('/:id/resultados', authenticateToken, requireRole([ROLES.ADMINISTRADOR, ROLES.FISIOTERAPEUTA]), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { resultado, resumenResultado } = req.body;

    if (!resultado || resultado.trim().length === 0) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'El resultado no puede estar vacío'
      });
    }

    // Verificar que la cita existe
    const citaExistente = await prisma.cita.findUnique({
      where: { idCita: parseInt(id) }
    });

    if (!citaExistente) {
      return res.status(404).json({
        error: 'Cita no encontrada',
        message: 'No existe una cita con el ID proporcionado'
      });
    }

    // Verificar permisos: solo el médico o admin pueden agregar resultados
    const isMedico = citaExistente.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isMedico && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo el médico asignado o un administrador pueden agregar resultados'
      });
    }

    const resultadoCita = await prisma.resultadoCita.create({
      data: {
        idCita: parseInt(id),
        resultado: resultado.trim(),
        resumenResultado: resumenResultado?.trim() || null,
        fechaRegistro: new Date()
      }
    });

    res.status(201).json({
      message: 'Resultado agregado exitosamente',
      resultado: resultadoCita
    });

  } catch (error) {
    console.error('Error al agregar resultado:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo agregar el resultado'
    });
  }
});

module.exports = router;
