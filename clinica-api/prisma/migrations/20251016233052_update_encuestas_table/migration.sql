/*
  Warnings:

  - You are about to drop the column `id_recepcionista` on the `encuestas` table. All the data in the column will be lost.
  - You are about to alter the column `calificacion` on the `encuestas` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - Added the required column `id_usuario` to the `encuestas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."encuestas" DROP CONSTRAINT "encuestas_id_recepcionista_fkey";

-- AlterTable
ALTER TABLE "encuestas" DROP COLUMN "id_recepcionista",
ADD COLUMN     "id_usuario" INTEGER NOT NULL,
ALTER COLUMN "calificacion" SET DATA TYPE SMALLINT;

-- CreateIndex
CREATE INDEX "encuestas_id_usuario_idx" ON "encuestas"("id_usuario");

-- CreateIndex
CREATE INDEX "encuestas_fecha_registro_idx" ON "encuestas"("fecha_registro");

-- AddForeignKey
ALTER TABLE "encuestas" ADD CONSTRAINT "encuestas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
