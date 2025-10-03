const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const prisma = require('./config/database');
const { specs, swaggerUi } = require('./config/swagger');
const { authenticateToken } = require('./middleware/auth');
const { clerkAuth, optionalClerkAuth } = require('./middleware/clerkAuth');

// Importar rutas
const authRoutes = require('./routes/auth');
const usuarioRoutes = require('./routes/usuarios');
const citaRoutes = require('./routes/citas');
const servicioRoutes = require('./routes/servicios');
const perfilRoutes = require('./routes/perfiles');
const historiaExitoRoutes = require('./routes/historias-exito');
const clerkProfileRoutes = require('./routes/clerkProfile');

const app = express();

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Middleware de CORS
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como Postman, Swagger UI, etc.)
    if (!origin) return callback(null, true);
    
    // Permitir localhost en cualquier puerto
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Permitir el origin configurado
    if (origin === config.corsOrigin) {
      return callback(null, true);
    }
    
    callback(new Error('No permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware de logging
app.use(morgan('combined'));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Clínica Fisioterapéutica'
}));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/perfiles', perfilRoutes);
app.use('/api/historias-exito', historiaExitoRoutes);
app.use('/api/clerk', clerkProfileRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar estado del servidor
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "API de Clínica Fisioterapéutica funcionando correctamente"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 */

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API de Clínica Fisioterapéutica funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba de autenticación JWT (deprecated)
app.get('/api/test-auth', authenticateToken, (req, res) => {
  res.json({
    message: 'Autenticación JWT exitosa (deprecated)',
    user: {
      id: req.user.idUsuario,
      nombre: req.user.nombre,
      email: req.user.correoElectronico,
      rol: {
        id: req.user.rol?.idRol,
        nombre: req.user.rol?.nombreRol
      }
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /test-clerk-auth:
 *   get:
 *     summary: Probar autenticación con Clerk
 *     tags: [Clerk]
 *     security:
 *       - clerkAuth: []
 *     responses:
 *       200:
 *         description: Autenticación Clerk exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Autenticación Clerk exitosa"
 *                 user:
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
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Token de autorización requerido o inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token de autorización requerido"
 *                 message:
 *                   type: string
 *                   example: "Debe proporcionar un token Bearer válido"
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Obtener información del usuario actual
 *     tags: [Clerk]
 *     security:
 *       - clerkAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Información del usuario actual"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "user_30KfM9ZKYFQjNC7TqzVLzfSt8Vi"
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
 *                       example: "sess_33ZSrfIln5SnNs33P5ajCYrufQ2"
 *                     metadata:
 *                       type: object
 *                       example: {}
 *                     tokenPayload:
 *                       type: object
 *                       properties:
 *                         sub:
 *                           type: string
 *                           example: "user_30KfM9ZKYFQjNC7TqzVLzfSt8Vi"
 *                         sid:
 *                           type: string
 *                           example: "sess_33ZSrfIln5SnNs33P5ajCYrufQ2"
 *                         exp:
 *                           type: number
 *                           example: 1759523014
 *                         iat:
 *                           type: number
 *                           example: 1759522954
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Token de autorización inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token de autorización requerido"
 *                 message:
 *                   type: string
 *                   example: "Debe proporcionar un token Bearer válido"
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /test-clerk-auth:
 *   post:
 *     summary: Probar autenticación con Clerk (POST con datos del usuario)
 *     tags: [Clerk]
 *     security:
 *       - clerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "user_30KfM9ZKYFQjNC7TqzVLzfSt8Vi"
 *                   email:
 *                     type: string
 *                     example: "usuario@ejemplo.com"
 *                   firstName:
 *                     type: string
 *                     example: "Juan"
 *                   lastName:
 *                     type: string
 *                     example: "Pérez"
 *                   metadata:
 *                     type: object
 *                     example: {}
 *     responses:
 *       200:
 *         description: Autenticación Clerk exitosa con datos del frontend
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Autenticación Clerk exitosa con datos del frontend"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "user_30KfM9ZKYFQjNC7TqzVLzfSt8Vi"
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
 *                       example: "sess_33ZSrfIln5SnNs33P5ajCYrufQ2"
 *                     metadata:
 *                       type: object
 *                       example: {}
 *                 frontendData:
 *                   type: object
 *                   description: "Datos enviados desde el frontend"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Token de autorización inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token de autorización requerido"
 *                 message:
 *                   type: string
 *                   example: "Debe proporcionar un token Bearer válido"
 *       500:
 *         description: Error interno del servidor
 */
// Endpoint para obtener información del usuario actual
app.get('/api/user/me', clerkAuth, (req, res) => {
  res.json({
    message: 'Información del usuario actual',
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      apellido1: req.user.apellido1,
      apellido2: req.user.apellido2,
      sessionId: req.user.sessionId,
      metadata: req.user.metadata,
      tokenPayload: req.user.tokenPayload
    },
    timestamp: new Date().toISOString()
  });
});



// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: config.nodeEnv === 'development' ? err.message : 'Algo salió mal'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`
  });
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // En Docker, esperar a que la base de datos esté lista
    if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('postgres:')) {
      const waitForDatabase = require('../scripts/wait-for-db');
      await waitForDatabase();
    }
    
    // Conectar a la base de datos
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos PostgreSQL');
    
    // Iniciar servidor
    app.listen(config.port, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${config.port}`);
      console.log(`📊 Entorno: ${config.nodeEnv}`);
      console.log(`🌐 URL: http://localhost:${config.port}`);
      console.log(`📚 Documentación API: http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

// Iniciar servidor
startServer();

module.exports = app;
