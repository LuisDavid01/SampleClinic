import { Router } from 'express';
import prisma from '../config/database.js';
import { clerkAuth } from '../middleware/clerkAuth.js';
import { validateId } from '../middleware/validation.js';
import { isPaciente, isFisioterapeuta, isAdministrador } from '../constants/roles.js';

const router = Router();

/**
 * @swagger
 * /citas/paciente/{pacienteId}:
 *   get:
 *     summary: Obtener todas las citas de un paciente específico
 *     description: Obtiene todas las citas de un paciente específico con información completa. Solo el paciente, sus médicos asignados o un administrador pueden acceder.
 *     tags: [Citas]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: pacienteId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del paciente
 *         example: "user_123456789"
 *     responses:
 *       200:
 *         description: Citas del paciente obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 citas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idCita:
 *                         type: integer
 *                       fechaCita:
 *                         type: string
 *                         format: date-time
 *                       descripcion:
 *                         type: string
 *                       estadoCita:
 *                         type: string
 *                       medico:
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
 *                       servicio:
 *                         type: object
 *                         properties:
 *                           idServicio:
 *                             type: integer
 *                           nombreServicio:
 *                             type: string
 *                           descripcion:
 *                             type: string
 *                       notas:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             idNota:
 *                               type: integer
 *                             nota:
 *                               type: string
 *                             fechaCreacion:
 *                               type: string
 *                               format: date-time
 *                       resultados:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             idResultado:
 *                               type: integer
 *                             resultado:
 *                               type: string
 *                             resumenResultado:
 *                               type: string
 *                             fechaRegistro:
 *                               type: string
 *                               format: date-time
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - no tiene permisos para ver las citas de este paciente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Paciente no encontrado
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
router.get('/paciente/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    // En desarrollo, usar datos mock si no hay autenticación
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasAuth = req.headers.authorization && req.headers.authorization !== 'Bearer mock-token';
    
    if (!hasAuth && isDevelopment) {
      console.log('🛠️ Modo desarrollo: Sin autenticación, obteniendo datos reales');
      
      // Obtener datos reales de la base de datos
      // Buscar por clerkId en lugar de idUsuario
      const usuario = await prisma.usuario.findUnique({
        where: { clerkId: pacienteId },
        select: { 
          idUsuario: true,
          nombre: true,
          apellido1: true,
          clerkId: true
        }
      });
      
      if (!usuario) {
        // Retornar lista vacía en lugar de error 404
        return res.json({ 
          citas: [],
          message: 'No se encontraron citas para este paciente'
        });
      }
      
      const citas = await prisma.cita.findMany({
        where: { idPaciente: usuario.idUsuario },
        include: {
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
              nombreServicio: true,
              descripcion: true
            }
          },
          notas: {
            orderBy: { fechaCreacion: 'desc' },
            take: 1
          },
          resultados: {
            orderBy: { fechaRegistro: 'desc' },
            take: 1
          },
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
        orderBy: { fechaCita: 'desc' }
      });

      // Obtener archivos del usuario
      const archivosUsuario = await prisma.archivo.findMany({
        where: { idUsuario: usuario.idUsuario },
        orderBy: { fechaSubida: 'desc' }
      });

      // Obtener evaluaciones específicas por cita
      const citasConEvaluaciones = await Promise.all(
        citas.map(async (cita) => {
          // Obtener evaluaciones específicas de esta cita
          const evaluaciones = await prisma.evaluacionDiagnostico.findMany({
            where: { 
              idCita: cita.idCita,
              idPaciente: usuario.idUsuario 
            },
            orderBy: { fecha: 'desc' },
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

          return {
            ...cita,
            evaluaciones,
            archivos: archivosUsuario // Agregar archivos a cada cita
          };
        })
      );

      const paciente = await prisma.usuario.findUnique({
        where: { clerkId: pacienteId },
        select: { idUsuario: true, nombre: true, apellido1: true }
      });

      return res.json({
        citas: citasConEvaluaciones,
        total: citasConEvaluaciones.length,
        paciente: paciente || {
          idUsuario: usuario.idUsuario,
          nombre: usuario.nombre,
          apellido1: usuario.apellido1
        }
      });
    }
    
    // Si hay autenticación, usar clerkAuth
    if (hasAuth) {
      // Aplicar middleware de autenticación manualmente
      const authResult = await clerkAuth(req, res, () => {});
      if (authResult) return; // Si hay error, ya se envió la respuesta
    }
    
    // Buscar el usuario por clerkId
    const usuarioPaciente = await prisma.usuario.findUnique({
      where: { clerkId: pacienteId },
      select: { idUsuario: true, nombre: true, apellido1: true }
    });

    if (!usuarioPaciente) {
      return res.status(404).json({
        error: 'Paciente no encontrado',
        message: 'No existe un paciente con el ID de Clerk proporcionado'
      });
    }

    const userId = req.user?.idUsuario;
    const userRole = req.user?.idRol || 3; // Rol paciente por defecto

    // Verificar permisos: solo el paciente, sus médicos o admin pueden ver las citas
    const isOwner = usuarioPaciente.idUsuario === userId;
    const isAdmin = isAdministrador(req.user);

    // Verificar si el usuario es médico del paciente
    let isMedicoDelPaciente = false;
    if (!isOwner && !isAdmin) {
      const citasDelPaciente = await prisma.cita.findFirst({
        where: { 
          idPaciente: usuarioPaciente.idUsuario,
          idMedico: userId
        }
      });
      isMedicoDelPaciente = !!citasDelPaciente;
    }

    if (!isOwner && !isAdmin && !isMedicoDelPaciente) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tiene permisos para ver las citas de este paciente'
      });
    }

    // Obtener todas las citas del paciente
    const citas = await prisma.cita.findMany({
      where: { idPaciente: usuarioPaciente.idUsuario },
      include: {
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
            nombreServicio: true,
            descripcion: true
          }
        },
        notas: {
          orderBy: { fechaCreacion: 'desc' },
          take: 1 // Solo la nota más reciente
        },
        resultados: {
          orderBy: { fechaRegistro: 'desc' },
          take: 1 // Solo el resultado más reciente
        }
      },
      orderBy: { fechaCita: 'desc' }
    });

    // Obtener diagnósticos del paciente para cada cita
    const citasConDiagnosticos = await Promise.all(
      citas.map(async (cita) => {
        const diagnosticos = await prisma.evaluacionDiagnostico.findMany({
          where: { idPaciente: usuarioPaciente.idUsuario },
          orderBy: { fecha: 'desc' },
          take: 1 // Solo la evaluación más reciente
        });

        return {
          ...cita,
          diagnosticos
        };
      })
    );

    res.json({
      citas: citasConDiagnosticos,
      total: citasConDiagnosticos.length,
      paciente: {
        idUsuario: usuarioPaciente.idUsuario,
        nombre: usuarioPaciente.nombre,
        apellido1: usuarioPaciente.apellido1
      }
    });

  } catch (error) {
    console.error('Error al obtener citas del paciente:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las citas del paciente'
    });
  }
});

export default router;

