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

-- Insertar datos iniciales
INSERT INTO roles (nombre_rol, descripcion) VALUES 
('admin', 'Administrador del sistema'),
('medico', 'Médico fisioterapeuta'),
('paciente', 'Paciente de la clínica')
ON CONFLICT DO NOTHING;

-- Insertar servicios básicos
INSERT INTO servicios (nombre_servicio, descripcion, precio) VALUES 
('Consulta inicial', 'Primera consulta de evaluación', 50.00),
('Sesión de fisioterapia', 'Sesión individual de tratamiento', 40.00),
('Terapia manual', 'Técnicas manuales especializadas', 45.00),
('Rehabilitación deportiva', 'Tratamiento especializado para deportistas', 55.00)
ON CONFLICT DO NOTHING;
