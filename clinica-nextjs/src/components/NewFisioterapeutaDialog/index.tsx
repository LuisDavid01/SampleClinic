'use client'

import { useActionState, useState } from 'react'
import { Button } from '../ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '../ui/dialog'
import { createUsuario, UsuarioData } from '@/actions/usuarios'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Form, FormGroup, FormInput, FormLabel, FormSelect, FormTextarea } from '../FormWithActions'
import { useNotification } from '../UseNotification'
import { apiEndpoints, useApiClient } from '@/utils/apiClient'
import { Usuario } from '@/types/Usuario'
import { createTeamMember, editTeamMember } from '@/actions/equipo'
import { teamProfile } from '@/types/perfiles'
import { getServicios } from '@/actions/servicios'
import { Service, Servicio } from '@/types/Service'

type ActionResponse = {
	success: boolean
	message: string
	errors?: Record<string, string[]>
}

interface NewFisioterapeutaDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	isEditing?: boolean
	miembro?: teamProfile
}

const initialState: ActionResponse = {
	success: false,
	message: '',
	errors: undefined,
}

export default function NewFisioterapeutaDialog({
	open,
	onOpenChange,
	miembro,
	isEditing = false,
}: NewFisioterapeutaDialogProps) {
	const queryClient = useQueryClient()
	const notificationContext = useNotification()
	const apiClient = useApiClient()
	const [serviciosSeleccionados, setServiciosSeleccionados] = useState<number[]>(
		miembro?.servicios?.map(s => s.idServicio) ?? []
	);
	const showNotification = notificationContext?.showNotification || (() => { })
	const results = useQueries({
		queries: [

			{
				queryKey: ['usuarios'],
				queryFn: async () => {
					const res = await apiClient.get(`${apiEndpoints.getUsuarios()}`)
					const usuarios = res.usuarios
					const equipo = usuarios.filter((usr: Usuario) => usr.rol.nombreRol != 'Paciente')
					console.log(equipo);
					return equipo;
				},
				staleTime: 3 * 60 * 1000,
			},
			{
				queryKey: ['services'],
				queryFn: async () => {
					const resServices = await getServicios(1, "", 20)
					console.log(resServices)
					return resServices.servicios
				},
				staleTime: 3 * 60 * 1000
			}

		]
	});

	const toggleServicio = (id: number) => {
		if (serviciosSeleccionados.includes(id)) {
			setServiciosSeleccionados(serviciosSeleccionados.filter((s) => s !== id));
		} else {
			setServiciosSeleccionados([...serviciosSeleccionados, id]);
		}
	};

	const isloading = results.some((r) => r.isLoading);
	const teamMembers = results[0].data ?? [];
	const services = results[1].data ?? [];
	const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(
		async (_prevState, formData) => {
			const data = {
				idEquipo: (formData.get('idEquipo') as string),
				descripcionBreve: (formData.get('descripcionBreve') as string),
				experienciaProfesional: (formData.get('experienciaProfesional') as string),
				especialidad: (formData.get('especialidad') as string),
				servicios: serviciosSeleccionados,
			}

			try {
				const result = isEditing ? await editTeamMember(miembro!.idPerfil, data, true) :
					await createTeamMember(data)

				if (result.success) {
					// Invalidar caches relacionadas a usuarios
					await queryClient.invalidateQueries({ queryKey: ['usuarios'] })
					await queryClient.invalidateQueries({ queryKey: ['team'] })

					showNotification({
						type: 'success',
						title: 'Fisioterapeuta creado',
						message: result.message || 'El fisioterapeuta se creó correctamente'
					})
					console.log(result)
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
					<DialogTitle className="text-2xl font-bold">{isEditing ? 'Editando miembro del equipo' : 'Nuevo miembro del equipo'}</DialogTitle>
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
									<FormLabel htmlFor="idEquipo">Miembro del equipo</FormLabel>
									<FormSelect
										key={"testimony-paciente-select"}
										id="idEquipo"
										name="idEquipo"
										options={teamMembers.map((equipo: Usuario) => ({
											label: equipo.nombre + ' ' + equipo.apellido1 + ' ' + equipo.apellido2,
											value: equipo.clerkId
										}))}
										defaultValue={miembro?.medico.clerkId ?? ''}
										required
										disabled={isPending || isloading}
										aria-describedby="title-error"
										className={state?.errors?.Equipo ? 'border-red-500' : ''}
									/>
									{state?.errors?.title && (
										<p id="idPaciente-error" className="text-sm text-red-500">
											{state.errors.idEquipo[0]}
										</p>
									)}
								</FormGroup>
								<FormGroup>
									<FormLabel htmlFor="Especialidad">Especialidad *</FormLabel>
									<FormInput
										id="especialidad"
										name="especialidad"
										placeholder="Area medica"
										required
										maxLength={200}
										disabled={isPending}
										defaultValue={miembro?.especialidad ?? ''}
										aria-describedby="especialidad-error"
										className={cn('border-0', state?.errors?.especialidad && 'border border-red-500')}
									/>
									{state?.errors?.telefonoPrincipal && (
										<p id="telefonoPrincipal-error" className="text-sm text-red-500">
											{state.errors.especialidad}
										</p>
									)}
								</FormGroup>

								<FormGroup>
									<FormLabel htmlFor="experienciaProfesional">Cuentanos sobre tu experiencia!</FormLabel>
									<FormTextarea
										id="experienciaProfesional"
										name="experienciaProfesional"
										placeholder="Cuentanos sobre ti!"
										required
										minLength={2}
										maxLength={100}
										disabled={isPending}
										defaultValue={miembro?.experienciaProfesional ?? ''}
										aria-describedby="apellido1-error"
										className={cn('border-0', state?.errors?.experienciaProfesional && 'border border-red-500')}
									/>
									{state?.errors?.experienciaProfesional && (
										<p id="apellido1-error" className="text-sm text-red-500">
											{state.errors.experienciaProfesional[0]}
										</p>
									)}
								</FormGroup>

								<FormGroup>
									<FormLabel htmlFor="descripcionBreve">Descripcion</FormLabel>
									<FormTextarea
										id="descripcionBreve"
										name="descripcionBreve"
										placeholder="Describe brevemente que haces!"
										required
										minLength={2}
										maxLength={100}
										disabled={isPending}
										defaultValue={miembro?.descripcionBreve ?? ''}
										aria-describedby="descripcionBreve-error"
										className={cn('border-0', state?.errors?.descripcionBreve && 'border border-red-500')}
									/>
									{state?.errors?.descripcionBreve && (
										<p id="apellido1-error" className="text-sm text-red-500">
											{state.errors.descripcionBreve}
										</p>
									)}
								</FormGroup>
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-foreground">Información de Contacto</h3>
							<FormGroup>
								{services.map((servicio: Service) => {
									return (<div key={servicio.idServicio}>

										<label htmlFor={`servicio-${servicio.idServicio}`}>{servicio.nombreServicio ?? 'Servicio no identificado'}</label>
										<input
											checked={serviciosSeleccionados.includes(servicio.idServicio)}
											onChange={() => toggleServicio(servicio.idServicio)}
											name={`servicio-${servicio.idServicio}`}
											id={`servicio-${servicio.idServicio}`}
											type='checkbox'
											disabled={isPending}
											aria-describedby="servicios-miembro-error"
											className={cn('border-0', state?.errors?.servicios && 'border border-red-500')}
										/>

									</div>
									)
								})
								}
								{state?.errors?.servicio && (
									<p id="servicio-error" className="text-sm text-red-500">
										{state.errors.servicio}
									</p>
								)}
							</FormGroup>


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
							{isEditing ? 'Editar miembro' : 'Crear Miembro del equipo'}
						</Button>
					</DialogFooter>
				</Form>
			</DialogContent>
		</Dialog >
	)
}

