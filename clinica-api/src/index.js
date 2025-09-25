import express, { json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/env.js';
const { corsOrigin, nodeEnv, port } = config;
import prisma from './config/database.js';
import { specs, swaggerUi } from './config/swagger.js';
import { authenticateToken } from './middleware/auth.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import usuarioRoutes from './routes/usuarios.js';
import citaRoutes from './routes/citas.js';
import servicioRoutes from './routes/servicios.js';
import perfilRoutes from './routes/perfiles.js';
import historiaExitoRoutes from './routes/historias-exito.js';

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
	origin: function(origin, callback) {
		// Permitir requests sin origin (como Postman, Swagger UI, etc.)
		if (!origin) return callback(null, true);

		// Permitir localhost en cualquier puerto
		if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
			return callback(null, true);
		}

		// Permitir el origin configurado
		if (origin === corsOrigin) {
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
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true }));

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

// Ruta de prueba de autenticación
app.get('/api/test-auth', authenticateToken, (req, res) => {
	res.json({
		message: 'Autenticación exitosa',
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

// Middleware de manejo de errores
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		error: 'Error interno del servidor',
		message: nodeEnv === 'development' ? err.message : 'Algo salió mal'
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
			const { default: waitForDatabase } = await import('../scripts/wait-for-db.js');
			await waitForDatabase();
		}

		// Conectar a la base de datos
		await prisma.$connect();
		console.log('✅ Conectado a la base de datos PostgreSQL');

		// Iniciar servidor
		app.listen(port, () => {
			console.log(`🚀 Servidor ejecutándose en puerto ${port}`);
			console.log(`📊 Entorno: ${nodeEnv}`);
			console.log(`🌐 URL: http://localhost:${port}`);
			console.log(`📚 Documentación API: http://localhost:${port}/api-docs`);
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

export default app;
