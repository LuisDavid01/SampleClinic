-- Script de migración para evaluaciones y diagnósticos
-- Este script se ejecuta automáticamente al levantar la base de datos

-- Verificar si la tabla evaluacion_diagnostico ya existe
DO $$
BEGIN
    -- Crear tabla evaluacion_diagnostico si no existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'evaluacion_diagnostico') THEN
        CREATE TABLE evaluacion_diagnostico (
            id_evaluacion SERIAL PRIMARY KEY,
            id_paciente INTEGER NOT NULL,
            fecha DATE DEFAULT CURRENT_DATE,
            id_doctor INTEGER,
            diagnostico_principal TEXT NOT NULL,
            sintomas_reportados TEXT,
            evaluacion_fisica TEXT,
            plan_tratamiento TEXT,
            recomendaciones TEXT,
            id_expediente INTEGER
        );

        -- Agregar foreign keys
        ALTER TABLE evaluacion_diagnostico ADD CONSTRAINT fk_evaluacion_paciente 
        FOREIGN KEY (id_paciente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE;
        ALTER TABLE evaluacion_diagnostico ADD CONSTRAINT fk_evaluacion_doctor 
        FOREIGN KEY (id_doctor) REFERENCES usuarios(id_usuario);
        ALTER TABLE evaluacion_diagnostico ADD CONSTRAINT fk_evaluacion_expediente 
        FOREIGN KEY (id_expediente) REFERENCES expediente(id_expediente);

        -- Crear índices
        CREATE INDEX IF NOT EXISTS idx_evaluacion_paciente ON evaluacion_diagnostico(id_paciente);
        CREATE INDEX IF NOT EXISTS idx_evaluacion_doctor ON evaluacion_diagnostico(id_doctor);
        CREATE INDEX IF NOT EXISTS idx_evaluacion_expediente ON evaluacion_diagnostico(id_expediente);
        CREATE INDEX IF NOT EXISTS idx_evaluacion_fecha ON evaluacion_diagnostico(fecha);

        RAISE NOTICE '✅ Tabla evaluacion_diagnostico creada exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ Tabla evaluacion_diagnostico ya existe';
    END IF;
END $$;

-- Migrar datos existentes de diagnostico a evaluacion_diagnostico si es necesario
DO $$
DECLARE
    diagnosticos_count INTEGER;
    evaluaciones_count INTEGER;
BEGIN
    -- Contar registros en ambas tablas
    SELECT COUNT(*) INTO diagnosticos_count FROM diagnostico;
    SELECT COUNT(*) INTO evaluaciones_count FROM evaluacion_diagnostico;
    
    -- Si hay diagnósticos pero no evaluaciones, migrar datos
    IF diagnosticos_count > 0 AND evaluaciones_count = 0 THEN
        INSERT INTO evaluacion_diagnostico (
            id_paciente,
            fecha,
            id_doctor,
            diagnostico_principal,
            id_expediente
        )
        SELECT 
            id_paciente,
            fecha,
            id_doctor,
            diagnostico,
            id_expediente
        FROM diagnostico;
        
        RAISE NOTICE '✅ Migración de datos completada: % registros migrados', diagnosticos_count;
    ELSE
        RAISE NOTICE 'ℹ️ No se requiere migración de datos';
    END IF;
END $$;

-- Insertar datos de ejemplo si no existen
DO $$
DECLARE
    evaluaciones_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO evaluaciones_count FROM evaluacion_diagnostico;
    
    -- Solo insertar datos de ejemplo si no hay evaluaciones
    IF evaluaciones_count = 0 THEN
        -- Verificar que existen usuarios con ID 10 y 12
        IF EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = 10) AND 
           EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = 12) THEN
            
            INSERT INTO evaluacion_diagnostico (
                id_paciente, 
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
                10, 
                'Lumbalgia mecánica por sobrecarga',
                'Dolor en la región lumbar baja, especialmente al estar de pie por períodos prolongados. El dolor se irradia hacia las nalgas pero no hacia las piernas.',
                'Examen físico revela dolor a la palpación de los músculos paraespinales lumbares, limitación del rango de movimiento en flexión hacia adelante.',
                '1. Terapia manual para relajar la musculatura paraespinal\n2. Ejercicios de fortalecimiento del core y músculos estabilizadores\n3. Estiramientos específicos para la musculatura lumbar',
                'Mantener postura correcta durante el trabajo, especialmente al estar sentado. Realizar pausas activas cada 2 horas.',
                '2024-02-05'
            );
            
            RAISE NOTICE '✅ Datos de ejemplo insertados exitosamente';
        ELSE
            RAISE NOTICE '⚠️ No se pueden insertar datos de ejemplo: usuarios con ID 10 y 12 no encontrados';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Ya existen evaluaciones en la tabla, no se insertan datos de ejemplo';
    END IF;
END $$;

-- Verificación final
DO $$
DECLARE
    total_evaluaciones INTEGER;
    total_diagnosticos INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_evaluaciones FROM evaluacion_diagnostico;
    SELECT COUNT(*) INTO total_diagnosticos FROM diagnostico;
    
    RAISE NOTICE '🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '📊 Total evaluaciones: %', total_evaluaciones;
    RAISE NOTICE '📊 Total diagnósticos originales: %', total_diagnosticos;
    RAISE NOTICE '🆕 Nueva estructura de evaluaciones y diagnósticos lista';
    RAISE NOTICE '🚀 Endpoints disponibles:';
    RAISE NOTICE '   - GET /api/evaluacion-diagnostico/paciente/{id}';
    RAISE NOTICE '   - GET /api/evaluacion-diagnostico/{id}';
    RAISE NOTICE '   - POST /api/evaluacion-diagnostico';
END $$;
