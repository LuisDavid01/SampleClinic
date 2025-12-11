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
			<DialogContent className="sm:max-w-[850px] max-h-[90vh] bg-background border-2 border-[#2B8181]/20 overflow-hidden flex flex-col p-0">
				<DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-[#2B8181]/20">
					<DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#2B8181] to-[#EE7132] bg-clip-text text-transparent">
						{isEditing ? 'Editar Miembro del Equipo' : 'Nuevo Miembro del Equipo'}
					</DialogTitle>
				</DialogHeader>
				
				<div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
					<Form action={formAction} id="team-member-form">
						{state?.message && !state.success && (
							<div
								className={cn(
									'mb-4 w-full rounded-xl border-2 px-4 py-3',
									'bg-gradient-to-r from-[#EE7132]/10 to-[#EE7132]/5 border-[#EE7132]/30',
									'text-[#EE7132] dark:text-[#EE7132]'
								)}
								role="alert"
								aria-live="assertive"
							>
								<div className="flex items-center gap-2">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									{state.message}
								</div>
							</div>
						)}

						<div className="space-y-6">
						{/* Información Personal */}
						<div className="space-y-5 bg-card rounded-xl p-6 border border-[#2B8181]/20 shadow-sm">
							<div className="flex items-center gap-3 mb-2">
								<div className="w-10 h-10 bg-[#2B8181]/10 rounded-lg flex items-center justify-center flex-shrink-0">
									<svg className="w-5 h-5 text-[#2B8181]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
								<h3 className="text-lg font-semibold text-foreground">Información Personal</h3>
							</div>

							{/* Primera fila: Miembro del Equipo y Especialidad */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
								<FormGroup className="space-y-2">
									<FormLabel htmlFor="idEquipo" className="text-sm font-semibold text-foreground">
										Miembro del Equipo *
									</FormLabel>
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
										aria-describedby="idEquipo-error"
										className={cn(
											'w-full h-10 border-2 border-card-foreground/20 bg-background rounded-lg px-3 py-2 text-sm',
											'focus:outline-none focus:ring-2 focus:ring-[#2B8181]/50 focus:border-[#2B8181]/50',
											'transition-all duration-300 hover:border-[#2B8181]/30',
											'disabled:cursor-not-allowed disabled:opacity-50',
											state?.errors?.Equipo && 'border-[#EE7132] focus:ring-[#EE7132]/50'
										)}
									/>
									{state?.errors?.idEquipo && (
										<p id="idEquipo-error" className="text-sm text-[#EE7132] mt-1">
											{state.errors.idEquipo[0]}
										</p>
									)}
								</FormGroup>
								
								<FormGroup className="space-y-2">
									<FormLabel htmlFor="especialidad" className="text-sm font-semibold text-foreground">
										Especialidad *
									</FormLabel>
									<FormInput
										id="especialidad"
										name="especialidad"
										placeholder="Ej: Fisioterapia Deportiva"
										required
										maxLength={200}
										disabled={isPending}
										defaultValue={miembro?.especialidad ?? ''}
										aria-describedby="especialidad-error"
										className={cn(
											'w-full border-2 border-card-foreground/20 bg-background rounded-lg px-3 py-2',
											'focus:outline-none focus:ring-2 focus:ring-[#2B8181]/50 focus:border-[#2B8181]/50',
											'transition-all duration-300 hover:border-[#2B8181]/30',
											state?.errors?.especialidad && 'border-[#EE7132] focus:ring-[#EE7132]/50'
										)}
									/>
									{state?.errors?.especialidad && (
										<p id="especialidad-error" className="text-sm text-[#EE7132] mt-1">
											{state.errors.especialidad[0]}
										</p>
									)}
								</FormGroup>
							</div>

							{/* Segunda fila: Experiencia Profesional */}
							<FormGroup className="space-y-2">
								<FormLabel htmlFor="experienciaProfesional" className="text-sm font-semibold text-foreground">
									Experiencia Profesional *
								</FormLabel>
								<FormTextarea
									id="experienciaProfesional"
									name="experienciaProfesional"
									placeholder="Describe tu experiencia profesional, años de práctica, certificaciones, etc."
									required
									minLength={2}
									maxLength={500}
									rows={4}
									disabled={isPending}
									defaultValue={miembro?.experienciaProfesional ?? ''}
									aria-describedby="experienciaProfesional-error"
									className={cn(
										'w-full border-2 border-card-foreground/20 bg-background rounded-lg px-3 py-2',
										'focus:outline-none focus:ring-2 focus:ring-[#2B8181]/50 focus:border-[#2B8181]/50',
										'transition-all duration-300 hover:border-[#2B8181]/30 resize-none',
										state?.errors?.experienciaProfesional && 'border-[#EE7132] focus:ring-[#EE7132]/50'
									)}
								/>
								{state?.errors?.experienciaProfesional && (
									<p id="experienciaProfesional-error" className="text-sm text-[#EE7132] mt-1">
										{state.errors.experienciaProfesional[0]}
									</p>
								)}
							</FormGroup>

							{/* Tercera fila: Descripción Breve */}
							<FormGroup className="space-y-2">
								<FormLabel htmlFor="descripcionBreve" className="text-sm font-semibold text-foreground">
									Descripción Breve *
								</FormLabel>
								<FormTextarea
									id="descripcionBreve"
									name="descripcionBreve"
									placeholder="Describe brevemente tu especialidad y enfoque de trabajo..."
									required
									minLength={2}
									maxLength={300}
									rows={3}
									disabled={isPending}
									defaultValue={miembro?.descripcionBreve ?? ''}
									aria-describedby="descripcionBreve-error"
									className={cn(
										'w-full border-2 border-card-foreground/20 bg-background rounded-lg px-3 py-2',
										'focus:outline-none focus:ring-2 focus:ring-[#2B8181]/50 focus:border-[#2B8181]/50',
										'transition-all duration-300 hover:border-[#2B8181]/30 resize-none',
										state?.errors?.descripcionBreve && 'border-[#EE7132] focus:ring-[#EE7132]/50'
									)}
								/>
								{state?.errors?.descripcionBreve && (
									<p id="descripcionBreve-error" className="text-sm text-[#EE7132] mt-1">
										{state.errors.descripcionBreve[0]}
									</p>
								)}
							</FormGroup>
						</div>

						{/* Servicios */}
						<div className="space-y-4 bg-card rounded-xl p-6 border border-[#EE7132]/20 shadow-sm">
							<div className="flex items-center gap-3 mb-2">
								<div className="w-10 h-10 bg-[#EE7132]/10 rounded-lg flex items-center justify-center flex-shrink-0">
									<svg className="w-5 h-5 text-[#EE7132]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
								</div>
								<h3 className="text-lg font-semibold text-foreground">Servicios Ofrecidos</h3>
							</div>
							<FormGroup>
								{isloading ? (
									<div className="flex items-center justify-center py-8">
										<div className="w-6 h-6 border-2 border-[#2B8181] border-t-transparent rounded-full animate-spin" />
										<span className="ml-2 text-muted-foreground">Cargando servicios...</span>
									</div>
								) : services.length === 0 ? (
									<p className="text-sm text-muted-foreground text-center py-4">
										No hay servicios disponibles
									</p>
								) : (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										{services.map((servicio: Service) => {
											const isSelected = serviciosSeleccionados.includes(servicio.idServicio);
											return (
												<label
													key={servicio.idServicio}
													htmlFor={`servicio-${servicio.idServicio}`}
													className={cn(
														'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
														isSelected
															? 'border-[#2B8181] bg-[#2B8181]/10 shadow-sm'
															: 'border-card-foreground/20 bg-background hover:border-[#2B8181]/30 hover:bg-[#2B8181]/5'
													)}
												>
													<input
														checked={isSelected}
														onChange={() => toggleServicio(servicio.idServicio)}
														name={`servicio-${servicio.idServicio}`}
														id={`servicio-${servicio.idServicio}`}
														type='checkbox'
														disabled={isPending}
														aria-describedby="servicios-miembro-error"
														className={cn(
															'w-5 h-5 rounded border-2 cursor-pointer transition-all flex-shrink-0',
															'text-[#2B8181] focus:ring-2 focus:ring-[#2B8181]/50',
															state?.errors?.servicios && 'border-[#EE7132]'
														)}
													/>
													<span className={cn(
														'text-sm font-medium flex-1',
														isSelected ? 'text-[#2B8181]' : 'text-foreground'
													)}>
														{servicio.nombreServicio ?? 'Servicio no identificado'}
													</span>
													{isSelected && (
														<svg className="w-5 h-5 text-[#2B8181] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
															<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
														</svg>
													)}
												</label>
											);
										})}
									</div>
								)}
								{state?.errors?.servicio && (
									<p id="servicio-error" className="text-sm text-[#EE7132] mt-2">
										{state.errors.servicio}
									</p>
								)}
							</FormGroup>
						</div>
						</div>
					</Form>
				</div>

				<DialogFooter className="flex-shrink-0 px-6 pt-4 pb-6 border-t border-[#2B8181]/20 flex flex-row items-center justify-end gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
						className="border-[#2B8181]/30 hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors min-w-[100px]"
					>
						Cancelar
					</Button>
					<Button 
						type="submit" 
						form="team-member-form"
						disabled={isPending}
						className="bg-gradient-to-r from-[#2B8181] to-[#2B8181]/80 hover:from-[#2B8181]/90 hover:to-[#2B8181]/70 text-white font-semibold transition-all duration-300 disabled:opacity-50 min-w-[150px]"
					>
						{isPending ? (
							<div className="flex items-center gap-2">
								<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
								{isEditing ? 'Guardando...' : 'Creando...'}
							</div>
						) : (
							isEditing ? 'Guardar Cambios' : 'Crear Miembro'
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog >
	)
}

