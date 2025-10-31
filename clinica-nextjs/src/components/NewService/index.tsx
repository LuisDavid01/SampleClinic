'use client'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'

import { Servicio } from '@/types/Service'
import { createServicio, updateServicio } from '@/actions/servicios'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Form, FormGroup, FormInput, FormLabel, FormSelect, FormTextarea } from '../FormWithActions'

type ActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

interface ServicioFormProps {
  servicio?: Servicio
  isEditing?: boolean
}

type ServicioPayload = Omit<Servicio, 'idServicio'>

const initialState: ActionResponse = {
  success: false,
  message: '',
  errors: undefined,
}

export default function ServicioForm({ servicio, isEditing = false }: ServicioFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(
    async (_prevState, formData) => {



      const data = {
        nombreServicio: ((formData.get('nombre') ?? '') as string),
        descripcion: ((formData.get('detalle') ?? '') as string),
        precio: Number(formData.get('precio')),
		activo: (formData.get('activo') || 'false') === 'true'
      }

      if (!data.nombreServicio || data.nombreServicio.length < 3) {
        return {
          success: false,
          message: 'El nombre es requerido (mínimo 3 caracteres)',
          errors: { nombre: ['Mínimo 3 caracteres'] },
        }
      }

      try {
        const result = isEditing
          ? await updateServicio(Number(servicio!.idServicio), data)
          : await createServicio(data)

        if (result.success) {
          await queryClient.invalidateQueries({ queryKey: ['servicios'] })
          await queryClient.invalidateQueries({ queryKey: ['servicio'] })
          if (!isEditing) router.push('/admin/services')
          router.refresh()
        }
        return result
      } catch (err) {
        return {
          success: false,
          message: (err as Error).message || 'Error procesando la solicitud',
          errors: undefined,
        }
      }
    },
    initialState
  )

  // Mantén el select con valores en minúscula para que coincida con el type
  const statusOptions = [
    { label: 'Activo', value: 'true' },
    { label: 'Inactivo', value: 'false' },
  ]

  return (
    <Form action={formAction}>
      {state?.message && (
        <div
          className={cn(
            'mb-4 w-full max-w-md rounded-md border px-4 py-2',
            state.success ? 'bg-green-50 text-green-800 border-green-300' : 'bg-red-50 text-red-800 border-red-300'
          )}
          role="status"
          aria-live={state.success ? 'polite' : 'assertive'}
        >
          {state.message}
        </div>
      )}

      <FormGroup>
        <FormLabel htmlFor="nombre">Nombre del servicio</FormLabel>
        <FormInput
          id="nombre"
          name="nombre"
          placeholder="Ej: Terapia Física"
          defaultValue={servicio?.nombreServicio || ''}
          required
          minLength={3}
          disabled={isPending}
          aria-describedby="nombre-error"
          className={state?.errors?.nombre ? 'border-red-500' : ''}
        />
        {state?.errors?.nombre && (
          <p id="nombre-error" className="text-sm text-red-500">{state.errors.nombre[0]}</p>
        )}
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="detalle">Detalle</FormLabel>
        <FormTextarea
          id="detalle"
          name="detalle"
          placeholder="Descripción del servicio"
          rows={4}
          defaultValue={servicio?.descripcion || ''}
          disabled={isPending}
          aria-describedby="detalle-error"
          className={state?.errors?.detalle ? 'border-red-500' : ''}
        />
        {state?.errors?.detalle && (
          <p id="detalle-error" className="text-sm text-red-500">{state.errors.detalle[0]}</p>
        )}
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="precio">Precio</FormLabel>
        <FormInput
          id="precio"
          name="precio"
          type="number"
          step="0.01"
          placeholder="0.00"
          defaultValue={servicio?.precio ?? ''}
          min={0}
          disabled={isPending}
          aria-describedby="precio-error"
          className={state?.errors?.precio ? 'border-red-500' : ''}
        />
        {state?.errors?.precio && (
          <p id="precio-error" className="text-sm text-red-500">{state.errors.precio[0]}</p>
        )}
      </FormGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup>
          <FormLabel htmlFor="activo">Estado</FormLabel>
          <FormSelect
            id="activo"
            name="activo"
            defaultValue={servicio?.activo ?? 'true'}
            options={statusOptions}
            disabled={isPending}
            required
            aria-describedby="status-error"
            className={state?.errors?.status ? 'border-red-500' : ''}
          />
          {state?.errors?.status && (
            <p id="status-error" className="text-sm text-red-500">{state.errors.status[0]}</p>
          )}
        </FormGroup>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isEditing ? 'Confirmar cambios' : 'Crear servicio'}
        </Button>
      </div>
    </Form>
  )
}
