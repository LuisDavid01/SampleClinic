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
} from '../FormWithActions'
import {  HistoriaExito, TESTIMONY_STATUS } from '@/types/Testimony'
import { formatDateForInput } from '@/lib/utils'
import { Star } from 'lucide-react'
interface ExpedienteFormProps {
  testimony ?: HistoriaExito,
  isEditing?: boolean
}

const initialState: ActionResponse = {
  success: false,
  message: '',
  errors: undefined,
}



export default function EditTestimony ({testimony,
  isEditing = false,
}: ExpedienteFormProps) {


    const router = useRouter()

  // Use useActionState hook for the Form submission action
  const [state, formAction, isPending] = useActionState<
    ActionResponse,
    FormData
  >(async (prevState: ActionResponse, formData: FormData) => {
    // Extract data from Form
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

  const statusOptions = Object.values(TESTIMONY_STATUS).map(({ label, value }) => ({
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
        <FormLabel htmlFor="idPaciente">Paciente</FormLabel>
        <FormSelect
          id="idPaciente"
          name="idPaciente"
          defaultValue={testimony?.idPaciente || ''}
          required
          disabled={isPending}
          aria-describedby="title-error"
          className={state?.errors?.title ? 'border-red-500' : ''}
        />
        {state?.errors?.title && (
          <p id="idPaciente-error" className="text-sm text-red-500">
            {state.errors.idPaciente[0]}
          </p>
        )}
      </FormGroup>

      

      <FormGroup>
        <FormLabel htmlFor="idMedico">Doctor </FormLabel>
        <FormSelect
          id="idMedico"
          name="idMedico"
          defaultValue={testimony?.idMedico|| ''}
          aria-describedby="description-error"
          className={state?.errors?.idMedico ? 'border-red-500' : ''}
        />
        {state?.errors?.idMedico && (
          <p id="idMedico-error" className="text-sm text-red-500">
            {state.errors.idMedico[0]}
          </p>
        )}
      </FormGroup>


      <FormGroup>
        <FormLabel htmlFor="fecha">fecha</FormLabel>
        <FormInput
          id="fecha"
          name="fecha"
          placeholder=""
          defaultValue={formatDateForInput(testimony?.fechaInicio)}
          type="date"
          required
          disabled={isPending}
          aria-describedby="fecha-inicio-error"
          className={state?.errors?.fechaInicio ? 'border-red-500' : ''}
        />
        {state?.errors?.title && (
          <p id="fecha-error" className="text-sm text-red-500">
            {state.errors.fechaInicio[0]}
          </p>
        )}
      </FormGroup>

      

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup >
          <FormLabel htmlFor="status">Estado</FormLabel>
          <FormSelect
            id="status"
            name="status"
            defaultValue={testimony?.publicado ? 'activo': 'inActivo'}
            options={statusOptions}
            disabled={isPending}
            required
            aria-describedby="publicado-error"
            className={state?.errors?.publicado ? 'border-red-500' : ''}
          />
          {state?.errors?.status && (
            <p id="status-error" className="text-sm text-red-500">
              {state.errors.publicado[0]}
            </p>
          )}
        </FormGroup>

        <FormGroup>
        <FormLabel htmlFor="nota">Comentario</FormLabel>
        <FormTextarea
          id="nota"
          name="nota"
          placeholder="coloque una nota..."
          defaultValue={testimony?.experiencia || ''}
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
