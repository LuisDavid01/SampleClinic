import dotenv from 'dotenv';

dotenv.config();

const config = {
	port: process.env.PORT || 3001,
	nodeEnv: process.env.NODE_ENV || 'development',
	databaseUrl: process.env.DATABASE_URL,
	jwtSecret: process.env.JWT_SECRET,
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
	corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
	// Email Configuration
	smtp: {
		host: process.env.SMTP_HOST || 'smtp.gmail.com',
		port: parseInt(process.env.SMTP_PORT || '587'),
		secure: process.env.SMTP_SECURE === 'true',
		auth: {
			user: process.env.SMTP_USER || '',
			pass: process.env.SMTP_PASS || ''
		}
	},
	email: {
		from: process.env.EMAIL_FROM || 'noreply@clinicaestebanporras.com',
		fromName: process.env.EMAIL_FROM_NAME || 'Clínica Esteban Porras'
	},
	frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
	recordatorio: {
		diasAntes: parseInt(process.env.RECORDATORIO_DIAS_ANTES || '2'),
		cronSchedule: process.env.CRON_SCHEDULE_RECORDATORIOS || '0 9 * * *'
	}
};

export default config;
