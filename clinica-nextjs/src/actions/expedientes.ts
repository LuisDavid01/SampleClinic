'use server'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'

const ExpedienteSchema = z.object({
	idPaciente: z
		.string(),

	cedula: z.string().min(1, 'Se requiere la cedula')
		.max(9, 'La cedula no puede tener mas de 9 caracteres')
		.regex(/^\d-\d{4}-\d{4}$/, 'El formato de la cedula incorrecto'),

	descripcion: z.string().optional().nullable(),

	idDoctor: z.string(),

	estado: z.enum(['activo', 'inactivo'], {
	}),

})

export type ExpedienteData = z.infer<typeof ExpedienteSchema>

export async function createExpediente(data: ExpedienteData): Promise<ActionResponse> {
	try {
		const user = await auth()
		if (!user.userId) {
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
		await fetch('/api/expedientes', {
			method: 'POST',
			headers: {
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
		if (!user.userId) {
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
		await fetch(`/api/expedientes/${id}`, {
			method: 'PUT',
			headers: {
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
		if (!user.userId) {
			throw new Error('Unauthorized')
		}

		// Delete Expediente
		await fetch(`/api/expedientes/${id}`, {
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

