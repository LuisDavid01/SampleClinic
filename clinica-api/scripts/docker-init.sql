-- Script de inicialización para Docker
-- Este script se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear la base de datos si no existe
SELECT 'CREATE DATABASE salena_fisio'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'salena_fisio')\gexec

-- Conectar a la base de datos
\c salena_fisio;

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    id_rol INTEGER REFERENCES roles(id_rol),
    activo BOOLEAN DEFAULT TRUE
);

-- 3. Tabla Perfiles
CREATE TABLE IF NOT EXISTS perfiles (
    id_perfil SERIAL PRIMARY KEY,
    id_medico INTEGER UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
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

-- 5. Tabla Perfil Certificacion
CREATE TABLE IF NOT EXISTS perfil_certificacion (
    id_perfil INTEGER REFERENCES perfiles(id_perfil) ON DELETE CASCADE,
    id_certificacion INTEGER REFERENCES certificaciones(id_certificacion) ON DELETE CASCADE,
    PRIMARY KEY (id_perfil, id_certificacion)
);

-- 6. Tabla Servicios
CREATE TABLE IF NOT EXISTS servicios (
    id_servicio SERIAL PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2),
    activo BOOLEAN DEFAULT TRUE
);

-- 7. Tabla Perfil Servicio
CREATE TABLE IF NOT EXISTS perfil_servicio (
    id_perfil INTEGER REFERENCES perfiles(id_perfil) ON DELETE CASCADE,
    id_servicio INTEGER REFERENCES servicios(id_servicio) ON DELETE CASCADE,
    PRIMARY KEY (id_perfil, id_servicio)
);

-- 8. Tabla Citas
CREATE TABLE IF NOT EXISTS citas (
    id_cita SERIAL PRIMARY KEY,
    fecha_cita DATE,
    id_paciente INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_medico INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_servicio INTEGER REFERENCES servicios(id_servicio) ON DELETE SET NULL,
    descripcion TEXT,
    estado_cita VARCHAR(50)
);

-- 9. Tabla Notas Citas
CREATE TABLE IF NOT EXISTS notas_citas (
    id_nota SERIAL PRIMARY KEY,
    id_cita INTEGER REFERENCES citas(id_cita) ON DELETE CASCADE,
    nota TEXT,
    fecha_creacion DATE DEFAULT CURRENT_DATE
);

-- 10. Tabla Resultados Citas
CREATE TABLE IF NOT EXISTS resultados_citas (
    id_resultado SERIAL PRIMARY KEY,
    id_cita INTEGER REFERENCES citas(id_cita) ON DELETE CASCADE,
    resultado TEXT,
    resumen_resultado TEXT,
    fecha_registro DATE
);

-- 11. Tabla Historias Exito
CREATE TABLE IF NOT EXISTS historias_exito (
    id_historia SERIAL PRIMARY KEY,
    id_servicio INTEGER REFERENCES servicios(id_servicio) ON DELETE SET NULL,
    id_medico INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    id_paciente INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    fecha_tratamiento DATE,
    experiencia TEXT,
    publicado BOOLEAN DEFAULT FALSE,
    fecha_publicacion DATE
);

-- 12. Tabla Sesiones
CREATE TABLE IF NOT EXISTS sesiones (
    id_sesion VARCHAR(25) PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expira_en TIMESTAMP NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- 13. Tabla Encuestas
CREATE TABLE IF NOT EXISTS encuestas (
    id_encuesta SERIAL PRIMARY KEY,
    calificacion SMALLINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Tabla Antecedentes Clínicos
CREATE TABLE IF NOT EXISTS antecedentes_clinicos (
    id_antecedente SERIAL PRIMARY KEY,
    id_paciente INTEGER UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    
    -- Historial médico general
    historial_medico TEXT,
    condiciones_preexistentes TEXT,
    
    -- Alergias específicas por tipo
    alergias_medicamentos TEXT,
    alergias_alimentos TEXT,
    alergias_ambientales TEXT,
    alergias_otras TEXT,
    
    -- Medicamentos
    medicamentos_actuales TEXT,
    medicamentos_previos TEXT,
    
    -- Cirugías con detalles
    cirugias_previas TEXT,
    procedimientos_medicos TEXT,
    
    -- Información adicional
    hospitalizaciones_previas TEXT,
    antecedentes_familiares TEXT,
    habitos_toxicos TEXT,
    
    -- Urgencias médicas
    urgencias_medicas TEXT,
    contacto_emergencia_nombre VARCHAR(100),
    contacto_emergencia_telefono VARCHAR(20),
    contacto_emergencia_relacion VARCHAR(50),
    
    -- Metadatos
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_medico_registro INTEGER REFERENCES usuarios(id_usuario),
    notas_adicionales TEXT
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo_electronico);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(id_rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_clerk_id ON usuarios(clerk_id);
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(id_paciente);
CREATE INDEX IF NOT EXISTS idx_citas_medico ON citas(id_medico);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_cita);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(id_usuario);
CREATE INDEX IF NOT EXISTS idx_sesiones_creacion ON sesiones(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_sesiones_actividad ON sesiones(ultima_actividad);
CREATE INDEX IF NOT EXISTS idx_sesiones_activa ON sesiones(activa);
CREATE INDEX IF NOT EXISTS idx_encuestas_usuario ON encuestas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_encuestas_fecha ON encuestas(fecha_registro);

-- 18. Tabla Auditoría Antecedentes
CREATE TABLE IF NOT EXISTS auditoria_antecedentes (
    id SERIAL PRIMARY KEY,
    accion VARCHAR(50) NOT NULL,
    recurso VARCHAR(50) NOT NULL,
    recurso_id INTEGER,
    metodo VARCHAR(10) NOT NULL,
    url TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id_usuario),
    usuario_info JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detalles JSONB
);

-- Índices para antecedentes clínicos
CREATE INDEX IF NOT EXISTS idx_antecedentes_paciente ON antecedentes_clinicos(id_paciente);
CREATE INDEX IF NOT EXISTS idx_antecedentes_medico ON antecedentes_clinicos(id_medico_registro);
CREATE INDEX IF NOT EXISTS idx_antecedentes_fecha_creacion ON antecedentes_clinicos(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_antecedentes_fecha_actualizacion ON antecedentes_clinicos(fecha_actualizacion);

-- Índices para auditoría de antecedentes
CREATE INDEX IF NOT EXISTS idx_auditoria_accion ON auditoria_antecedentes(accion);
CREATE INDEX IF NOT EXISTS idx_auditoria_recurso ON auditoria_antecedentes(recurso);
CREATE INDEX IF NOT EXISTS idx_auditoria_recurso_id ON auditoria_antecedentes(recurso_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria_antecedentes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON auditoria_antecedentes(timestamp);

-- Insertar datos iniciales
INSERT INTO roles (nombre_rol, descripcion) VALUES 
('admin', 'Administrador del sistema'),
('fisioterapeuta', 'Médico fisioterapeuta'),
('recepcionista', 'Recepcionista de la clínica'),
('paciente', 'Paciente de la clínica')
ON CONFLICT DO NOTHING;

-- Insertar servicios básicos
INSERT INTO servicios (nombre_servicio, descripcion, precio) VALUES 
('Consulta inicial', 'Primera consulta de evaluación', 50.00),
('Sesión de fisioterapia', 'Sesión individual de tratamiento', 40.00),
('Terapia manual', 'Técnicas manuales especializadas', 45.00),
('Rehabilitación deportiva', 'Tratamiento especializado para deportistas', 55.00)
ON CONFLICT DO NOTHING;

-- Comentarios para antecedentes clínicos
COMMENT ON TABLE antecedentes_clinicos IS 'Registro completo de antecedentes clínicos del paciente';
COMMENT ON COLUMN antecedentes_clinicos.id_paciente IS 'ID del paciente (relación uno a uno)';
COMMENT ON COLUMN antecedentes_clinicos.historial_medico IS 'Historial médico general del paciente';
COMMENT ON COLUMN antecedentes_clinicos.condiciones_preexistentes IS 'Condiciones médicas preexistentes';
COMMENT ON COLUMN antecedentes_clinicos.alergias_medicamentos IS 'Alergias a medicamentos específicos';
COMMENT ON COLUMN antecedentes_clinicos.alergias_alimentos IS 'Alergias alimentarias';
COMMENT ON COLUMN antecedentes_clinicos.alergias_ambientales IS 'Alergias ambientales (polen, polvo, etc.)';
COMMENT ON COLUMN antecedentes_clinicos.alergias_otras IS 'Otras alergias (latex, contrastes, etc.)';
COMMENT ON COLUMN antecedentes_clinicos.medicamentos_actuales IS 'Medicamentos que toma actualmente';
COMMENT ON COLUMN antecedentes_clinicos.medicamentos_previos IS 'Medicamentos que tomó anteriormente';
COMMENT ON COLUMN antecedentes_clinicos.cirugias_previas IS 'Cirugías previas con tipo, fecha y hospital';
COMMENT ON COLUMN antecedentes_clinicos.procedimientos_medicos IS 'Otros procedimientos médicos realizados';
COMMENT ON COLUMN antecedentes_clinicos.hospitalizaciones_previas IS 'Hospitalizaciones anteriores';
COMMENT ON COLUMN antecedentes_clinicos.antecedentes_familiares IS 'Historial médico familiar';
COMMENT ON COLUMN antecedentes_clinicos.habitos_toxicos IS 'Consumo de alcohol, tabaco, drogas';
COMMENT ON COLUMN antecedentes_clinicos.urgencias_medicas IS 'Información de urgencias médicas del paciente';
COMMENT ON COLUMN antecedentes_clinicos.contacto_emergencia_nombre IS 'Nombre del contacto de emergencia';
COMMENT ON COLUMN antecedentes_clinicos.contacto_emergencia_telefono IS 'Teléfono del contacto de emergencia';
COMMENT ON COLUMN antecedentes_clinicos.contacto_emergencia_relacion IS 'Relación con el paciente (familiar, amigo, etc.)';
COMMENT ON COLUMN antecedentes_clinicos.fecha_creacion IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN antecedentes_clinicos.fecha_actualizacion IS 'Fecha y hora de la última actualización';
COMMENT ON COLUMN antecedentes_clinicos.id_medico_registro IS 'ID del médico que registró los antecedentes';
COMMENT ON COLUMN antecedentes_clinicos.notas_adicionales IS 'Observaciones adicionales del médico';

-- Comentarios para auditoría de antecedentes
COMMENT ON TABLE auditoria_antecedentes IS 'Registro de auditoría para operaciones de antecedentes clínicos';
COMMENT ON COLUMN auditoria_antecedentes.accion IS 'Acción realizada (CREAR, ACTUALIZAR, CONSULTAR, ELIMINAR)';
COMMENT ON COLUMN auditoria_antecedentes.recurso IS 'Recurso afectado (ANTECEDENTES_CLINICOS)';
COMMENT ON COLUMN auditoria_antecedentes.recurso_id IS 'ID del recurso afectado (ID del paciente)';
COMMENT ON COLUMN auditoria_antecedentes.metodo IS 'Método HTTP utilizado (GET, POST, PUT, DELETE)';
COMMENT ON COLUMN auditoria_antecedentes.url IS 'URL completa de la operación';
COMMENT ON COLUMN auditoria_antecedentes.status_code IS 'Código de respuesta HTTP';
COMMENT ON COLUMN auditoria_antecedentes.usuario_id IS 'ID del usuario que realizó la acción';
COMMENT ON COLUMN auditoria_antecedentes.usuario_info IS 'Información del usuario de Clerk (JSON)';
COMMENT ON COLUMN auditoria_antecedentes.ip_address IS 'Dirección IP del cliente';
COMMENT ON COLUMN auditoria_antecedentes.user_agent IS 'User Agent del navegador/cliente';
COMMENT ON COLUMN auditoria_antecedentes.timestamp IS 'Fecha y hora de la operación';
COMMENT ON COLUMN auditoria_antecedentes.detalles IS 'Detalles de la operación (request/response sanitizados)';

-- Comentarios para tabla de encuestas
COMMENT ON TABLE encuestas IS 'Tabla para almacenar encuestas de satisfacción de usuarios';
COMMENT ON COLUMN encuestas.id_encuesta IS 'Identificador único de la encuesta';
COMMENT ON COLUMN encuestas.calificacion IS 'Calificación del 1 al 5 (1=malo, 5=excelente)';
COMMENT ON COLUMN encuestas.comentario IS 'Comentario opcional del usuario sobre la experiencia';
COMMENT ON COLUMN encuestas.id_usuario IS 'ID del usuario que completó la encuesta';
COMMENT ON COLUMN encuestas.fecha_registro IS 'Fecha y hora de registro de la encuesta';
