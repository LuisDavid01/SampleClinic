import { z } from 'zod';

// Esquema para Expediente (mapea los campos del formulario)
export const expedienteSchema = z.object({
  descripcion: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(1000, "La descripción no puede exceder 1000 caracteres"),
  estado: z.enum(['activo', 'inactivo'], {
    message: "El estado es requerido"
  }),
  idPaciente: z.number()
    .int("El ID del paciente debe ser un número entero")
    .positive("El ID del paciente debe ser válido"),
  cedula: z.string()
    .min(3, "La cédula debe tener al menos 3 caracteres")
    .max(12, "La cédula no puede exceder 12 caracteres")
    .regex(/^[0-9]+$/, "La cédula solo puede contener números"),
  idDoctor: z.number()
    .int("El ID del doctor debe ser un número entero")
    .positive("El ID del doctor debe ser válido")
});

// Esquema para Antecedentes
export const antecedentesSchema = z.object({
  historialMedico: z.string()
    .max(2000, "Máximo 2000 caracteres")
    .optional(),
  condicionesPreexistentes: z.string()
    .min(1, "Las condiciones preexistentes son requeridas")
    .max(2000, "Máximo 2000 caracteres"),
  alergiasMedicamentos: z.string()
    .min(1, "Las alergias a medicamentos son requeridas")
    .max(1000, "Máximo 1000 caracteres"),
  alergiasAlimentos: z.string()
    .min(1, "Las alergias alimentarias son requeridas")
    .max(1000, "Máximo 1000 caracteres"),
  alergiasAmbientales: z.string()
    .max(1000, "Máximo 1000 caracteres")
    .optional(),
  alergiasOtras: z.string()
    .max(1000, "Máximo 1000 caracteres")
    .optional(),
  medicamentosActuales: z.string()
    .min(1,"los medicamentos actuales son requeridos")
    .max(2000, "Máximo 2000 caracteres"),
  medicamentosPrevios: z.string()
    .max(2000, "Máximo 2000 caracteres")
    .optional(),
  cirugiasPrevias: z.string()
    .max(2000, "Máximo 2000 caracteres")
    .optional(),
  procedimientosMedicos: z.string()
    .max(2000, "Máximo 2000 caracteres")
    .optional(),
  hospitalizacionesPrevias: z.string()
    .max(2000, "Máximo 2000 caracteres")
    .optional(),
  antecedentesFamiliares: z.string()
    .max(2000, "Máximo 2000 caracteres")
    .optional(),
  habitosToxicos: z.string()
    .max(1000, "Máximo 1000 caracteres")
    .optional(),
  urgenciasMedicas: z.string()
    .max(2000, "Máximo 2000 caracteres")
    .optional(),
  contactoEmergenciaNombre: z.string()
    .max(100, "El nombre no puede exceder 100 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/, "Solo se permiten letras y espacios")
    .optional(),
  contactoEmergenciaTelefono: z.string()
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .regex(/^[\d\s\+\-\(\)]*$/, "Solo se permiten números, espacios, +, -, ( y )")
    .optional(),
  contactoEmergenciaRelacion: z.string()
    .max(50, "La relación no puede exceder 50 caracteres")
    .optional(),
  notasAdicionales: z.string()
    .max(2000, "Máximo 2000 caracteres")
    .optional()
}).refine((data) => {
  // Validar que al menos un campo tenga contenido
  const fields = [
    data.historialMedico,
    data.condicionesPreexistentes,
    data.alergiasMedicamentos,
    data.alergiasAlimentos,
    data.alergiasAmbientales,
    data.alergiasOtras,
    data.medicamentosActuales,
    data.medicamentosPrevios,
    data.cirugiasPrevias,
    data.procedimientosMedicos,
    data.hospitalizacionesPrevias,
    data.antecedentesFamiliares,
    data.habitosToxicos,
    data.urgenciasMedicas,
    data.contactoEmergenciaNombre,
    data.contactoEmergenciaTelefono,
    data.contactoEmergenciaRelacion,
    data.notasAdicionales
  ];
  
  // Verificar que al menos un campo tenga contenido (no vacío o solo espacios)
  const hasContent = fields.some(field => field && field.trim().length > 0);
  
  return hasContent;
}, {
  message: "Debe completar al menos un campo de antecedentes médicos",
  path: ["general"] // Error general, no específico de un campo
});

// Tipos inferidos de los esquemas
export type ExpedienteFormData = z.infer<typeof expedienteSchema>;
export type AntecedentesFormData = z.infer<typeof antecedentesSchema>;
