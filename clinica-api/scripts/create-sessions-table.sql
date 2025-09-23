-- Crear tabla de sesiones
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
    
    -- Claves foráneas
    CONSTRAINT fk_sesion_usuario 
        FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario) 
        ON DELETE CASCADE
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(id_usuario);
CREATE INDEX IF NOT EXISTS idx_sesiones_fecha_creacion ON sesiones(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_sesiones_ultima_actividad ON sesiones(ultima_actividad);
CREATE INDEX IF NOT EXISTS idx_sesiones_activa ON sesiones(activa);
CREATE INDEX IF NOT EXISTS idx_sesiones_token_hash ON sesiones(token_hash);

-- Comentarios en la tabla
COMMENT ON TABLE sesiones IS 'Tabla para gestionar sesiones de usuario con control de inactividad';
COMMENT ON COLUMN sesiones.id_sesion IS 'Identificador único de la sesión (CUID)';
COMMENT ON COLUMN sesiones.id_usuario IS 'ID del usuario propietario de la sesión';
COMMENT ON COLUMN sesiones.token_hash IS 'Hash SHA256 del token JWT para almacenamiento seguro';
COMMENT ON COLUMN sesiones.fecha_creacion IS 'Fecha y hora de creación de la sesión';
COMMENT ON COLUMN sesiones.ultima_actividad IS 'Fecha y hora de la última actividad en la sesión';
COMMENT ON COLUMN sesiones.expira_en IS 'Fecha y hora de expiración de la sesión';
COMMENT ON COLUMN sesiones.activa IS 'Indica si la sesión está activa';
COMMENT ON COLUMN sesiones.ip_address IS 'Dirección IP desde la cual se creó la sesión';
COMMENT ON COLUMN sesiones.user_agent IS 'User Agent del navegador/cliente';
