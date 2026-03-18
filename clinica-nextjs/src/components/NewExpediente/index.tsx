'use client'
import { useActionState, useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EXPEDIENTE_STATUS, Expediente } from '@/types/Expediente'
import { createExpediente, updateExpediente } from '@/actions/expedientes'
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query'
import { apiEndpoints, useApiClient } from '@/utils/apiClient'
import { AdminPaciente } from '@/types/AdminPaciente'
import { cn } from '@/lib/utils'
import { useUser } from '@clerk/nextjs'
import { expedienteSchema } from '@/lib/validations'
import { validateFormData } from '@/lib/form-validation'
import { Switch } from '../ui/switch'




interface ExpedienteFormProps {
	expediente?: Expediente,
	isEditing?: boolean,
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
	const { user } = useUser();
	const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
	const [isReadOnly, setIsReadOnly] = useState(isEditing);
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
	// Primero obtener el usuario actual
	const { data: currentUser, isLoading: isLoadingUser, error: currentUserError } = useQuery({
		queryKey: ['currentUser', user?.id],
		queryFn: async () => {
			const clerkId = user?.id;

			if (!clerkId) {
				return null;
			}

			try {
				// Primero intentar crear/validar el usuario con /usuarios/validaClerk
				// Este endpoint crea el usuario automáticamente si no existe
				try {
					const validateRes = await apiClient.get(`/usuarios/validaClerk/${clerkId}`);
					if (validateRes?.user) {
						return validateRes.user;
					}
				} catch (validateError) {
					// Silenciar error y continuar con siguiente método
				}

				// Si validaClerk falla, intentar con /usuarios/me (requiere clerkAuth)
				try {
					const meRes = await apiClient.get('/usuarios/me');
					if (meRes?.user) {
						return meRes.user;
					}
				} catch (meError) {
					// Silenciar error y continuar con siguiente método
				}

				// Como último recurso, buscar en la lista completa
				const res = await apiClient.get(`${apiEndpoints.getUsuarios()}?limit=1000`)
				const foundUser = res?.usuarios?.find((u: any) => u.clerkId === clerkId);

				return foundUser || null;
			} catch (error) {
				return null;
			}
		},
		staleTime: 10 * 60 * 1000,
		enabled: !!user?.id
	});


	// Luego obtener los doctores basado en el usuario actual
	const { data: doctors = [], isLoading: isLoadingDoctors, error: doctorsError } = useQuery({
		queryKey: ['doctors', currentUser?.idUsuario, currentUser?.rol?.idRol],
		queryFn: async () => {
			try {
				if (!currentUser) {
					return [];
				}

				// Si es admin o recepcionista, obtener todos los doctores (rol 2 = fisioterapeuta)
				if (currentUser.rol?.idRol === 1 || currentUser.rol?.idRol === 3) { // admin o recepcionista
					// Obtener todos los usuarios con rol 2 (fisioterapeuta) sin límite de paginación
					const res = await apiClient.get(`${apiEndpoints.getUsuarios()}?limit=1000`)
					// Filtrar solo los que tienen rol 2 (fisioterapeuta) y están activos
					const fisioterapeutas = Array.isArray(res?.usuarios)
						? res.usuarios.filter((u: any) => u.rol?.idRol === 2 && u.activo !== false)
						: [];
					return fisioterapeutas;
				}
				// Si es fisioterapeuta (rol 2), solo obtener su propio perfil
				else if (currentUser.rol?.idRol === 2) { // fisioterapeuta
					return [currentUser];
				}
				// Si no tiene rol o es paciente, no puede crear expedientes
				return [];
			} catch (error) {
				return [];
			}
		},
		staleTime: 10 * 60 * 1000,
		enabled: !!user?.id && !!currentUser
	});

	// Obtener pacientes
	const { data: pacients = [], isLoading: isLoadingPacients } = useQuery({
		queryKey: ['pacients'],
		queryFn: async () => {
			const res = await apiClient.get(`${apiEndpoints.getUsuarios()}?rol=paciente`)
			return res.usuarios || [];
		},
		staleTime: 3 * 60 * 1000,
	});

	const isLoading = isLoadingUser || isLoadingDoctors || isLoadingPacients;




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

	// Calcular el valor de aria-live antes del render
	const ariaLiveValue: 'polite' | 'assertive' = state?.success === true ? 'polite' : 'assertive';

	return (
		<>
			<div className={`flex items-center space-x-2 `}>

				{isEditing &&
					<>
						<Switch
							checked={isReadOnly}
							onCheckedChange={() => setIsReadOnly(!isReadOnly)}
							aria-label="Toggle editing mode"
						/>

						<div className="text-sm font-medium">
							{isReadOnly ? "Solo visualizar" : "Editar"}
						</div>
					</>
				}
			</div>
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
						{...(ariaLiveValue === 'polite' ? { 'aria-live': 'polite' } : { 'aria-live': 'assertive' })}
					>
						{state.message}
					</div>
				)}

				<div className="space-y-2 w-full">
					<Label htmlFor="idPaciente" className="text-sm font-medium">Nombre del paciente</Label>
					{/* Si está en modo lectura y el expediente tiene información del paciente, mostrarlo directamente */}
					{(isEditing || isReadOnly) && expediente?.paciente ? (
						<Input
							id="idPaciente"
							name="idPaciente"
							value={`${expediente.paciente.nombre || ''} ${expediente.paciente.apellido1 || ''} ${expediente.paciente.apellido2 || ''}`.trim()}
							disabled={true}
							className="w-full bg-gray-50 border-2 border-gray-300"
						/>
					) : (
						<Select
							name="idPaciente"
							defaultValue={expediente?.idPaciente?.toString() || ''}
							disabled={isLoading || isEditing}
						>
							<SelectTrigger className={`w-full bg-white border-2 ${validationErrors.idPaciente || state?.errors?.title ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}>
								<SelectValue placeholder="Seleccionar paciente">
									{expediente?.paciente && `${expediente.paciente.nombre || ''} ${expediente.paciente.apellido1 || ''} ${expediente.paciente.apellido2 || ''}`.trim()}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								{/* Si el paciente del expediente no está en la lista, agregarlo */}
								{expediente?.paciente && !pacients.find((p: AdminPaciente) => p.idUsuario === expediente.paciente.idUsuario) && (
									<SelectItem
										key={`expediente-paciente-${expediente.paciente.idUsuario}`}
										value={expediente.paciente.idUsuario.toString()}
									>
										{`${expediente.paciente.nombre || ''} ${expediente.paciente.apellido1 || ''} ${expediente.paciente.apellido2 || ''}`.trim()}
									</SelectItem>
								)}
								{pacients.map((p: AdminPaciente) => (
									<SelectItem key={p.nombre + p.idUsuario} value={p.idUsuario.toString()}>
										{p.nombre + ' ' + p.apellido1 + ' ' + p.apellido2}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
					{(validationErrors.idPaciente || state?.errors?.title) && (
						<p id="idPaciente-error" className="text-sm text-red-500">
							{validationErrors.idPaciente?.[0] || state?.errors?.title?.[0]}
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
						className={`w-full bg-white border-2 ${validationErrors.cedula || state?.errors?.cedula ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
					/>
					{(validationErrors.cedula || state?.errors?.cedula) && (
						<p id="cedula-error" className="text-sm text-red-500">
							{validationErrors.cedula?.[0] || state?.errors?.cedula?.[0]}
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
						className={`w-full bg-white border-2 ${validationErrors.descripcion || state?.errors?.description ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
					/>
					{(validationErrors.descripcion || state?.errors?.description) && (
						<p id="descripcion-error" className="text-sm text-red-500">
							{validationErrors.descripcion?.[0] || state?.errors?.description?.[0]}
						</p>
					)}
				</div>

				<div className="space-y-2 w-full">
					<Label htmlFor="idDoctor" className="text-sm font-medium">Doctor asignado</Label>
					<Select
						name="idDoctor"
						defaultValue={defaultDoctorId?.toString() || ''}
						disabled={isLoading || (currentUser?.rol?.idRol === 2) || isReadOnly} // Deshabilitar si es fisioterapeuta o solo lectura
					>
						<SelectTrigger className={`w-full bg-white border-2 ${validationErrors.idDoctor || state?.errors?.idDoctor ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}>
							<SelectValue placeholder={isLoading ? "Cargando doctores..." : doctors.length === 0 ? "No hay doctores disponibles" : "Seleccionar doctor"} />
						</SelectTrigger>
						<SelectContent>
							{doctors.length === 0 ? (
								<div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
									{isLoading ? "Cargando..." : "No hay doctores disponibles"}
								</div>
							) : (
								doctors.map((d: AdminPaciente) => (
									<SelectItem key={d.idUsuario || d.nombre + d.idUsuario}
										value={d.idUsuario?.toString() || '0'}>
										{d.nombre || ''} {d.apellido1 || ''} {d.apellido2 || ''}
									</SelectItem>
								))
							)}
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
					{(validationErrors.idDoctor || state?.errors?.idDoctor) && (
						<p id="idDoctor-error" className="text-sm text-red-500">
							{validationErrors.idDoctor?.[0] || state?.errors?.idDoctor?.[0]}
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
							<SelectTrigger className={`w-full bg-white border-2 ${validationErrors.estado || state?.errors?.status ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}>
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
						{(validationErrors.estado || state?.errors?.status) && (
							<p id="estado-error" className="text-sm text-red-500">
								{validationErrors.estado?.[0] || state?.errors?.status?.[0]}
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
		</>
	)
}
