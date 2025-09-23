require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSessionsTable() {
  try {
    console.log('🔧 Creando tabla de sesiones...');
    
    // Crear tabla de sesiones
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS sesiones (
        id_sesion VARCHAR(255) PRIMARY KEY,
        id_usuario INTEGER NOT NULL,
        token_hash VARCHAR(255) UNIQUE NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expira_en TIMESTAMP NOT NULL,
        activa BOOLEAN DEFAULT TRUE,
        ip_address VARCHAR(45),
        user_agent TEXT,
        
        CONSTRAINT fk_sesion_usuario 
          FOREIGN KEY (id_usuario) 
          REFERENCES usuarios(id_usuario) 
          ON DELETE CASCADE
      )
    `;

    console.log('✅ Tabla de sesiones creada');

    // Crear índices
    console.log('🔧 Creando índices...');
    
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(id_usuario)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_sesiones_fecha_creacion ON sesiones(fecha_creacion)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_sesiones_ultima_actividad ON sesiones(ultima_actividad)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_sesiones_activa ON sesiones(activa)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_sesiones_token_hash ON sesiones(token_hash)`;

    console.log('✅ Índices creados');

    // Verificar que la tabla existe
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sesiones'
      )
    `;

    console.log('📊 Tabla de sesiones existe:', tableExists[0].exists);

    console.log('🎉 Tabla de sesiones configurada exitosamente');

  } catch (error) {
    console.error('❌ Error creando tabla de sesiones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSessionsTable();
