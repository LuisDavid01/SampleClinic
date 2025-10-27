import { Router } from 'express';
import prisma from '../config/database.js';
import { clerkAuth, requireClerkRole } from '../middleware/clerkAuth.js';
import { ROLES, isPaciente, isFisioterapeuta, isAdministrador } from '../constants/roles.js';
import { validateId } from '../middleware/validation.js';

const router = Router();

/**
 * @swagger
 * /citas/{id}/recetas:
 *   get:
 *     summary: Obtener recetas relacionadas con una cita
 *     description: Obtiene todas las recetas (archivos con categoría "receta") del paciente de una cita específica. Implementa la funcionalidad de recetas usando la tabla de archivos con categoría específica.
 *     tags: [Citas - Recetas]
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
 *           default: 20
 *         description: Número máximo de recetas a retornar
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar recetas desde una fecha específica
 *         example: "2024-01-01"
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar recetas hasta una fecha específica
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Recetas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recetas:
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
 *                       urlDescarga:
 *                         type: string
 *                         description: URL para descargar el archivo
 *                 total:
 *                   type: integer
 *                 resumen:
 *                   type: object
 *                   properties:
 *                     totalRecetas:
 *                       type: integer
 *                     recetasRecientes:
 *                       type: integer
 *                       description: Recetas de los últimos 30 días
 *                     tiposArchivo:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error interno del servidor
 */
// GET /api/citas/:id/recetas - Obtener recetas relacionadas con una cita
router.get('/:id/recetas',  validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, fechaDesde, fechaHasta } = req.query;

    // Verificar que la cita existe y obtener el paciente
    const cita = await prisma.cita.findUnique({
      where: { idCita: parseInt(id) },
      select: {
        idPaciente: true,
        idMedico: true,
        fechaCita: true
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

    // Construir filtros para recetas
    const whereRecetas = {
      idUsuario: cita.idPaciente,
      activo: true,
      categoria: 'receta'
    };

    // Agregar filtros de fecha si se proporcionan
    if (fechaDesde || fechaHasta) {
      whereRecetas.fechaSubida = {};
      if (fechaDesde) {
        whereRecetas.fechaSubida.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        whereRecetas.fechaSubida.lte = new Date(fechaHasta);
      }
    }

    // Obtener recetas
    const recetas = await prisma.archivo.findMany({
      where: whereRecetas,
      orderBy: { fechaSubida: 'desc' },
      take: parseInt(limit)
    });

    // Obtener estadísticas
    const totalRecetas = await prisma.archivo.count({ where: whereRecetas });

    // Recetas de los últimos 30 días
    const fecha30DiasAtras = new Date();
    fecha30DiasAtras.setDate(fecha30DiasAtras.getDate() - 30);
    const recetasRecientes = await prisma.archivo.count({
      where: {
        ...whereRecetas,
        fechaSubida: {
          gte: fecha30DiasAtras
        }
      }
    });

    // Tipos de archivo únicos
    const tiposArchivo = await prisma.archivo.findMany({
      where: whereRecetas,
      select: { extension: true },
      distinct: ['extension']
    });

    // Construir URLs de descarga
    const recetasConUrl = recetas.map(receta => ({
      idArchivo: receta.idArchivo,
      nombreOriginal: receta.nombreOriginal,
      nombreArchivo: receta.nombreArchivo,
      tipoMime: receta.tipoMime,
      tamanoArchivo: receta.tamanoArchivo,
      extension: receta.extension,
      descripcion: receta.descripcion,
      categoria: receta.categoria,
      fechaSubida: receta.fechaSubida,
      urlDescarga: `/api/archivos/${cita.idPaciente}/${receta.idArchivo}/download`
    }));

    res.json({
      recetas: recetasConUrl,
      total: totalRecetas,
      resumen: {
        totalRecetas,
        recetasRecientes,
        tiposArchivo: tiposArchivo.map(t => t.extension)
      }
    });

  } catch (error) {
    console.error('Error al obtener recetas de la cita:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las recetas'
    });
  }
});

/**
 * @swagger
 * /citas/{id}/recetas:
 *   post:
 *     summary: Agregar receta a una cita
 *     description: Agrega una nueva receta (archivo con categoría "receta") relacionada con una cita específica. Solo médicos y administradores pueden agregar recetas.
 *     tags: [Citas - Recetas]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreOriginal
 *               - descripcion
 *             properties:
 *               nombreOriginal:
 *                 type: string
 *                 description: Nombre original del archivo de receta
 *                 example: "Receta_Medicamentos_2024.pdf"
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la receta
 *                 example: "Receta de medicamentos para tratamiento post-operatorio"
 *               tipoMime:
 *                 type: string
 *                 description: Tipo MIME del archivo
 *                 example: "application/pdf"
 *               tamanoArchivo:
 *                 type: integer
 *                 description: Tamaño del archivo en bytes
 *                 example: 1024000
 *               extension:
 *                 type: string
 *                 description: Extensión del archivo
 *                 example: ".pdf"
 *     responses:
 *       201:
 *         description: Receta agregada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Receta agregada exitosamente"
 *                 receta:
 *                   type: object
 *                   properties:
 *                     idArchivo:
 *                       type: integer
 *                     nombreOriginal:
 *                       type: string
 *                     descripcion:
 *                       type: string
 *                     categoria:
 *                       type: string
 *                     fechaSubida:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - solo médicos y administradores
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error interno del servidor
 */
// POST /api/citas/:id/recetas - Agregar receta a una cita
router.post('/:id/recetas',  requireClerkRole([ROLES.FISIOTERAPEUTA, ROLES.ADMINISTRADOR]), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreOriginal, descripcion, tipoMime, tamanoArchivo, extension } = req.body;

    // Verificar que la cita existe
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

    // Verificar que el médico tiene permisos para agregar recetas a esta cita
    const isMedicoCita = cita.idMedico === req.user.idUsuario;
    const isAdmin = isAdministrador(req.user);

    if (!isMedicoCita && !isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo el médico asignado o un administrador pueden agregar recetas a esta cita'
      });
    }

    // Validar datos requeridos
    if (!nombreOriginal || !descripcion) {
      return res.status(400).json({
        error: 'Datos requeridos faltantes',
        message: 'El nombre original y la descripción son campos obligatorios'
      });
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const nombreArchivo = `receta_${timestamp}_${Math.round(Math.random() * 1E9)}${extension || '.pdf'}`;
    const rutaArchivo = `user_${cita.idPaciente}/recetas/${nombreArchivo}`;

    // Crear registro de receta
    const receta = await prisma.archivo.create({
      data: {
        nombreOriginal: nombreOriginal.trim(),
        nombreArchivo: nombreArchivo,
        rutaArchivo: rutaArchivo,
        tipoMime: tipoMime || 'application/pdf',
        tamanoArchivo: tamanoArchivo || 0,
        extension: extension || '.pdf',
        descripcion: descripcion.trim(),
        categoria: 'receta',
        idUsuario: cita.idPaciente,
        activo: true
      }
    });

    res.status(201).json({
      message: 'Receta agregada exitosamente',
      receta: {
        idArchivo: receta.idArchivo,
        nombreOriginal: receta.nombreOriginal,
        descripcion: receta.descripcion,
        categoria: receta.categoria,
        fechaSubida: receta.fechaSubida
      }
    });

  } catch (error) {
    console.error('Error al agregar receta a la cita:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo agregar la receta'
    });
  }
});

export default router;
