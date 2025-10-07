import express from 'express';
import prisma from '../config/database.js';
import { requireOwnershipOrAdmin } from '../middleware/auth.js';
import { clerkAuth, requireClerkRole } from '../middleware/clerkAuth.js';
import { ROLES } from '../constants/roles.js';
import { validateUsuario, validateId } from '../middleware/validation.js';
import { hashPassword } from '../utils/password.js';

const router = express.Router();

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
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
 *         description: Búsqueda por nombre, apellido o email
 *       - in: query
 *         name: rol
 *         schema:
 *           type: string
 *           enum: [admin, medico, paciente]
 *         description: Filtrar por rol
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado (solo admin)
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

// GET /api/usuarios - Obtener todos los usuarios (solo admin)
router.get('/', clerkAuth, requireClerkRole([ROLES.ADMINISTRADOR]), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, rol, activo } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido1: { contains: search, mode: 'insensitive' } },
        { apellido2: { contains: search, mode: 'insensitive' } },
        { correoElectronico: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (rol) {
      where.rol = { nombreRol: rol };
    }

    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        include: { rol: true },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { fechaRegistro: 'desc' }
      }),
      prisma.usuario.count({ where })
    ]);

    // Remover contraseñas de la respuesta
    const usuariosSinContrasena = usuarios.map(({ contrasena, ...usuario }) => usuario);

    res.json({
      usuarios: usuariosSinContrasena,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los usuarios'
    });
  }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado (solo propio usuario o admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
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

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', clerkAuth, requireOwnershipOrAdmin, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { idUsuario: parseInt(id) },
      include: { 
        rol: true,
        perfil: {
          include: {
            certificaciones: {
              include: { certificacion: true }
            },
            servicios: {
              include: { servicio: true }
            }
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'No existe un usuario con el ID proporcionado'
      });
    }

    // Remover contraseña de la respuesta
    const { contrasena, ...usuarioSinContrasena } = usuario;

    res.json(usuarioSinContrasena);

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el usuario'
    });
  }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     description: Actualiza un usuario existente. Los usuarios solo pueden actualizar sus propios datos, los administradores pueden actualizar cualquier usuario.
 *     tags: [Usuarios]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 maxLength: 50
 *                 description: Nombre del usuario
 *                 example: "Juan"
 *               apellido1:
 *                 type: string
 *                 maxLength: 50
 *                 description: Primer apellido
 *                 example: "Pérez"
 *               apellido2:
 *                 type: string
 *                 maxLength: 50
 *                 description: Segundo apellido
 *                 example: "García"
 *               telefono:
 *                 type: string
 *                 maxLength: 20
 *                 description: Teléfono del usuario
 *                 example: "+1234567890"
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *                 description: Fecha de nacimiento
 *                 example: "1990-01-01"
 *               activo:
 *                 type: boolean
 *                 description: Estado del usuario
 *                 example: true
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario actualizado exitosamente"
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - no puede actualizar este usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
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
// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', clerkAuth, requireOwnershipOrAdmin, validateId, validateUsuario, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Si se está actualizando la contraseña, hashearla
    if (updateData.contrasena) {
      updateData.contrasena = await hashPassword(updateData.contrasena);
    }

    const usuario = await prisma.usuario.update({
      where: { idUsuario: parseInt(id) },
      data: updateData,
      include: { rol: true }
    });

    // Remover contraseña de la respuesta
    const { contrasena, ...usuarioSinContrasena } = usuario;

    res.json({
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioSinContrasena
    });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflicto de datos',
        message: 'Ya existe un usuario con este correo electrónico'
      });
    }

    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el usuario'
    });
  }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Desactivar usuario
 *     description: Desactiva un usuario (soft delete). Solo los administradores pueden desactivar usuarios.
 *     tags: [Usuarios]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario desactivado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario desactivado exitosamente"
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - solo administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
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
// DELETE /api/usuarios/:id - Desactivar usuario (soft delete)
router.delete('/:id', clerkAuth, requireClerkRole([ROLES.ADMINISTRADOR]), validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.update({
      where: { idUsuario: parseInt(id) },
      data: { activo: false }
    });

    res.json({
      message: 'Usuario desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo desactivar el usuario'
    });
  }
});

/**
 * @swagger
 * /usuarios/{id}/citas:
 *   get:
 *     summary: Obtener citas del usuario
 *     description: Obtiene todas las citas de un usuario específico. Los usuarios solo pueden ver sus propias citas, los administradores pueden ver las citas de cualquier usuario.
 *     tags: [Usuarios]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *         example: 1
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
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [programada, confirmada, en_progreso, completada, cancelada]
 *         description: Filtrar por estado de prisma.cita
 *     responses:
 *       200:
 *         description: Citas del usuario obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 citas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cita'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - no puede ver las citas de este usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
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
// GET /api/usuarios/:id/citas - Obtener citas del usuario
router.get('/:id/citas', clerkAuth, requireOwnershipOrAdmin, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, estado } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { idPaciente: parseInt(id) },
        { idMedico: parseInt(id) }
      ]
    };

    if (estado) {
      where.estadoCita = estado;
    }

    const [citas, total] = await Promise.all([
      prisma.cita.findMany({
        where,
        include: {
          paciente: {
            select: { idUsuario: true, nombre: true, apellido1: true, apellido2: true }
          },
          medico: {
            select: { idUsuario: true, nombre: true, apellido1: true, apellido2: true }
          },
          servicio: true
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { fechaCita: 'desc' }
      }),
      prisma.cita.count({ where })
    ]);

    res.json({
      citas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener citas del usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las citas del usuario'
    });
  }
});

export default router;
