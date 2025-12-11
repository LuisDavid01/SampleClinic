'use client'
import { useActionState, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '../ui/dialog'
import {
	Form,
	FormGroup,
	FormLabel,
	FormInput,
	FormTextarea,
	FormSelect,
	FormError,
} from '../FormWithActions'
import { HistoriaExito } from '@/types/Testimony'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

import { createTestimony, updateTestimony } from '@/actions/historiasExito'
import { useQueries } from '@tanstack/react-query'
import { apiEndpoints, useApiClient } from '@/utils/apiClient'
import { Usuario } from '@/types/Usuario'
import { formatDateForInput } from '@/lib/utils'
import { useNotification } from '../UseNotification'

type ActionResponse = {
	success: boolean
	message: string
	errors?: Record<string, string[]>
}

interface EditTestimonyDialogProps {
	testimony?: HistoriaExito,
	isEditing?: boolean
	open: boolean
	onOpenChange: (open: boolean) => void
}

const initialState: ActionResponse = {
	success: false,
	message: '',
	errors: undefined,
}

// Componente de estrellas con texto dinámico
function StarRatingComponent({ value, onChange }: { value: number; onChange: (value: number) => void }) {
	const [hoveredValue, setHoveredValue] = useState(0);

	const ratingLabels: Record<number, string> = {
		0: "Sin calificar",
		1: "Muy insatisfecho",
		2: "Insatisfecho",
		3: "Regular",
		4: "Satisfecho",
		5: "Muy satisfecho",
	};

	const handleStarClick = (starValue: number) => {
		onChange(starValue);
	};

	const handleStarHover = (starValue: number) => {
		setHoveredValue(starValue);
	};

	const handleStarLeave = () => {
		setHoveredValue(0);
	};

	const displayValue = hoveredValue || value;

	return (
		<div className="flex flex-col items-center gap-3">
			<div className="flex justify-center items-center gap-1">
				{[1, 2, 3, 4, 5].map((star) => (
					<button
						key={star}
						type="button"
						className="focus:outline-none transition-transform hover:scale-110"
						onClick={() => handleStarClick(star)}
						onMouseEnter={() => handleStarHover(star)}
						onMouseLeave={handleStarLeave}
						aria-label={`Calificar con ${star} estrella${star > 1 ? "s" : ""}`}
					>
						<Star
							className={`w-8 h-8 transition-all duration-200 cursor-pointer ${
								star <= displayValue
									? "fill-yellow-500 text-yellow-500"
									: "text-muted-foreground hover:text-yellow-400"
							}`}
						/>
					</button>
				))}
			</div>
			<p className="text-center text-sm text-muted-foreground font-medium">
				{ratingLabels[displayValue] || "Calificación"}
			</p>
		</div>
	);
}

export default function EditTestimonyDialog({ 
	testimony,
	isEditing = false,
	open,
	onOpenChange,
}: EditTestimonyDialogProps) {

	const apiClient = useApiClient();
	const router = useRouter()
	const { showNotification } = useNotification()
	const [rating, setRating] = useState<number>(0)
	
	// Initialize rating when testimony changes
	useEffect(() => {
		if (testimony?.rating) {
			setRating(testimony.rating)
		} else {
			setRating(0)
		}
	}, [testimony])

	const results = useQueries({
		queries: [
			{
				queryKey: ['pacients'],
				queryFn: async () => {
					const res = await apiClient.get(`${apiEndpoints.getUsuarios()}?rol=paciente`)
					return res.usuarios;
				},
				staleTime: 3 * 60 * 1000,
			},
		]
	});
	const isloading = results.some((r) => r.isLoading);
	const pacients = results[0].data ?? [];
	
	// Use useActionState hook for the Form submission action
	const [state, formAction, isPending] = useActionState<
		ActionResponse,
		FormData
	>(async (prevState: ActionResponse, formData: FormData) => {
		// Extract data from Form
		const data = {
			idPaciente: Number(formData.get('idPaciente')),
			rating: rating, // Use state value instead of form data
			fechaTratamiento: formData.get('fechaTratamiento') as string,
			experiencia: formData.get('experiencia') as string,
		}

		try {
			// Call the appropriate action based on whether we're editing or creating
			const result = isEditing
				? await updateTestimony(Number(testimony!.idHistoria), data)
				: await createTestimony(data)

			// Handle successful submission
			if (result.success) {
				showNotification({
					type: 'success',
					title: isEditing ? 'Testimonio actualizado' : 'Testimonio creado',
					message: result.message || 'Operación exitosa'
				})
				onOpenChange(false)
				router.refresh()
			} else {
				showNotification({
					type: 'error',
					title: 'Error',
					message: result.message || 'Ocurrió un error'
				})
			}

			return result
		} catch (err) {
			return {
				success: false,
				message: (err as Error).message || 'An error occurred',
				errors: undefined
			}
		}
	}, initialState)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="!max-w-[420px] !w-[420px] max-h-[90vh] bg-background border-2 border-[#2B8181]/20 overflow-hidden flex flex-col !p-0">
				<DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-[#2B8181]/20">
					<DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#2B8181] to-[#EE7132] bg-clip-text text-transparent">
						{isEditing ? 'Editar Testimonio' : 'Nuevo Testimonio'}
					</DialogTitle>
				</DialogHeader>
				
				<div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
					<Form action={formAction} id="testimony-form">
						{state?.message && !state.success && (
							<div
								className={cn(
									'mb-4 w-full rounded-lg border px-4 py-3',
									'bg-[#EE7132]/10 border-[#EE7132]/30 text-[#EE7132]'
								)}
								role="alert"
								aria-live="assertive"
							>
								<div className="flex items-center gap-2 text-sm">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									{state.message}
								</div>
							</div>
						)}

						<div className="space-y-5">
							{/* Paciente */}
							<FormGroup className="space-y-2">
								<FormLabel htmlFor="idPaciente" className="text-sm font-medium text-foreground">
									Paciente *
								</FormLabel>
								<FormSelect
									key={"testimony-paciente-select"}
									id="idPaciente"
									name="idPaciente"
									defaultValue={testimony?.idPaciente || ''}
									options={pacients.map((pacient: Usuario) => ({
										label: `${pacient.nombre} ${pacient.apellido1} ${pacient.apellido2 || ''}`.trim(),
										value: pacient.idUsuario
									}))}
									required
									disabled={isPending || isloading}
									aria-describedby="idPaciente-error"
									className={cn(
										'w-full h-10 border border-muted bg-background rounded-lg px-3 py-2 text-sm',
										'focus:outline-none focus:ring-2 focus:ring-[#2B8181]/50 focus:border-[#2B8181]',
										'transition-all duration-200',
										'disabled:cursor-not-allowed disabled:opacity-50',
										state?.errors?.idPaciente && 'border-[#EE7132] focus:ring-[#EE7132]/50'
									)}
								/>
								{state?.errors?.idPaciente && (
									<p id="idPaciente-error" className="text-xs text-[#EE7132] mt-1">
										{state.errors.idPaciente[0]}
									</p>
								)}
							</FormGroup>

							{/* Rating con estrellas */}
							<FormGroup className="space-y-2">
								<FormLabel htmlFor="rating" className="text-sm font-medium text-foreground">
									Calificación *
								</FormLabel>
								<div className="flex flex-col gap-3">
									<div className="bg-card/50 rounded-lg p-4 border border-[#2B8181]/10">
										<StarRatingComponent
											value={rating}
											onChange={setRating}
										/>
									</div>
									<input
										type="hidden"
										name="rating"
										value={rating}
									/>
									{state?.errors?.rating && (
										<p id="rating-error" className="text-xs text-[#EE7132]">
											{state.errors.rating[0]}
										</p>
									)}
								</div>
							</FormGroup>

							{/* Fecha y Experiencia en grid */}
							<div className="grid grid-cols-1 gap-5">
								<FormGroup className="space-y-2">
									<FormLabel htmlFor="fechaTratamiento" className="text-sm font-medium text-foreground">
										Fecha de tratamiento *
									</FormLabel>
									<FormInput
										id="fechaTratamiento"
										name="fechaTratamiento"
										defaultValue={formatDateForInput(new Date(testimony?.fechaTratamiento ?? ''))}
										type="date"
										required
										disabled={isPending || isloading}
										aria-describedby="fechaTratamiento-error"
										className={cn(
											'w-full h-10 border border-muted bg-background rounded-lg px-3 py-2 text-sm',
											'focus:outline-none focus:ring-2 focus:ring-[#2B8181]/50 focus:border-[#2B8181]',
											'transition-all duration-200',
											state?.errors?.fechaTratamiento && 'border-[#EE7132] focus:ring-[#EE7132]/50'
										)}
									/>
									{state?.errors?.fechaTratamiento && (
										<p id="fechaTratamiento-error" className="text-xs text-[#EE7132] mt-1">
											{state.errors.fechaTratamiento[0]}
										</p>
									)}
								</FormGroup>

								<FormGroup className="space-y-2">
									<FormLabel htmlFor="experiencia" className="text-sm font-medium text-foreground">
										Experiencia *
									</FormLabel>
									<FormTextarea
										id="experiencia"
										name="experiencia"
										placeholder="Describe la experiencia del paciente..."
										defaultValue={testimony?.experiencia || ''}
										required
										rows={5}
										minLength={3}
										maxLength={500}
										disabled={isPending}
										aria-describedby="experiencia-error"
										className={cn(
											'w-full border border-muted bg-background rounded-lg px-3 py-2 text-sm',
											'focus:outline-none focus:ring-2 focus:ring-[#2B8181]/50 focus:border-[#2B8181]',
											'transition-all duration-200 resize-none',
											state?.errors?.experiencia && 'border-[#EE7132] focus:ring-[#EE7132]/50'
										)}
									/>
									{state?.errors?.experiencia && (
										<p id="experiencia-error" className="text-xs text-[#EE7132] mt-1">
											{state.errors.experiencia[0]}
										</p>
									)}
								</FormGroup>
							</div>
						</div>
					</Form>
				</div>

				<div className="flex-shrink-0 px-6 pt-4 pb-12 border-t border-[#2B8181]/20 flex flex-row items-center justify-end gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
						className="border-muted hover:bg-muted/50 transition-colors"
					>
						Cancelar
					</Button>
					<Button 
						type="submit" 
						form="testimony-form"
						disabled={isPending || isloading}
						className="bg-[#2B8181] hover:bg-[#2B8181]/90 text-white font-medium transition-all duration-200 disabled:opacity-50"
					>
						{isPending ? (
							<div className="flex items-center gap-2">
								<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
								{isEditing ? 'Guardando...' : 'Creando...'}
							</div>
						) : (
							isEditing ? 'Guardar Cambios' : 'Crear Testimonio'
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

