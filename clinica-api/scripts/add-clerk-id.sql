-- Script para agregar la columna clerk_id a la tabla usuarios
-- Ejecutar este script después de actualizar el esquema de Prisma

-- Agregar la columna clerk_id
ALTER TABLE usuarios ADD COLUMN clerk_id VARCHAR(100) UNIQUE;

-- Crear índice para mejorar el rendimiento de búsquedas por clerk_id
CREATE INDEX IF NOT EXISTS idx_usuarios_clerk_id ON usuarios(clerk_id);

-- Comentario para documentar el cambio
COMMENT ON COLUMN usuarios.clerk_id IS 'ID del usuario en Clerk para autenticación externa';
