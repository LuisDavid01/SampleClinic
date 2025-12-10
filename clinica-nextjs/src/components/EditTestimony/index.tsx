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
import { HistoriaExito } from '@/types/Testimony'

import { createTestimony, updateTestimony } from '@/actions/historiasExito'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { apiEndpoints, useApiClient } from '@/utils/apiClient'
import { getAllServicios, getServicios } from '@/actions/servicios'
import { Usuario } from '@/types/Usuario'
import { Servicio } from '@/types/Service'
import { formatDateForInput } from '@/lib/utils'
interface ExpedienteFormProps {
	testimony?: HistoriaExito,
	isEditing?: boolean
}

const initialState: ActionResponse = {
	success: false,
	message: '',
	errors: undefined,
}



export default function EditTestimony({ testimony,
	isEditing = false,
}: ExpedienteFormProps) {

	const apiClient = useApiClient();
	const router = useRouter()
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
			rating: Number(formData.get('rating')),
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
				if (!isEditing) {
					router.push('/admin/testimonials')
				} else {
					router.refresh()
				}
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

	const ratingOptions = [
		{ label: 'Deficiente', value: '1' },
		{ label: 'Insatifecho', value: '2' },
		{ label: 'Satisfecho', value: '3' },
		{ label: 'Muy satisfecho', value: '4' },
		{ label: 'Excelente', value: '5' },
	]

	return (
		<Form action={formAction}>
			{state?.message && (
				<FormError
					className={`mb-4 ${state.success ? 'bg-green-100 text-green-800 border-green-300' : ''
						}`}
				>
					{state.message}
				</FormError>
			)}

			<FormGroup>
				<FormLabel htmlFor="idPaciente">Paciente</FormLabel>
				<FormSelect
					key={"testimony-paciente-select"}
					id="idPaciente"
					name="idPaciente"
					defaultValue={testimony?.idPaciente || ''}
					options={pacients.map((pacient: Usuario) => ({
						label: pacient.nombre + ' ' + pacient.apellido1 + ' ' + pacient.apellido2,
						value: pacient.idUsuario
					}))}
					required
					disabled={isPending || isloading}
					aria-describedby="title-error"
					className={state?.errors?.idPaciente ? 'border-red-500' : ''}
				/>
				{state?.errors?.idPaciente && (
					<p id="idPaciente-error" className="text-sm text-red-500">
						{state.errors.idPaciente[0]}
					</p>
				)}
			</FormGroup>



			<FormGroup>
				<FormLabel htmlFor="rating">Califica la experiencia</FormLabel>
				<FormSelect
					key={"testimony-rating-select"}
					id="rating"
					name="rating"
					defaultValue={testimony?.rating || ''}
					options={ratingOptions}
					aria-describedby="description-error"
					className={state?.errors?.rating ? 'border-red-500' : ''}
					disabled={isPending || isloading}
				/>
				{state?.errors?.rating && (
					<p id="idMedico-error" className="text-sm text-red-500">
						{state.errors.rating[0]}
					</p>
				)}
			</FormGroup>
			

			<FormGroup>
				<FormLabel htmlFor="fechaTratamiento">Fecha de tratamiento</FormLabel>
				<FormInput
					id="fechaTratamiento"
					name="fechaTratamiento"
					placeholder=""
					defaultValue={formatDateForInput(new Date(testimony?.fechaTratamiento ?? ''))}
					type="date"
					required
					disabled={isPending || isloading}
					aria-describedby="fecha-fechaTratamiento-error"
					className={state?.errors?.fechaTratamiento ? 'border-red-500' : ''}
				/>
				{state?.errors?.fechaTratamiento && (
					<p id="fecha-error" className="text-sm text-red-500">
						{state.errors.fechaTratamiento[0]}
					</p>
				)}
			</FormGroup>



			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">


				<FormGroup>
					<FormLabel htmlFor="experiencia">Experiencia</FormLabel>
					<FormTextarea
						id="experiencia"
						name="experiencia"
						placeholder="Anote su experiencia..."
						defaultValue={testimony?.experiencia || ''}
						required
						rows={4}
						minLength={3}
						maxLength={100}
						disabled={isPending}
						aria-describedby="experiencia-error"
						className={state?.errors?.experiencia ? 'border-red-500' : ''}
					/>
					{state?.errors?.experiencia && (
						<p id="title-error" className="text-sm text-red-500">
							{state.errors.experiencia[0]}
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
				<Button type="submit" disabled={isloading}>
					Confirmar cambios
				</Button>
			</div>
		</Form>
	)
}
