-- =========================
-- CREACIÓN DE BASE DE DATOS
-- =========================
-- Crear la base de datos
CREATE DATABASE salena_fisio
    WITH ENCODING = 'UTF8';

-- ==================
-- CREACIÓN DE TABLAS
-- ==================

-- 1. Tabla Roles
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);

-- 2. Tabla Usuarios
CREATE TABLE usuarios (
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
    id_rol INT REFERENCES roles(id_rol) ON UPDATE CASCADE ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- 3. Tabla Perfiles
CREATE TABLE perfiles (
    id_perfil SERIAL PRIMARY KEY,
    id_medico INT REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    fotografia VARCHAR(255),
    experiencia_profesional TEXT,
    descripcion_breve TEXT,
    especialidad VARCHAR(100)
);

-- 4. Tabla Certificaciones
CREATE TABLE certificaciones (
    id_certificacion SERIAL PRIMARY KEY,
    nombre_certificacion VARCHAR(150) NOT NULL,
    fecha_emision DATE
);

-- 5. Tabla Perfil_Certificacion
CREATE TABLE perfil_certificacion (
    id_perfil INT REFERENCES perfiles(id_perfil) ON UPDATE CASCADE ON DELETE CASCADE,
    id_certificacion INT REFERENCES certificaciones(id_certificacion) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (id_perfil, id_certificacion)
);

-- 6. Tabla Servicios
CREATE TABLE servicios (
    id_servicio SERIAL PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2),
    activo BOOLEAN DEFAULT TRUE
);

-- 7. Tabla Perfil_Servicio
CREATE TABLE perfil_servicio (
    id_perfil INT REFERENCES perfiles(id_perfil) ON UPDATE CASCADE ON DELETE CASCADE,
    id_servicio INT REFERENCES servicios(id_servicio) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (id_perfil, id_servicio)
);

-- 8. Tabla Citas
CREATE TABLE citas (
    id_cita SERIAL PRIMARY KEY,
    fecha_cita DATE,
    id_paciente INT REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    id_medico INT REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    id_servicio INT REFERENCES servicios(id_servicio) ON UPDATE CASCADE ON DELETE SET NULL,
    descripcion TEXT,
    estado_cita VARCHAR(50)
);

-- 9. Tabla Notas_Citas
CREATE TABLE notas_citas (
    id_nota SERIAL PRIMARY KEY,
    id_cita INT REFERENCES citas(id_cita) ON UPDATE CASCADE ON DELETE CASCADE,
    nota TEXT,
    fecha_creacion DATE DEFAULT CURRENT_DATE
);

-- 10. Tabla Resultados_Citas
CREATE TABLE resultados_citas (
    id_resultado SERIAL PRIMARY KEY,
    id_cita INT REFERENCES citas(id_cita) ON UPDATE CASCADE ON DELETE CASCADE,
    resultado TEXT,
    resumen_resultado TEXT,
    fecha_registro DATE
);

-- 11. Tabla Historias_Exito
CREATE TABLE historias_exito (
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
    cedula VARCHAR(50) UNIQUE NOT NULL,
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