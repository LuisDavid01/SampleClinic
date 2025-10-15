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
} from '@/components/ui/form'
import { Consent} from '@/types/Consent'
import { formatDateForInput } from '@/lib/utils'


const doctors = [
  { label: 'Dr. Carlos Mendoza', value: 'carlos' },
   { label: 'Dra. Ana Vargas', value: 'ana' },
    ]


interface ConsentFormProps {
  consent?: Consent,
  isEditing?: boolean
}

const initialState: ActionResponse = {
  success: false,
  message: '',
  errors: undefined,
}

export default function NewConsent({
  consent,
  isEditing = false,
}: ConsentFormProps) {

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
        ? await updateConsent(Number(consent!.id), data)
        : await createConsent(data)
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
    <form>
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
        <FormLabel htmlFor="paciente">Nombre del Paciente</FormLabel>
        <FormInput
          id="paciente"
          name="paciente"
          placeholder="colocar el paciente..."
          defaultValue={consent?.paciente ?? ''}
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
        <FormLabel htmlFor="cedula">Cedula</FormLabel>
        <FormInput
          id="cedula"
          name="cedula"
          placeholder="Documento de identidad del paciente"
          defaultValue={consent?.cedula ?? ''}
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
          defaultValue={consent?.doctor|| ''}
          disabled={isPending}
          aria-describedby="description-error"
          className={state?.errors?.doctor ? 'border-red-500' : ''}
        />
        {state?.errors?.doctor && (
          <p id="description-error" className="text-sm text-red-500">
            {state.errors.doctor[0]}
          </p>
        )}
      </FormGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup >
          <FormLabel htmlFor="fecha">Fecha</FormLabel>
          <FormInput
          id="fecha"
          name="fecha"
          placeholder="fecha del consent"
          defaultValue={formatDateForInput(consent?.fechaCreacion) || ''}
          required
          disabled={isPending}
          aria-describedby="fecha-error"
          className={state?.errors?.fechaCreacion? 'border-red-500' : ''}
        />
          {state?.errors?.status && (
            <p id="fecha-error" className="text-sm text-red-500">
              {state.errors.status[0]}
            </p>
          )}
        </FormGroup>
        <FormGroup>
        <FormLabel htmlFor="tratamiento">Tratamiento</FormLabel>
        <FormTextarea
          id="tratamiento"
          name="tratamiento"
          placeholder="coloque el tratmiento adecuado..."
          defaultValue={consent?.tratamiento ?? ''}
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
          {isEditing ? 'Confirmar cambios' : 'Crear acta de consentimiento'}
        </Button>
      </div>
    </form>
  )
}