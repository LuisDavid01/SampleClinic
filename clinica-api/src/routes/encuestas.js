import express from 'express';
import { clerkAuth, requireClerkRole } from '../middleware/clerkAuth.js';
import { validateEncuesta, validateId } from '../middleware/validation.js';
import { ROLES } from '../constants/roles.js';
import {
  getEncuestas,
  getEncuestaById,
  createEncuesta,
  getEncuestasByUsuario,
  getEstadisticasEncuestas
} from '../controllers/encuestas.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Encuesta:
 *       type: object
 *       required:
 *         - calificacion
 *         - idUsuario
 *       properties:
 *         idEncuesta:
 *           type: integer
 *           description: ID único de la encuesta
 *         calificacion:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Calificación del 1 al 5
 *         comentario:
 *           type: string
 *           nullable: true
 *           description: Comentario opcional del usuario
 *         idUsuario:
 *           type: integer
 *           description: ID del usuario que completó la encuesta
 *         fechaRegistro:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de registro de la encuesta
 *         usuario:
 *           type: object
 *           properties:
 *             idUsuario:
 *               type: integer
 *             nombre:
 *               type: string
 *             apellido1:
 *               type: string
 *             apellido2:
 *               type: string
 *             correoElectronico:
 *               type: string
 *             rol:
 *               type: object
 *               properties:
 *                 nombreRol:
 *                   type: string
 *     EncuestaCreate:
 *       type: object
 *       required:
 *         - calificacion
 *         - idUsuario
 *       properties:
 *         calificacion:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Calificación del 1 al 5
 *         comentario:
 *           type: string
 *           nullable: true
 *           description: Comentario opcional del usuario
 *         idUsuario:
 *           type: integer
 *           description: ID del usuario que completa la encuesta
 *     EstadisticasEncuestas:
 *       type: object
 *       properties:
 *         estadisticas:
 *           type: object
 *           properties:
 *             promedio:
 *               type: number
 *               description: Promedio de calificaciones
 *             total:
 *               type: integer
 *               description: Total de encuestas
 *             minima:
 *               type: integer
 *               description: Calificación mínima
 *             maxima:
 *               type: integer
 *               description: Calificación máxima
 *         distribucion:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               calificacion:
 *                 type: integer
 *               _count:
 *                 type: object
 *                 properties:
 *                   calificacion:
 *                     type: integer
 *         encuestasRecientes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Encuesta'
 */

/**
 * @swagger
 * /api/encuestas:
 *   get:
 *     summary: Obtener todas las encuestas
 *     description: Obtiene una lista paginada de encuestas con filtros opcionales
 *     tags: [Encuestas]
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
 *         description: Buscar en comentarios
 *       - in: query
 *         name: idUsuario
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de usuario
 *       - in: query
 *         name: calificacion
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filtrar por calificación específica
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar desde fecha
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar hasta fecha
 *     responses:
 *       200:
 *         description: Lista de encuestas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     encuestas:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Encuesta'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                     estadisticas:
 *                       type: object
 *                       properties:
 *                         promedio:
 *                           type: number
 *                         total:
 *                           type: integer
 *                         distribucion:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               calificacion:
 *                                 type: integer
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   calificacion:
 *                                     type: integer
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/',  getEncuestas);

/**
 * @swagger
 * /api/encuestas/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de encuestas
 *     description: Obtiene estadísticas generales de las encuestas
 *     tags: [Encuestas]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar estadísticas desde fecha
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar estadísticas hasta fecha
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EstadisticasEncuestas'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/estadisticas', getEstadisticasEncuestas);

/**
 * @swagger
 * /api/encuestas/{id}:
 *   get:
 *     summary: Obtener encuesta por ID
 *     description: Obtiene una encuesta específica por su ID
 *     tags: [Encuestas]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la encuesta
 *     responses:
 *       200:
 *         description: Encuesta obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Encuesta'
 *       404:
 *         description: Encuesta no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id',  validateId, getEncuestaById);

/**
 * @swagger
 * /api/encuestas:
 *   post:
 *     summary: Crear nueva encuesta
 *     description: Crea una nueva encuesta de satisfacción
 *     tags: [Encuestas]
 *     security:
 *       - clerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EncuestaCreate'
 *     responses:
 *       201:
 *         description: Encuesta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Encuesta'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', validateEncuesta, createEncuesta);

/**
 * @swagger
 * /api/encuestas/usuario/{idUsuario}:
 *   get:
 *     summary: Obtener encuestas por usuario
 *     description: Obtiene todas las encuestas de un usuario específico
 *     tags: [Encuestas]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
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
 *         description: Encuestas del usuario obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     encuestas:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Encuesta'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/usuario/:idUsuario', validateId, getEncuestasByUsuario);

export default router;
