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
				queryKey: ['doctors'],
				queryFn: async () => {
					const res = await apiClient.get(`${apiEndpoints.getUsuarios()}?rol=fisioterapeuta`)
					return res.usuarios;

				},
				staleTime: 10 * 60 * 1000,
			},
			{
				queryKey: ['pacients'],
				queryFn: async () => {
					const res = await apiClient.get(`${apiEndpoints.getUsuarios()}?rol=paciente`)
					return res.usuarios;
				},
				staleTime: 3 * 60 * 1000,
			},
			{
				queryKey: ['servicios'],
				queryFn: async () => {
					const res = await getAllServicios()
					return res?.servicios ?? [];
				},
				staleTime: 3 * 60 * 1000,
			}

		]
	});
	const isloading = results.some((r) => r.isLoading);
	const doctors = results[0].data ?? [];
	const pacients = results[1].data ?? [];
	const servicios = results[2].data ?? [];
	// Use useActionState hook for the Form submission action
	const [state, formAction, isPending] = useActionState<
		ActionResponse,
		FormData
	>(async (prevState: ActionResponse, formData: FormData) => {
		// Extract data from Form
		const data = {
			idPaciente: Number(formData.get('idPaciente')),
			idServicio: Number(formData.get('idServicio')),
			idMedico: Number(formData.get('idMedico')),
			fechaTratamiento: formData.get('fechaTratamiento') as string,
			experiencia: formData.get('experiencia') as string,
			publicado: formData.get('publicado') === 'true' ? true : false,
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

	const statusOptions = [
		{ label: 'Activo', value: 'true' },
		{ label: 'Inactivo', value: 'false' },
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
					key={"testimony-medico-select"}
					id="idMedico"
					name="idMedico"
					defaultValue={testimony?.idMedico || ''}
					options={doctors.map((doctor: Usuario) => ({
						label: doctor.nombre + ' ' + doctor.apellido1 + ' ' + doctor.apellido2,
						value: doctor.idUsuario
					}))}
					aria-describedby="description-error"
					className={state?.errors?.idMedico ? 'border-red-500' : ''}
					disabled={isPending || isloading}
				/>
				{state?.errors?.idMedico && (
					<p id="idMedico-error" className="text-sm text-red-500">
						{state.errors.idMedico[0]}
					</p>
				)}
			</FormGroup>
			<FormGroup>
				<FormLabel htmlFor="idServicio">Servicio recibido </FormLabel>
				<FormSelect
					key={"testimony-servicio-select"}
					id="idServicio"
					name="idServicio"
					defaultValue={testimony?.idServicio || ''}
					options={servicios.map((servicio: Servicio) => ({
						label: servicio.nombre,
						value: servicio.id
					}))}
					aria-describedby="Servicio-error"
					className={state?.errors?.idServicio ? 'border-red-500' : ''}
					disabled={isPending || isloading}
				/>
				{state?.errors?.idServicio && (
					<p id="Servicio-error" className="text-sm text-red-500">
						{state.errors.idServicio[0]}
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
					<FormLabel htmlFor="publicado">Estado</FormLabel>
					<FormSelect
						id="publicado"
						name="status"
						defaultValue={testimony?.publicado ? 'activo' : 'inActivo'}
						options={statusOptions}
						disabled={isPending}
						required
						aria-describedby="publicado-error"
						className={state?.errors?.publicado ? 'border-red-500' : ''}
					/>
					{state?.errors?.status && (
						<p id="publicado-error" className="text-sm text-red-500">
							{state.errors.publicado[0]}
						</p>
					)}
				</FormGroup>

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
				<Button type="submit" disabled={isloading}>
					Confirmar cambios
				</Button>
			</div>
		</Form>
	)
}
