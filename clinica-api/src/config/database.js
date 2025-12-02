import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
	log: process.env.NODE_ENV === 'development' 
		? ['warn', 'error'] 
		: ['error'], // Solo errores en producción, warnings y errores en desarrollo
});

export default prisma;
