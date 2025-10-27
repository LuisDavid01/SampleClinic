'use server'

import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
// import { checkRole } from '@/utils/client-roles'

// Schema de validación para evaluaciones y diagnósticos
const DiagnosticoSchema = z.object({
	idPaciente: z.number().min(1, 'El ID del paciente es obligatorio'),
	fecha: z.string().min(1, 'La fecha de la evaluación es obligatoria'),
	diagnosticoPrincipal: z.string().min(1, 'El diagnóstico principal es obligatorio').max(500, 'El diagnóstico principal no puede exceder 500 caracteres'),
	sintomasReportados: z.string().optional(),
	evaluacionFisica: z.string().optional(),
	planTratamiento: z.string().optional(),
	recomendaciones: z.string().optional(),
	idDoctor: z.number().min(1, 'El ID del médico es obligatorio'),
	idExpediente: z.number().min(1, 'El ID del expediente es obligatorio'),
})

export type DiagnosticoData = z.infer<typeof DiagnosticoSchema>

export type Doctor = {
	idUsuario: number
	nombre: string
	apellido1: string
	apellido2: string
	email: string
}

export type ActionResponse = {
	success: boolean
	message: string
	errors?: Record<string, string[]>
	error?: string
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

// Obtener lista de doctores
export async function getDoctores(): Promise<Doctor[]> {
	try {
		const user = await auth()
		if (!user.userId) {
			throw new Error('No autorizado')
		}

		const response = await fetch(`${baseUrl}/evaluacion-diagnostico/doctores`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				authorization: `Bearer ${await user.getToken()}`
			}
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			let errorMessage = 'Error al obtener doctores'
			
			if (response.status === 401) {
				errorMessage = 'No tiene permisos para ver los doctores'
			} else if (response.status === 404) {
				errorMessage = 'No se encontraron doctores'
			} else if (response.status === 500) {
				errorMessage = 'Error interno del servidor al obtener doctores'
			}
			
			throw new Error(errorData.error || errorMessage)
		}

		const data = await response.json()
		return data.doctores || []
	} catch (error) {
		console.error('Error fetching doctores:', error)
		if (error instanceof Error) {
			throw new Error(`No se pudieron cargar los doctores: ${error.message}`)
		}
		throw new Error('Error desconocido al obtener doctores')
	}
}

// Obtener diagnósticos por expediente
export async function getDiagnosticosByExpediente(expedienteId: number) {
	try {
		const user = await auth()
		if (!user.userId) {
			throw new Error('No autorizado')
		}

		const response = await fetch(`${baseUrl}/evaluacion-diagnostico/expediente/${expedienteId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				authorization: `Bearer ${await user.getToken()}`
			}
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			let errorMessage = 'Error al obtener diagnósticos'
			
			if (response.status === 401) {
				errorMessage = 'No tiene permisos para ver los diagnósticos'
			} else if (response.status === 404) {
				errorMessage = 'No se encontraron diagnósticos para este expediente'
			} else if (response.status === 500) {
				errorMessage = 'Error interno del servidor al obtener diagnósticos'
			}
			
			throw new Error(errorData.error || errorMessage)
		}

		return response.json()
	} catch (error) {
		console.error('Error fetching diagnosticos:', error)
		// Re-lanzar el error con un mensaje más claro
		if (error instanceof Error) {
			throw new Error(`No se pudieron cargar los diagnósticos: ${error.message}`)
		}
		throw new Error('Error desconocido al obtener diagnósticos')
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
				message: 'Por favor, corrija los errores en el formulario',
				errors: validationResult.error.flatten().fieldErrors,
			}
		}

		const validatedData = validationResult.data

		const response = await fetch(`${baseUrl}/evaluacion-diagnostico`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				authorization: `Bearer ${await user.getToken()}`
			},
			body: JSON.stringify(validatedData),
		})

		if (!response.ok) {
			const errorData = await response.json()
			let errorMessage = 'Error del servidor'
			
			if (response.status === 400) {
				errorMessage = 'Datos inválidos. Verifique la información ingresada.'
			} else if (response.status === 401) {
				errorMessage = 'No tiene permisos para realizar esta acción.'
			} else if (response.status === 404) {
				errorMessage = 'No se encontró el recurso solicitado.'
			} else if (response.status === 500) {
				errorMessage = 'Error interno del servidor. Intente nuevamente.'
			}
			
			return {
				success: false,
				message: errorData.error || errorMessage,
				error: errorMessage,
			}
		}

		return { success: true, message: 'Evaluación y diagnóstico creado exitosamente' }
	} catch (error) {
		console.error('Error creando diagnóstico:', error)
		return {
			success: false,
			message: 'No se pudo crear la evaluación. Verifique su conexión e intente nuevamente.',
			error: 'Error de conexión',
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
				message: 'Por favor, corrija los errores en el formulario',
				errors: validationResult.error.flatten().fieldErrors,
			}
		}

		const validatedData = validationResult.data
		const updateData: Record<string, unknown> = {}

		if (validatedData.idPaciente !== undefined)
			updateData.idPaciente = validatedData.idPaciente
		if (validatedData.fecha !== undefined)
			updateData.fecha = validatedData.fecha
		if (validatedData.diagnosticoPrincipal !== undefined)
			updateData.diagnosticoPrincipal = validatedData.diagnosticoPrincipal
		if (validatedData.sintomasReportados !== undefined)
			updateData.sintomasReportados = validatedData.sintomasReportados
		if (validatedData.evaluacionFisica !== undefined)
			updateData.evaluacionFisica = validatedData.evaluacionFisica
		if (validatedData.planTratamiento !== undefined)
			updateData.planTratamiento = validatedData.planTratamiento
		if (validatedData.recomendaciones !== undefined)
			updateData.recomendaciones = validatedData.recomendaciones
		if (validatedData.idDoctor !== undefined)
			updateData.idDoctor = validatedData.idDoctor
		if (validatedData.idExpediente !== undefined)
			updateData.idExpediente = validatedData.idExpediente

		const response = await fetch(`${baseUrl}/evaluacion-diagnostico/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				authorization: `Bearer ${await user.getToken()}`
			},
			body: JSON.stringify(updateData),
		})

		if (!response.ok) {
			const errorData = await response.json()
			let errorMessage = 'Error del servidor'
			
			if (response.status === 400) {
				errorMessage = 'Datos inválidos. Verifique la información ingresada.'
			} else if (response.status === 401) {
				errorMessage = 'No tiene permisos para realizar esta acción.'
			} else if (response.status === 404) {
				errorMessage = 'No se encontró la evaluación solicitada.'
			} else if (response.status === 500) {
				errorMessage = 'Error interno del servidor. Intente nuevamente.'
			}
			
			return {
				success: false,
				message: errorData.error || errorMessage,
				error: errorMessage,
			}
		}

		return { success: true, message: 'Evaluación y diagnóstico actualizado exitosamente' }
	} catch (error) {
		console.error('Error actualizando diagnóstico:', error)
		return {
			success: false,
			message: 'No se pudo actualizar la evaluación. Verifique su conexión e intente nuevamente.',
			error: 'Error de conexión',
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

		const response = await fetch(`${baseUrl}/evaluacion-diagnostico/${id}`, {
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
