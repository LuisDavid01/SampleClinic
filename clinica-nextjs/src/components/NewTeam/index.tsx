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
import { Team, TEAM_STATUS } from '@/types/Team'
import { formatDateForInput } from '@/lib/utils'
interface ExpedienteFormProps {
  member ?: Team,
  isEditing?: boolean
}

const initialState: ActionResponse = {
  success: false,
  message: '',
  errors: undefined,
}



export default function NewTeam({member,
  isEditing = false,
}: ExpedienteFormProps) {


    
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

  const statusOptions = Object.values(TEAM_STATUS).map(({ label, value }) => ({
    label,
    value,
  }))
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
        <FormLabel htmlFor="pacienteID">Paciente</FormLabel>
        <FormInput
          id="pacienteID"
          name="pacienteID"
          placeholder="id del paciente"
          defaultValue={member?.name || ''}
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
        <FormLabel htmlFor="rol">Rol</FormLabel>
        <FormInput
          id="rol"
          name="rol"
          placeholder="rol asignado"
          defaultValue={member?.role || ''}
          required
          minLength={3}
          maxLength={100}
          disabled={isPending}
          aria-describedby="rol-error"
          className={state?.errors?.title ? 'border-red-500' : ''}
        />
        {state?.errors?.title && (
          <p id="title-error" className="text-sm text-red-500">
            {state.errors.title[0]}
          </p>
        )}
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="rol">Experiencia</FormLabel>
        <FormInput
          id="rol"
          name="rol"
          placeholder="años de experiencia"
          defaultValue={member?.experience || ''}
          required
          minLength={3}
          maxLength={100}
          disabled={isPending}
          aria-describedby="rol-error"
          className={state?.errors?.title ? 'border-red-500' : ''}
        />
        {state?.errors?.title && (
          <p id="title-error" className="text-sm text-red-500">
            {state.errors.title[0]}
          </p>
        )}
      </FormGroup>


      <FormGroup>
        <FormLabel htmlFor="fecha">fecha</FormLabel>
        <FormInput
          id="fecha"
          name="fecha"
          placeholder=""
          defaultValue={formatDateForInput(member?.createdAt) || ''}
          type="date"
          required
          disabled={member?.createdAt != null}
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
  <FormLabel htmlFor="specialties">Especialidades</FormLabel>

  {/* Input para specialties[0] */}
  <FormInput
    id="specialties-0"
    name="specialties[]"
    placeholder="Especialidad 1"
    defaultValue={(member?.specialties && member.specialties[0]) || ''}
    minLength={1}
    maxLength={100}
    disabled={isPending}
    aria-describedby="specialties-error"
    className={state?.errors?.specialties ? 'border-red-500' : ''}
  />

  {/* Input para specialties[1] */}
  <FormInput
    id="specialties-1"
    name="specialties[]"
    placeholder="Especialidad 2"
    defaultValue={(member?.specialties && member.specialties[1]) || ''}
    minLength={1}
    maxLength={100}
    disabled={isPending}
    aria-describedby="specialties-error"
    className="mt-2"
  />

  {/* Input para specialties[2] */}
  <FormInput
    id="specialties-2"
    name="specialties[]"
    placeholder="Especialidad 3"
    defaultValue={(member?.specialties && member.specialties[2]) || ''}
    minLength={1}
    maxLength={100}
    disabled={isPending}
    aria-describedby="specialties-error"
    className="mt-2"
  />

  {state?.errors?.specialties && (
    <p id="specialties-error" className="text-sm text-red-500 mt-1">
      {state.errors.specialties[0]}
    </p>
  )}
</FormGroup>

      

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup >
          <FormLabel htmlFor="status">Estado</FormLabel>
          <FormSelect
            id="status"
            name="status"
            defaultValue={member?.status || 'Programada'}
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
        <FormLabel htmlFor="nota">Descripcion</FormLabel>
        <FormTextarea
          id="nota"
          name="nota"
          placeholder="coloque una nota..."
          defaultValue={member?.description || ''}
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
    </Form>
  )
}