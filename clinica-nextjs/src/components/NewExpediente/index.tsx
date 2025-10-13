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
import { EXPEDIENTE_STATUS, Expediente } from '@/types/Expediente'
import { createExpediente, updateExpediente } from '@/actions/expedientes'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { apiEndpoints, useApiClient } from '@/utils/apiClient'
import { AdminPaciente } from '@/types/AdminPaciente'
import { cn } from '@/lib/utils'




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
	const queryClient = useQueryClient();
	/*
		const { isLoading, data: pacients } = useQuery<AdminPaciente[]>({
			queryKey: ['pacients'],
			queryFn: async () => {
				const res = await apiClient.get(`${apiEndpoints.getUsuarios()}?rol=paciente`)
				return res.usuarios;
			},
			staleTime: 3 * 60 * 1000,
	
		})
	*/
	const results = useQueries({
		queries: [
			{
				queryKey: ['doctors'], queryFn: async () => {
					const res = await apiClient.get(`${apiEndpoints.getUsuarios()}?rol=admin`)
					return res.usuarios;
				}, staleTime: 1 * 60 * 1000,
			},
			{
				queryKey: ['pacients'],
				queryFn: async () => {
					const res = await apiClient.get(`${apiEndpoints.getUsuarios()}`)
					return res.usuarios;
				},
				staleTime: 1 * 60 * 1000,

			}
		]
	});
	const isLoading = results.some((r) => r.isLoading);
	const pacients = results[1].data ?? []

	const doctors = results[0].data ?? [];

	const doctorOptions = useMemo(
		() => doctors.map((d: any) => ({ label: `${d.nombre} ${d.apellido1}`, value: String(d.idUsuario) })),
		[doctors]
	);



	const patientOptions = useMemo(() => {
		if (!pacients) return [];
		return pacients.map((p: AdminPaciente) => ({
			label: `${p.nombre} ${p.apellido1}`,
			value: String(p.idUsuario),
		}));
	}, [pacients]);

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
			idDoctor: Number(formData.get('idDoctor')),
		}

		try {
			// Call the appropriate action based on whether we're editing or creating

			const result = isEditing
				? await updateExpediente(Number(expediente!.idExpediente), data)
				: await createExpediente(data)


			// Handle successful submission
			if (result.success) {
				if (!isEditing) {
					await queryClient.invalidateQueries({ queryKey: ['expedientes'] });
					router.push('/admin/files')

				}
				await queryClient.invalidateQueries({ queryKey: ['expediente'] });
				router.refresh();
			}

			return result
		} catch (err) {
			return {
				success: false,
				message: (err as Error).message || 'An error occurred',
				errors: undefined,
			}
		}
	}, initialState);

	const statusOptions = Object.values(EXPEDIENTE_STATUS).map(({ label, value }) => ({
		label,
		value,
	}));


	return (
		<Form action={formAction}>
			{state?.message && (
				<div
					className={cn(
						' mb-4 w-full max-w-md rounded-md border px-4 py-2',
						state.success
							? 'bg-green-50 text-green-800 border-green-300'
							: 'bg-red-50 text-red-800 border-red-300'
					)}
					role="status"
					aria-live={state.success ? 'polite' : 'assertive'}
				>
					{state.message}
				</div>
			)}
			{patientOptions.length === 0 ? (
				<div className="text-muted-foreground">Cargando pacientes...</div>
			) : (
				<FormGroup>
					<FormLabel htmlFor="idPaciente">Nombre del paciente</FormLabel>
					<FormSelect
						id="idPaciente"
						name="idPaciente"
						options={patientOptions}
						defaultValue={String(expediente?.idPaciente)}
						required
						aria-describedby="title-error"
						className={state?.errors?.title ? 'border-red-500' : ''}
						disabled={isLoading || patientOptions.length === 0}
					/>
					{state?.errors?.title && (
						<p id="title-error" className="text-sm text-red-500">
							{state.errors.title[0]}
						</p>
					)}
				</FormGroup>
			)}

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
					disabled={isLoading}
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
					options={doctorOptions}
					defaultValue={expediente?.idMedico || ''}
					disabled={isLoading}
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
						defaultValue={String(expediente?.estado)}
						options={statusOptions}
						disabled={isLoading}
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
