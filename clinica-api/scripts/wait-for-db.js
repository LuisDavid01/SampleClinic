const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function waitForDatabase() {
  console.log('Esperando a que la base de datos esté disponible...');
  
  let retries = 0;
  const maxRetries = 30;
  const retryDelay = 2000; // 2 segundos

  while (retries < maxRetries) {
    try {
      await prisma.$connect();
      console.log('✅ Base de datos conectada exitosamente');
      
      // Verificar que las tablas existan
      await prisma.$queryRaw`SELECT 1 FROM roles LIMIT 1`;
      console.log('✅ Tablas de la base de datos verificadas');
      
      await prisma.$disconnect();
      return true;
    } catch (error) {
      retries++;
      console.log(`❌ Intento ${retries}/${maxRetries} falló: ${error.message}`);
      
      if (retries >= maxRetries) {
        console.error('❌ No se pudo conectar a la base de datos después de', maxRetries, 'intentos');
        process.exit(1);
      }
      
      console.log(`⏳ Esperando ${retryDelay/1000} segundos antes del siguiente intento...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

module.exports = waitForDatabase;
