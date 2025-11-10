import { Router } from 'express';
import prisma from '../config/database.js';
import { clerkAuth } from '../middleware/clerkAuth.js';
import { validateId } from '../middleware/validation.js';
import { isPaciente, isFisioterapeuta, isAdministrador } from '../constants/roles.js';

const router = Router();

/**
 * @swagger
 * /evaluacion-diagnostico/paciente/{pacienteId}:
 *   get:
 *     summary: Obtener evaluaciones y diagnósticos de un paciente
 *     description: Obtiene todas las evaluaciones y diagnósticos de un paciente específico con información completa.
 *     tags: [EvaluacionDiagnostico]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: pacienteId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del paciente
 *         example: "12"
 *     responses:
 *       200:
 *         description: Evaluaciones obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 evaluaciones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idEvaluacion:
 *                         type: integer
 *                       fecha:
 *                         type: string
 *                         format: date
 *                       diagnosticoPrincipal:
 *                         type: string
 *                       sintomasReportados:
 *                         type: string
 *                       evaluacionFisica:
 *                         type: string
 *                       planTratamiento:
 *                         type: string
 *                       recomendaciones:
 *                         type: string
 *                       doctor:
 *                         type: object
 *                         properties:
 *                           idUsuario:
 *                             type: integer
 *                           nombre:
 *                             type: string
 *                           apellido1:
 *                             type: string
 *                           apellido2:
 *                             type: string
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/paciente/:pacienteId', clerkAuth, async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const userId = req.user.idUsuario;
    const userRole = req.user.idRol;

    // Verificar que el paciente existe
    const paciente = await prisma.usuario.findUnique({
      where: { idUsuario: parseInt(pacienteId) },
      select: { idUsuario: true, nombre: true, apellido1: true }
    });

    if (!paciente) {
      return res.status(404).json({
        error: 'Paciente no encontrado',
        message: 'No existe un paciente con el ID proporcionado'
      });
    }

    // Verificar permisos: solo el paciente, sus médicos o admin pueden ver las evaluaciones
    const isOwner = parseInt(pacienteId) === userId;
    const isAdmin = isAdministrador(req.user);

    // Verificar si el usuario es médico del paciente
    let isMedicoDelPaciente = false;
    if (!isOwner && !isAdmin) {
      const evaluacionesDelPaciente = await prisma.evaluacionDiagnostico.findFirst({
        where: { 
          idPaciente: parseInt(pacienteId),
          idDoctor: userId
        }
      });
      isMedicoDelPaciente = !!evaluacionesDelPaciente;
    }

    if (!isOwner && !isAdmin && !isMedicoDelPaciente) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tiene permisos para ver las evaluaciones de este paciente'
      });
    }

    // Obtener todas las evaluaciones del paciente
    const evaluaciones = await prisma.evaluacionDiagnostico.findMany({
      where: { idPaciente: parseInt(pacienteId) },
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
    });

    res.json({
      evaluaciones,
      total: evaluaciones.length,
      paciente: {
        idUsuario: paciente.idUsuario,
        nombre: paciente.nombre,
        apellido1: paciente.apellido1
      }
    });

  } catch (error) {
    console.error('Error al obtener evaluaciones del paciente:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las evaluaciones del paciente'
    });
  }
});

/**
 * @swagger
 * /evaluacion-diagnostico/expediente/{expedienteId}:
 *   get:
 *     summary: Obtener todas las evaluaciones de un expediente específico
 *     description: Obtiene todas las evaluaciones y diagnósticos asociados a un expediente específico.
 *     tags: [EvaluacionDiagnostico]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: expedienteId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del expediente
 *         example: "1"
 *     responses:
 *       200:
 *         description: Evaluaciones obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 evaluaciones:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EvaluacionDiagnostico'
 *       404:
 *         description: Expediente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/expediente/:expedienteId', clerkAuth, async (req, res) => {
  try {
    const { expedienteId } = req.params;
    const userId = req.user.idUsuario;

    // Verificar que el expediente existe
    const expediente = await prisma.expediente.findUnique({
      where: { idExpediente: parseInt(expedienteId) },
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

    if (!expediente) {
      return res.status(404).json({
        error: 'Expediente no encontrado',
        message: 'El expediente especificado no existe'
      });
    }

    // Obtener evaluaciones del expediente
    const evaluaciones = await prisma.evaluacionDiagnostico.findMany({
      where: { idExpediente: parseInt(expedienteId) },
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
    });

    res.json({
      expediente: {
        idExpediente: expediente.idExpediente,
        paciente: expediente.paciente
      },
      evaluaciones
    });

  } catch (error) {
    console.error('Error al obtener evaluaciones del expediente:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las evaluaciones del expediente'
    });
  }
});

/**
 * @swagger
 * /evaluacion-diagnostico/doctores:
 *   get:
 *     summary: Obtener lista de doctores disponibles
 *     description: Obtiene la lista de todos los doctores (fisioterapeutas) disponibles para asignar a evaluaciones.
 *     tags: [EvaluacionDiagnostico]
 *     security:
 *       - clerkAuth: []
 *     responses:
 *       200:
 *         description: Lista de doctores obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 doctores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idUsuario:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       apellido1:
 *                         type: string
 *                       apellido2:
 *                         type: string
 *                       email:
 *                         type: string
 *       500:
 *         description: Error interno del servidor
 */
router.get('/doctores', clerkAuth, async (req, res) => {
  try {
    // Obtener todos los usuarios con rol de fisioterapeuta (ID 2)
    const doctores = await prisma.usuario.findMany({
      where: {
        idRol: 2  // ID del rol fisioterapeuta
      },
      select: {
        idUsuario: true,
        nombre: true,
        apellido1: true,
        apellido2: true,
        correoElectronico: true
      },
      orderBy: [
        { nombre: 'asc' },
        { apellido1: 'asc' }
      ]
    });

    res.json({
      doctores
    });

  } catch (error) {
    console.error('Error al obtener doctores:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los doctores'
    });
  }
});

/**
 * @swagger
 * /evaluacion-diagnostico/{evaluacionId}:
 *   get:
 *     summary: Obtener detalles de una evaluación específica
 *     description: Obtiene los detalles completos de una evaluación y diagnóstico específica.
 *     tags: [EvaluacionDiagnostico]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: evaluacionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la evaluación
 *         example: "1"
 *     responses:
 *       200:
 *         description: Evaluación obtenida exitosamente
 *       404:
 *         description: Evaluación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:evaluacionId', clerkAuth, async (req, res) => {
  try {
    const { evaluacionId } = req.params;
    const userId = req.user.idUsuario;

    const evaluacion = await prisma.evaluacionDiagnostico.findUnique({
      where: { idEvaluacion: parseInt(evaluacionId) },
      include: {
        doctor: {
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

    if (!evaluacion) {
      return res.status(404).json({
        error: 'Evaluación no encontrada',
        message: 'No existe una evaluación con el ID proporcionado'
      });
    }

    // Verificar permisos
    const isOwner = evaluacion.idPaciente === userId;
    const isDoctor = evaluacion.idDoctor === userId;
    const isAdmin = isAdministrador(req.user);

    if (!isOwner && !isDoctor && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tiene permisos para ver esta evaluación'
      });
    }

    res.json({ evaluacion });

  } catch (error) {
    console.error('Error al obtener evaluación:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo obtener la evaluación'
    });
  }
});

/**
 * @swagger
 * /evaluacion-diagnostico:
 *   post:
 *     summary: Crear nueva evaluación y diagnóstico
 *     description: Crea una nueva evaluación y diagnóstico para un paciente.
 *     tags: [EvaluacionDiagnostico]
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
 *               - diagnosticoPrincipal
 *             properties:
 *               idPaciente:
 *                 type: integer
 *               diagnosticoPrincipal:
 *                 type: string
 *               sintomasReportados:
 *                 type: string
 *               evaluacionFisica:
 *                 type: string
 *               planTratamiento:
 *                 type: string
 *               recomendaciones:
 *                 type: string
 *               idExpediente:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Evaluación creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', clerkAuth, async (req, res) => {
  try {
    const userId = req.user.idUsuario;
    const userRole = req.user.idRol;

    // Solo médicos y administradores pueden crear evaluaciones
    if (!isFisioterapeuta(req.user) && !isAdministrador(req.user)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los médicos pueden crear evaluaciones'
      });
    }

    const {
      idPaciente,
      idDoctor,
      diagnosticoPrincipal,
      sintomasReportados,
      evaluacionFisica,
      planTratamiento,
      recomendaciones,
      idExpediente
    } = req.body;

    // Validar datos requeridos
    if (!idPaciente || !diagnosticoPrincipal) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'ID del paciente y diagnóstico principal son requeridos'
      });
    }

    // Validar que se proporcione un doctor
    if (!idDoctor) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'ID del doctor es requerido'
      });
    }

    // Verificar que el doctor existe
    const doctor = await prisma.usuario.findUnique({
      where: { idUsuario: parseInt(idDoctor) }
    });

    if (!doctor) {
      return res.status(404).json({
        error: 'Doctor no encontrado',
        message: 'No existe un doctor con el ID proporcionado'
      });
    }

    // Verificar que el paciente existe
    const paciente = await prisma.usuario.findUnique({
      where: { idUsuario: parseInt(idPaciente) }
    });

    if (!paciente) {
      return res.status(404).json({
        error: 'Paciente no encontrado',
        message: 'No existe un paciente con el ID proporcionado'
      });
    }

    // Crear la evaluación
    const evaluacion = await prisma.evaluacionDiagnostico.create({
      data: {
        idPaciente: parseInt(idPaciente),
        idDoctor: parseInt(idDoctor), // Usar el doctor seleccionado en el formulario
        diagnosticoPrincipal,
        sintomasReportados,
        evaluacionFisica,
        planTratamiento,
        recomendaciones,
        idExpediente: idExpediente ? parseInt(idExpediente) : null
      },
      include: {
        doctor: {
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
      message: 'Evaluación creada exitosamente',
      evaluacion
    });

  } catch (error) {
    console.error('Error al crear evaluación:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo crear la evaluación'
    });
  }
});

/**
 * @swagger
 * /evaluacion-diagnostico/{evaluacionId}:
 *   put:
 *     summary: Actualizar una evaluación y diagnóstico existente
 *     description: Actualiza los datos de una evaluación y diagnóstico específica.
 *     tags: [EvaluacionDiagnostico]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: evaluacionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la evaluación a actualizar
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               diagnosticoPrincipal:
 *                 type: string
 *                 description: Diagnóstico principal
 *               sintomasReportados:
 *                 type: string
 *                 description: Síntomas reportados por el paciente
 *               evaluacionFisica:
 *                 type: string
 *                 description: Evaluación física realizada
 *               planTratamiento:
 *                 type: string
 *                 description: Plan de tratamiento propuesto
 *               recomendaciones:
 *                 type: string
 *                 description: Recomendaciones para el paciente
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la evaluación
 *               idDoctor:
 *                 type: integer
 *                 description: ID del doctor responsable
 *     responses:
 *       200:
 *         description: Evaluación actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Evaluación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:evaluacionId', clerkAuth, async (req, res) => {
  try {
    const { evaluacionId } = req.params;
    const userId = req.user.idUsuario;
    const updateData = req.body;

    // Verificar que la evaluación existe
    const evaluacionExistente = await prisma.evaluacionDiagnostico.findUnique({
      where: { idEvaluacion: parseInt(evaluacionId) },
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
    });

    if (!evaluacionExistente) {
      return res.status(404).json({
        error: 'Evaluación no encontrada',
        message: 'La evaluación especificada no existe'
      });
    }

    // Actualizar la evaluación
    const evaluacionActualizada = await prisma.evaluacionDiagnostico.update({
      where: { idEvaluacion: parseInt(evaluacionId) },
      data: {
        diagnosticoPrincipal: updateData.diagnosticoPrincipal,
        sintomasReportados: updateData.sintomasReportados,
        evaluacionFisica: updateData.evaluacionFisica,
        planTratamiento: updateData.planTratamiento,
        recomendaciones: updateData.recomendaciones,
        fecha: updateData.fecha ? new Date(updateData.fecha) : undefined,
        idDoctor: updateData.idDoctor
      },
      include: {
        doctor: {
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
      message: 'Evaluación actualizada exitosamente',
      evaluacion: evaluacionActualizada
    });

  } catch (error) {
    console.error('Error al actualizar evaluación:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar la evaluación'
    });
  }
});

export default router;
