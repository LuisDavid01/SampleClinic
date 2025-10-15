import express from 'express';
import { clerkAuth, requireClerkRole } from '../middleware/clerkAuth.js';
import { validateId } from '../middleware/validation.js';
import {
  getHistorialAuditoria,
  getEstadisticasAuditoria,
  getLogsSeguridad,
  exportarAuditoria
} from '../controllers/auditoria.js';

const router = express.Router();

/**
 * @swagger
 * /api/auditoria/pacientes/{id}/antecedentes:
 *   get:
 *     summary: Obtener historial de auditoría para un paciente
 *     tags: [Auditoría]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *           default: 20
 *         description: Límite de registros por página
 *     responses:
 *       200:
 *         description: Historial de auditoría obtenido exitosamente
 *       403:
 *         description: No tiene permisos para acceder
 *       500:
 *         description: Error interno del servidor
 */
router.get('/pacientes/:id/antecedentes', clerkAuth, requireClerkRole(['admin']), validateId, getHistorialAuditoria);

/**
 * @swagger
 * /api/auditoria/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de auditoría
 *     tags: [Auditoría]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del rango
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del rango
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: integer
 *         description: ID del usuario para filtrar
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       403:
 *         description: No tiene permisos para acceder
 *       500:
 *         description: Error interno del servidor
 */
router.get('/estadisticas', clerkAuth, requireClerkRole(['admin']), getEstadisticasAuditoria);

/**
 * @swagger
 * /api/auditoria/seguridad:
 *   get:
 *     summary: Obtener logs de seguridad
 *     tags: [Auditoría]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del rango
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del rango
 *       - in: query
 *         name: nivel
 *         schema:
 *           type: string
 *           enum: [all, high, medium]
 *           default: all
 *         description: Nivel de seguridad a filtrar
 *     responses:
 *       200:
 *         description: Logs de seguridad obtenidos exitosamente
 *       403:
 *         description: No tiene permisos para acceder
 *       500:
 *         description: Error interno del servidor
 */
router.get('/seguridad', clerkAuth, requireClerkRole(['admin']), getLogsSeguridad);

/**
 * @swagger
 * /api/auditoria/exportar:
 *   get:
 *     summary: Exportar datos de auditoría
 *     tags: [Auditoría]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del rango
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del rango
 *       - in: query
 *         name: formato
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Formato de exportación
 *     responses:
 *       200:
 *         description: Datos exportados exitosamente
 *       403:
 *         description: No tiene permisos para acceder
 *       500:
 *         description: Error interno del servidor
 */
router.get('/exportar', clerkAuth, requireClerkRole(['admin']), exportarAuditoria);

export default router;
