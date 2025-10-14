'use client';

import { useState, useEffect, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { AntecedenteFormData, AntecedenteClinico, AntecedenteSection, AntecedenteField } from '@/types/Antecedentes';
import { createAntecedentes, updateAntecedentes } from '@/actions/antecedentes';

// Verificar importaciones
console.log('🔍 [IMPORT] updateAntecedentes importado:', typeof updateAntecedentes);
console.log('🔍 [IMPORT] createAntecedentes importado:', typeof createAntecedentes);

// Esquema de validación
const antecedenteSchema = z.object({
  historialMedico: z.string().max(2000, 'El historial médico no puede exceder 2000 caracteres').optional(),
  condicionesPreexistentes: z.string().max(2000, 'Las condiciones preexistentes no pueden exceder 2000 caracteres').optional(),
  alergiasMedicamentos: z.string().max(1000, 'Las alergias a medicamentos no pueden exceder 1000 caracteres').optional(),
  alergiasAlimentos: z.string().max(1000, 'Las alergias alimentarias no pueden exceder 1000 caracteres').optional(),
  alergiasAmbientales: z.string().max(1000, 'Las alergias ambientales no pueden exceder 1000 caracteres').optional(),
  alergiasOtras: z.string().max(1000, 'Otras alergias no pueden exceder 1000 caracteres').optional(),
  medicamentosActuales: z.string().max(2000, 'Los medicamentos actuales no pueden exceder 2000 caracteres').optional(),
  medicamentosPrevios: z.string().max(2000, 'Los medicamentos previos no pueden exceder 2000 caracteres').optional(),
  cirugiasPrevias: z.string().max(2000, 'Las cirugías previas no pueden exceder 2000 caracteres').optional(),
  procedimientosMedicos: z.string().max(2000, 'Los procedimientos médicos no pueden exceder 2000 caracteres').optional(),
  hospitalizacionesPrevias: z.string().max(2000, 'Las hospitalizaciones previas no pueden exceder 2000 caracteres').optional(),
  antecedentesFamiliares: z.string().max(2000, 'Los antecedentes familiares no pueden exceder 2000 caracteres').optional(),
  habitosToxicos: z.string().max(1000, 'Los hábitos tóxicos no pueden exceder 1000 caracteres').optional(),
  urgenciasMedicas: z.string().max(1000, 'Las urgencias médicas no pueden exceder 1000 caracteres').optional().transform((val) => {
    console.log('🔍 [ZOD] urgenciasMedicas recibido:', val, typeof val);
    return val;
  }),
  contactoEmergenciaNombre: z.string().max(100, 'El nombre del contacto de emergencia no puede exceder 100 caracteres').optional(),
  contactoEmergenciaTelefono: z.string().max(20, 'El teléfono del contacto de emergencia no puede exceder 20 caracteres').optional().transform((val) => {
    console.log('🔍 [ZOD] contactoEmergenciaTelefono recibido:', val, typeof val);
    return val;
  }),
  contactoEmergenciaRelacion: z.string().max(50, 'La relación del contacto de emergencia no puede exceder 50 caracteres').optional(),
  notasAdicionales: z.string().max(2000, 'Las notas adicionales no pueden exceder 2000 caracteres').optional().transform((val) => {
    console.log('🔍 [ZOD] notasAdicionales recibido:', val, typeof val);
    return val;
  }),
});

interface AntecedentesFormProps {
  pacienteId: number;
  antecedente?: AntecedenteClinico;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Configuración de secciones del formulario
const secciones: AntecedenteSection[] = [
  {
    id: 'informacion-general',
    title: 'Información General',
    description: 'Historial médico y condiciones preexistentes',
    fields: [
      { name: 'historialMedico', label: 'Historial Médico', type: 'textarea', rows: 4, maxLength: 2000 },
      { name: 'condicionesPreexistentes', label: 'Condiciones Preexistentes', type: 'textarea', rows: 4, maxLength: 2000 }
    ]
  },
  {
    id: 'alergias',
    title: 'Alergias',
    description: 'Información sobre alergias del paciente',
    fields: [
      { name: 'alergiasMedicamentos', label: 'Alergias a Medicamentos', type: 'textarea', rows: 3, maxLength: 1000 },
      { name: 'alergiasAlimentos', label: 'Alergias Alimentarias', type: 'textarea', rows: 3, maxLength: 1000 },
      { name: 'alergiasAmbientales', label: 'Alergias Ambientales', type: 'textarea', rows: 3, maxLength: 1000 },
      { name: 'alergiasOtras', label: 'Otras Alergias', type: 'textarea', rows: 3, maxLength: 1000 }
    ]
  },
  {
    id: 'medicamentos',
    title: 'Medicamentos',
    description: 'Medicamentos actuales y previos',
    fields: [
      { name: 'medicamentosActuales', label: 'Medicamentos Actuales', type: 'textarea', rows: 4, maxLength: 2000 },
      { name: 'medicamentosPrevios', label: 'Medicamentos Previos', type: 'textarea', rows: 4, maxLength: 2000 }
    ]
  },
  {
    id: 'cirugias',
    title: 'Historial de Cirugías',
    description: 'Cirugías y procedimientos médicos',
    fields: [
      { name: 'cirugiasPrevias', label: 'Cirugías Previas', type: 'textarea', rows: 4, maxLength: 2000 },
      { name: 'procedimientosMedicos', label: 'Procedimientos Médicos', type: 'textarea', rows: 4, maxLength: 2000 },
      { name: 'hospitalizacionesPrevias', label: 'Hospitalizaciones Previas', type: 'textarea', rows: 4, maxLength: 2000 }
    ]
  },
  {
    id: 'condiciones-cronicas',
    title: 'Condiciones Crónicas',
    description: 'Antecedentes familiares y hábitos',
    fields: [
      { name: 'antecedentesFamiliares', label: 'Antecedentes Familiares', type: 'textarea', rows: 4, maxLength: 2000 },
      { name: 'habitosToxicos', label: 'Hábitos Tóxicos', type: 'textarea', rows: 3, maxLength: 1000 }
    ]
  },
  {
    id: 'emergencias',
    title: 'Información de Emergencia',
    description: 'Contacto de emergencia y urgencias médicas',
    fields: [
      { name: 'urgenciasMedicas', label: 'Urgencias Médicas', type: 'textarea', rows: 3, maxLength: 1000 },
      { name: 'contactoEmergenciaNombre', label: 'Nombre del Contacto', type: 'text', maxLength: 100 },
      { name: 'contactoEmergenciaTelefono', label: 'Teléfono de Emergencia', type: 'tel', maxLength: 20 },
      { name: 'contactoEmergenciaRelacion', label: 'Relación', type: 'text', maxLength: 50 }
    ]
  },
  {
    id: 'notas-adicionales',
    title: 'Notas Adicionales',
    description: 'Información adicional relevante',
    fields: [
      { name: 'notasAdicionales', label: 'Notas Adicionales', type: 'textarea', rows: 4, maxLength: 2000 }
    ]
  }
];

export default function AntecedentesForm({ pacienteId, antecedente, onSuccess, onCancel }: AntecedentesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');


  const form = useForm<AntecedenteFormData>({
    resolver: zodResolver(antecedenteSchema),
    defaultValues: antecedente ? {
      historialMedico: antecedente.historialMedico || '',
      condicionesPreexistentes: antecedente.condicionesPreexistentes || '',
      alergiasMedicamentos: antecedente.alergiasMedicamentos || '',
      alergiasAlimentos: antecedente.alergiasAlimentos || '',
      alergiasAmbientales: antecedente.alergiasAmbientales || '',
      alergiasOtras: antecedente.alergiasOtras || '',
      medicamentosActuales: antecedente.medicamentosActuales || '',
      medicamentosPrevios: antecedente.medicamentosPrevios || '',
      cirugiasPrevias: antecedente.cirugiasPrevias || '',
      procedimientosMedicos: antecedente.procedimientosMedicos || '',
      hospitalizacionesPrevias: antecedente.hospitalizacionesPrevias || '',
      antecedentesFamiliares: antecedente.antecedentesFamiliares || '',
      habitosToxicos: antecedente.habitosToxicos || '',
      urgenciasMedicas: antecedente.urgenciasMedicas ?? '',
      contactoEmergenciaNombre: antecedente.contactoEmergenciaNombre ?? '',
      contactoEmergenciaTelefono: antecedente.contactoEmergenciaTelefono ?? '',
      contactoEmergenciaRelacion: antecedente.contactoEmergenciaRelacion ?? '',
      notasAdicionales: antecedente.notasAdicionales ?? '',
    } : {}
  });

  // Handler para errores de validación
  const onError = (errors: any) => {
    // Manejo de errores de validación
  };

  const onSubmit = async (data: AntecedenteFormData) => {
    console.log('🚀 [ONSUBMIT] ===== INICIANDO onSubmit =====');
    console.log('🚀 [ONSUBMIT] onSubmit EJECUTÁNDOSE - ESTE LOG DEBE APARECER');
    console.log('🚀 [ONSUBMIT] onSubmit EJECUTÁNDOSE - ESTE LOG DEBE APARECER - SEGUNDA VEZ');
    console.log('🚀 [ONSUBMIT] onSubmit EJECUTÁNDOSE - ESTE LOG DEBE APARECER - TERCERA VEZ');
    console.log('🚀 [ONSUBMIT] onSubmit EJECUTÁNDOSE - ESTE LOG DEBE APARECER - CUARTA VEZ');
    console.log('🔍 [ONSUBMIT] Datos recibidos de Zod:', data);
    console.log('🔍 [ONSUBMIT] Valores específicos:');
    console.log('- urgenciasMedicas:', data.urgenciasMedicas, typeof data.urgenciasMedicas);
    console.log('- contactoEmergenciaTelefono:', data.contactoEmergenciaTelefono, typeof data.contactoEmergenciaTelefono);
    console.log('- notasAdicionales:', data.notasAdicionales, typeof data.notasAdicionales);
    
    // Transformar datos para asegurar que los campos vacíos se envían como cadenas vacías
    const transformedData = {
      ...data,
      // Mantener valores reales, solo convertir undefined/null a cadenas vacías
      contactoEmergenciaNombre: data.contactoEmergenciaNombre || '',
      contactoEmergenciaTelefono: data.contactoEmergenciaTelefono || '',
      contactoEmergenciaRelacion: data.contactoEmergenciaRelacion || '',
      urgenciasMedicas: data.urgenciasMedicas || '',
      notasAdicionales: data.notasAdicionales || ''
    };
    
    console.log('🔄 [ONSUBMIT] Datos transformados para envío:', transformedData);
    console.log('📞 [ONSUBMIT] Llamando a updateAntecedentes...');
    console.log('📞 [ONSUBMIT] Paciente ID:', pacienteId);
    console.log('📞 [ONSUBMIT] Datos a enviar:', transformedData);
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      console.log('🚀 [ONSUBMIT] Ejecutando updateAntecedentes...');
      console.log('🚀 [ONSUBMIT] Antecedente existe:', !!antecedente);
      console.log('🚀 [ONSUBMIT] Paciente ID:', pacienteId);
      console.log('🚀 [ONSUBMIT] Datos a enviar:', transformedData);
      
      console.log('📞 [ONSUBMIT] Llamando a updateAntecedentes...');
      console.log('📞 [ONSUBMIT] updateAntecedentes función:', typeof updateAntecedentes);
      console.log('📞 [ONSUBMIT] createAntecedentes función:', typeof createAntecedentes);
      console.log('📞 [ONSUBMIT] Datos que se van a enviar a updateAntecedentes:');
      console.log('- urgenciasMedicas:', transformedData.urgenciasMedicas, typeof transformedData.urgenciasMedicas);
      console.log('- contactoEmergenciaTelefono:', transformedData.contactoEmergenciaTelefono, typeof transformedData.contactoEmergenciaTelefono);
      console.log('- notasAdicionales:', transformedData.notasAdicionales, typeof transformedData.notasAdicionales);
      console.log('📞 [ONSUBMIT] JSON completo a enviar:', JSON.stringify(transformedData, null, 2));
      
      console.log('🚀 [ONSUBMIT] EJECUTANDO updateAntecedentes...');
      console.log('🚀 [ONSUBMIT] Antecedente existe:', !!antecedente);
      console.log('🚀 [ONSUBMIT] Llamando función:', antecedente ? 'updateAntecedentes' : 'createAntecedentes');
      console.log('🚀 [ONSUBMIT] LLAMANDO updateAntecedentes - ESTE LOG DEBE APARECER');
      console.log('🚀 [ONSUBMIT] LLAMANDO updateAntecedentes - ESTE LOG DEBE APARECER - SEGUNDA VEZ');
      console.log('🚀 [ONSUBMIT] LLAMANDO updateAntecedentes - ESTE LOG DEBE APARECER - TERCERA VEZ');
      
      const result = antecedente 
        ? await updateAntecedentes(pacienteId, transformedData)
        : await createAntecedentes(pacienteId, transformedData);
      
      console.log('🚀 [ONSUBMIT] updateAntecedentes COMPLETADO - ESTE LOG DEBE APARECER');
      console.log('🚀 [ONSUBMIT] updateAntecedentes COMPLETADO - ESTE LOG DEBE APARECER - SEGUNDA VEZ');
      
      console.log('🚀 [ONSUBMIT] Función completada, resultado:', result);
      
      console.log('📞 [ONSUBMIT] Llamada a updateAntecedentes completada');
      console.log('📞 [ONSUBMIT] Resultado recibido:', result);
      
      console.log('✅ [ONSUBMIT] updateAntecedentes completado:', result);

      if (result.success) {
        setSubmitStatus('success');
        setSubmitMessage(result.details || 'Antecedentes guardados exitosamente');
        onSuccess?.();
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.error || 'Error al guardar los antecedentes');
      }
    } catch (error: any) {
      console.error('💥 [ONSUBMIT] Error en onSubmit:', error);
      console.error('💥 [ONSUBMIT] Error message:', error.message);
      console.error('💥 [ONSUBMIT] Error stack:', error.stack);
      console.error('💥 [ONSUBMIT] Error completo:', JSON.stringify(error, null, 2));
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Error inesperado al guardar los antecedentes');
    } finally {
      console.log('🏁 [ONSUBMIT] Finalizando onSubmit');
      setIsSubmitting(false);
    }
  };

  const renderField = (field: AntecedenteField) => {
    const fieldName = field.name as keyof AntecedenteFormData;
    const fieldValue = form.getValues(fieldName) || '';
    
    return (
      <div key={field.name} className="w-full space-y-2">
        <label className="text-sm font-medium">{field.label}</label>
        {field.type === 'textarea' ? (
          <Textarea
            name={fieldName}
            defaultValue={fieldValue}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            maxLength={field.maxLength}
            className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
          />
        ) : (
          <Input
            name={fieldName}
            type={field.type}
            defaultValue={fieldValue}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        )}
        {field.maxLength && (
          <div className="text-xs text-muted-foreground text-right">
            {fieldValue?.length || 0} / {field.maxLength}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full">
      <form className="space-y-6 w-full">
          {secciones.map((seccion) => (
            <Card key={seccion.id} className="w-full">
              <CardHeader>
                <CardTitle className="text-lg">{seccion.title}</CardTitle>
                <CardDescription>{seccion.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 w-full">
                {seccion.fields.map(renderField)}
              </CardContent>
            </Card>
          ))}

          {/* Mensajes de estado */}
          {submitStatus === 'success' && (
            <Alert className="w-full border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {submitMessage}
              </AlertDescription>
            </Alert>
          )}

          {submitStatus === 'error' && (
            <Alert className="w-full border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {submitMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Botones de acción */}
          <div className="w-full mt-8 pt-6 border-t-2 border-gray-300">
            <div className="flex flex-col gap-4 w-full">
              <Button 
                type="button" 
                disabled={isSubmitting} 
                 className="w-full font-semibold py-3"
                //className="w-full bg-black border-2 border-gray-400 hover:border-gray-500 py-3"
                onClick={async () => {
                  console.log('🖱️ [BUTTON] BOTÓN CLICKEADO - INICIO');
                  console.log('🖱️ [BUTTON] Estado del botón - isSubmitting:', isSubmitting);
                  console.log('🖱️ [BUTTON] Botón deshabilitado:', isSubmitting);
                  
                  // Obtener datos directamente de los elementos del DOM
                  const data: any = {};
                  
                  // Campos específicos de antecedentes
                  const antecedentesFields = [
                    'historialMedico', 'condicionesPreexistentes', 'alergiasMedicamentos',
                    'alergiasAlimentos', 'alergiasAmbientales', 'alergiasOtras',
                    'medicamentosActuales', 'medicamentosPrevios', 'cirugiasPrevias',
                    'procedimientosMedicos', 'hospitalizacionesPrevias', 'antecedentesFamiliares',
                    'habitosToxicos', 'urgenciasMedicas', 'contactoEmergenciaNombre',
                    'contactoEmergenciaTelefono', 'contactoEmergenciaRelacion', 'notasAdicionales'
                  ];
                  
                  // Obtener valores directamente de los elementos
                  antecedentesFields.forEach(fieldName => {
                    const element = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement | HTMLTextAreaElement;
                    if (element) {
                      data[fieldName] = element.value || '';
                    }
                  });
                  
                  console.log('🖱️ [BUTTON] Datos capturados del DOM:', data);
                  console.log('🖱️ [BUTTON] Campos específicos:');
                  console.log('- urgenciasMedicas:', data.urgenciasMedicas, typeof data.urgenciasMedicas);
                  console.log('- contactoEmergenciaTelefono:', data.contactoEmergenciaTelefono, typeof data.contactoEmergenciaTelefono);
                  console.log('- notasAdicionales:', data.notasAdicionales, typeof data.notasAdicionales);
                  
                  // Llamar directamente a onSubmit con los datos capturados
                  console.log('🚀 [BUTTON] LLAMANDO onSubmit DIRECTAMENTE');
                  await onSubmit(data);
                  console.log('🚀 [BUTTON] onSubmit COMPLETADO');
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {antecedente ? 'Actualizar' : 'Guardar'} Antecedentes
                  </>
                )}
              </Button>
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel} 
                  className="w-full bg-white border-2 border-gray-400 hover:border-gray-500 py-3"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </form>
    </div>
  );
}
