'use client'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import {
  Form,
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  FormError,
} from '@/components/ui/Form'
import { Diagnostico} from '@/types/Diagnostico'
import { formatDateForInput } from '@/lib/utils'


const doctors = [
  { label: 'Dr. Carlos Mendoza', value: 'carlos' },
   { label: 'Dra. Ana Vargas', value: 'ana' },
    ]


interface DiagnosticoFormProps {
  diagnostico?: Diagnostico,
  isEditing?: boolean
}

const initialState: ActionResponse = {
  success: false,
  message: '',
  errors: undefined,
}

export default function DiagnosisForm({
  diagnostico,
  isEditing = false,
}: DiagnosticoFormProps) {

    const router = useRouter()

  // Use useActionState hook for the form submission action
  const [state, formAction, isPending] = useActionState<
    ActionResponse,
    FormData
  >(async (prevState: ActionResponse, formData: FormData) => {
    // Extract data from form
    const data = {
      descripcion: formData.get('description') as string,
      status: formData.get('status') as
        | 'Activo'
        | 'Inactivo',
      pacienteID: formData.get('pacienteID') as string
    }

    try {
      // Call the appropriate action based on whether we're editing or creating
      /*
      const result = isEditing
        ? await updateDiagnostico(Number(diagnostico!.id), data)
        : await createDiagnostico(data)
      */
      const result = {
        success: false,
        message: 'Invalid email or password',
        errors: {
          email: ['Invalid email or password'],
        },
      }

      // Handle successful submission
      if (result.success) {
        router.refresh()
        if (!isEditing) {
          router.push('/admin/files')
        }
      }

      return result
    } catch (err) {
      return {
        success: false,
        message: (err as Error).message || 'An error occurred',
        errors: undefined,
      }
    }
  }, initialState)




     return (
    <Form>
      {state?.message && (
        <FormError
          className={`mb-4 ${
            state.success ? 'bg-green-100 text-green-800 border-green-300' : ''
          }`}
        >
          {state.message}
        </FormError>
      )}

      <FormGroup>
        <FormLabel htmlFor="expediente">Expediente</FormLabel>
        <FormInput
          id="expediente"
          name="expediente"
          placeholder="Expediente del paciente"
          defaultValue={diagnostico?.expediente || ''}
          required
          minLength={3}
          maxLength={100}
          disabled={isPending}
          aria-describedby="title-error"
          className={state?.errors?.title ? 'border-red-500' : ''}
        />
        {state?.errors?.title && (
          <p id="title-error" className="text-sm text-red-500">
            {state.errors.title[0]}
          </p>
        )}
      </FormGroup>


      <FormGroup>
        <FormLabel htmlFor="paciente">Paciente</FormLabel>
        <FormInput
          id="paciente"
          name="paciente"
          placeholder="Documento de identidad del paciente"
          defaultValue={diagnostico?.paciente || ''}
          required
          minLength={3}
          maxLength={12}
          disabled={isPending}
          aria-describedby="cedula-error"
          className={state?.errors?.cedula? 'border-red-500' : ''}
        />
        {state?.errors?.title && (
          <p id="cedula-error" className="text-sm text-red-500">
            {state.errors.title[0]}
          </p>
        )}
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="doctor">Doctor asignado</FormLabel>
        <FormSelect
          id="doctor"
          name="doctor"
          options={doctors}
          defaultValue={diagnostico?.doctor|| ''}
          disabled={isPending}
          aria-describedby="description-error"
          className={state?.errors?.description ? 'border-red-500' : ''}
        />
        {state?.errors?.description && (
          <p id="description-error" className="text-sm text-red-500">
            {state.errors.description[0]}
          </p>
        )}
      </FormGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup>
                <FormLabel htmlFor="fecha">fecha</FormLabel>
                <FormInput
                  id="fecha"
                  name="fecha"
                  placeholder=""
                  defaultValue={formatDateForInput(diagnostico?.fecha) || ''}
                  type="date"
                  required
                  disabled={isPending}
                  aria-describedby="title-error"
                  className={state?.errors?.title ? 'border-red-500' : ''}
                />
                {state?.errors?.title && (
                  <p id="title-error" className="text-sm text-red-500">
                    {state.errors.title[0]}
                  </p>
                )}
              </FormGroup>
        <FormGroup>
        <FormLabel htmlFor="diagnostico">Diagnostico</FormLabel>
        <FormTextarea
          id="diagnostico"
          name="diagnostico"
          placeholder="coloque un diagnostico..."
          defaultValue={diagnostico?.diagnostico || ''}
          required
          rows={4}
          minLength={3}
          maxLength={100}
          disabled={isPending}
          aria-describedby="title-error"
          className={state?.errors?.title ? 'border-red-500' : ''}
        />
        {state?.errors?.title && (
          <p id="title-error" className="text-sm text-red-500">
            {state.errors.title[0]}
          </p>
        )}
      </FormGroup>

      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled>
          {isEditing ? 'Confirmar cambios' : 'Crear diagnostico'}
        </Button>
      </div>
    </Form>
  )
}