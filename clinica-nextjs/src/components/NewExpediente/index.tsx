'use client'
import { useActionState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EXPEDIENTE_STATUS, Expediente } from '@/types/Expediente'
import { createExpediente, updateExpediente } from '@/actions/expedientes'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { apiEndpoints, useApiClient } from '@/utils/apiClient'
import { AdminPaciente } from '@/types/AdminPaciente'
import { cn } from '@/lib/utils'
import { useUser } from '@clerk/nextjs'




interface ExpedienteFormProps {
	expediente?: Expediente,
	isEditing?: boolean,
	isReadOnly?: boolean
}

const initialState: ActionResponse = {
	success: false,
	message: '',
	errors: undefined,
}

export default function ExpedienteForm({
	expediente,
	isEditing = false,
	isReadOnly = false,
}: ExpedienteFormProps) {
	const apiClient = useApiClient();
	const queryClient = useQueryClient();
	const { user } = useUser();
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
				queryKey: ['currentUser'], 
				queryFn: async () => {
					// Obtener el usuario actual desde la base de datos
					const res = await apiClient.get(`${apiEndpoints.getUsuarios()}`)
					const currentUser = res.usuarios.find((u: any) => u.clerkId === user?.id);
					return currentUser;
				}, 
				staleTime: 10 * 60 * 1000,
				enabled: !!user?.id
			},
			{
				queryKey: ['doctors'], 
				queryFn: async () => {
					// Obtener el usuario actual primero
					const currentUserRes = await apiClient.get(`${apiEndpoints.getUsuarios()}`)
					const currentUser = currentUserRes.usuarios.find((u: any) => u.clerkId === user?.id);
					
					if (!currentUser) return [];
					
					// Si es admin o recepcionista, obtener todos los doctores
					if (currentUser.rol?.idRol === 1 || currentUser.rol?.idRol === 3) { // admin o recepcionista
						const res = await apiClient.get(`${apiEndpoints.getUsuarios()}?rol=fisioterapeuta`)
						return res.usuarios;
					}
					// Si es doctor, solo obtener su propio perfil
					else if (currentUser.rol?.idRol === 2) { // fisioterapeuta
						return [currentUser];
					}
					// Si no tiene rol o es paciente, no puede crear expedientes
					return [];
				}, 
				staleTime: 10 * 60 * 1000,
				enabled: !!user?.id
			},
			{
				queryKey: ['pacients'],
				queryFn: async () => {
					const res = await apiClient.get(`${apiEndpoints.getUsuarios()}?rol=paciente`)
					return res.usuarios;
				},
				staleTime: 3 * 60 * 1000,
			}
		]
	});
	const isLoading = results.some((r) => r.isLoading);
	const currentUser = results[0].data;
	const doctors = results[1].data ?? [];
	const pacients = results[2].data ?? [];

	const doctorOptions = useMemo(
		() => doctors.map((d: any) => ({ label: `${d.nombre} ${d.apellido1}`, value: String(d.idUsuario) })),
		[doctors]
	);

	// Lógica para el doctor por defecto
	const defaultDoctorId = useMemo(() => {
		// Si es fisioterapeuta, siempre usar su propio ID
		if (currentUser?.rol?.idRol === 2 && doctors.length > 0) { // fisioterapeuta
			return String(doctors[0].idUsuario);
		}
		// Si es admin o recepcionista, usar el doctor del expediente existente o el primero disponible
		if (currentUser?.rol?.idRol === 1 || currentUser?.rol?.idRol === 3) { // admin o recepcionista
			return expediente?.idMedico || (doctors.length > 0 ? String(doctors[0].idUsuario) : '');
		}
		// Fallback
		return expediente?.idMedico || '';
	}, [currentUser, doctors, expediente?.idMedico]);

	// Validación: Si es fisioterapeuta editando, verificar que el expediente le pertenece
	const canEditExpediente = useMemo(() => {
		if (!isEditing || !expediente || !currentUser) return true;
		
		// Si es fisioterapeuta, solo puede editar expedientes asignados a él
		if (currentUser.rol?.idRol === 2) {
			return expediente.idMedico === currentUser.idUsuario;
		}
		
		// Admin y recepcionista pueden editar cualquier expediente
		return true;
	}, [isEditing, expediente, currentUser]);



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
			// Si el campo está deshabilitado, usar el valor por defecto
			idDoctor: (() => {
				const formIdDoctor = formData.get('idDoctor');
				if (formIdDoctor && formIdDoctor !== '') {
					return Number(formIdDoctor);
				}
				
				// Si es fisioterapeuta, usar su propio ID
				if (currentUser?.rol?.idRol === 2 && doctors.length > 0) {
					return Number(doctors[0].idUsuario);
				}
				
				// Si está editando, mantener el médico actual
				if (isEditing && expediente?.idMedico) {
					return Number(expediente.idMedico);
				}
				
				// Si hay doctores disponibles, usar el primero
				if (doctors.length > 0) {
					return Number(doctors[0].idUsuario);
				}
				
				// Fallback: usar el primer doctor disponible o 0 si no hay ninguno
				return doctors.length > 0 ? Number(doctors[0].idUsuario) : 0;
			})(),
		}

		// Debug: Log the data being sent
		console.log('Form data being sent:', {
			...data,
			formDataIdDoctor: formData.get('idDoctor'),
			currentUserRole: currentUser?.rol?.idRol,
			doctorsLength: doctors.length,
			defaultDoctorId
		});

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


	// Si no puede editar el expediente, mostrar mensaje de error
	if (!canEditExpediente) {
		return (
			<div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
				<div className="flex items-center">
					<svg className="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
						<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
					</svg>
					<div>
						<h3 className="text-sm font-medium text-red-800">Acceso denegado</h3>
						<p className="text-sm text-red-600 mt-1">
							No tienes permisos para editar este expediente. Solo puedes editar expedientes asignados a ti.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<form action={formAction} className="w-full space-y-6">
			{state?.message && (
				<div
					className={cn(
						'w-full rounded-md border px-4 py-3',
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

			<div className="space-y-2 w-full">
				<Label htmlFor="idPaciente" className="text-sm font-medium">Nombre del paciente</Label>
				<Select
					name="idPaciente"
					defaultValue={expediente?.idPaciente?.toString() || ''}
					disabled={isLoading || isReadOnly}
				>
					<SelectTrigger className={`w-full bg-white border-2 ${state?.errors?.title ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}>
						<SelectValue placeholder="Seleccionar paciente" />
					</SelectTrigger>
					<SelectContent>
						{patientOptions.map((option) => (
							<SelectItem key={option.value} value={option.value.toString()}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{state?.errors?.title && (
					<p id="title-error" className="text-sm text-red-500">
						{state.errors.title[0]}
					</p>
				)}
			</div>


			<div className="space-y-2 w-full">
				<Label htmlFor="cedula" className="text-sm font-medium">Cedula de identidad</Label>
				<Input
					id="cedula"
					name="cedula"
					placeholder="Documento de identidad del paciente"
					defaultValue={expediente?.cedula || ''}
					required
					minLength={3}
					maxLength={12}
					disabled={isPending || isReadOnly}
					aria-describedby="cedula-error"
					className={`w-full bg-white border-2 ${state?.errors?.cedula ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
				/>
				{state?.errors?.cedula && (
					<p id="cedula-error" className="text-sm text-red-500">
						{state.errors.cedula[0]}
					</p>
				)}
			</div>



			<div className="space-y-2 w-full">
				<Label htmlFor="descripcion" className="text-sm font-medium">Descripcion</Label>
				<Textarea
					id="descripcion"
					name="descripcion"
					placeholder="Descripcion del estado del paciente"
					rows={4}
					defaultValue={expediente?.descripcion || ''}
					disabled={isPending || isReadOnly}
					aria-describedby="description-error"
					className={`w-full bg-white border-2 ${state?.errors?.description ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
				/>
				{state?.errors?.description && (
					<p id="description-error" className="text-sm text-red-500">
						{state.errors.description[0]}
					</p>
				)}
			</div>

			<div className="space-y-2 w-full">
				<Label htmlFor="idDoctor" className="text-sm font-medium">Doctor asignado</Label>
				<Select
					name="idDoctor"
					defaultValue={defaultDoctorId?.toString() || ''}
					disabled={isPending || (currentUser?.rol?.idRol === 2) || isReadOnly} // Deshabilitar si es fisioterapeuta o solo lectura
				>
					<SelectTrigger className={`w-full bg-white border-2 ${state?.errors?.idDoctor ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}>
						<SelectValue placeholder="Seleccionar doctor" />
					</SelectTrigger>
					<SelectContent>
						{doctorOptions.map((option) => (
							<SelectItem key={option.value} value={option.value.toString()}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{/* Campo oculto para asegurar que el valor se envíe cuando está deshabilitado */}
				{currentUser?.rol?.idRol === 2 && (
					<input 
						type="hidden" 
						name="idDoctor" 
						value={defaultDoctorId} 
					/>
				)}
				{currentUser?.rol?.idRol === 2 && (
					<p className="text-xs text-gray-500 mt-1">
						{isEditing 
							? 'Como fisioterapeuta, solo puedes editar expedientes asignados a ti mismo.'
							: 'Como fisioterapeuta, solo puedes crear expedientes asignados a ti mismo.'
						}
					</p>
				)}
				{state?.errors?.idDoctor && (
					<p id="doctor-error" className="text-sm text-red-500">
						{state.errors.idDoctor[0]}
					</p>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2 w-full">
					<Label htmlFor="status" className="text-sm font-medium">Status</Label>
					<Select
						name="status"
						defaultValue={expediente?.estado || 'Activo'}
						disabled={isPending || isReadOnly}
					>
						<SelectTrigger className={`w-full bg-white border-2 ${state?.errors?.status ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}>
							<SelectValue placeholder="Seleccionar status" />
						</SelectTrigger>
						<SelectContent>
							{statusOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{state?.errors?.status && (
						<p id="status-error" className="text-sm text-red-500">
							{state.errors.status[0]}
						</p>
					)}
				</div>
			</div>

			{!isReadOnly && (
				<div className="w-full mt-8 pt-6 border-t-2 border-gray-300">
					<div className="flex flex-col gap-4 w-full">
						<Button 
							type="submit" 
							disabled={isPending}
							className="w-full font-semibold py-3"
						>
							{isEditing ? 'Confirmar cambios' : 'Crear expediente'}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => router.back()}
							disabled={isPending}
							className="w-full bg-white border-2 border-gray-400 hover:border-gray-500 py-3"
						>
							Cancel
						</Button>
					</div>
				</div>
			)}
		</form>
	)
}
