import express from 'express';
import { clerkAuth, requireClerkRole } from '../middleware/clerkAuth.js';
import { validateId, validateAntecedentes } from '../middleware/validation.js';
import { auditMiddleware } from '../middleware/audit.js';
import { encryptSensitiveData, decryptSensitiveData } from '../middleware/encryption.js';
import { validateAntecedentesPermissions, validatePaciente, rateLimitMiddleware, validateDataIntegrity, securityLogging } from '../middleware/security.js';
import {
  createAntecedentes,
  getAntecedentes,
  updateAntecedentes,
  getHistorialAntecedentes
} from '../controllers/antecedentes.js';

const router = express.Router();

/**
 * @swagger
 * /api/pacientes/{id}/antecedentes:
 *   post:
 *     summary: Crear antecedentes clínicos para un paciente
 *     tags: [Antecedentes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               historialMedico:
 *                 type: string
 *               condicionesPreexistentes:
 *                 type: string
 *               alergiasMedicamentos:
 *                 type: string
 *               alergiasAlimentos:
 *                 type: string
 *               alergiasAmbientales:
 *                 type: string
 *               alergiasOtras:
 *                 type: string
 *               medicamentosActuales:
 *                 type: string
 *               medicamentosPrevios:
 *                 type: string
 *               cirugiasPrevias:
 *                 type: string
 *               procedimientosMedicos:
 *                 type: string
 *               hospitalizacionesPrevias:
 *                 type: string
 *               antecedentesFamiliares:
 *                 type: string
 *               habitosToxicos:
 *                 type: string
 *               urgenciasMedicas:
 *                 type: string
 *               contactoEmergenciaNombre:
 *                 type: string
 *               contactoEmergenciaTelefono:
 *                 type: string
 *               contactoEmergenciaRelacion:
 *                 type: string
 *               notasAdicionales:
 *                 type: string
 *     responses:
 *       201:
 *         description: Antecedentes creados exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/antecedentes', 
  clerkAuth, 
  requireClerkRole(['admin', 'fisioterapeuta']), 
  validateId, 
  validatePaciente,
  validateAntecedentesPermissions,
  rateLimitMiddleware(50, 15 * 60 * 1000), // 50 requests per 15 minutes
  validateDataIntegrity,
  securityLogging,
  auditMiddleware,
  validateAntecedentes, 
  createAntecedentes
);

/**
 * @swagger
 * /api/pacientes/{id}/antecedentes:
 *   get:
 *     summary: Obtener antecedentes clínicos de un paciente
 *     tags: [Antecedentes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Antecedentes obtenidos exitosamente
 *       404:
 *         description: Paciente o antecedentes no encontrados
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/antecedentes', 
  clerkAuth, 
  requireClerkRole(['admin', 'fisioterapeuta']), 
  validateId, 
  validatePaciente,
  validateAntecedentesPermissions,
  rateLimitMiddleware(100, 15 * 60 * 1000), // 100 requests per 15 minutes
  securityLogging,
  auditMiddleware,
  decryptSensitiveData,
  getAntecedentes
);

/**
 * @swagger
 * /api/pacientes/{id}/antecedentes:
 *   put:
 *     summary: Actualizar antecedentes clínicos de un paciente
 *     tags: [Antecedentes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               historialMedico:
 *                 type: string
 *               condicionesPreexistentes:
 *                 type: string
 *               alergiasMedicamentos:
 *                 type: string
 *               alergiasAlimentos:
 *                 type: string
 *               alergiasAmbientales:
 *                 type: string
 *               alergiasOtras:
 *                 type: string
 *               medicamentosActuales:
 *                 type: string
 *               medicamentosPrevios:
 *                 type: string
 *               cirugiasPrevias:
 *                 type: string
 *               procedimientosMedicos:
 *                 type: string
 *               hospitalizacionesPrevias:
 *                 type: string
 *               antecedentesFamiliares:
 *                 type: string
 *               habitosToxicos:
 *                 type: string
 *               urgenciasMedicas:
 *                 type: string
 *               contactoEmergenciaNombre:
 *                 type: string
 *               contactoEmergenciaTelefono:
 *                 type: string
 *               contactoEmergenciaRelacion:
 *                 type: string
 *               notasAdicionales:
 *                 type: string
 *     responses:
 *       200:
 *         description: Antecedentes actualizados exitosamente
 *       404:
 *         description: Paciente o antecedentes no encontrados
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/antecedentes', 
  clerkAuth, 
  requireClerkRole(['admin', 'fisioterapeuta']), 
  validateId, 
  validatePaciente,
  validateAntecedentesPermissions,
  rateLimitMiddleware(30, 15 * 60 * 1000), // 30 requests per 15 minutes
  validateDataIntegrity,
  securityLogging,
  auditMiddleware,
  validateAntecedentes, 
  updateAntecedentes
);

/**
 * @swagger
 * /api/pacientes/{id}/antecedentes/historial:
 *   get:
 *     summary: Obtener historial de cambios de antecedentes
 *     tags: [Antecedentes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Historial obtenido exitosamente
 *       404:
 *         description: Paciente o antecedentes no encontrados
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/antecedentes/historial', 
  clerkAuth, 
  requireClerkRole(['admin', 'fisioterapeuta']), 
  validateId, 
  validatePaciente,
  validateAntecedentesPermissions,
  rateLimitMiddleware(50, 15 * 60 * 1000), // 50 requests per 15 minutes
  securityLogging,
  auditMiddleware,
  getHistorialAntecedentes
);

export default router;
