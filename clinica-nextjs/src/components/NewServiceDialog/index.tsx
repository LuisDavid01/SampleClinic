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
			<DialogContent className="sm:max-w-[850px] max-h-[90vh] bg-background border-2 border-[#2B8181]/20 overflow-hidden flex flex-col p-0">
				<DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-[#2B8181]/20">
					<DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#2B8181] to-[#EE7132] bg-clip-text text-transparent">
						Nuevo Servicio
					</DialogTitle>
				</DialogHeader>
				
				<div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
					<Form action={formAction} id="service-form">
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
							{/* Información del Servicio */}
							<div className="space-y-5 bg-card rounded-xl p-6 border border-[#2B8181]/20 shadow-sm">
								<div className="flex items-center gap-3 mb-2">
									<div className="w-10 h-10 bg-[#2B8181]/10 rounded-lg flex items-center justify-center flex-shrink-0">
										<svg className="w-5 h-5 text-[#2B8181]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
										</svg>
									</div>
									<h3 className="text-lg font-semibold text-foreground">Información del Servicio</h3>
								</div>

								<FormGroup className="space-y-2">
									<FormLabel htmlFor="nombre" className="text-sm font-semibold text-foreground">
										Nombre del servicio *
									</FormLabel>
									<FormInput
										id="nombre"
										name="nombre"
										placeholder="Ej: Terapia Física"
										required
										minLength={3}
										disabled={isPending}
										aria-describedby="nombre-error"
										className={cn(
											'w-full border-2 border-card-foreground/20 bg-background rounded-lg px-3 py-2',
											'focus:outline-none focus:ring-2 focus:ring-[#2B8181]/50 focus:border-[#2B8181]/50',
											'transition-all duration-300 hover:border-[#2B8181]/30',
											state?.errors?.nombre && 'border-[#EE7132] focus:ring-[#EE7132]/50'
										)}
									/>
									{state?.errors?.nombre && (
										<p id="nombre-error" className="text-sm text-[#EE7132] mt-1">
											{state.errors.nombre[0]}
										</p>
									)}
								</FormGroup>

								<FormGroup className="space-y-2">
									<FormLabel htmlFor="detalle" className="text-sm font-semibold text-foreground">
										Detalle *
									</FormLabel>
									<FormTextarea
										id="detalle"
										name="detalle"
										placeholder="Descripción del servicio"
										rows={4}
										disabled={isPending}
										aria-describedby="detalle-error"
										className={cn(
											'w-full border-2 border-card-foreground/20 bg-background rounded-lg px-3 py-2',
											'focus:outline-none focus:ring-2 focus:ring-[#2B8181]/50 focus:border-[#2B8181]/50',
											'transition-all duration-300 hover:border-[#2B8181]/30 resize-none',
											state?.errors?.detalle && 'border-[#EE7132] focus:ring-[#EE7132]/50'
										)}
									/>
									{state?.errors?.detalle && (
										<p id="detalle-error" className="text-sm text-[#EE7132] mt-1">
											{state.errors.detalle[0]}
										</p>
									)}
								</FormGroup>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									<FormGroup className="space-y-2">
										<FormLabel htmlFor="precio" className="text-sm font-semibold text-foreground">
											Precio *
										</FormLabel>
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
											className={cn(
												'w-full border-2 border-card-foreground/20 bg-background rounded-lg px-3 py-2',
												'focus:outline-none focus:ring-2 focus:ring-[#2B8181]/50 focus:border-[#2B8181]/50',
												'transition-all duration-300 hover:border-[#2B8181]/30',
												state?.errors?.precio && 'border-[#EE7132] focus:ring-[#EE7132]/50'
											)}
										/>
										{state?.errors?.precio && (
											<p id="precio-error" className="text-sm text-[#EE7132] mt-1">
												{state.errors.precio[0]}
											</p>
										)}
									</FormGroup>

									<FormGroup className="space-y-2">
										<FormLabel htmlFor="status" className="text-sm font-semibold text-foreground">
											Estado *
										</FormLabel>
										<FormSelect
											id="status"
											name="status"
											defaultValue="Activo"
											options={statusOptions}
											disabled={isPending}
											required
											aria-describedby="status-error"
											className={cn(
												'w-full h-10 border-2 border-card-foreground/20 bg-background rounded-lg px-3 py-2 text-sm',
												'focus:outline-none focus:ring-2 focus:ring-[#2B8181]/50 focus:border-[#2B8181]/50',
												'transition-all duration-300 hover:border-[#2B8181]/30',
												'disabled:cursor-not-allowed disabled:opacity-50',
												state?.errors?.status && 'border-[#EE7132] focus:ring-[#EE7132]/50'
											)}
										/>
										{state?.errors?.status && (
											<p id="status-error" className="text-sm text-[#EE7132] mt-1">
												{state.errors.status[0]}
											</p>
										)}
									</FormGroup>
								</div>
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
						form="service-form"
						disabled={isPending}
						className="bg-gradient-to-r from-[#2B8181] to-[#2B8181]/80 hover:from-[#2B8181]/90 hover:to-[#2B8181]/70 text-white font-semibold transition-all duration-300 disabled:opacity-50 min-w-[150px]"
					>
						{isPending ? (
							<div className="flex items-center gap-2">
								<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
								Creando...
							</div>
						) : (
							'Crear Servicio'
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

