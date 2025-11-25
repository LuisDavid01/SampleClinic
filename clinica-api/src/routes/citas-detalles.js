import { Router } from 'express';
import prisma from '../config/database.js';
import { clerkAuth, requireClerkRole } from '../middleware/clerkAuth.js';
import { ROLES, isPaciente, isFisioterapeuta, isAdministrador } from '../constants/roles.js';
import { validateId } from '../middleware/validation.js';

const router = Router();

/**
 * @swagger
 * /citas/{id}/detalles-completos:
 *   get:
 *     summary: Obtener detalles completos de una cita
 *     description: Obtiene todos los detalles de una cita específica incluyendo diagnósticos, documentos, archivos y expediente del paciente. Diseñado específicamente para la historia de usuario de visualización de detalles de citas.
 *     tags: [Citas - Detalles Completos]
 *     security:
 *       - clerkAuth: []
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
 *         description: Detalles completos de la cita obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cita:
 *                   type: object
 *                   properties:
 *                     idCita:
 *                       type: integer
 *                     fechaCita:
 *                       type: string
 *                       format: date-time
 *                     descripcion:
 *                       type: string
 *                     estadoCita:
 *                       type: string
 *                     paciente:
 *                       type: object
 *                       properties:
 *                         idUsuario:
 *                           type: integer
 *                         nombre:
 *                           type: string
 *                         apellido1:
 *                           type: string
 *                         apellido2:
 *                           type: string
 *                         correoElectronico:
 *                           type: string
 *                         telefonoPrincipal:
 *                           type: string
 *                     medico:
 *                       type: object
 *                       properties:
 *                         idUsuario:
 *                           type: integer
 *                         nombre:
 *                           type: string
 *                         apellido1:
 *                           type: string
 *                         apellido2:
 *                           type: string
 *                         correoElectronico:
 *                           type: string
 *                         telefonoPrincipal:
 *                           type: string
 *                     servicio:
 *                       type: object
 *                       properties:
 *                         idServicio:
 *                           type: integer
 *                         nombreServicio:
 *                           type: string
 *                         descripcion:
 *                           type: string
 *                         precio:
 *                           type: number
 *                     notas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           idNota:
 *                             type: integer
 *                           nota:
 *                             type: string
 *                           fechaCreacion:
 *                             type: string
 *                             format: date-time
 *                     resultados:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           idResultado:
 *                             type: integer
 *                           resultado:
 *                             type: string
 *                           resumenResultado:
 *                             type: string
 *                           fechaRegistro:
 *                             type: string
 *                             format: date-time
 *                 diagnosticos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idDiagnostico:
 *                         type: integer
 *                       diagnostico:
 *                         type: string
 *                       fecha:
 *                         type: string
 *                         format: date
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
 *                 expediente:
 *                   type: object
 *                   properties:
 *                     idExpediente:
 *                       type: integer
 *                     cedula:
 *                       type: string
 *                     estado:
 *                       type: string
 *                     descripcion:
 *                       type: string
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                     documentos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           idDocumento:
 *                             type: integer
 *                           url:
 *                             type: string
 *                           tipoDocumento:
 *                             type: string
 *                           fechaCreacion:
 *                             type: string
 *                             format: date-time
 *                 archivos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idArchivo:
 *                         type: integer
 *                       nombreOriginal:
 *                         type: string
 *                       nombreArchivo:
 *                         type: string
 *                       tipoMime:
 *                         type: string
 *                       tamanoArchivo:
 *                         type: integer
 *                       extension:
 *                         type: string
 *                       descripcion:
 *                         type: string
 *                       categoria:
 *                         type: string
 *                       fechaSubida:
 *                         type: string
 *                         format: date-time
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
// GET /api/citas/:id/detalles-completos - Obtener detalles completos de una cita
router.get('/:id/detalles-completos' , clerkAuth,validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la cita con todos sus detalles básicos
    const cita = await prisma.cita.findUnique({
      where: { idCita: parseInt(id) },
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
            correoElectronico: true,
            telefonoPrincipal: true
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
    const isPacienteCita = cita.idPaciente === req.user.idUsuario;
    const isMedicoCita = cita.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isPacienteCita && !isMedicoCita && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tiene permisos para ver esta cita'
      });
    }

    // Obtener diagnósticos del paciente
    const diagnosticos = await prisma.evaluacionDiagnostico.findMany({
      where: { idPaciente: cita.idPaciente },
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

    // Obtener expediente del paciente
    const expediente = await prisma.expediente.findFirst({
      where: { idPaciente: cita.idPaciente },
      include: {
        documentos: {
          orderBy: { fechaCreacion: 'desc' }
        }
      }
    });

    // Obtener archivos del paciente
    const archivos = await prisma.archivo.findMany({
      where: {
        idUsuario: cita.idPaciente,
        activo: true
      },
      orderBy: { fechaSubida: 'desc' }
    });

    // Construir respuesta completa
    const respuesta = {
      cita: {
        idCita: cita.idCita,
        fechaCita: cita.fechaCita,
        descripcion: cita.descripcion,
        estadoCita: cita.estadoCita,
        paciente: cita.paciente,
        medico: cita.medico,
        servicio: cita.servicio,
        notas: cita.notas,
        resultados: cita.resultados
      },
      diagnosticos: diagnosticos.map(diag => ({
        idEvaluacion: diag.idEvaluacion,
        diagnostico: diag.diagnostico,
        fecha: diag.fecha,
        doctor: diag.doctor
      })),
      expediente: expediente ? {
        idExpediente: expediente.idExpediente,
        cedula: expediente.cedula,
        estado: expediente.estado,
        descripcion: expediente.descripcion,
        fechaCreacion: expediente.fechaCreacion,
        documentos: expediente.documentos.map(doc => ({
          idDocumento: doc.idDocumento,
          url: doc.url,
          tipoDocumento: doc.tipoDocumento,
          fechaCreacion: doc.fechaCreacion
        }))
      } : null,
      archivos: archivos.map(archivo => ({
        idArchivo: archivo.idArchivo,
        nombreOriginal: archivo.nombreOriginal,
        nombreArchivo: archivo.nombreArchivo,
        tipoMime: archivo.tipoMime,
        tamanoArchivo: archivo.tamanoArchivo,
        extension: archivo.extension,
        descripcion: archivo.descripcion,
        categoria: archivo.categoria,
        fechaSubida: archivo.fechaSubida
      }))
    };

    res.json(respuesta);

  } catch (error) {
    console.error('Error al obtener detalles completos de la cita:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los detalles completos de la cita'
    });
  }
});

/**
 * @swagger
 * /citas/{id}/diagnosticos:
 *   get:
 *     summary: Obtener diagnósticos relacionados con una cita
 *     description: Obtiene todos los diagnósticos del paciente de una cita específica. Útil para mostrar el historial médico relacionado con la cita.
 *     tags: [Citas - Detalles Completos]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de diagnósticos a retornar
 *     responses:
 *       200:
 *         description: Diagnósticos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 diagnosticos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idDiagnostico:
 *                         type: integer
 *                       diagnostico:
 *                         type: string
 *                       fecha:
 *                         type: string
 *                         format: date
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
 *                 total:
 *                   type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error interno del servidor
 */
// GET /api/citas/:id/diagnosticos - Obtener diagnósticos relacionados con una cita
router.get('/:id/diagnosticos', clerkAuth ,validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    // Verificar que la cita existe y obtener el paciente
    const cita = await prisma.cita.findUnique({
      where: { idCita: parseInt(id) },
      select: {
        idPaciente: true,
        idMedico: true
      }
    });

    if (!cita) {
      return res.status(404).json({
        error: 'Cita no encontrada',
        message: 'No existe una cita con el ID proporcionado'
      });
    }

    // Verificar permisos
    const isPacienteCita = cita.idPaciente === req.user.idUsuario;
    const isMedicoCita = cita.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isPacienteCita && !isMedicoCita && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tiene permisos para ver esta cita'
      });
    }

    // Obtener diagnósticos del paciente
    const diagnosticos = await prisma.evaluacionDiagnostico.findMany({
      where: { idPaciente: cita.idPaciente },
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
      orderBy: { fecha: 'desc' },
      take: parseInt(limit)
    });

    const total = await prisma.evaluacionDiagnostico.count({
      where: { idPaciente: cita.idPaciente }
    });

    res.json({
      diagnosticos: diagnosticos.map(diag => ({
        idEvaluacion: diag.idEvaluacion,
        diagnostico: diag.diagnostico,
        fecha: diag.fecha,
        doctor: diag.doctor
      })),
      total
    });

  } catch (error) {
    console.error('Error al obtener diagnósticos de la cita:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los diagnósticos'
    });
  }
});

/**
 * @swagger
 * /citas/{id}/documentos:
 *   get:
 *     summary: Obtener documentos y archivos relacionados con una cita
 *     description: Obtiene todos los documentos y archivos del paciente de una cita específica. Incluye documentos del expediente y archivos subidos por el usuario.
 *     tags: [Citas - Detalles Completos]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *         example: 1
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoría de archivo
 *         example: "imagenes_medicas"
 *       - in: query
 *         name: tipoDocumento
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de documento
 *         example: "consentimiento"
 *     responses:
 *       200:
 *         description: Documentos y archivos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documentos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idDocumento:
 *                         type: integer
 *                       url:
 *                         type: string
 *                       tipoDocumento:
 *                         type: string
 *                       fechaCreacion:
 *                         type: string
 *                         format: date-time
 *                 archivos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idArchivo:
 *                         type: integer
 *                       nombreOriginal:
 *                         type: string
 *                       nombreArchivo:
 *                         type: string
 *                       tipoMime:
 *                         type: string
 *                       tamanoArchivo:
 *                         type: integer
 *                       extension:
 *                         type: string
 *                       descripcion:
 *                         type: string
 *                       categoria:
 *                         type: string
 *                       fechaSubida:
 *                         type: string
 *                         format: date-time
 *                 totalDocumentos:
 *                   type: integer
 *                 totalArchivos:
 *                   type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error interno del servidor
 */
// GET /api/citas/:id/documentos - Obtener documentos y archivos relacionados con una cita
router.get('/:id/documentos', clerkAuth ,validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { categoria, tipoDocumento } = req.query;

    // Verificar que la cita existe y obtener el paciente
    const cita = await prisma.cita.findUnique({
      where: { idCita: parseInt(id) },
      select: {
        idPaciente: true,
        idMedico: true
      }
    });

    if (!cita) {
      return res.status(404).json({
        error: 'Cita no encontrada',
        message: 'No existe una cita con el ID proporcionado'
      });
    }

    // Verificar permisos
    const isPacienteCita = cita.idPaciente === req.user.idUsuario;
    const isMedicoCita = cita.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isPacienteCita && !isMedicoCita && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tiene permisos para ver esta cita'
      });
    }

    // Obtener expediente del paciente
    const expediente = await prisma.expediente.findFirst({
      where: { idPaciente: cita.idPaciente }
    });

    // Construir filtros para documentos
    const whereDocumentos = expediente ? { idExpediente: expediente.idExpediente } : { idExpediente: -1 };
    if (tipoDocumento) {
      whereDocumentos.tipoDocumento = tipoDocumento;
    }

    // Construir filtros para archivos
    const whereArchivos = {
      idUsuario: cita.idPaciente,
      activo: true
    };
    if (categoria) {
      whereArchivos.categoria = categoria;
    }

    // Obtener documentos y archivos en paralelo
    const [documentos, archivos] = await Promise.all([
      prisma.documento.findMany({
        where: whereDocumentos,
        orderBy: { fechaCreacion: 'desc' }
      }),
      prisma.archivo.findMany({
        where: whereArchivos,
        orderBy: { fechaSubida: 'desc' }
      })
    ]);

    const totalDocumentos = await prisma.documento.count({ where: whereDocumentos });
    const totalArchivos = await prisma.archivo.count({ where: whereArchivos });

    res.json({
      documentos: documentos.map(doc => ({
        idDocumento: doc.idDocumento,
        url: doc.url,
        tipoDocumento: doc.tipoDocumento,
        fechaCreacion: doc.fechaCreacion
      })),
      archivos: archivos.map(archivo => ({
        idArchivo: archivo.idArchivo,
        nombreOriginal: archivo.nombreOriginal,
        nombreArchivo: archivo.nombreArchivo,
        tipoMime: archivo.tipoMime,
        tamanoArchivo: archivo.tamanoArchivo,
        extension: archivo.extension,
        descripcion: archivo.descripcion,
        categoria: archivo.categoria,
        fechaSubida: archivo.fechaSubida
      })),
      totalDocumentos,
      totalArchivos
    });

  } catch (error) {
    console.error('Error al obtener documentos de la cita:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los documentos'
    });
  }
});

export default router;
