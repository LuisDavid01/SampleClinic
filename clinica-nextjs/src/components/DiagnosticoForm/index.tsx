'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// Removido: import { Form, FormGroup, FormLabel, FormInput, FormTextarea, FormError } from '@/components/ui/form'
import { createDiagnostico, updateDiagnostico, DiagnosticoData, ActionResponse } from '@/actions/diagnosticos'
import { Diagnostico } from '@/types/Expediente'
import { useUser } from '@clerk/nextjs'
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '@/utils/apiClient'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface DiagnosticoFormProps {
	expedienteId: number
	expediente?: any // Para obtener el idPaciente
	diagnostico?: Diagnostico
	isEditing?: boolean
	onSuccess?: () => void
}

const initialState: ActionResponse = {
	success: false,
	message: '',
	errors: undefined,
}

export default function DiagnosticoForm({
	expedienteId,
	expediente,
	diagnostico,
	isEditing = false,
	onSuccess,
}: DiagnosticoFormProps) {
	const router = useRouter()
	const queryClient = useQueryClient()
	const { user } = useUser()
	const apiClient = useApiClient()
	
	// Estado para la fecha seleccionada
	const [selectedDate, setSelectedDate] = useState<Date | null>(
		diagnostico?.fecha ? new Date(diagnostico.fecha) : new Date()
	)

	// Obtener el usuario actual desde la base de datos
	const { data: currentUser } = useQuery({
		queryKey: ['currentUser'],
		queryFn: async () => {
			const res = await apiClient.get('/usuarios')
			return res.usuarios.find((u: any) => u.clerkId === user?.id)
		},
		enabled: !!user?.id,
		staleTime: 10 * 60 * 1000,
	})

	// Use useActionState hook for the form submission action
	const [state, formAction, isPending] = useActionState<
		ActionResponse,
		FormData
	>(async (prevState: ActionResponse, formData: FormData) => {
		// Extract data from form - Incluyendo fecha
		const data: DiagnosticoData = {
			idPaciente: expediente?.idPaciente || Number(formData.get('idPaciente')),
			fecha: formData.get('fecha') as string,
			diagnostico: formData.get('diagnostico') as string,
			idDoctor: currentUser?.idUsuario || 0, // Usar el ID del usuario actual como doctor
			idExpediente: expedienteId, // Usar el ID del expediente
		}

		// Debug: Log the data being sent (incluyendo fecha)
		console.log('DiagnosticoForm data being sent:', {
			idPaciente: data.idPaciente,
			fecha: data.fecha,
			idDoctor: data.idDoctor,
			idExpediente: data.idExpediente,
			diagnostico: data.diagnostico?.substring(0, 50) + '...' // Solo primeros 50 caracteres
		});

		// Validar que tenemos todos los datos necesarios
		if (!data.idPaciente || data.idPaciente === 0) {
			return {
				success: false,
				message: 'Error: No se pudo obtener el ID del paciente',
				error: 'Datos incompletos',
			}
		}

		if (!data.idDoctor || data.idDoctor === 0) {
			return {
				success: false,
				message: 'Error: No se pudo obtener el ID del doctor',
				error: 'Datos incompletos',
			}
		}

		try {
			// Call the appropriate action based on whether we're editing or creating
			const result = isEditing
				? await updateDiagnostico(Number(diagnostico!.idDiagnostico), data)
				: await createDiagnostico(data)

			// Handle successful submission
			if (result.success) {
				// Invalidar queries de diagnósticos
				await queryClient.invalidateQueries({ queryKey: ['diagnosticos', expedienteId] })
				router.refresh()
				// Llamar callback de éxito si existe
				onSuccess?.()
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

	// Verificar permisos - solo fisioterapeutas y administradores pueden crear/editar diagnósticos
	const canManageDiagnosticos = user?.publicMetadata?.role === 'fisioterapeuta' || user?.publicMetadata?.role === 'admin'

	// Verificar que tenemos todos los datos necesarios
	const isDataReady = currentUser && expediente && currentUser.idUsuario && expediente.idPaciente

	if (!canManageDiagnosticos) {
		return (
			<Card className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
				<div className="flex items-center">
					<svg className="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
						<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
					</svg>
					<div>
						<h3 className="text-sm font-medium text-red-800">Acceso denegado</h3>
						<p className="text-sm text-red-600 mt-1">
							Solo los fisioterapeutas y administradores pueden crear o editar diagnósticos.
						</p>
					</div>
				</div>
			</Card>
		)
	}

	// Mostrar estado de carga mientras se obtienen los datos
	if (!isDataReady) {
		return (
			<Card>
				<CardContent className="p-8 text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Cargando datos del expediente...</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{isEditing ? 'Editar Diagnóstico' : 'Nuevo Diagnóstico'}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form action={formAction}>
					{state?.message && (
						<div className={`p-4 rounded-lg mb-4 ${
							state.success 
								? 'bg-green-50 text-green-800 border border-green-200' 
								: 'bg-red-50 text-red-800 border border-red-200'
						}`}>
							{state.message}
						</div>
					)}

					{/* Campo oculto para el ID del paciente */}
					<input type="hidden" name="idPaciente" value={expedienteId} />

					<div className="space-y-2">
						<label htmlFor="fecha" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Fecha del diagnóstico</label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										"w-full justify-start text-left font-normal min-h-[40px]",
										!selectedDate && "text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
									<span className="truncate">
										{selectedDate ? (
											format(selectedDate, "PPP", { locale: es })
										) : (
											"Seleccionar fecha"
										)}
									</span>
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={selectedDate || undefined}
									onSelect={(date) => setSelectedDate(date || null)}
									initialFocus
									locale={es}
									showOutsideDays={false}
									fixedWeeks
									captionLayout="dropdown"
									fromYear={2020}
									toYear={new Date().getFullYear() + 1}
								/>
							</PopoverContent>
						</Popover>
						{/* Campo oculto para enviar la fecha */}
						<input 
							type="hidden" 
							name="fecha" 
							value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''} 
						/>
						{state?.errors?.fecha && (
							<p id="fecha-error" className="text-sm font-medium text-destructive">
								{state.errors.fecha[0]}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<label htmlFor="diagnostico" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Diagnóstico</label>
						<Textarea
							id="diagnostico"
							name="diagnostico"
							placeholder="Describe el diagnóstico..."
							defaultValue={diagnostico?.diagnostico || ''}
							required
							rows={4}
							aria-describedby="diagnostico-error"
							className={`bg-white ${state?.errors?.diagnostico ? 'border-red-500' : ''}`}
						/>
						{state?.errors?.diagnostico && (
							<p id="diagnostico-error" className="text-sm font-medium text-destructive">
								{state.errors.diagnostico[0]}
							</p>
						)}
					</div>

					<div className="flex gap-2 pt-4">
						<Button type="submit" disabled={isPending || !isDataReady}>
							{isPending ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
						</Button>
						<Button type="button" variant="outline" onClick={() => router.back()}>
							Cancelar
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}
