const express = require('express');
const prisma = require('../config/database');
const { clerkAuth } = require('../middleware/clerkAuth');

const router = express.Router();

/**
 * @swagger
 * /clerk/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado con Clerk
 *     tags: [Clerk]
 *     security:
 *       - clerkAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clerkUser:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "user_2abc123def456"
 *                     email:
 *                       type: string
 *                       example: "usuario@ejemplo.com"
 *                     firstName:
 *                       type: string
 *                       example: "Juan"
 *                     lastName:
 *                       type: string
 *                       example: "Pérez"
 *                     sessionId:
 *                       type: string
 *                       example: "sess_2abc123def456"
 *                     metadata:
 *                       type: object
 *                 dbUser:
 *                   type: object
 *                   properties:
 *                     idUsuario:
 *                       type: integer
 *                       example: 1
 *                     nombre:
 *                       type: string
 *                       example: "Juan"
 *                     apellido1:
 *                       type: string
 *                       example: "Pérez"
 *                     correoElectronico:
 *                       type: string
 *                       example: "usuario@ejemplo.com"
 *                     clerkId:
 *                       type: string
 *                       example: "user_2abc123def456"
 *                     rol:
 *                       type: object
 *                       properties:
 *                         idRol:
 *                           type: integer
 *                           example: 2
 *                         nombreRol:
 *                           type: string
 *                           example: "medico"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/profile', clerkAuth, syncClerkUserMiddleware, async (req, res) => {
  try {
    res.json({
      message: 'Perfil obtenido exitosamente',
      clerkUser: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        sessionId: req.user.sessionId,
        metadata: req.user.metadata
      },
      dbUser: req.dbUser ? {
        idUsuario: req.dbUser.idUsuario,
        nombre: req.dbUser.nombre,
        apellido1: req.dbUser.apellido1,
        apellido2: req.dbUser.apellido2,
        correoElectronico: req.dbUser.correoElectronico,
        clerkId: req.dbUser.clerkId,
        fechaRegistro: req.dbUser.fechaRegistro,
        activo: req.dbUser.activo,
        rol: req.dbUser.rol ? {
          idRol: req.dbUser.rol.idRol,
          nombreRol: req.dbUser.rol.nombreRol,
          descripcion: req.dbUser.rol.descripcion
        } : null
      } : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener el perfil del usuario'
    });
  }
});

module.exports = router;
