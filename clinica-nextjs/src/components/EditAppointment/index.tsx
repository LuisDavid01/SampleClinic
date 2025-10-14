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
import { Appointment, APPOINTMENT_STATUS } from '@/types/Appointment'
import { formatDateForInput } from '@/lib/utils'
interface ExpedienteFormProps {
  appointment ?: Appointment,
  isEditing?: boolean
}

const initialState: ActionResponse = {
  success: false,
  message: '',
  errors: undefined,
}



export default function EditAppointment ({appointment,
  isEditing = false,
}: ExpedienteFormProps) {


    const doctors = [
  { label: 'Guillermo', value: 'guillermo' },
   { label: 'María', value: 'maria' },
    ]
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
        ? await updateExpediente(Number(expediente!.id), data)
        : await createExpediente(data)
      */
      const result = {
        success: true,
        message: 'Success',
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

  const statusOptions = Object.values(APPOINTMENT_STATUS).map(({ label, value }) => ({
    label,
    value,
  }))
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
        <FormLabel htmlFor="pacienteID">Paciente</FormLabel>
        <FormInput
          id="pacienteID"
          name="pacienteID"
          placeholder="id del paciente"
          defaultValue={appointment?.pacienteID || ''}
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
        <FormLabel htmlFor="description">Doctor asignado</FormLabel>
        <FormSelect
          id="doctor"
          name="doctor"
          options={doctors}
          defaultValue={appointment?.doctor|| ''}
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

      <FormGroup>
        <FormLabel htmlFor="fecha">fecha</FormLabel>
        <FormInput
          id="fecha"
          name="fecha"
          placeholder=""
          defaultValue={formatDateForInput(appointment?.fecha) || ''}
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

      

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup >
          <FormLabel htmlFor="status">Estado</FormLabel>
          <FormSelect
            id="status"
            name="status"
            defaultValue={appointment?.status || 'Programada'}
            options={statusOptions}
            disabled={isPending}
            required
            aria-describedby="status-error"
            className={state?.errors?.status ? 'border-red-500' : ''}
          />
          {state?.errors?.status && (
            <p id="status-error" className="text-sm text-red-500">
              {state.errors.status[0]}
            </p>
          )}
        </FormGroup>

        <FormGroup>
        <FormLabel htmlFor="nota">Nota adicional</FormLabel>
        <FormTextarea
          id="nota"
          name="nota"
          placeholder="coloque una nota..."
          defaultValue={appointment?.nota || ''}
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
            Confirmar cambios
        </Button>
      </div>
    </form>
  )
}