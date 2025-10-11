'use server'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { checkRole } from '@/utils/roles'

const ExpedienteSchema = z.object({
	idPaciente: z
		.string()
		.transform((val) => parseInt(val, 10))
		.refine((val) => !isNaN(val), "Debe ser un número válido"),

	cedula: z
		.string()
		.regex(/^\d{9}$/, 'La cédula debe tener exactamente 9 dígitos y sin guiones'),
	descripcion: z.string().optional().nullable(),

	idDoctor: z.string(),

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

	const res = await fetch(`${baseUrl}/api/expedientes?${params}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',

			authorization: `Bearer ${user.getToken()}`
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

		// fetch
		await fetch(`${baseUrl}/api/expedientes`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',

				authorization: `Bearer ${user.getToken()}`,
			},
			body: JSON.stringify(validatedData),
		})


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

		// Allow partial validation for updates
		const UpdateExpedienteSchema = ExpedienteSchema.partial()
		const validationResult = UpdateExpedienteSchema.safeParse(data)

		if (!validationResult.success) {
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
			updateData.idDoctor = validatedData.idDoctor

		// Update issue
		await fetch(`${baseUrl}/api/expedientes/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',

				authorization: `Bearer ${user.getToken()}`
			},
			body: JSON.stringify(updateData),
		})
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
		await fetch(`${baseUrl}/api/expedientes/${id}`, {
			method: 'DELETE',
			headers: {
				authorization: `Bearer ${user.getToken()}`
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

