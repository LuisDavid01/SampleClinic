'use server'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { checkRole } from '@/utils/roles'

const ExpedienteSchema = z.object({
	idPaciente: z
		.number('Invalido'),

	cedula: z
		.string()
		.regex(/^[A-Za-z0-9-]+$/, 'La cédula solo puede contener letras, números y guiones')
		.min(5, 'La cédula debe tener al menos 5 caracteres')
		.max(50, 'La cédula no puede exceder 50 caracteres'),
	descripcion: z.string().optional().nullable(),

	idDoctor: z
		.number('Invalido'),

	estado: z.enum(['activo', 'inactivo'], {
	}),

})



const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

export type ExpedienteData = z.infer<typeof ExpedienteSchema>
export async function getExpedientes(page: number, search?: string, limit: number = 10) {

	const user = await auth();
	if (!user.userId && !checkRole('admin')) {
		return [];
	}

	const params = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
		...(search && { search }),
	});

	const res = await fetch(`${baseUrl}/expedientes?${params}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',

			authorization: `Bearer ${await user.getToken()}`
		}
	});
	if (!res.ok) {
		throw new Error('Failed to fetch expedientes');
	}
	return res.json();

}

export async function getExpedienteByID(id: number) {

	const user = await auth();
	if (!user.userId && !checkRole('admin')) {
		return [];
	}


	const res = await fetch(`${baseUrl}/expedientes/${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',

			authorization: `Bearer ${await user.getToken()}`
		}
	});
	if (!res.ok) {
		throw new Error('Failed to fetch expedientes');
	}
	return res.json();

}

export async function createExpediente(data: ExpedienteData): Promise<ActionResponse> {
	try {
		const user = await auth()
		if (!user.userId && !checkRole('admin')) {
			return {
				success: false,
				message: 'Unauthorized access',
				error: 'Unauthorized',
			}
		}

		// Validate with Zod
		const validationResult = ExpedienteSchema.safeParse(data)
		if (!validationResult.success) {
			return {
				success: false,
				message: 'Validation failed',
				errors: validationResult.error.flatten().fieldErrors,
			}
		}

		// Create expediente with validated data
		const validatedData = validationResult.data
		
		// Transform idDoctor to idMedico for the API
		const apiData = {
			...validatedData,
			idMedico: validatedData.idDoctor,
			idDoctor: undefined
		};
		delete apiData.idDoctor;

		// fetch
		const response = await fetch(`${baseUrl}/expedientes`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',

				authorization: `Bearer ${await user.getToken()}`,
			},
			body: JSON.stringify(apiData),
		})

		// Check if the response is not ok
		if (!response.ok) {
			const errorData = await response.json()
			
			// Handle specific error cases
			if (errorData.error === 'El paciente ya tiene un expediente activo') {
				return {
					success: false,
					message: errorData.message || 'El paciente ya tiene un expediente activo',
					error: 'Expediente duplicado',
				}
			}
			
			if (errorData.error === 'Ya existe un expediente con esta cédula') {
				return {
					success: false,
					message: errorData.error || 'Ya existe un expediente con esta cédula',
					error: 'Cédula duplicada',
				}
			}
			
			// Handle other API errors
			return {
				success: false,
				message: errorData.error || 'Error del servidor',
				error: 'Error del servidor',
			}
		}

		return { success: true, message: 'Expediente creado con exito' }
	} catch (error) {
		console.error('Error creando el expediente:', error)
		return {
			success: false,
			message: 'Ha ocurrido un error al crear el expediente',
			error: 'No se pudo crear el expediente',
		}
	}
}


export async function updateExpediente(
	id: number,
	data: Partial<ExpedienteData>
): Promise<ActionResponse> {
	try {
		// Security check - ensure user is authenticated
		const user = await auth()

		if (!user.userId && !checkRole('admin')) {
			return {
				success: false,
				message: 'Acceso no autorizado',
				error: 'Acceso no autorizado',
			}
		}

		// Allow partial validation for updates with more flexible schema
		const UpdateExpedienteSchema = ExpedienteSchema.partial().extend({
			cedula: z.string()
				.regex(/^[A-Za-z0-9-]+$/, 'La cédula solo puede contener letras, números y guiones')
				.min(5, 'La cédula debe tener al menos 5 caracteres')
				.max(50, 'La cédula no puede exceder 50 caracteres')
				.optional(),
		})
		const validationResult = UpdateExpedienteSchema.safeParse(data)

		if (!validationResult.success) {
			console.log('Frontend validation failed:', {
				data,
				errors: validationResult.error.flatten().fieldErrors,
				issues: validationResult.error.issues
			});
			return {
				success: false,
				message: 'Validation failed',
				errors: validationResult.error.flatten().fieldErrors,
			}
		}

		// Type safe update object with validated data
		const validatedData = validationResult.data
		const updateData: Record<string, unknown> = {}

		if (validatedData.idPaciente !== undefined)
			updateData.idPaciente = validatedData.idPaciente
		if (validatedData.cedula !== undefined)
			updateData.cedula = validatedData.cedula
		if (validatedData.estado !== undefined)
			updateData.estado = validatedData.estado
		if (validatedData.descripcion !== undefined)
			updateData.descripcion = validatedData.descripcion
		if (validatedData.idDoctor !== undefined)
			updateData.idMedico = validatedData.idDoctor

		// Update issue
		const response = await fetch(`${baseUrl}/expedientes/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',

				authorization: `Bearer ${await user.getToken()}`
			},
			body: JSON.stringify(updateData),
		})

		// Check if the response is not ok
		if (!response.ok) {
			const errorData = await response.json()
			
			// Handle specific error cases
			if (errorData.error === 'El paciente ya tiene un expediente activo') {
				return {
					success: false,
					message: errorData.message || 'El paciente ya tiene un expediente activo',
					error: 'Expediente duplicado',
				}
			}
			
			if (errorData.error === 'Ya existe un expediente con esta cédula') {
				return {
					success: false,
					message: errorData.error || 'Ya existe un expediente con esta cédula',
					error: 'Cédula duplicada',
				}
			}
			
			// Handle other API errors
			return {
				success: false,
				message: errorData.error || 'Error del servidor',
				error: 'Error del servidor',
			}
		}

		return { success: true, message: 'Se actualizo correctamente' }
	} catch (error) {
		console.error('Error actualizando el expediente:', error)
		return {
			success: false,
			message: 'Ha ocurrido un error al actualizar el expediente',
			error: 'Error al actualizar el expediente',
		}
	}
}


export async function deleteExpediente(id: number) {
	try {
		const user = await auth()
		if (!user.userId && !checkRole('admin')) {

			throw new Error('Unauthorized')
		}

		// Delete Expediente
		await fetch(`${baseUrl}/expedientes/${id}`, {
			method: 'DELETE',
			headers: {
				authorization: `Bearer ${await user.getToken()}`
			}
		})
		return { success: true, message: 'Expediente eliminado correctamente' }
	} catch (error) {
		console.error('Error eliminando el expediente:', error)
		return {
			success: false,
			message: 'Un error ocurrio al eliminar el expediente',
			error: 'Failed to delete issue',
		}
	}
}

