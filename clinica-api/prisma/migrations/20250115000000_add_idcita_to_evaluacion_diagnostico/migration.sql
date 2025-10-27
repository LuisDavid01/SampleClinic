-- Add id_cita column to evaluacion_diagnostico table
ALTER TABLE "evaluacion_diagnostico" ADD COLUMN "id_cita" INTEGER;

-- Add foreign key constraint
ALTER TABLE "evaluacion_diagnostico" ADD CONSTRAINT "evaluacion_diagnostico_id_cita_fkey" FOREIGN KEY ("id_cita") REFERENCES "citas"("id_cita") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for better performance
CREATE INDEX "idx_evaluacion_diagnostico_id_cita" ON "evaluacion_diagnostico"("id_cita");
