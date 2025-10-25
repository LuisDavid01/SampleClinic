-- Renombrar tabla diagnostico a evaluacion_diagnostico
ALTER TABLE diagnostico RENAME TO evaluacion_diagnostico;

-- Agregar nuevas columnas
ALTER TABLE evaluacion_diagnostico 
ADD COLUMN sintomas_reportados TEXT,
ADD COLUMN evaluacion_fisica TEXT,
ADD COLUMN plan_tratamiento TEXT,
ADD COLUMN recomendaciones TEXT;

-- Renombrar columna existente para mayor claridad
ALTER TABLE evaluacion_diagnostico 
RENAME COLUMN diagnostico TO diagnostico_principal;

-- Agregar comentarios a las columnas
COMMENT ON COLUMN evaluacion_diagnostico.sintomas_reportados IS 'Síntomas reportados por el paciente';
COMMENT ON COLUMN evaluacion_diagnostico.evaluacion_fisica IS 'Evaluación física realizada por el médico';
COMMENT ON COLUMN evaluacion_diagnostico.plan_tratamiento IS 'Plan de tratamiento propuesto';
COMMENT ON COLUMN evaluacion_diagnostico.recomendaciones IS 'Recomendaciones para el paciente';
COMMENT ON COLUMN evaluacion_diagnostico.diagnostico_principal IS 'Diagnóstico principal de la evaluación';
