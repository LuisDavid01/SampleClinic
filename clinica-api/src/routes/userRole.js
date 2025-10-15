import express from 'express';
import prisma from '../config/database.js';
import { getOrCreateClerkUser } from '../utils/clerkSync.js';

const router = express.Router();

// Endpoint de prueba para verificar la conexión a la base de datos
router.get('/test', async (req, res) => {
  try {
    const count = await prisma.usuario.count();
    res.json({
      success: true,
      message: 'Conexión a la base de datos exitosa',
      totalUsuarios: count
    });
  } catch (error) {
    console.error('Error en test de conexión:', error);
    res.status(500).json({
      success: false,
      error: 'Error de conexión a la base de datos',
      details: error.message
    });
  }
});

// Endpoint de prueba para crear usuario
router.get('/create-test/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    console.log('Creando usuario de prueba con clerkId:', clerkId);
    
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: clerkId,
        nombre: 'Usuario Test',
        apellido1: 'Test',
        apellido2: '',
        correoElectronico: `${clerkId}@test.local`,
        telefono: '',
        fechaNacimiento: new Date('1990-01-01'),
        idRol: 4, // PACIENTE
        activo: true
      }
    });
    
    res.json({
      success: true,
      message: 'Usuario creado exitosamente',
      usuario: {
        idUsuario: usuario.idUsuario,
        clerkId: usuario.clerkId,
        nombre: usuario.nombre
      }
    });
  } catch (error) {
    console.error('Error creando usuario de prueba:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando usuario',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /user-role/{clerkId}:
 *   get:
 *     summary: Obtener rol de usuario por Clerk ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: clerkId
 *         required: true
 *         schema:
 *           type: string
 *         description: Clerk ID del usuario
 *     responses:
 *       200:
 *         description: Rol del usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     idUsuario:
 *                       type: integer
 *                       example: 3
 *                     nombre:
 *                       type: string
 *                       example: "Adrian"
 *                     clerkId:
 *                       type: string
 *                       example: "user_2abc123"
 *                     rol:
 *                       type: object
 *                       properties:
 *                         idRol:
 *                           type: integer
 *                           example: 2
 *                         nombreRol:
 *                           type: string
 *                           example: "Fisioterapeuta"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    console.log('Buscando usuario con clerkId:', clerkId);

    // Usar la función existente de Clerk sync para obtener o crear el usuario
    const usuario = await getOrCreateClerkUser(req);
    
    console.log('Usuario obtenido/creado:', {
      id: usuario.idUsuario,
      nombre: usuario.nombre,
      apellido1: usuario.apellido1,
      apellido2: usuario.apellido2,
      email: usuario.correoElectronico,
      clerkId: usuario.clerkId,
      rol: usuario.rol?.nombreRol
    });

    res.json({
      success: true,
      user: {
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        apellido1: usuario.apellido1,
        apellido2: usuario.apellido2,
        correoElectronico: usuario.correoElectronico,
        clerkId: usuario.clerkId,
        rol: usuario.rol ? {
          idRol: usuario.rol.idRol,
          nombreRol: usuario.rol.nombreRol
        } : null
      }
    });
  } catch (error) {
    console.error('Error obteniendo/creando rol de usuario:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message,
      code: error.code,
      meta: error.meta
    });
  }
});

export default router;
