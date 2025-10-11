-- CreateTable
CREATE TABLE "roles" (
    "id_rol" SERIAL NOT NULL,
    "nombre_rol" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido1" VARCHAR(100) NOT NULL,
    "apellido2" VARCHAR(100),
    "fecha_nacimiento" DATE,
    "fecha_registro" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "telefono_principal" VARCHAR(20),
    "telefono_secundario" VARCHAR(20),
    "correo_electronico" VARCHAR(150) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "direccion_residencia" VARCHAR(255),
    "clerk_id" VARCHAR(100),
    "id_rol" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "perfiles" (
    "id_perfil" SERIAL NOT NULL,
    "id_medico" INTEGER NOT NULL,
    "fotografia" VARCHAR(255),
    "experiencia_profesional" TEXT,
    "descripcion_breve" TEXT,
    "especialidad" VARCHAR(100),

    CONSTRAINT "perfiles_pkey" PRIMARY KEY ("id_perfil")
);

-- CreateTable
CREATE TABLE "certificaciones" (
    "id_certificacion" SERIAL NOT NULL,
    "nombre_certificacion" VARCHAR(150) NOT NULL,
    "fecha_emision" DATE,

    CONSTRAINT "certificaciones_pkey" PRIMARY KEY ("id_certificacion")
);

-- CreateTable
CREATE TABLE "perfil_certificacion" (
    "id_perfil" INTEGER NOT NULL,
    "id_certificacion" INTEGER NOT NULL,

    CONSTRAINT "perfil_certificacion_pkey" PRIMARY KEY ("id_perfil","id_certificacion")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id_servicio" SERIAL NOT NULL,
    "nombre_servicio" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id_servicio")
);

-- CreateTable
CREATE TABLE "perfil_servicio" (
    "id_perfil" INTEGER NOT NULL,
    "id_servicio" INTEGER NOT NULL,

    CONSTRAINT "perfil_servicio_pkey" PRIMARY KEY ("id_perfil","id_servicio")
);

-- CreateTable
CREATE TABLE "citas" (
    "id_cita" SERIAL NOT NULL,
    "fecha_cita" DATE,
    "id_paciente" INTEGER NOT NULL,
    "id_medico" INTEGER NOT NULL,
    "id_servicio" INTEGER,
    "descripcion" TEXT,
    "estado_cita" VARCHAR(50),

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id_cita")
);

-- CreateTable
CREATE TABLE "notas_citas" (
    "id_nota" SERIAL NOT NULL,
    "id_cita" INTEGER NOT NULL,
    "nota" TEXT,
    "fecha_creacion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_citas_pkey" PRIMARY KEY ("id_nota")
);

-- CreateTable
CREATE TABLE "resultados_citas" (
    "id_resultado" SERIAL NOT NULL,
    "id_cita" INTEGER NOT NULL,
    "resultado" TEXT,
    "resumen_resultado" TEXT,
    "fecha_registro" DATE,

    CONSTRAINT "resultados_citas_pkey" PRIMARY KEY ("id_resultado")
);

-- CreateTable
CREATE TABLE "historias_exito" (
    "id_historia" SERIAL NOT NULL,
    "id_servicio" INTEGER,
    "id_medico" INTEGER,
    "id_paciente" INTEGER,
    "fecha_tratamiento" DATE,
    "experiencia" TEXT,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_publicacion" DATE,

    CONSTRAINT "historias_exito_pkey" PRIMARY KEY ("id_historia")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id_sesion" TEXT NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actividad" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id_sesion")
);

-- CreateTable
CREATE TABLE "encuestas" (
    "id_encuesta" SERIAL NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "id_recepcionista" INTEGER,
    "comentario" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "encuestas_pkey" PRIMARY KEY ("id_encuesta")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id_log" SERIAL NOT NULL,
    "nombre_accion" TEXT NOT NULL,
    "id_usuario" INTEGER,
    "fecha_ejecucion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id_log")
);

-- CreateTable
CREATE TABLE "expediente" (
    "id_expediente" SERIAL NOT NULL,
    "id_paciente" INTEGER NOT NULL,
    "cedula" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(50) NOT NULL,
    "id_medico" INTEGER,
    "descripcion" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expediente_pkey" PRIMARY KEY ("id_expediente")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id_documento" SERIAL NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "tipo_documento" VARCHAR(50) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_expediente" INTEGER,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id_documento")
);

-- CreateTable
CREATE TABLE "diagnostico" (
    "id_diagnostico" SERIAL NOT NULL,
    "id_paciente" INTEGER NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_doctor" INTEGER,
    "diagnostico" TEXT NOT NULL,
    "id_expediente" INTEGER,

    CONSTRAINT "diagnostico_pkey" PRIMARY KEY ("id_diagnostico")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_electronico_key" ON "usuarios"("correo_electronico");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_clerk_id_key" ON "usuarios"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_id_medico_key" ON "perfiles"("id_medico");

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_token_hash_key" ON "sesiones"("token_hash");

-- CreateIndex
CREATE INDEX "sesiones_id_usuario_idx" ON "sesiones"("id_usuario");

-- CreateIndex
CREATE INDEX "sesiones_fecha_creacion_idx" ON "sesiones"("fecha_creacion");

-- CreateIndex
CREATE INDEX "sesiones_ultima_actividad_idx" ON "sesiones"("ultima_actividad");

-- CreateIndex
CREATE INDEX "sesiones_activa_idx" ON "sesiones"("activa");

-- CreateIndex
CREATE UNIQUE INDEX "expediente_cedula_key" ON "expediente"("cedula");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id_rol") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfiles" ADD CONSTRAINT "perfiles_id_medico_fkey" FOREIGN KEY ("id_medico") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_certificacion" ADD CONSTRAINT "perfil_certificacion_id_perfil_fkey" FOREIGN KEY ("id_perfil") REFERENCES "perfiles"("id_perfil") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_certificacion" ADD CONSTRAINT "perfil_certificacion_id_certificacion_fkey" FOREIGN KEY ("id_certificacion") REFERENCES "certificaciones"("id_certificacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_servicio" ADD CONSTRAINT "perfil_servicio_id_perfil_fkey" FOREIGN KEY ("id_perfil") REFERENCES "perfiles"("id_perfil") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_servicio" ADD CONSTRAINT "perfil_servicio_id_servicio_fkey" FOREIGN KEY ("id_servicio") REFERENCES "servicios"("id_servicio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_medico_fkey" FOREIGN KEY ("id_medico") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_servicio_fkey" FOREIGN KEY ("id_servicio") REFERENCES "servicios"("id_servicio") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_citas" ADD CONSTRAINT "notas_citas_id_cita_fkey" FOREIGN KEY ("id_cita") REFERENCES "citas"("id_cita") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados_citas" ADD CONSTRAINT "resultados_citas_id_cita_fkey" FOREIGN KEY ("id_cita") REFERENCES "citas"("id_cita") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias_exito" ADD CONSTRAINT "historias_exito_id_servicio_fkey" FOREIGN KEY ("id_servicio") REFERENCES "servicios"("id_servicio") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias_exito" ADD CONSTRAINT "historias_exito_id_medico_fkey" FOREIGN KEY ("id_medico") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias_exito" ADD CONSTRAINT "historias_exito_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encuestas" ADD CONSTRAINT "encuestas_id_recepcionista_fkey" FOREIGN KEY ("id_recepcionista") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expediente" ADD CONSTRAINT "expediente_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expediente" ADD CONSTRAINT "expediente_id_medico_fkey" FOREIGN KEY ("id_medico") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_id_expediente_fkey" FOREIGN KEY ("id_expediente") REFERENCES "expediente"("id_expediente") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostico" ADD CONSTRAINT "diagnostico_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostico" ADD CONSTRAINT "diagnostico_id_doctor_fkey" FOREIGN KEY ("id_doctor") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostico" ADD CONSTRAINT "diagnostico_id_expediente_fkey" FOREIGN KEY ("id_expediente") REFERENCES "expediente"("id_expediente") ON DELETE SET NULL ON UPDATE CASCADE;
