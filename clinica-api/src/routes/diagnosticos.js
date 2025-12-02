import express from 'express';
import { clerkAuth, requireClerkRole } from '../middleware/clerkAuth.js';
import { validateDiagnostico, validateId } from '../middleware/validation.js';
import {
  getDiagnosticos,
  getDiagnosticoById,
  createDiagnostico,
  updateDiagnostico,
  deleteDiagnostico,
  getDiagnosticosByPaciente,
  getDiagnosticosByExpediente,
  createDiagnosticoCita,
  updateDiagnosticoCita
} from '../controllers/diagnosticos.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Diagnostico:
 *       type: object
 *       required:
 *         - idPaciente
 *         - diagnostico
 *       properties:
 *         idDiagnostico:
 *           type: integer
 *           description: ID único del diagnóstico
 *         idPaciente:
 *           type: integer
 *           description: ID del paciente
 *         idDoctor:
 *           type: integer
 *           nullable: true
 *           description: ID del doctor/fisioterapeuta
 *         diagnostico:
 *           type: string
 *           description: Descripción del diagnóstico
 *         fecha:
 *           type: string
 *           format: date
 *           description: Fecha del diagnóstico
 *         idExpediente:
 *           type: integer
 *           nullable: true
 *           description: ID del expediente asociado
 *         paciente:
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
 *         doctor:
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
 *         expediente:
 *           type: object
 *           properties:
 *             idExpediente:
 *               type: integer
 *             cedula:
 *               type: string
 *             estado:
 *               type: string
 */

/**
 * @swagger
 * /diagnosticos:
 *   get:
 *     summary: Obtener todos los diagnósticos
 *     tags: [Diagnósticos]
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
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda en el texto del diagnóstico
 *       - in: query
 *         name: idPaciente
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del paciente
 *       - in: query
 *         name: idDoctor
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del doctor
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
 *         description: Lista de diagnósticos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Diagnostico'
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
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', 
  clerkAuth, 
  requireClerkRole(['fisioterapeuta', 'admin']), 
  getDiagnosticos
);

/**
 * @swagger
 * /diagnosticos/{id}:
 *   get:
 *     summary: Obtener un diagnóstico por ID
 *     tags: [Diagnósticos]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del diagnóstico
 *     responses:
 *       200:
 *         description: Diagnóstico obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Diagnostico'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', 
  clerkAuth, 
  requireClerkRole(['fisioterapeuta', 'admin']), 
  validateId, 
  getDiagnosticoById
);

/**
 * @swagger
 * /diagnosticos:
 *   post:
 *     summary: Crear un nuevo diagnóstico
 *     tags: [Diagnósticos]
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
 *               - diagnostico
 *             properties:
 *               idPaciente:
 *                 type: integer
 *                 description: ID del paciente
 *               idDoctor:
 *                 type: integer
 *                 nullable: true
 *                 description: ID del doctor/fisioterapeuta
 *               diagnostico:
 *                 type: string
 *                 description: Descripción del diagnóstico
 *               idExpediente:
 *                 type: integer
 *                 nullable: true
 *                 description: ID del expediente asociado
 *     responses:
 *       201:
 *         description: Diagnóstico creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Diagnostico'
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', 
  clerkAuth, 
  requireClerkRole(['fisioterapeuta', 'admin']), 
  validateDiagnostico, 
  createDiagnostico
);

router.post('/diagCita', 
  clerkAuth, 
  requireClerkRole(['fisioterapeuta', 'admin']), 
  createDiagnosticoCita
);

/**
 * @swagger
 * /diagnosticos/{id}:
 *   put:
 *     summary: Actualizar un diagnóstico
 *     tags: [Diagnósticos]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del diagnóstico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               diagnostico:
 *                 type: string
 *                 description: Descripción del diagnóstico
 *               idDoctor:
 *                 type: integer
 *                 nullable: true
 *                 description: ID del doctor/fisioterapeuta
 *               idExpediente:
 *                 type: integer
 *                 nullable: true
 *                 description: ID del expediente asociado
 *     responses:
 *       200:
 *         description: Diagnóstico actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Diagnostico'
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', 
  clerkAuth, 
  requireClerkRole(['fisioterapeuta', 'admin']), 
  validateId, 
  updateDiagnostico
);

router.put('/diagCita/:id', 
  clerkAuth, 
  requireClerkRole(['fisioterapeuta', 'admin']), 
  updateDiagnosticoCita
);

/**
 * @swagger
 * /diagnosticos/{id}:
 *   delete:
 *     summary: Eliminar un diagnóstico
 *     tags: [Diagnósticos]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del diagnóstico
 *     responses:
 *       200:
 *         description: Diagnóstico eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', 
  clerkAuth, 
  requireClerkRole(['fisioterapeuta', 'admin']), 
  validateId, 
  deleteDiagnostico
);

/**
 * @swagger
 * /diagnosticos/paciente/{idPaciente}:
 *   get:
 *     summary: Obtener diagnósticos de un paciente específico
 *     tags: [Diagnósticos]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: idPaciente
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
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
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Diagnósticos del paciente obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Diagnostico'
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
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/paciente/:idPaciente', 
  clerkAuth, 
  requireClerkRole(['fisioterapeuta', 'admin']), 
  getDiagnosticosByPaciente
);

/**
 * @swagger
 * /api/diagnosticos/expediente/{expedienteId}:
 *   get:
 *     summary: Obtener diagnósticos por expediente
 *     tags: [Diagnósticos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expedienteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     responses:
 *       200:
 *         description: Lista de diagnósticos del expediente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 diagnosticos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Diagnostico'
 *                 total:
 *                   type: integer
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/expediente/:expedienteId', 
  clerkAuth, 
  requireClerkRole(['fisioterapeuta', 'admin']), 
  getDiagnosticosByExpediente
);

export default router;
