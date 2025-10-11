'use client'
import { useActionState, useMemo } from 'react'
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
} from '@/components/ui/Form'
import { ISSUE_STATUS, Expediente } from '@/types/Expediente'
import { createExpediente, updateExpediente } from '@/actions/expedientes'
import { useQuery } from '@tanstack/react-query'
import { apiEndpoints, useApiClient } from '@/utils/apiClient'
import { AdminPaciente } from '@/types/AdminPaciente'


const doctors = [
	{ label: 'Guillermo', value: 'guillermo' },
	{ label: 'María', value: 'maria' },
]


interface ExpedienteFormProps {
	expediente?: Expediente,
	isEditing?: boolean
}

const initialState: ActionResponse = {
	success: false,
	message: '',
	errors: undefined,
}

export default function ExpedienteForm({
	expediente,
	isEditing = false,
}: ExpedienteFormProps) {
	const apiClient = useApiClient();

	const { isLoading, data: patients = [] } = useQuery<AdminPaciente[]>({
		queryKey: ['pacients-file'],
		queryFn: async () => {
			const res = await apiClient.get(`${apiEndpoints.getUsuarios()}?rol=paciente`)
			console.log(res)
			return res.usuarios;
		},
		staleTime: 5 * 60 * 1000,

	})
	const patientOptions = useMemo(() => {
		if (!patients) return [];
		return patients.map((p) => ({
			label: `${p.nombre} ${p.apellido1}`,
			value: String(p.idUsuario),
		}));
	}, [patients]);

	const router = useRouter()

	// Use useActionState hook for the form submission action
	const [state, formAction, isPending] = useActionState<
		ActionResponse,
		FormData
	>(async (prevState: ActionResponse, formData: FormData) => {
		// Extract data from form
		const data = {
			descripcion: formData.get('descripcion') as string,
			estado: formData.get('status') as 'activo' | 'inactivo',
			idPaciente: Number(formData.get("idPaciente")),
			cedula: formData.get('cedula') as string,
			idDoctor: formData.get('idDoctor') as string
		}

		try {
			// Call the appropriate action based on whether we're editing or creating

			const result = isEditing
				? await updateExpediente(Number(expediente!.id), data)
				: await createExpediente(data)


			console.log("Result:", result)
			// Handle successful submission
			if (result.success) {
				router.refresh()
				if (!isEditing) {
					router.push('/admin/files')
				}
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

	const statusOptions = Object.values(ISSUE_STATUS).map(({ label, value }) => ({
		label,
		value,
	}))


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
				<FormLabel htmlFor="idPaciente">Nombre del paciente</FormLabel>
				<FormSelect
					id="idPaciente"
					name="idPaciente"
					options={patientOptions}
					defaultValue={expediente?.idPaciente || ''}
					required
					aria-describedby="title-error"
					className={state?.errors?.title ? 'border-red-500' : ''}
					disabled={isLoading}
				/>
				{state?.errors?.title && (
					<p id="title-error" className="text-sm text-red-500">
						{state.errors.title[0]}
					</p>
				)}
			</FormGroup>


			<FormGroup>
				<FormLabel htmlFor="cedula">Cedula de identidad</FormLabel>
				<FormInput
					id="cedula"
					name="cedula"
					placeholder="Documento de identidad del paciente"
					defaultValue={expediente?.cedula || ''}
					required
					minLength={3}
					maxLength={12}
					disabled={isPending}
					aria-describedby="cedula-error"
					className={state?.errors?.cedula ? 'border-red-500' : ''}
				/>
				{state?.errors?.title && (
					<p id="cedula-error" className="text-sm text-red-500">
						{state.errors.title[0]}
					</p>
				)}
			</FormGroup>



			<FormGroup>
				<FormLabel htmlFor="descripcion">Descripcion</FormLabel>
				<FormTextarea
					id="descripcion"
					name="descripcion"
					placeholder="Descripcion del estado del paciente"
					rows={4}
					defaultValue={expediente?.descripcion || ''}
					disabled={isPending}
					aria-describedby="description-error"
					className={state?.errors?.description ? 'border-red-500' : ''}
				/>
				{state?.errors?.description && (
					<p id="description-error" className="text-sm text-red-500">
						{state.errors.description[0]}
					</p>
				)}
			</FormGroup>

			<FormGroup>
				<FormLabel htmlFor="idDoctor">Doctor asignado</FormLabel>
				<FormSelect
					id="idDoctor"
					name="idDoctor"
					options={doctors}
					defaultValue={expediente?.idDoctor || ''}
					disabled={isPending}
					aria-describedby="description-error"
					className={state?.errors?.description ? 'border-red-500' : ''}
				/>
				{state?.errors?.description && (
					<p id="description-error" className="text-sm text-red-500">
						{state.errors.description[0]}
					</p>
				)}
			</FormGroup>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormGroup >
					<FormLabel htmlFor="status">Status</FormLabel>
					<FormSelect
						id="status"
						name="status"
						defaultValue={expediente?.estado || 'Activo'}
						options={statusOptions}
						disabled={isPending}
						required
						aria-describedby="status-error"
						className={state?.errors?.status ? 'border-red-500' : ''}
					/>
					{state?.errors?.status && (
						<p id="status-error" className="text-sm text-red-500">
							{state.errors.status[0]}
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
				<Button type="submit" >
					{isEditing ? 'Confirmar cambios' : 'Crear expediente'}
				</Button>
			</div>
		</Form>
	)
}
