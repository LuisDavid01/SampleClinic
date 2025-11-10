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
import { createUsuario, UsuarioData } from '@/actions/usuarios'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Form, FormGroup, FormInput, FormLabel, FormTextarea } from '../FormWithActions'
import { useNotification } from '../UseNotification'

type ActionResponse = {
	success: boolean
	message: string
	errors?: Record<string, string[]>
}

interface NewFisioterapeutaDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

const initialState: ActionResponse = {
	success: false,
	message: '',
	errors: undefined,
}

export default function NewFisioterapeutaDialog({
	open,
	onOpenChange,
}: NewFisioterapeutaDialogProps) {
	const queryClient = useQueryClient()
	const notificationContext = useNotification()
	const showNotification = notificationContext?.showNotification || (() => {})

	const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(
		async (_prevState, formData) => {
			const data: UsuarioData = {
				nombre: (formData.get('nombre') as string) ?? '',
				apellido1: (formData.get('apellido1') as string) ?? '',
				apellido2: (formData.get('apellido2') as string) || undefined,
				fechaNacimiento: (formData.get('fechaNacimiento') as string) || undefined,
				telefonoPrincipal: (formData.get('telefonoPrincipal') as string) ?? '',
				telefonoSecundario: (formData.get('telefonoSecundario') as string) || undefined,
				correoElectronico: (formData.get('correoElectronico') as string) ?? '',
				direccionResidencia: (formData.get('direccionResidencia') as string) || undefined,
				idRol: 2, // Rol de fisioterapeuta
				activo: true,
			}

			try {
				const result = await createUsuario(data)

				if (result.success) {
					// Invalidar caches relacionadas a usuarios
					await queryClient.invalidateQueries({ queryKey: ['usuarios'] })
					await queryClient.invalidateQueries({ queryKey: ['team'] })
					
					showNotification({
						type: 'success',
						title: 'Fisioterapeuta creado',
						message: result.message || 'El fisioterapeuta se creó correctamente'
					})
					
					onOpenChange(false)
				} else {
					showNotification({
						type: 'error',
						title: 'Error al crear',
						message: result.message || 'Ocurrió un error al crear el fisioterapeuta'
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

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[calc(700px)] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">Nuevo Fisioterapeuta</DialogTitle>
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
						{/* Información Personal */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-foreground">Información Personal</h3>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormGroup>
									<FormLabel htmlFor="nombre">Nombre *</FormLabel>
									<FormInput
										id="nombre"
										name="nombre"
										placeholder="Ingrese el nombre"
										required
										minLength={2}
										maxLength={100}
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
									<FormLabel htmlFor="apellido1">Primer Apellido *</FormLabel>
									<FormInput
										id="apellido1"
										name="apellido1"
										placeholder="Ingrese el primer apellido"
										required
										minLength={2}
										maxLength={100}
										disabled={isPending}
										aria-describedby="apellido1-error"
										className={cn('border-0', state?.errors?.apellido1 && 'border border-red-500')}
									/>
									{state?.errors?.apellido1 && (
										<p id="apellido1-error" className="text-sm text-red-500">
											{state.errors.apellido1[0]}
										</p>
									)}
								</FormGroup>

								<FormGroup>
									<FormLabel htmlFor="apellido2">Segundo Apellido</FormLabel>
									<FormInput
										id="apellido2"
										name="apellido2"
										placeholder="Ingrese el segundo apellido (opcional)"
										maxLength={100}
										disabled={isPending}
										aria-describedby="apellido2-error"
										className={cn('border-0', state?.errors?.apellido2 && 'border border-red-500')}
									/>
									{state?.errors?.apellido2 && (
										<p id="apellido2-error" className="text-sm text-red-500">
											{state.errors.apellido2[0]}
										</p>
									)}
								</FormGroup>

								<FormGroup>
									<FormLabel htmlFor="fechaNacimiento">Fecha de Nacimiento</FormLabel>
									<FormInput
										id="fechaNacimiento"
										name="fechaNacimiento"
										type="date"
										disabled={isPending}
										aria-describedby="fechaNacimiento-error"
										className={cn('border-0', state?.errors?.fechaNacimiento && 'border border-red-500')}
									/>
									{state?.errors?.fechaNacimiento && (
										<p id="fechaNacimiento-error" className="text-sm text-red-500">
											{state.errors.fechaNacimiento[0]}
										</p>
									)}
								</FormGroup>
							</div>
						</div>

						{/* Información de Contacto */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-foreground">Información de Contacto</h3>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormGroup>
									<FormLabel htmlFor="correoElectronico">Correo Electrónico *</FormLabel>
									<FormInput
										id="correoElectronico"
										name="correoElectronico"
										type="email"
										placeholder="ejemplo@correo.com"
										required
										maxLength={150}
										disabled={isPending}
										aria-describedby="correoElectronico-error"
										className={cn('border-0', state?.errors?.correoElectronico && 'border border-red-500')}
									/>
									{state?.errors?.correoElectronico && (
										<p id="correoElectronico-error" className="text-sm text-red-500">
											{state.errors.correoElectronico[0]}
										</p>
									)}
								</FormGroup>

								<FormGroup>
									<FormLabel htmlFor="telefonoPrincipal">Teléfono Principal *</FormLabel>
									<FormInput
										id="telefonoPrincipal"
										name="telefonoPrincipal"
										placeholder="+506 8888-8888"
										required
										maxLength={20}
										disabled={isPending}
										aria-describedby="telefonoPrincipal-error"
										className={cn('border-0', state?.errors?.telefonoPrincipal && 'border border-red-500')}
									/>
									{state?.errors?.telefonoPrincipal && (
										<p id="telefonoPrincipal-error" className="text-sm text-red-500">
											{state.errors.telefonoPrincipal[0]}
										</p>
									)}
								</FormGroup>

								<FormGroup>
									<FormLabel htmlFor="telefonoSecundario">Teléfono Secundario</FormLabel>
									<FormInput
										id="telefonoSecundario"
										name="telefonoSecundario"
										placeholder="+506 8888-8889 (opcional)"
										maxLength={20}
										disabled={isPending}
										aria-describedby="telefonoSecundario-error"
										className={cn('border-0', state?.errors?.telefonoSecundario && 'border border-red-500')}
									/>
									{state?.errors?.telefonoSecundario && (
										<p id="telefonoSecundario-error" className="text-sm text-red-500">
											{state.errors.telefonoSecundario[0]}
										</p>
									)}
								</FormGroup>

								<FormGroup>
									<FormLabel htmlFor="direccionResidencia">Dirección de Residencia</FormLabel>
									<FormTextarea
										id="direccionResidencia"
										name="direccionResidencia"
										placeholder="Dirección completa (opcional)"
										rows={2}
										maxLength={255}
										disabled={isPending}
										aria-describedby="direccionResidencia-error"
										className={cn('border-0', state?.errors?.direccionResidencia && 'border border-red-500')}
									/>
									{state?.errors?.direccionResidencia && (
										<p id="direccionResidencia-error" className="text-sm text-red-500">
											{state.errors.direccionResidencia[0]}
										</p>
									)}
								</FormGroup>
							</div>
						</div>
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
							{isPending ? 'Creando...' : 'Crear Fisioterapeuta'}
						</Button>
					</DialogFooter>
				</Form>
			</DialogContent>
		</Dialog>
	)
}

