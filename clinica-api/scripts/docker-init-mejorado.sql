-- Script de inicialización mejorado para Docker
-- Este script garantiza que todas las relaciones se creen correctamente

-- Crear la base de datos si no existe
SELECT 'CREATE DATABASE salena_fisio'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'salena_fisio')\gexec

-- Conectar a la base de datos
\c salena_fisio;

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- CREACIÓN DE TABLAS EN ORDEN ESTRICTO
-- ========================================

-- 1. Tabla Roles (SIN DEPENDENCIAS)
CREATE TABLE IF NOT EXISTS roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);

-- 2. Tabla Servicios (SIN DEPENDENCIAS)
CREATE TABLE IF NOT EXISTS servicios (
    id_servicio SERIAL PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2),
    activo BOOLEAN DEFAULT TRUE
);

-- 3. Tabla Certificaciones (SIN DEPENDENCIAS)
CREATE TABLE IF NOT EXISTS certificaciones (
    id_certificacion SERIAL PRIMARY KEY,
    nombre_certificacion VARCHAR(150) NOT NULL,
    fecha_emision DATE
);

-- 4. Tabla Usuarios (DEPENDE DE ROLES)
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
    id_rol INTEGER,
    activo BOOLEAN DEFAULT TRUE
);

-- Agregar foreign key después de crear la tabla
ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_rol 
FOREIGN KEY (id_rol) REFERENCES roles(id_rol);

-- 5. Tabla Perfiles (DEPENDE DE USUARIOS)
CREATE TABLE IF NOT EXISTS perfiles (
    id_perfil SERIAL PRIMARY KEY,
    id_medico INTEGER UNIQUE,
    fotografia VARCHAR(255),
    experiencia_profesional TEXT,
    descripcion_breve TEXT,
    especialidad VARCHAR(100)
);

-- Agregar foreign key después de crear la tabla
ALTER TABLE perfiles ADD CONSTRAINT fk_perfiles_medico 
FOREIGN KEY (id_medico) REFERENCES usuarios(id_usuario) ON DELETE CASCADE;

-- 6. Tabla Perfil Certificacion (DEPENDE DE PERFILES Y CERTIFICACIONES)
CREATE TABLE IF NOT EXISTS perfil_certificacion (
    id_perfil INTEGER,
    id_certificacion INTEGER,
    PRIMARY KEY (id_perfil, id_certificacion)
);

-- Agregar foreign keys después de crear la tabla
ALTER TABLE perfil_certificacion ADD CONSTRAINT fk_perfil_cert_perfil 
FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil) ON DELETE CASCADE;
ALTER TABLE perfil_certificacion ADD CONSTRAINT fk_perfil_cert_certificacion 
FOREIGN KEY (id_certificacion) REFERENCES certificaciones(id_certificacion) ON DELETE CASCADE;

-- 7. Tabla Perfil Servicio (DEPENDE DE PERFILES Y SERVICIOS)
CREATE TABLE IF NOT EXISTS perfil_servicio (
    id_perfil INTEGER,
    id_servicio INTEGER,
    PRIMARY KEY (id_perfil, id_servicio)
);

-- Agregar foreign keys después de crear la tabla
ALTER TABLE perfil_servicio ADD CONSTRAINT fk_perfil_serv_perfil 
FOREIGN KEY (id_perfil) REFERENCES perfiles(id_perfil) ON DELETE CASCADE;
ALTER TABLE perfil_servicio ADD CONSTRAINT fk_perfil_serv_servicio 
FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE CASCADE;

-- 8. Tabla Citas (DEPENDE DE USUARIOS Y SERVICIOS)
CREATE TABLE IF NOT EXISTS citas (
    id_cita SERIAL PRIMARY KEY,
    fecha_cita TIMESTAMP, 
    duracion_minutos INTEGER DEFAULT 30, 
    id_paciente INTEGER,
    id_medico INTEGER,
    id_servicio INTEGER,
    descripcion TEXT,
    estado_cita VARCHAR(50)
);

-- Agregar foreign keys después de crear la tabla
ALTER TABLE citas ADD CONSTRAINT fk_citas_paciente 
FOREIGN KEY (id_paciente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE;
ALTER TABLE citas ADD CONSTRAINT fk_citas_medico 
FOREIGN KEY (id_medico) REFERENCES usuarios(id_usuario) ON DELETE CASCADE;
ALTER TABLE citas ADD CONSTRAINT fk_citas_servicio 
FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE SET NULL;

-- 9. Tabla Notas Citas (DEPENDE DE CITAS)
CREATE TABLE IF NOT EXISTS notas_citas (
    id_nota SERIAL PRIMARY KEY,
    id_cita INTEGER,
    nota TEXT,
    fecha_creacion DATE DEFAULT CURRENT_DATE
);

-- Agregar foreign key después de crear la tabla
ALTER TABLE notas_citas ADD CONSTRAINT fk_notas_cita 
FOREIGN KEY (id_cita) REFERENCES citas(id_cita) ON DELETE CASCADE;

-- 10. Tabla Resultados Citas (DEPENDE DE CITAS)
CREATE TABLE IF NOT EXISTS resultados_citas (
    id_resultado SERIAL PRIMARY KEY,
    id_cita INTEGER,
    resultado TEXT,
    resumen_resultado TEXT,
    fecha_registro DATE
);

-- Agregar foreign key después de crear la tabla
ALTER TABLE resultados_citas ADD CONSTRAINT fk_resultados_cita 
FOREIGN KEY (id_cita) REFERENCES citas(id_cita) ON DELETE CASCADE;

-- 11. Tabla Historias Exito (DEPENDE DE USUARIOS Y SERVICIOS)
CREATE TABLE IF NOT EXISTS historias_exito (
    id_historia SERIAL PRIMARY KEY,
    id_servicio INTEGER,
    id_medico INTEGER,
    id_paciente INTEGER,
    fecha_tratamiento DATE,
    experiencia TEXT,
    publicado BOOLEAN DEFAULT FALSE,
    fecha_publicacion DATE
);

-- Agregar foreign keys después de crear la tabla
ALTER TABLE historias_exito ADD CONSTRAINT fk_historias_servicio 
FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE SET NULL;
ALTER TABLE historias_exito ADD CONSTRAINT fk_historias_medico 
FOREIGN KEY (id_medico) REFERENCES usuarios(id_usuario) ON DELETE SET NULL;
ALTER TABLE historias_exito ADD CONSTRAINT fk_historias_paciente 
FOREIGN KEY (id_paciente) REFERENCES usuarios(id_usuario) ON DELETE SET NULL;

-- 12. Tabla Sesiones (DEPENDE DE USUARIOS)
CREATE TABLE IF NOT EXISTS sesiones (
    id_sesion VARCHAR(25) PRIMARY KEY,
    id_usuario INTEGER,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expira_en TIMESTAMP NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Agregar foreign key después de crear la tabla
ALTER TABLE sesiones ADD CONSTRAINT fk_sesiones_usuario 
FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE;

-- 13. Tabla Encuestas (DEPENDE DE USUARIOS)
CREATE TABLE IF NOT EXISTS encuestas (
    id_encuesta SERIAL PRIMARY KEY,
    calificacion SMALLINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    clerk_id VARCHAR(100) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar foreign key después de crear la tabla
ALTER TABLE encuestas ADD CONSTRAINT fk_encuestas_usuario 
FOREIGN KEY (clerk_id) REFERENCES usuarios(clerk_id) ON DELETE CASCADE;

-- 14. Tabla Antecedentes Clínicos (DEPENDE DE USUARIOS)
CREATE TABLE IF NOT EXISTS antecedentes_clinicos (
    id_antecedente SERIAL PRIMARY KEY,
    id_paciente INTEGER UNIQUE,
    historial_medico TEXT,
    condiciones_preexistentes TEXT,
    alergias_medicamentos TEXT,
    alergias_alimentos TEXT,
    alergias_ambientales TEXT,
    alergias_otras TEXT,
    medicamentos_actuales TEXT,
    medicamentos_previos TEXT,
    cirugias_previas TEXT,
    procedimientos_medicos TEXT,
    hospitalizaciones_previas TEXT,
    antecedentes_familiares TEXT,
    habitos_toxicos TEXT,
    urgencias_medicas TEXT,
    contacto_emergencia_nombre VARCHAR(100),
    contacto_emergencia_telefono VARCHAR(20),
    contacto_emergencia_relacion VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_medico_registro INTEGER,
    notas_adicionales TEXT
);

-- Agregar foreign keys después de crear la tabla
ALTER TABLE antecedentes_clinicos ADD CONSTRAINT fk_antecedentes_paciente 
FOREIGN KEY (id_paciente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE;
ALTER TABLE antecedentes_clinicos ADD CONSTRAINT fk_antecedentes_medico 
FOREIGN KEY (id_medico_registro) REFERENCES usuarios(id_usuario);

-- 15. Tabla Auditoría Antecedentes (DEPENDE DE USUARIOS)
CREATE TABLE IF NOT EXISTS auditoria_antecedentes (
    id SERIAL PRIMARY KEY,
    accion VARCHAR(50) NOT NULL,
    recurso VARCHAR(50) NOT NULL,
    recurso_id INTEGER,
    metodo VARCHAR(10) NOT NULL,
    url TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    usuario_id INTEGER,
    usuario_info JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detalles JSONB
);

-- Agregar foreign key después de crear la tabla
ALTER TABLE auditoria_antecedentes ADD CONSTRAINT fk_auditoria_antecedentes_usuario 
FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario);

-- 16. Tabla Auditoria (DEPENDE DE USUARIOS)
CREATE TABLE IF NOT EXISTS auditoria (
    id_log SERIAL PRIMARY KEY,
    nombre_accion VARCHAR(255) NOT NULL,
    id_usuario INTEGER,
    fecha_ejecucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar foreign key después de crear la tabla
ALTER TABLE auditoria ADD CONSTRAINT fk_auditoria_usuario 
FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);

-- 17. Tabla Expediente (DEPENDE DE USUARIOS)
CREATE TABLE IF NOT EXISTS expediente (
    id_expediente SERIAL PRIMARY KEY,
    id_paciente INTEGER NOT NULL,
    cedula VARCHAR(50) UNIQUE NOT NULL,
    estado VARCHAR(50) NOT NULL,
    id_medico INTEGER,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar foreign keys después de crear la tabla
ALTER TABLE expediente ADD CONSTRAINT fk_expediente_paciente 
FOREIGN KEY (id_paciente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE;
ALTER TABLE expediente ADD CONSTRAINT fk_expediente_medico 
FOREIGN KEY (id_medico) REFERENCES usuarios(id_usuario);

-- 18. Tabla Documentos (DEPENDE DE EXPEDIENTE)
CREATE TABLE IF NOT EXISTS documentos (
    id_documento SERIAL PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_expediente INTEGER
);

-- Agregar foreign key después de crear la tabla
ALTER TABLE documentos ADD CONSTRAINT fk_documentos_expediente 
FOREIGN KEY (id_expediente) REFERENCES expediente(id_expediente);

-- 19. Tabla Evaluacion Diagnostico (DEPENDE DE USUARIOS Y EXPEDIENTE)
CREATE TABLE IF NOT EXISTS evaluacion_diagnostico (
    id_evaluacion SERIAL PRIMARY KEY,
    id_paciente INTEGER NOT NULL,
    id_cita INTEGER,
    fecha DATE DEFAULT CURRENT_DATE,
    id_doctor INTEGER,
    diagnostico_principal TEXT NOT NULL,
    sintomas_reportados TEXT,
    evaluacion_fisica TEXT,
    plan_tratamiento TEXT,
    recomendaciones TEXT,
    id_expediente INTEGER
);

-- Agregar foreign keys después de crear la tabla
ALTER TABLE evaluacion_diagnostico ADD CONSTRAINT fk_evaluacion_paciente 
FOREIGN KEY (id_paciente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE;
ALTER TABLE evaluacion_diagnostico ADD CONSTRAINT fk_evaluacion_doctor 
FOREIGN KEY (id_doctor) REFERENCES usuarios(id_usuario);
ALTER TABLE evaluacion_diagnostico ADD CONSTRAINT fk_evaluacion_expediente 
FOREIGN KEY (id_expediente) REFERENCES expediente(id_expediente);
ALTER TABLE evaluacion_diagnostico ADD CONSTRAINT fk_evaluacion_cita 
FOREIGN KEY (id_cita) REFERENCES citas(id_cita) ON DELETE SET NULL;

-- 19b. Tabla Diagnostico (MANTENER PARA COMPATIBILIDAD)
CREATE TABLE IF NOT EXISTS diagnostico (
    id_diagnostico SERIAL PRIMARY KEY,
    id_paciente INTEGER NOT NULL,
    fecha DATE DEFAULT CURRENT_DATE,
    id_doctor INTEGER,
    diagnostico TEXT NOT NULL,
    id_expediente INTEGER
);

-- Agregar foreign keys después de crear la tabla
ALTER TABLE diagnostico ADD CONSTRAINT fk_diagnostico_paciente 
FOREIGN KEY (id_paciente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE;
ALTER TABLE diagnostico ADD CONSTRAINT fk_diagnostico_doctor 
FOREIGN KEY (id_doctor) REFERENCES usuarios(id_usuario);
ALTER TABLE diagnostico ADD CONSTRAINT fk_diagnostico_expediente 
FOREIGN KEY (id_expediente) REFERENCES expediente(id_expediente);

-- 20. Tabla Archivos (DEPENDE DE USUARIOS Y EXPEDIENTE)
CREATE TABLE IF NOT EXISTS archivos (
    id_archivo SERIAL PRIMARY KEY,
    nombre_original VARCHAR(255) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    tamano_archivo INTEGER NOT NULL,
    extension VARCHAR(10) NOT NULL,
    descripcion VARCHAR(500),
    categoria VARCHAR(100),
    etiquetas VARCHAR(500),
    es_publico BOOLEAN DEFAULT FALSE,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario INTEGER NOT NULL,
    id_expediente INTEGER,
    activo BOOLEAN DEFAULT TRUE
);

-- Agregar foreign keys después de crear la tabla
ALTER TABLE archivos ADD CONSTRAINT fk_archivos_usuario 
FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE;
ALTER TABLE archivos ADD CONSTRAINT fk_archivos_expediente 
FOREIGN KEY (id_expediente) REFERENCES expediente(id_expediente) ON DELETE SET NULL;

-- ========================================
-- CREAR ÍNDICES PARA RENDIMIENTO
-- ========================================

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo_electronico);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(id_rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_clerk_id ON usuarios(clerk_id);

-- Índices para citas
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(id_paciente);
CREATE INDEX IF NOT EXISTS idx_citas_medico ON citas(id_medico);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_cita);

-- Índices para sesiones
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(id_usuario);
CREATE INDEX IF NOT EXISTS idx_sesiones_creacion ON sesiones(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_sesiones_actividad ON sesiones(ultima_actividad);
CREATE INDEX IF NOT EXISTS idx_sesiones_activa ON sesiones(activa);

-- Índices para encuestas
CREATE INDEX IF NOT EXISTS idx_encuestas_clerk_id ON encuestas(clerk_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_fecha ON encuestas(fecha_registro);

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

-- Índices para archivos
CREATE INDEX IF NOT EXISTS idx_archivos_usuario ON archivos(id_usuario);
CREATE INDEX IF NOT EXISTS idx_archivos_expediente ON archivos(id_expediente);
CREATE INDEX IF NOT EXISTS idx_archivos_categoria ON archivos(categoria);
CREATE INDEX IF NOT EXISTS idx_archivos_fecha_subida ON archivos(fecha_subida);

-- Índices para expedientes
CREATE INDEX IF NOT EXISTS idx_expediente_paciente ON expediente(id_paciente);
CREATE INDEX IF NOT EXISTS idx_expediente_medico ON expediente(id_medico);
CREATE INDEX IF NOT EXISTS idx_expediente_cedula ON expediente(cedula);

-- Índices para evaluaciones y diagnósticos
CREATE INDEX IF NOT EXISTS idx_evaluacion_paciente ON evaluacion_diagnostico(id_paciente);
CREATE INDEX IF NOT EXISTS idx_evaluacion_doctor ON evaluacion_diagnostico(id_doctor);
CREATE INDEX IF NOT EXISTS idx_evaluacion_expediente ON evaluacion_diagnostico(id_expediente);
CREATE INDEX IF NOT EXISTS idx_evaluacion_fecha ON evaluacion_diagnostico(fecha);

-- Índices para diagnósticos (compatibilidad)
CREATE INDEX IF NOT EXISTS idx_diagnostico_paciente ON diagnostico(id_paciente);
CREATE INDEX IF NOT EXISTS idx_diagnostico_doctor ON diagnostico(id_doctor);
CREATE INDEX IF NOT EXISTS idx_diagnostico_expediente ON diagnostico(id_expediente);

-- ========================================
-- INSERTAR DATOS INICIALES
-- ========================================

-- Insertar roles
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

-- Insertar datos de ejemplo para citas
-- (Estos datos se insertarán solo si existen usuarios con ID 10 y 12)
INSERT INTO citas (
    id_paciente,
    id_medico,
    id_servicio,
    fecha_cita,
    descripcion,
    estado_cita
) VALUES 
(
    12, -- Paciente ID 12
    10, -- Médico ID 10
    1,  -- Servicio ID 1
    '2024-01-15',
    'Consulta inicial por dolor en hombro izquierdo',
    'completada'
),
(
    12, -- Paciente ID 12
    10, -- Médico ID 10
    2,  -- Servicio ID 2
    '2024-01-20',
    'Seguimiento por dolor en rodilla derecha',
    'completada'
),
(
    12, -- Paciente ID 12
    10, -- Médico ID 10
    1,  -- Servicio ID 1
    '2024-02-05',
    'Consulta por dolor lumbar',
    'completada'
)
ON CONFLICT DO NOTHING;

-- Insertar datos de ejemplo para evaluaciones y diagnósticos
-- (Estos datos se insertarán solo si existen usuarios con ID 10 y 12)
INSERT INTO evaluacion_diagnostico (
    id_paciente, 
    id_cita,
    id_doctor, 
    diagnostico_principal, 
    sintomas_reportados, 
    evaluacion_fisica, 
    plan_tratamiento, 
    recomendaciones, 
    fecha
) VALUES 
(
    12, 
    1, -- Asociar a la primera cita
    10, 
    'Tendinitis del supraespinoso en hombro izquierdo',
    'Dolor agudo en el hombro izquierdo, especialmente al levantar el brazo por encima de la cabeza. El dolor se intensifica durante la noche y mejora con el reposo.',
    'Examen físico revela dolor a la palpación del tendón supraespinoso, prueba de Jobe positiva, limitación del rango de movimiento en abducción a 90 grados.',
    '1. Terapia manual para reducir la tensión muscular del manguito rotador\n2. Ejercicios de fortalecimiento progresivo del supraespinoso\n3. Estiramientos específicos para el tendón supraespinoso',
    'Evitar actividades que requieran elevación del brazo por encima de 90 grados durante las primeras 2 semanas. Aplicar hielo 3 veces al día por 15-20 minutos.',
    '2024-01-15'
),
(
    12, 
    2, -- Asociar a la segunda cita
    10, 
    'Tendinitis rotuliana en rodilla derecha',
    'Dolor en la parte anterior de la rodilla derecha, especialmente al subir y bajar escaleras. El dolor se intensifica después de actividades físicas.',
    'Examen físico revela dolor a la palpación del polo inferior de la rótula, limitación del rango de movimiento en flexión de rodilla, y debilidad en el cuádriceps.',
    '1. Terapia manual para reducir la tensión muscular del cuádriceps\n2. Ejercicios de fortalecimiento excéntrico del cuádriceps\n3. Estiramientos específicos para el tendón rotuliano',
    'Evitar actividades de alto impacto como correr o saltar durante 4-6 semanas. Aplicar hielo 3 veces al día por 15-20 minutos.',
    '2024-01-20'
),
(
    12, 
    3, -- Asociar a la tercera cita
    10, 
    'Lumbalgia mecánica por sobrecarga',
    'Dolor en la región lumbar baja, especialmente al estar de pie por períodos prolongados. El dolor se irradia hacia las nalgas pero no hacia las piernas.',
    'Examen físico revela dolor a la palpación de los músculos paraespinales lumbares, limitación del rango de movimiento en flexión hacia adelante.',
    '1. Terapia manual para relajar la musculatura paraespinal\n2. Ejercicios de fortalecimiento del core y músculos estabilizadores\n3. Estiramientos específicos para la musculatura lumbar',
    'Mantener postura correcta durante el trabajo, especialmente al estar sentado. Realizar pausas activas cada 2 horas.',
    '2024-02-05'
)
ON CONFLICT DO NOTHING;

-- ========================================
-- EJECUTAR MIGRACIÓN DE EVALUACIONES
-- ========================================

-- Ejecutar migración de evaluaciones y diagnósticos
\i scripts/migracion-evaluaciones.sql

-- ========================================
-- VERIFICACIÓN FINAL DE RELACIONES
-- ========================================

-- Verificar que todas las foreign keys se crearon correctamente
DO $$
DECLARE
    fk_count INTEGER;
    tabla_count INTEGER;
BEGIN
    -- Contar foreign keys
    SELECT COUNT(*) INTO fk_count 
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_schema = 'public';
    
    -- Contar tablas
    SELECT COUNT(*) INTO tabla_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    RAISE NOTICE '✅ Base de datos inicializada correctamente';
    RAISE NOTICE '📊 Total de tablas creadas: %', tabla_count;
    RAISE NOTICE '🔗 Total de foreign keys creadas: %', fk_count;
    RAISE NOTICE '🎉 Todas las relaciones están correctamente definidas';
    RAISE NOTICE '🆕 Nueva tabla evaluacion_diagnostico creada con campos:';
    RAISE NOTICE '   - sintomas_reportados';
    RAISE NOTICE '   - evaluacion_fisica';
    RAISE NOTICE '   - plan_tratamiento';
    RAISE NOTICE '   - recomendaciones';
    RAISE NOTICE '🚀 La base de datos está lista para usar';
END $$;
