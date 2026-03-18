/*
  Warnings:

  - You are about to drop the column `id_usuario` on the `encuestas` table. All the data in the column will be lost.
  - You are about to drop the column `id_medico` on the `historias_exito` table. All the data in the column will be lost.
  - You are about to drop the column `id_servicio` on the `historias_exito` table. All the data in the column will be lost.
  - You are about to drop the `diagnostico` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[token_confirmacion]` on the table `citas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerk_id` to the `encuestas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "diagnostico" DROP CONSTRAINT "diagnostico_id_doctor_fkey";

-- DropForeignKey
ALTER TABLE "diagnostico" DROP CONSTRAINT "diagnostico_id_expediente_fkey";

-- DropForeignKey
ALTER TABLE "diagnostico" DROP CONSTRAINT "diagnostico_id_paciente_fkey";

-- DropForeignKey
ALTER TABLE "encuestas" DROP CONSTRAINT "encuestas_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "historias_exito" DROP CONSTRAINT "historias_exito_id_medico_fkey";

-- DropForeignKey
ALTER TABLE "historias_exito" DROP CONSTRAINT "historias_exito_id_servicio_fkey";

-- DropIndex
DROP INDEX "encuestas_id_usuario_idx";

-- AlterTable
ALTER TABLE "citas" ADD COLUMN     "duracion_minutos" INTEGER,
ADD COLUMN     "fecha_confirmacion" TIMESTAMP(3),
ADD COLUMN     "fecha_recordatorio_enviado" TIMESTAMP(3),
ADD COLUMN     "recordatorio_enviado" BOOLEAN DEFAULT false,
ADD COLUMN     "token_confirmacion" VARCHAR(255),
ALTER COLUMN "fecha_cita" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "id_medico" DROP NOT NULL;

-- AlterTable
ALTER TABLE "encuestas" DROP COLUMN "id_usuario",
ADD COLUMN     "clerk_id" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "historias_exito" DROP COLUMN "id_medico",
DROP COLUMN "id_servicio",
ADD COLUMN     "rating" SMALLINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "servicios" ADD COLUMN     "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fecha_modificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "diagnostico";

-- CreateTable
CREATE TABLE "evaluacion_diagnostico" (
    "id_evaluacion" SERIAL NOT NULL,
    "id_paciente" INTEGER NOT NULL,
    "id_cita" INTEGER,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_doctor" INTEGER,
    "diagnostico_principal" TEXT NOT NULL,
    "sintomas_reportados" TEXT,
    "evaluacion_fisica" TEXT,
    "plan_tratamiento" TEXT,
    "recomendaciones" TEXT,
    "id_expediente" INTEGER,

    CONSTRAINT "evaluacion_diagnostico_pkey" PRIMARY KEY ("id_evaluacion")
);

-- CreateTable
CREATE TABLE "archivos" (
    "id_archivo" SERIAL NOT NULL,
    "nombre_original" VARCHAR(255) NOT NULL,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "ruta_archivo" VARCHAR(500) NOT NULL,
    "tipo_mime" VARCHAR(100) NOT NULL,
    "tamano_archivo" INTEGER NOT NULL,
    "extension" VARCHAR(10) NOT NULL,
    "descripcion" VARCHAR(500),
    "categoria" VARCHAR(100),
    "etiquetas" VARCHAR(500),
    "es_publico" BOOLEAN NOT NULL DEFAULT false,
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_expediente" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "archivos_pkey" PRIMARY KEY ("id_archivo")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id_log" SERIAL NOT NULL,
    "id_cita" INTEGER NOT NULL,
    "tipo_email" VARCHAR(50) NOT NULL,
    "destinatario" VARCHAR(150) NOT NULL,
    "asunto" VARCHAR(255) NOT NULL,
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" VARCHAR(50) NOT NULL,
    "error_message" TEXT,
    "token_confirmacion" VARCHAR(255),

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id_log")
);

-- CreateIndex
CREATE INDEX "archivos_id_usuario_idx" ON "archivos"("id_usuario");

-- CreateIndex
CREATE INDEX "archivos_id_expediente_idx" ON "archivos"("id_expediente");

-- CreateIndex
CREATE INDEX "archivos_categoria_idx" ON "archivos"("categoria");

-- CreateIndex
CREATE INDEX "archivos_fecha_subida_idx" ON "archivos"("fecha_subida");

-- CreateIndex
CREATE INDEX "email_logs_id_cita_idx" ON "email_logs"("id_cita");

-- CreateIndex
CREATE INDEX "email_logs_tipo_email_idx" ON "email_logs"("tipo_email");

-- CreateIndex
CREATE INDEX "email_logs_fecha_envio_idx" ON "email_logs"("fecha_envio");

-- CreateIndex
CREATE INDEX "email_logs_estado_idx" ON "email_logs"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "citas_token_confirmacion_key" ON "citas"("token_confirmacion");

-- CreateIndex
CREATE INDEX "encuestas_clerk_id_idx" ON "encuestas"("clerk_id");

-- AddForeignKey
ALTER TABLE "encuestas" ADD CONSTRAINT "encuestas_clerk_id_fkey" FOREIGN KEY ("clerk_id") REFERENCES "usuarios"("clerk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_diagnostico" ADD CONSTRAINT "evaluacion_diagnostico_id_doctor_fkey" FOREIGN KEY ("id_doctor") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_diagnostico" ADD CONSTRAINT "evaluacion_diagnostico_id_expediente_fkey" FOREIGN KEY ("id_expediente") REFERENCES "expediente"("id_expediente") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_diagnostico" ADD CONSTRAINT "evaluacion_diagnostico_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_diagnostico" ADD CONSTRAINT "evaluacion_diagnostico_id_cita_fkey" FOREIGN KEY ("id_cita") REFERENCES "citas"("id_cita") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_id_expediente_fkey" FOREIGN KEY ("id_expediente") REFERENCES "expediente"("id_expediente") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_id_cita_fkey" FOREIGN KEY ("id_cita") REFERENCES "citas"("id_cita") ON DELETE CASCADE ON UPDATE CASCADE;
