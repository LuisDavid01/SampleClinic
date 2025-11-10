import express from 'express';
import prisma from '../config/database.js';
import { requireOwnershipOrAdmin, authenticateToken } from '../middleware/auth.js';
import { clerkAuth, requireClerkRole } from '../middleware/clerkAuth.js';
import { ROLES } from '../constants/roles.js';
import { validateUsuario, validateUsuarioUpdate, validateId } from '../middleware/validation.js';
import { hashPassword } from '../utils/password.js';
import { auditMiddleware } from '../middleware/audit.js';

const router = express.Router();

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Obtiene la lista de usuarios con paginación y filtros. No requiere autenticación.
 *     tags: [Usuarios]
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

// GET /api/usuarios - Obtener usuarios (sin autenticación)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, rol, activo } = req.query;
    const skip = (page - 1) * limit;
    
    console.log('🔍 Parámetros de consulta:', { page, limit, search, rol, activo });

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
      // Si el rol es "paciente", buscar por ID 4 (PACIENTE)
      if (rol === 'paciente') {
        where.idRol = 4; // ROLES.PACIENTE
      } else if (rol === 'admin') {
        where.idRol = 1; // ROLES.ADMINISTRADOR
      } else if (rol === 'fisioterapeuta') {
        where.idRol = 2; // ROLES.FISIOTERAPEUTA
      } else if (rol === 'recepcionista') {
        where.idRol = 3; // ROLES.RECEPCIONISTA
      } else {
        // Fallback: buscar por nombre de rol
        where.rol = { nombreRol: rol };
      }
    }

    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    console.log('🔍 Filtros aplicados:', where);

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

    console.log('✅ Usuarios encontrados:', usuariosSinContrasena.length, 'de', total, 'total');

    res.json({
      usuarios: usuariosSinContrasena,
      total,
      pagina: parseInt(page),
      totalPaginas: Math.ceil(total / limit),
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
 * /usuarios:
 *   post:
 *     summary: Crear nuevo usuario
 *     description: Crea un nuevo usuario en el sistema. Solo los administradores pueden crear usuarios.
 *     tags: [Usuarios]
 *     security:
 *       - clerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido1
 *               - correoElectronico
 *               - contrasena
 *               - idRol
 *             properties:
 *               nombre:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nombre del usuario
 *                 example: "Juan"
 *               apellido1:
 *                 type: string
 *                 maxLength: 100
 *                 description: Primer apellido
 *                 example: "Pérez"
 *               apellido2:
 *                 type: string
 *                 maxLength: 100
 *                 description: Segundo apellido
 *                 example: "García"
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *                 description: Fecha de nacimiento
 *                 example: "1990-01-01"
 *               telefonoPrincipal:
 *                 type: string
 *                 maxLength: 20
 *                 description: Teléfono principal
 *                 example: "+506 8888-8888"
 *               telefonoSecundario:
 *                 type: string
 *                 maxLength: 20
 *                 description: Teléfono secundario
 *                 example: "+506 8888-8889"
 *               correoElectronico:
 *                 type: string
 *                 maxLength: 150
 *                 format: email
 *                 description: Correo electrónico
 *                 example: "juan.perez@email.com"
 *               contrasena:
 *                 type: string
 *                 minLength: 6
 *                 description: Contraseña del usuario
 *                 example: "password123"
 *               direccionResidencia:
 *                 type: string
 *                 maxLength: 255
 *                 description: Dirección de residencia
 *                 example: "San José, Costa Rica"
 *               idRol:
 *                 type: integer
 *                 description: ID del rol del usuario
 *                 example: 3
 *               activo:
 *                 type: boolean
 *                 description: Estado del usuario
 *                 example: true
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario creado exitosamente"
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
 *         description: Acceso denegado - solo administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflicto - correo electrónico ya existe
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
// POST /api/usuarios - Crear nuevo usuario (solo admin)
router.post('/', auditMiddleware, clerkAuth, requireClerkRole(['admin']), validateUsuario, async (req, res) => {
  try {
    const {
      nombre,
      apellido1,
      apellido2,
      fechaNacimiento,
      telefonoPrincipal,
      telefonoSecundario,
      correoElectronico,
      contrasena,
      direccionResidencia,
      idRol,
      activo = true
    } = req.body;

    // Verificar que el rol existe
    if (idRol) {
      const rol = await prisma.rol.findUnique({
        where: { idRol: parseInt(idRol) }
      });

      if (!rol) {
        return res.status(400).json({
          error: 'Rol inválido',
          message: 'El rol especificado no existe'
        });
      }
    }

    // Preparar datos para crear usuario
    const usuarioData = {
      nombre,
      apellido1,
      apellido2,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
      telefonoPrincipal,
      telefonoSecundario,
      correoElectronico,
      direccionResidencia,
      idRol: idRol ? parseInt(idRol) : null,
      activo
    };

    // Hashear la contraseña - si no se proporciona, usar valor por defecto
    if (contrasena) {
      usuarioData.contrasena = await hashPassword(contrasena);
    } else {
      // Para usuarios creados desde el portal sin contraseña
      usuarioData.contrasena = await hashPassword("Portal_Created");
    }

    const usuario = await prisma.usuario.create({
      data: usuarioData,
      include: { rol: true }
    });

    // Remover contraseña de la respuesta
    const { contrasena: _, ...usuarioSinContrasena } = usuario;

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: usuarioSinContrasena
    });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflicto de datos',
        message: 'Ya existe un usuario con este correo electrónico'
      });
    }

    console.error('Error al crear usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo crear el usuario'
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
router.get('/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { clerkId: clerkId },
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
router.put('/:id', auditMiddleware, clerkAuth, requireClerkRole(['admin']), validateId, validateUsuarioUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    console.log('🔍 Actualizando usuario:', { id, updateData });
    console.log('🔍 Usuario autenticado:', req.user?.id, req.user?.email);
    console.log('🔍 Roles del usuario:', req.user?.metadata?.role, req.user?.metadata?.roles);
    console.log('🔍 Datos recibidos del body:', req.body);
    console.log('🔍 Campos específicos:', {
      nombre: updateData.nombre,
      apellido1: updateData.apellido1,
      correoElectronico: updateData.correoElectronico,
      activo: updateData.activo
    });

    // Si se está actualizando la contraseña, hashearla
    if (updateData.contrasena) {
      updateData.contrasena = await hashPassword(updateData.contrasena);
    }

    const usuario = await prisma.usuario.update({
      where: { idUsuario: parseInt(id) },
      data: updateData,
      include: { rol: true }
    });

    console.log('✅ Usuario actualizado exitosamente:', usuario.idUsuario);

    // Remover contraseña de la respuesta
    const { contrasena, ...usuarioSinContrasena } = usuario;

    res.json({
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioSinContrasena
    });

  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error meta:', error.meta);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflicto de datos',
        message: 'Ya existe un usuario con este correo electrónico'
      });
    }

    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el usuario',
      details: error.message,
      code: error.code
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
router.delete('/:id', auditMiddleware, clerkAuth, requireClerkRole(['admin']), validateId, async (req, res) => {
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
