-- CreateTable
CREATE TABLE "auditoria_antecedentes" (
    "id" SERIAL NOT NULL,
    "accion" TEXT NOT NULL,
    "recurso" TEXT NOT NULL,
    "recurso_id" INTEGER,
    "metodo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "usuario_id" INTEGER,
    "usuario_info" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalles" JSONB,

    CONSTRAINT "auditoria_antecedentes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auditoria_antecedentes_accion_idx" ON "auditoria_antecedentes"("accion");

-- CreateIndex
CREATE INDEX "auditoria_antecedentes_recurso_idx" ON "auditoria_antecedentes"("recurso");

-- CreateIndex
CREATE INDEX "auditoria_antecedentes_recurso_id_idx" ON "auditoria_antecedentes"("recurso_id");

-- CreateIndex
CREATE INDEX "auditoria_antecedentes_usuario_id_idx" ON "auditoria_antecedentes"("usuario_id");

-- CreateIndex
CREATE INDEX "auditoria_antecedentes_timestamp_idx" ON "auditoria_antecedentes"("timestamp");

-- AddForeignKey
ALTER TABLE "auditoria_antecedentes" ADD CONSTRAINT "auditoria_antecedentes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
