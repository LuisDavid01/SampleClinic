-- CreateTable
CREATE TABLE "antecedentes_clinicos" (
    "id_antecedente" SERIAL NOT NULL,
    "id_paciente" INTEGER NOT NULL,
    "historial_medico" TEXT,
    "condiciones_preexistentes" TEXT,
    "alergias_medicamentos" TEXT,
    "alergias_alimentos" TEXT,
    "alergias_ambientales" TEXT,
    "alergias_otras" TEXT,
    "medicamentos_actuales" TEXT,
    "medicamentos_previos" TEXT,
    "cirugias_previas" TEXT,
    "procedimientos_medicos" TEXT,
    "hospitalizaciones_previas" TEXT,
    "antecedentes_familiares" TEXT,
    "habitos_toxicos" TEXT,
    "urgencias_medicas" TEXT,
    "contacto_emergencia_nombre" VARCHAR(100),
    "contacto_emergencia_telefono" VARCHAR(20),
    "contacto_emergencia_relacion" VARCHAR(50),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_medico_registro" INTEGER,
    "notas_adicionales" TEXT,

    CONSTRAINT "antecedentes_clinicos_pkey" PRIMARY KEY ("id_antecedente")
);

-- CreateIndex
CREATE UNIQUE INDEX "antecedentes_clinicos_id_paciente_key" ON "antecedentes_clinicos"("id_paciente");

-- CreateIndex
CREATE INDEX "antecedentes_clinicos_id_paciente_idx" ON "antecedentes_clinicos"("id_paciente");

-- CreateIndex
CREATE INDEX "antecedentes_clinicos_id_medico_registro_idx" ON "antecedentes_clinicos"("id_medico_registro");

-- CreateIndex
CREATE INDEX "antecedentes_clinicos_fecha_creacion_idx" ON "antecedentes_clinicos"("fecha_creacion");

-- CreateIndex
CREATE INDEX "antecedentes_clinicos_fecha_actualizacion_idx" ON "antecedentes_clinicos"("fecha_actualizacion");

-- AddForeignKey
ALTER TABLE "antecedentes_clinicos" ADD CONSTRAINT "antecedentes_clinicos_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "antecedentes_clinicos" ADD CONSTRAINT "antecedentes_clinicos_id_medico_registro_fkey" FOREIGN KEY ("id_medico_registro") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
