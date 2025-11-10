'use client'

import { useActionState } from 'react'
import { Button } from '../ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '../ui/dialog'
import { SERVICE_STATUS } from '@/types/Service'
import { createServicio } from '@/actions/servicios'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Form, FormGroup, FormInput, FormLabel, FormSelect, FormTextarea } from '../FormWithActions'
import { useNotification } from '../UseNotification'

type ActionResponse = {
	success: boolean
	message: string
	errors?: Record<string, string[]>
}

interface NewServiceDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

const initialState: ActionResponse = {
	success: false,
	message: '',
	errors: undefined,
}

export default function NewServiceDialog({
	open,
	onOpenChange,
}: NewServiceDialogProps) {
	const queryClient = useQueryClient()
	const notificationContext = useNotification()
	const showNotification = notificationContext?.showNotification || (() => {})

	const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(
		async (_prevState, formData) => {
			const data = {
				nombre: (formData.get('nombre') as string) ?? '',
				detalle: (formData.get('detalle') as string) ?? '',
				precio: Number(formData.get('precio')),
				estado: (formData.get('status') as string).toLowerCase() as 'activo' | 'inactivo',
			}

			try {
				const result = await createServicio(data)

				if (result.success) {
					// Invalidar caches relacionadas a servicios
					await queryClient.invalidateQueries({ queryKey: ['servicios'] })
					await queryClient.invalidateQueries({ queryKey: ['servicio'] })
					
					showNotification({
						type: 'success',
						title: 'Servicio creado',
						message: result.message || 'El servicio se creó correctamente'
					})
					
					onOpenChange(false)
				} else {
					showNotification({
						type: 'error',
						title: 'Error al crear',
						message: result.message || 'Ocurrió un error al crear el servicio'
					})
				}

				return result
			} catch (err) {
				const errorMessage = (err as Error).message || 'An error occurred'
				showNotification({
					type: 'error',
					title: 'Error',
					message: errorMessage
				})
				return {
					success: false,
					message: errorMessage,
					errors: undefined,
				}
			}
		},
		initialState
	)

	const statusOptions = Object.values(SERVICE_STATUS).map(({ label, value }) => ({
		label,
		value,
	}))

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[calc(700px)]">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">Nuevo Servicio</DialogTitle>
				</DialogHeader>

				<Form action={formAction}>
					{state?.message && !state.success && (
						<div
							className={cn(
								'mb-4 w-full rounded-md border px-4 py-2',
								'bg-red-50 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
							)}
							role="alert"
							aria-live="assertive"
						>
							{state.message}
						</div>
					)}

					<div className="space-y-5 max-h-[60vh]  pr-2">
						<FormGroup>
							<FormLabel htmlFor="nombre">Nombre del servicio</FormLabel>
							<FormInput
								id="nombre"
								name="nombre"
								placeholder="Ej: Terapia Física"
								required
								minLength={3}
								disabled={isPending}
								aria-describedby="nombre-error"
								className={cn('border-0', state?.errors?.nombre && 'border border-red-500')}
							/>
							{state?.errors?.nombre && (
								<p id="nombre-error" className="text-sm text-red-500">
									{state.errors.nombre[0]}
								</p>
							)}
						</FormGroup>

						<FormGroup>
							<FormLabel htmlFor="detalle">Detalle</FormLabel>
							<FormTextarea
								id="detalle"
								name="detalle"
								placeholder="Descripción del servicio"
								rows={4}
								disabled={isPending}
								aria-describedby="detalle-error"
								className={cn('border-0', state?.errors?.detalle && 'border border-red-500')}
							/>
							{state?.errors?.detalle && (
								<p id="detalle-error" className="text-sm text-red-500">
									{state.errors.detalle[0]}
								</p>
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
								required
								min={0}
								disabled={isPending}
								aria-describedby="precio-error"
								className={cn('border-0', state?.errors?.precio && 'border border-red-500')}
							/>
							{state?.errors?.precio && (
								<p id="precio-error" className="text-sm text-red-500">
									{state.errors.precio[0]}
								</p>
							)}
						</FormGroup>

						<FormGroup>
							<FormLabel htmlFor="status">Estado</FormLabel>
							<FormSelect
								id="status"
								name="status"
								defaultValue="Activo"
								options={statusOptions}
								disabled={isPending}
								required
								aria-describedby="status-error"
								className={cn('border-0', state?.errors?.status && 'border border-red-500')}
							/>
							{state?.errors?.status && (
								<p id="status-error" className="text-sm text-red-500">
									{state.errors.status[0]}
								</p>
							)}
						</FormGroup>
					</div>

					<DialogFooter className="mt-6">
						<Button
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
							disabled={isPending}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? 'Creando...' : 'Crear servicio'}
						</Button>
					</DialogFooter>
				</Form>
			</DialogContent>
		</Dialog>
	)
}

