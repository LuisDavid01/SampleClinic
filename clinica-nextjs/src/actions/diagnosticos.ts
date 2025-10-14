'use server'

import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
// import { checkRole } from '@/utils/client-roles'

// Schema de validación para diagnósticos
const DiagnosticoSchema = z.object({
	idPaciente: z.number().min(1, 'ID del paciente es requerido'),
	fecha: z.string().min(1, 'La fecha es requerida'),
	diagnostico: z.string().min(1, 'El diagnóstico es requerido'),
	idDoctor: z.number().min(1, 'ID del doctor es requerido'),
	idExpediente: z.number().min(1, 'ID del expediente es requerido'),
})

export type DiagnosticoData = z.infer<typeof DiagnosticoSchema>

export type ActionResponse = {
	success: boolean
	message: string
	errors?: Record<string, string[]>
	error?: string
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

// Obtener diagnósticos por expediente
export async function getDiagnosticosByExpediente(expedienteId: number) {
	try {
		const user = await auth()
		if (!user.userId) {
			throw new Error('No autorizado')
		}

		const response = await fetch(`${baseUrl}/diagnosticos/expediente/${expedienteId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				authorization: `Bearer ${await user.getToken()}`
			}
		})

		if (!response.ok) {
			throw new Error('Error al obtener diagnósticos')
		}

		return response.json()
	} catch (error) {
		console.error('Error fetching diagnosticos:', error)
		throw error
	}
}

// Crear diagnóstico
export async function createDiagnostico(data: DiagnosticoData): Promise<ActionResponse> {
	try {
		const user = await auth()
		if (!user.userId) {
			return {
				success: false,
				message: 'No autorizado',
				error: 'No autorizado',
			}
		}

		// Validar con Zod
		const validationResult = DiagnosticoSchema.safeParse(data)
		if (!validationResult.success) {
			return {
				success: false,
				message: 'Validación fallida',
				errors: validationResult.error.flatten().fieldErrors,
			}
		}

		const validatedData = validationResult.data

		const response = await fetch(`${baseUrl}/diagnosticos`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				authorization: `Bearer ${await user.getToken()}`
			},
			body: JSON.stringify(validatedData),
		})

		if (!response.ok) {
			const errorData = await response.json()
			return {
				success: false,
				message: errorData.error || 'Error del servidor',
				error: 'Error del servidor',
			}
		}

		return { success: true, message: 'Diagnóstico creado exitosamente' }
	} catch (error) {
		console.error('Error creando diagnóstico:', error)
		return {
			success: false,
			message: (error as Error).message || 'Error interno',
			error: 'Error interno',
		}
	}
}

// Actualizar diagnóstico
export async function updateDiagnostico(id: number, data: Partial<DiagnosticoData>): Promise<ActionResponse> {
	try {
		const user = await auth()
		if (!user.userId) {
			return {
				success: false,
				message: 'No autorizado',
				error: 'No autorizado',
			}
		}

		// Validación parcial para actualizaciones
		const UpdateDiagnosticoSchema = DiagnosticoSchema.partial()
		const validationResult = UpdateDiagnosticoSchema.safeParse(data)

		if (!validationResult.success) {
			return {
				success: false,
				message: 'Validación fallida',
				errors: validationResult.error.flatten().fieldErrors,
			}
		}

		const validatedData = validationResult.data
		const updateData: Record<string, unknown> = {}

		if (validatedData.idPaciente !== undefined)
			updateData.idPaciente = validatedData.idPaciente
		if (validatedData.diagnostico !== undefined)
			updateData.diagnostico = validatedData.diagnostico

		const response = await fetch(`${baseUrl}/diagnosticos/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				authorization: `Bearer ${await user.getToken()}`
			},
			body: JSON.stringify(updateData),
		})

		if (!response.ok) {
			const errorData = await response.json()
			return {
				success: false,
				message: errorData.error || 'Error del servidor',
				error: 'Error del servidor',
			}
		}

		return { success: true, message: 'Diagnóstico actualizado exitosamente' }
	} catch (error) {
		console.error('Error actualizando diagnóstico:', error)
		return {
			success: false,
			message: (error as Error).message || 'Error interno',
			error: 'Error interno',
		}
	}
}

// Eliminar diagnóstico
export async function deleteDiagnostico(id: number): Promise<ActionResponse> {
	try {
		const user = await auth()
		if (!user.userId) {
			return {
				success: false,
				message: 'No autorizado',
				error: 'No autorizado',
			}
		}

		const response = await fetch(`${baseUrl}/diagnosticos/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				authorization: `Bearer ${await user.getToken()}`
			}
		})

		if (!response.ok) {
			const errorData = await response.json()
			return {
				success: false,
				message: errorData.error || 'Error del servidor',
				error: 'Error del servidor',
			}
		}

		return { success: true, message: 'Diagnóstico eliminado exitosamente' }
	} catch (error) {
		console.error('Error eliminando diagnóstico:', error)
		return {
			success: false,
			message: (error as Error).message || 'Error interno',
			error: 'Error interno',
		}
	}
}
