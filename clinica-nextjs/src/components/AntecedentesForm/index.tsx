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
import { antecedentesSchema } from '@/lib/validations';
import { validateFormData } from '@/lib/form-validation';


interface AntecedentesFormProps {
  pacienteId: number;
  antecedente?: AntecedenteClinico | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Definir las secciones y campos del formulario
const antecedenteSections: AntecedenteSection[] = [
  {
    id: 'historial-medico',
    title: 'Historial Médico',
    description: 'Información sobre el historial médico del paciente',
    fields: [
      { name: 'historialMedico', label: 'Historial Médico', type: 'textarea', placeholder: 'Describa el historial médico del paciente...' }
    ]
  },
  {
    id: 'condiciones-preexistentes',
    title: 'Condiciones Preexistentes',
    description: 'Condiciones médicas preexistentes del paciente',
    fields: [
      { name: 'condicionesPreexistentes', label: 'Condiciones Preexistentes', type: 'textarea', placeholder: 'Describa las condiciones preexistentes...' }
    ]
  },
  {
    id: 'alergias',
    title: 'Alergias',
    description: 'Información sobre alergias del paciente',
    fields: [
      { name: 'alergiasMedicamentos', label: 'Alergias a Medicamentos', type: 'textarea', placeholder: 'Describa las alergias a medicamentos...' },
      { name: 'alergiasAlimentos', label: 'Alergias Alimentarias', type: 'textarea', placeholder: 'Describa las alergias alimentarias...' },
      { name: 'alergiasAmbientales', label: 'Alergias Ambientales', type: 'textarea', placeholder: 'Describa las alergias ambientales...' },
      { name: 'alergiasOtras', label: 'Otras Alergias', type: 'textarea', placeholder: 'Describa otras alergias...' }
    ]
  },
  {
    id: 'medicamentos',
    title: 'Medicamentos',
    description: 'Medicamentos actuales y previos del paciente',
    fields: [
      { name: 'medicamentosActuales', label: 'Medicamentos Actuales', type: 'textarea', placeholder: 'Describa los medicamentos actuales...' },
      { name: 'medicamentosPrevios', label: 'Medicamentos Previos', type: 'textarea', placeholder: 'Describa los medicamentos previos...' }
    ]
  },
  {
    id: 'cirugias-procedimientos',
    title: 'Procedimientos Quirúrgicos',
    description: 'Historial de cirugías y procedimientos médicos',
    fields: [
      { name: 'cirugiasPrevias', label: 'Cirugías Previas', type: 'textarea', placeholder: 'Describa las cirugías previas...' },
      { name: 'procedimientosMedicos', label: 'Procedimientos Médicos', type: 'textarea', placeholder: 'Describa los procedimientos médicos...' },
      { name: 'hospitalizacionesPrevias', label: 'Hospitalizaciones Previas', type: 'textarea', placeholder: 'Describa las hospitalizaciones previas...' }
    ]
  },
  {
    id: 'antecedentes-familiares',
    title: 'Antecedentes Familiares',
    description: 'Historial médico familiar del paciente',
    fields: [
      { name: 'antecedentesFamiliares', label: 'Antecedentes Familiares', type: 'textarea', placeholder: 'Describa los antecedentes familiares...' }
    ]
  },
  {
    id: 'habitos-toxicos',
    title: 'Hábitos',
    description: 'Información sobre hábitos tóxicos del paciente',
    fields: [
      { name: 'habitosToxicos', label: 'Hábitos Tóxicos', type: 'textarea', placeholder: 'Describa los hábitos tóxicos...' }
    ]
  },
  {
    id: 'contacto-emergencia',
    title: 'Información de Emergencia',
    description: 'Información de contacto para emergencias médicas',
    fields: [
      { name: 'urgenciasMedicas', label: 'Urgencias Médicas', type: 'textarea', placeholder: 'Describa las urgencias médicas...' },
      { name: 'contactoEmergenciaNombre', label: 'Nombre del Contacto de Emergencia', type: 'text', placeholder: 'Nombre completo del contacto...' },
      { name: 'contactoEmergenciaTelefono', label: 'Teléfono del Contacto', type: 'tel', placeholder: 'Número de teléfono...' },
      { name: 'contactoEmergenciaRelacion', label: 'Relación', type: 'text', placeholder: 'Relación con el paciente...' }
    ]
  },
  {
    id: 'notas-adicionales',
    title: 'Notas Adicionales',
    description: 'Información adicional relevante',
    fields: [
      { name: 'notasAdicionales', label: 'Notas Adicionales', type: 'textarea', placeholder: 'Cualquier información adicional relevante...' }
    ]
  }
];

export default function AntecedentesForm({ pacienteId, antecedente, onSuccess, onCancel }: AntecedentesFormProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  
  // Use useActionState hook for the form submission action
  const [state, formAction, isPending] = useActionState<
    { success: boolean; error?: string; details?: string },
    FormData
  >(async (prevState, formData: FormData) => {
    
    // Extract data from form
    const data: AntecedenteFormData = {
      historialMedico: formData.get('historialMedico') as string || '',
      condicionesPreexistentes: formData.get('condicionesPreexistentes') as string || '',
      alergiasMedicamentos: formData.get('alergiasMedicamentos') as string || '',
      alergiasAlimentos: formData.get('alergiasAlimentos') as string || '',
      alergiasAmbientales: formData.get('alergiasAmbientales') as string || '',
      alergiasOtras: formData.get('alergiasOtras') as string || '',
      medicamentosActuales: formData.get('medicamentosActuales') as string || '',
      medicamentosPrevios: formData.get('medicamentosPrevios') as string || '',
      cirugiasPrevias: formData.get('cirugiasPrevias') as string || '',
      procedimientosMedicos: formData.get('procedimientosMedicos') as string || '',
      hospitalizacionesPrevias: formData.get('hospitalizacionesPrevias') as string || '',
      antecedentesFamiliares: formData.get('antecedentesFamiliares') as string || '',
      habitosToxicos: formData.get('habitosToxicos') as string || '',
      urgenciasMedicas: formData.get('urgenciasMedicas') as string || '',
      contactoEmergenciaNombre: formData.get('contactoEmergenciaNombre') as string || '',
      contactoEmergenciaTelefono: formData.get('contactoEmergenciaTelefono') as string || '',
      contactoEmergenciaRelacion: formData.get('contactoEmergenciaRelacion') as string || '',
      notasAdicionales: formData.get('notasAdicionales') as string || '',
    };

    
    // Verificar los elementos del DOM directamente
    const urgenciasElement = document.querySelector('[name="urgenciasMedicas"]') as HTMLTextAreaElement;
    const telefonoElement = document.querySelector('[name="contactoEmergenciaTelefono"]') as HTMLInputElement;
    const notasElement = document.querySelector('[name="notasAdicionales"]') as HTMLTextAreaElement;
    
    
    // Si los campos están vacíos en FormData pero tienen valores en el DOM, usar los valores del DOM
    if ((!data.urgenciasMedicas || data.urgenciasMedicas.trim() === '') && urgenciasElement?.value) {
      data.urgenciasMedicas = urgenciasElement.value;
    }
    
    if ((!data.contactoEmergenciaTelefono || data.contactoEmergenciaTelefono.trim() === '') && telefonoElement?.value) {
      data.contactoEmergenciaTelefono = telefonoElement.value;
    }
    
    if ((!data.notasAdicionales || data.notasAdicionales.trim() === '') && notasElement?.value) {
      data.notasAdicionales = notasElement.value;
    }
    
    // VALIDAR CON ZOD
    const validation = validateFormData(antecedentesSchema, data);
    if (!validation.success) {
      setValidationErrors(validation.errors || {});
      return {
        success: false,
        error: 'Por favor corrige los errores en el formulario',
        details: 'Errores de validación encontrados'
      };
    }

    // Limpiar errores de validación si la validación es exitosa
    setValidationErrors({});

    try {
      // Call the appropriate action based on whether we're editing or creating
      
      const result = antecedente 
        ? await updateAntecedentes(pacienteId, data)
        : await createAntecedentes(pacienteId, data);
        

      // Handle successful submission
      if (result.success) {
        onSuccess?.();
      }

      return result;
    } catch (err) {
      console.error('💥 [ACTION] Error:', err);
      return {
        success: false,
        error: (err as Error).message || 'Error inesperado',
        details: 'Error al procesar la solicitud'
      };
    }
  }, { success: false });

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Update submit status based on state
  useEffect(() => {
    if (state.success) {
      setSubmitStatus('success');
      setSubmitMessage(state.details || 'Antecedentes guardados exitosamente');
    } else if (state.error) {
      setSubmitStatus('error');
      setSubmitMessage(state.error);
    }
  }, [state]);

  const renderField = (field: AntecedenteField) => {
    const fieldName = field.name as keyof AntecedenteFormData;
    const fieldValue = antecedente?.[fieldName] || '';
    const fieldError = validationErrors[fieldName];

    return (
      <div key={fieldName} className="space-y-2">
        <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700">
          {field.label}
        </label>
        {field.type === 'textarea' ? (
          <Textarea
            id={fieldName}
            name={fieldName}
            placeholder={field.placeholder}
            defaultValue={fieldValue}
            className={`w-full bg-white border-2 ${fieldError ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
            rows={4}
          />
        ) : (
          <Input
            id={fieldName}
            name={fieldName}
            type={field.type}
            placeholder={field.placeholder}
            defaultValue={fieldValue}
            className={`w-full bg-white border-2 ${fieldError ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
          />
        )}
        {fieldError && (
          <p className="text-sm text-red-500">
            {fieldError[0]}
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">
          {antecedente ? 'Editar Antecedentes Clínicos' : 'Crear Antecedentes Clínicos'}
        </CardTitle>
        <CardDescription>
          {antecedente 
            ? 'Actualice la información médica del paciente'
            : 'Complete la información médica del paciente'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form action={formAction} className="space-y-8">
          {antecedenteSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b-2 border-gray-200 pb-2">
                {section.title}
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {section.fields.map((field) => renderField(field))}
              </div>
            </div>
          ))}

          {/* Error general de validación */}
          {validationErrors.general && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {validationErrors.general[0]}
              </AlertDescription>
            </Alert>
          )}

          {/* Alertas de estado */}
          {submitStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {submitMessage}
              </AlertDescription>
            </Alert>
          )}

          {submitStatus === 'error' && (
            <Alert className="border-red-200 bg-red-50">
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
                type="submit" 
                disabled={isPending}
                className="w-full font-semibold py-3"
              >
                {isPending ? (
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
      </CardContent>
    </Card>
  );
}
