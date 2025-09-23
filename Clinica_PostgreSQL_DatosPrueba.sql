-- ===========================================
-- INSERTS DE PRUEBA PARA CLÍNICA FISIOTERAPIA
-- ===========================================

-- 1. Roles
INSERT INTO roles (nombre_rol, descripcion) VALUES
('Administrador', 'Gestión total del sistema'),
('Fisioterapeuta', 'Profesional de la salud encargado de terapias'),
('Recepcionista', 'Atención al cliente y gestión de citas'),
('Paciente', 'Usuarios que reciben los servicios');

-- 2. Usuarios
INSERT INTO usuarios (nombre, apellido1, apellido2, fecha_nacimiento, telefono_principal, correo_electronico, contrasena, direccion_residencia, id_rol)
VALUES
('María', 'González', 'Rojas', '1985-03-12', '88888888', 'maria.admin@fisio.com', 'admin123', 'San José', 1),
('Andrés', 'Ramírez', 'Lopez', '1990-07-21', '89999999', 'andres.fisio@fisio.com', 'fisio123', 'Alajuela', 2),
('Laura', 'Cordero', 'Mata', '1988-09-10', '87777777', 'laura.fisio@fisio.com', 'fisio456', 'Heredia', 2),
('Carlos', 'Jiménez', 'Vega', '1995-02-05', '86666666', 'carlos.paciente@fisio.com', 'paciente123', 'Cartago', 4),
('Ana', 'Soto', 'Campos', '2000-05-15', '85555555', 'ana.paciente@fisio.com', 'paciente456', 'Puntarenas', 4);

-- 3. Perfiles
INSERT INTO perfiles (id_medico, fotografia, experiencia_profesional, descripcion_breve, especialidad)
VALUES
(2, 'foto_andres.jpg', '10 años de experiencia en rehabilitación deportiva', 'Especialista en lesiones musculares', 'Rehabilitación Deportiva'),
(3, 'foto_laura.jpg', '8 años de experiencia en terapia ocupacional', 'Terapias innovadoras para adultos mayores', 'Terapia Ocupacional');

-- 4. Certificaciones
INSERT INTO certificaciones (nombre_certificacion, fecha_emision) VALUES
('Certificación en Terapia Manual', '2020-06-15'),
('Certificación en Rehabilitación Neurológica', '2021-03-20'),
('Certificación en Vendaje Neuromuscular', '2022-11-05');

-- 5. Perfil_Certificación
INSERT INTO perfil_certificacion (id_perfil, id_certificacion) VALUES
(1,1), (1,2),
(2,2), (2,3);

-- 6. Servicios
INSERT INTO servicios (nombre_servicio, descripcion, precio) VALUES
('Rehabilitación Deportiva', 'Sesiones de fisioterapia para deportistas lesionados', 25000.00),
('Terapia Ocupacional', 'Programas de terapia para adultos mayores', 20000.00),
('Terapia Manual', 'Técnicas manuales para recuperación muscular', 22000.00);

-- 7. Perfil_Servicio
INSERT INTO perfil_servicio (id_perfil, id_servicio) VALUES
(1,1), (1,3),
(2,2), (2,3);

-- 8. Citas
INSERT INTO citas (fecha_cita, id_paciente, id_medico, id_servicio, descripcion, estado_cita) VALUES
('2025-09-20', 4, 2, 1, 'Primera evaluación tras lesión de rodilla', 'Programada'),
('2025-09-22', 5, 3, 2, 'Sesión de terapia ocupacional post-cirugía', 'Programada');

-- 9. Notas_Citas
INSERT INTO notas_citas (id_cita, nota) VALUES
(1, 'Paciente presenta inflamación moderada, aplicar hielo'),
(2, 'Realizar ejercicios de movilidad suave');

-- 10. Resultados_Citas
INSERT INTO resultados_citas (id_cita, resultado, resumen_resultado, fecha_registro) VALUES
(1, 'Mejoría en la flexión de rodilla en 15%', 'Paciente responde bien al tratamiento inicial', '2025-09-21'),
(2, 'Recuperación funcional del 30%', 'Paciente muestra avances en movilidad', '2025-09-23');

-- 11. Historias_Exito
INSERT INTO historias_exito (id_servicio, id_medico, id_paciente, fecha_tratamiento, experiencia, publicado, fecha_publicacion) VALUES
(1, 2, 4, '2025-08-10', 'Tras varias sesiones, Carlos recuperó movilidad completa en la rodilla.', TRUE, '2025-09-01'),
(2, 3, 5, '2025-08-15', 'Ana logró recuperar la funcionalidad de su brazo tras la cirugía.', FALSE, NULL);