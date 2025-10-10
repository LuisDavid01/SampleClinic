-- Script de inicialización de la base de datos
-- Ejecutar este script después de crear la base de datos

-- CREACIÓN DE BASE DE DATOS
-- CREATE DATABASE salena_fisio WITH ENCODING = 'UTF8';

-- CREACIÓN DE TABLAS

-- 1. Tabla Roles
CREATE TABLE IF NOT EXISTS roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);

-- 2. Tabla Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido1 VARCHAR(100) NOT NULL,
    apellido2 VARCHAR(100),
    fecha_nacimiento DATE,
    fecha_registro DATE DEFAULT CURRENT_DATE,
    telefono_principal VARCHAR(20),
    telefono_secundario VARCHAR(20),
    correo_electronico VARCHAR(150) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    direccion_residencia VARCHAR(255),
    clerk_id VARCHAR(100) UNIQUE,
    id_rol INT REFERENCES roles(id_rol) ON UPDATE CASCADE ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- 3. Tabla Perfiles
CREATE TABLE IF NOT EXISTS perfiles (
    id_perfil SERIAL PRIMARY KEY,
    id_medico INT REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    fotografia VARCHAR(255),
    experiencia_profesional TEXT,
    descripcion_breve TEXT,
    especialidad VARCHAR(100)
);

-- 4. Tabla Certificaciones
CREATE TABLE IF NOT EXISTS certificaciones (
    id_certificacion SERIAL PRIMARY KEY,
    nombre_certificacion VARCHAR(150) NOT NULL,
    fecha_emision DATE
);

-- 5. Tabla Perfil_Certificacion
CREATE TABLE IF NOT EXISTS perfil_certificacion (
    id_perfil INT REFERENCES perfiles(id_perfil) ON UPDATE CASCADE ON DELETE CASCADE,
    id_certificacion INT REFERENCES certificaciones(id_certificacion) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (id_perfil, id_certificacion)
);

-- 6. Tabla Servicios
CREATE TABLE IF NOT EXISTS servicios (
    id_servicio SERIAL PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2),
    activo BOOLEAN DEFAULT TRUE
);

-- 7. Tabla Perfil_Servicio
CREATE TABLE IF NOT EXISTS perfil_servicio (
    id_perfil INT REFERENCES perfiles(id_perfil) ON UPDATE CASCADE ON DELETE CASCADE,
    id_servicio INT REFERENCES servicios(id_servicio) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (id_perfil, id_servicio)
);

-- 8. Tabla Citas
CREATE TABLE IF NOT EXISTS citas (
    id_cita SERIAL PRIMARY KEY,
    fecha_cita DATE,
    id_paciente INT REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    id_medico INT REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    id_servicio INT REFERENCES servicios(id_servicio) ON UPDATE CASCADE ON DELETE SET NULL,
    descripcion TEXT,
    estado_cita VARCHAR(50)
);

-- 9. Tabla Notas_Citas
CREATE TABLE IF NOT EXISTS notas_citas (
    id_nota SERIAL PRIMARY KEY,
    id_cita INT REFERENCES citas(id_cita) ON UPDATE CASCADE ON DELETE CASCADE,
    nota TEXT,
    fecha_creacion DATE DEFAULT CURRENT_DATE
);

-- 10. Tabla Resultados_Citas
CREATE TABLE IF NOT EXISTS resultados_citas (
    id_resultado SERIAL PRIMARY KEY,
    id_cita INT REFERENCES citas(id_cita) ON UPDATE CASCADE ON DELETE CASCADE,
    resultado TEXT,
    resumen_resultado TEXT,
    fecha_registro DATE
);

-- 11. Tabla Historias_Exito
CREATE TABLE IF NOT EXISTS historias_exito (
    id_historia SERIAL PRIMARY KEY,
    id_servicio INT REFERENCES servicios(id_servicio) ON UPDATE CASCADE ON DELETE SET NULL,
    id_medico INT REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE SET NULL,
    id_paciente INT REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE SET NULL,
    fecha_tratamiento DATE,
    experiencia TEXT,
    publicado BOOLEAN DEFAULT FALSE,
    fecha_publicacion DATE
);

-- 12. Tabla Encuestas
CREATE TABLE encuestas (
    id_encuesta SERIAL PRIMARY KEY,
    calificacion INT CHECK (calificacion BETWEEN 1 AND 5),
    id_recepcionista INT REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE SET NULL,
    comentario TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Tabla Auditoria
CREATE TABLE auditoria (
    id_log SERIAL PRIMARY KEY,
    nombre_accion VARCHAR(255) NOT NULL,
    id_usuario INT REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE SET NULL,
    fecha_ejecucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Tabla Expedientes_Medicos
CREATE TABLE expediente (
    id_expediente SERIAL PRIMARY KEY,
    id_paciente INT REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    cedula VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    id_medico INT REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE SET NULL,
    descripcion TEXT
	fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Tabla Documentos
CREATE TABLE documentos (
    id_documento SERIAL PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(50) CHECK (tipo_documento IN ('expediente', 'consentimiento')),
	fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    id_expediente INT REFERENCES expediente(id_expediente) ON UPDATE CASCADE ON DELETE SET NULL
);

-- 16. Tabla Diagnostico
CREATE TABLE diagnostico (
    id_diagnostico SERIAL PRIMARY KEY,
    id_paciente INT REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    fecha DATE DEFAULT CURRENT_DATE,
    id_doctor INT REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE SET NULL,
    diagnostico TEXT NOT NULL,
    id_expediente INT REFERENCES expediente(id_expediente) ON UPDATE CASCADE ON DELETE SET NULL
);

-- INSERTAR DATOS INICIALES

-- Insertar roles básicos
INSERT INTO roles (nombre_rol, descripcion) VALUES 
('admin', 'Administrador del sistema'),
('medico', 'Médico fisioterapeuta'),
('paciente', 'Paciente de la clínica')
ON CONFLICT DO NOTHING;

-- Insertar servicios básicos
INSERT INTO servicios (nombre_servicio, descripcion, precio, activo) VALUES 
('Consulta General', 'Consulta inicial de fisioterapia', 50.00, true),
('Terapia Manual', 'Tratamiento manual especializado', 80.00, true),
('Rehabilitación Deportiva', 'Rehabilitación para deportistas', 100.00, true),
('Fisioterapia Neurológica', 'Tratamiento para problemas neurológicos', 90.00, true),
('Terapia Respiratoria', 'Tratamiento para problemas respiratorios', 70.00, true)
ON CONFLICT DO NOTHING;

-- Insertar certificaciones básicas
INSERT INTO certificaciones (nombre_certificacion, fecha_emision) VALUES 
('Certificación en Terapia Manual', '2023-01-15'),
('Especialización en Rehabilitación Deportiva', '2023-03-20'),
('Certificación en Fisioterapia Neurológica', '2023-05-10'),
('Especialización en Terapia Respiratoria', '2023-07-05')
ON CONFLICT DO NOTHING;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo_electronico);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(id_rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_clerk_id ON usuarios(clerk_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_cita);
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(id_paciente);
CREATE INDEX IF NOT EXISTS idx_citas_medico ON citas(id_medico);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado_cita);
CREATE INDEX IF NOT EXISTS idx_historias_publicado ON historias_exito(publicado);
CREATE INDEX IF NOT EXISTS idx_servicios_activo ON servicios(activo);

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