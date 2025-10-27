import { Router } from 'express';
import prisma from '../config/database.js';
import { clerkAuth, requireClerkRole } from '../middleware/clerkAuth.js';
import { ROLES, isPaciente, isFisioterapeuta, isAdministrador } from '../constants/roles.js';
import { validateId, validateExpediente, validateExpedienteUpdate } from '../middleware/validation.js';

const router = Router();

/**
 * @swagger
 * /expedientes:
 *   get:
 *     summary: Obtener todos los expedientes
 *     description: Obtiene una lista paginada de expedientes. Los pacientes solo ven sus propios expedientes, los fisioterapeutas y administradores pueden ver todos.
 *     tags: [Expedientes]
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
 *         name: cedula
 *         schema:
 *           type: string
 *         description: Filtrar por cédula del paciente
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Filtrar por estado del expediente
 *       - in: query
 *         name: idMedico
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del médico asignado
 *     responses:
 *       200:
 *         description: Lista de expedientes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expedientes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expediente'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', clerkAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, cedula, estado, idMedico } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros
    const where = {};
    
    if (cedula) {
      where.cedula = { contains: cedula, mode: 'insensitive' };
    }
    
    if (estado) {
      where.estado = estado;
    }
    
    if (idMedico) {
      where.idMedico = parseInt(idMedico);
    }

    // Aplicar restricciones de acceso basadas en el rol
    const userRole = req.user.metadata?.role;
    const usuario = await prisma.usuario.findFirst({
      where: { clerkId: req.user.id },
      include: { rol: true }
    });

    // Aplicar restricciones basadas en el rol de la base de datos (más confiable)
    const dbRole = usuario?.rol?.idRol;
    
    if (dbRole === 4) { // PACIENTE
      // Pacientes solo pueden ver sus propios expedientes
      if (usuario) {
        where.idPaciente = usuario.idUsuario;
      }
    } else if (dbRole === 2) { // FISIOTERAPEUTA
      // Fisioterapeutas solo pueden ver expedientes asignados a ellos
      if (usuario) {
        where.idMedico = usuario.idUsuario;
      }
    } else if (dbRole === 1) { // ADMINISTRADOR
      // Los administradores pueden ver todos los expedientes
    } else {
      // Si no se reconoce el rol, aplicar restricción por defecto
      if (usuario) {
        where.idMedico = usuario.idUsuario;
      }
    }

    
    const [expedientes, total] = await Promise.all([
      prisma.expediente.findMany({
        where,
        include: {
          paciente: {
            select: {
              idUsuario: true,
              nombre: true,
              apellido1: true,
              apellido2: true,
              correoElectronico: true
            }
          },
          medico: {
            select: {
              idUsuario: true,
              nombre: true,
              apellido1: true,
              apellido2: true,
              correoElectronico: true
            }
          },
          documentos: true,
          evaluaciones: {
            include: {
              doctor: {
                select: {
                  idUsuario: true,
                  nombre: true,
                  apellido1: true,
                  apellido2: true
                }
              }
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: { fechaCreacion: 'desc' }
      }),
      prisma.expediente.count({ where })
    ]);
    

    res.json({
      expedientes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error al obtener expedientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /expedientes/{id}:
 *   get:
 *     summary: Obtener expediente por ID
 *     description: Obtiene un expediente específico por su ID. Los pacientes solo pueden ver sus propios expedientes.
 *     tags: [Expedientes]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     responses:
 *       200:
 *         description: Expediente obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expediente'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', clerkAuth, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    
    const expediente = await prisma.expediente.findUnique({
      where: { idExpediente: parseInt(id) },
      include: {
        paciente: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true,
            telefonoPrincipal: true
          }
        },
        medico: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true
          }
        },
        documentos: true,
        evaluaciones: {
          include: {
            doctor: {
              select: {
                idUsuario: true,
                nombre: true,
                apellido1: true,
                apellido2: true
              }
            }
          },
          orderBy: { fecha: 'desc' }
        }
      }
    });

    if (!expediente) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }


    // Verificar permisos basados en el rol
    const userRole = req.user.metadata?.role;
    const usuario = await prisma.usuario.findFirst({
      where: { clerkId: req.user.id },
      include: { rol: true }
    });

    console.log('🔍 Debug permisos expediente:', {
      expedienteId: id,
      expedienteIdPaciente: expediente.idPaciente,
      expedienteIdMedico: expediente.idMedico,
      userRole,
      usuarioId: usuario?.idUsuario,
      usuarioRol: usuario?.rol?.idRol,
      usuarioRolNombre: usuario?.rol?.nombreRol,
      clerkId: req.user.id
    });

    // Usar el rol de la base de datos en lugar del rol de Clerk (más confiable)
    const dbRole = usuario?.rol?.idRol;
    
    if (dbRole === 4) { // PACIENTE
      // Pacientes solo pueden ver sus propios expedientes
      if (usuario && expediente.idPaciente !== usuario.idUsuario) {
        console.log('❌ Acceso denegado - Paciente:', {
          expedienteIdPaciente: expediente.idPaciente,
          usuarioId: usuario.idUsuario,
          sonIguales: expediente.idPaciente === usuario.idUsuario
        });
        return res.status(403).json({ error: 'No tienes permisos para ver este expediente' });
      }
    } else if (dbRole === 2) { // FISIOTERAPEUTA
      // Fisioterapeutas solo pueden ver expedientes asignados a ellos
      if (usuario && expediente.idMedico !== usuario.idUsuario) {
        console.log('❌ Acceso denegado - Fisioterapeuta:', {
          expedienteIdMedico: expediente.idMedico,
          usuarioId: usuario.idUsuario,
          sonIguales: expediente.idMedico === usuario.idUsuario
        });
        return res.status(403).json({ error: 'No tienes permisos para ver este expediente' });
      }
    } else if (dbRole === 1) { // ADMINISTRADOR
      // Los administradores pueden ver cualquier expediente (sin restricciones)
      console.log('✅ Acceso permitido - Administrador');
    } else {
      // Si no se reconoce el rol, denegar acceso
      console.log('❌ Acceso denegado - Rol no reconocido:', dbRole);
      return res.status(403).json({ error: 'No tienes permisos para ver este expediente' });
    }
    // Los administradores pueden ver cualquier expediente (sin restricciones)

    res.json(expediente);
  } catch (error) {
    console.error('Error al obtener expediente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /expedientes:
 *   post:
 *     summary: Crear nuevo expediente
 *     description: Crea un nuevo expediente. Solo fisioterapeutas y administradores pueden crear expedientes.
 *     tags: [Expedientes]
 *     security:
 *       - clerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idPaciente
 *               - cedula
 *               - estado
 *             properties:
 *               idPaciente:
 *                 type: integer
 *                 description: ID del paciente
 *               cedula:
 *                 type: string
 *                 description: Cédula del paciente
 *               estado:
 *                 type: string
 *                 description: Estado del expediente
 *               idMedico:
 *                 type: integer
 *                 description: ID del médico asignado
 *               descripcion:
 *                 type: string
 *                 description: Descripción del expediente
 *     responses:
 *       201:
 *         description: Expediente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expediente'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', clerkAuth, requireClerkRole(['admin', 'medico','fisioterapeuta']), validateExpediente, async (req, res) => {
  try {
    const { idPaciente, cedula, estado, idMedico, descripcion } = req.body;

    // Validaciones básicas
    if (!idPaciente || !cedula || !estado) {
      return res.status(400).json({ 
        error: 'Los campos idPaciente, cedula y estado son obligatorios' 
      });
    }

    // Verificar que el paciente existe
    const paciente = await prisma.usuario.findUnique({
      where: { idUsuario: parseInt(idPaciente) }
    });

    if (!paciente) {
      return res.status(400).json({ error: 'El paciente especificado no existe' });
    }

    // Verificar que el médico existe (si se proporciona)
    if (idMedico) {
      const medico = await prisma.usuario.findUnique({
        where: { idUsuario: parseInt(idMedico) }
      });

      if (!medico) {
        return res.status(400).json({ error: 'El médico especificado no existe' });
      }
    }

    // Verificar que la cédula no esté en uso
    const expedienteExistente = await prisma.expediente.findUnique({
      where: { cedula }
    });

    if (expedienteExistente) {
      return res.status(400).json({ error: 'Ya existe un expediente con esta cédula' });
    }

    // Verificar que el paciente no tenga un expediente activo
    const expedienteActivoPaciente = await prisma.expediente.findFirst({
      where: { 
        idPaciente: parseInt(idPaciente),
        estado: {
          in: ['activo', 'en_proceso', 'pendiente'] // Estados que consideramos "activos"
        }
      }
    });

    if (expedienteActivoPaciente) {
      return res.status(400).json({ 
        error: 'El paciente ya tiene un expediente activo',
        message: `El paciente ya tiene un expediente en estado "${expedienteActivoPaciente.estado}" con ID ${expedienteActivoPaciente.idExpediente}`,
        expedienteExistente: {
          id: expedienteActivoPaciente.idExpediente,
          estado: expedienteActivoPaciente.estado,
          cedula: expedienteActivoPaciente.cedula,
          fechaCreacion: expedienteActivoPaciente.fechaCreacion
        }
      });
    }

    const expediente = await prisma.expediente.create({
      data: {
        idPaciente: parseInt(idPaciente),
        cedula,
        estado,
        idMedico: idMedico !== null && idMedico !== '' ? parseInt(idMedico) : null,
        descripcion
      },
      include: {
        paciente: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true
          }
        },
        medico: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true
          }
        }
      }
    });

    res.status(201).json(expediente);
  } catch (error) {
    console.error('Error al crear expediente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /expedientes/{id}:
 *   put:
 *     summary: Actualizar expediente
 *     description: Actualiza un expediente existente. Solo fisioterapeutas y administradores pueden actualizar expedientes.
 *     tags: [Expedientes]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cedula:
 *                 type: string
 *                 description: Cédula del paciente
 *               estado:
 *                 type: string
 *                 description: Estado del expediente
 *               idMedico:
 *                 type: integer
 *                 description: ID del médico asignado
 *               descripcion:
 *                 type: string
 *                 description: Descripción del expediente
 *     responses:
 *       200:
 *         description: Expediente actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expediente'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', clerkAuth, requireClerkRole(['admin', 'medico','fisioterapeuta']), validateId, validateExpedienteUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const { cedula, estado, idMedico, descripcion } = req.body;
    
    // Debug: Log the received data
    console.log('Backend received data:', {
      id,
      cedula,
      estado,
      idMedico,
      descripcion,
      idMedicoType: typeof idMedico,
      idMedicoValue: idMedico
    });
    
    console.log('Validation passed for expediente update');

    // Verificar que el expediente existe
    const expedienteExistente = await prisma.expediente.findUnique({
      where: { idExpediente: parseInt(id) }
    });

    if (!expedienteExistente) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }

    // Verificar que el médico existe (si se proporciona)
    if (idMedico) {
      const medico = await prisma.usuario.findUnique({
        where: { idUsuario: parseInt(idMedico) }
      });

      if (!medico) {
        return res.status(400).json({ error: 'El médico especificado no existe' });
      }
    }

    // Verificar que la cédula no esté en uso por otro expediente
    if (cedula && cedula !== expedienteExistente.cedula) {
      const cedulaEnUso = await prisma.expediente.findUnique({
        where: { cedula }
      });

      if (cedulaEnUso) {
        return res.status(400).json({ error: 'Ya existe un expediente con esta cédula' });
      }
    }

    const expediente = await prisma.expediente.update({
      where: { idExpediente: parseInt(id) },
      data: {
        ...(cedula && { cedula }),
        ...(estado && { estado }),
        ...(idMedico !== undefined && { idMedico: idMedico !== null && idMedico !== '' ? parseInt(idMedico) : null }),
        ...(descripcion !== undefined && { descripcion })
      },
      include: {
        paciente: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true
          }
        },
        medico: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true
          }
        },
        documentos: true,
        evaluaciones: {
          include: {
            doctor: {
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
    });

    // Debug: Log the updated expediente
    console.log('Updated expediente:', {
      idExpediente: expediente.idExpediente,
      idMedico: expediente.idMedico,
      medico: expediente.medico
    });

    res.json(expediente);
  } catch (error) {
    console.error('Error al actualizar expediente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /expedientes/{id}:
 *   delete:
 *     summary: Eliminar expediente
 *     description: Elimina un expediente. Solo administradores pueden eliminar expedientes.
 *     tags: [Expedientes]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     responses:
 *       200:
 *         description: Expediente eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Expediente eliminado exitosamente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', clerkAuth, requireClerkRole(['admin']), validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el expediente existe
    const expediente = await prisma.expediente.findUnique({
      where: { idExpediente: parseInt(id) }
    });

    if (!expediente) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }

    // Eliminar expediente (esto también eliminará documentos y diagnósticos relacionados por CASCADE)
    await prisma.expediente.delete({
      where: { idExpediente: parseInt(id) }
    });

    res.json({ message: 'Expediente eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar expediente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
