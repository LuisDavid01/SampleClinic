
'use server'

import { baseUrl } from '@/utils/apiClient';
import { getUserRole } from '@/utils/roles';
import { auth } from '@clerk/nextjs/server'
import { success, z } from 'zod'
// import { checkRole } from '@/utils/client-roles'

// Schema de validación para diagnósticos
const ConsentimientoSchema = z.object({
	idPaciente: z.number().min(1, 'ID del paciente es requerido'),
	categoria: z.enum(['consentimiento', 'archivo']),
	idExpediente: z.number().min(1, 'ID del expediente es requerido'),
	files: z.instanceof(File).refine(
		(file) => file.size > 0,
		{ message: 'El archivo no puede estar vacío' }
	).refine(
		(file) => {
			const allowedTypes = [
				'application/pdf',
			];
			return allowedTypes.includes(file.type);
		},
		{ message: 'Solo se permiten archivos PDF' }
	).refine(
		(file) => file.size <= 5 * 1024 * 1024, // 5MB
		{ message: 'El archivo no puede ser mayor a 5MB' }
	).optional(),
	descripcion: z.string().max(300).optional().nullable(),
	etiquetas: z.string().max(500).optional().nullable(),
	esPublico: z.boolean().optional().nullable(),
})

export type ConsentimientoData = z.infer<typeof ConsentimientoSchema>


export async function getConsentimientosbyUser(idUser: number, page: number, limit: number = 10) {

	const user = await auth();
	if (!user.userId) {
		return {
			success: false,
			message: 'Unauthorized access',
			error: 'Unauthorized',
		}
	}

	const params = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
	});

	const res = await fetch(`${baseUrl}/files/${idUser}?${params}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',

			authorization: `Bearer ${await user.getToken()}`
		}
	});
	if (!res.ok) {
		throw new Error('Failed to fetch consentimientos');
	}
	return res.json();

}

export async function newConsentimiento(data: ConsentimientoData) {
	try {
		const user = await auth()
		if (!user.userId) {
			return {
				success: false,
				message: 'Unauthorized access',
				error: 'Unauthorized',
			}
		}

		const userRole = await getUserRole()
		if (!userRole) {
			return {
				success: false,
				message: 'Unauthorized access',
				error: 'Unauthorized',
			}
		}

		// Validate with Zod
		const validationResult = ConsentimientoSchema.safeParse(data)
		if (!validationResult.success) {
			return {
				success: false,
				message: 'Validation failed',
				errors: z.treeifyError(validationResult.error),
			}
		}

		// Create expediente with validated data
		const validatedData = validationResult.data

		const formData = new FormData();

		formData.append('idUsuario', validatedData.idPaciente.toString());
		formData.append('expedienteId', validatedData.idExpediente.toString());
		formData.append('categoria', validatedData.categoria);
		if (!validatedData.files) {
			return {
				success: false,
				message: 'No hay archivo seleccionado',
				error: 'Porfavor seleccione un archivo',
			}
		}
		formData.append('files', validatedData.files);


		// fetch
		const response = await fetch(`${baseUrl}/files/${validatedData.idPaciente}/upload`, {
			method: 'POST',
			headers: {

				authorization: `Bearer ${await user.getToken()}`,
			},
			body: formData,
		})

		// Check if the response is not ok
		if (!response.ok) {
			return {
				success: false,
				message: 'Error al subir el archivo',
				error: response.status,
			}
		}

		return {
			success: true,
			message: 'Archivo subido correctamente',
		}

	} catch (error) {
		return {
			success: false,
			message: 'Unauthorized access',
			error: 'Unauthorized',
		}
	}
}


export async function updateConsentimiento(id: number, idConsentimiento: number,
	data: Partial<ConsentimientoData>) {
	try {
		const user = await auth()
		if (!user.userId) {
			return {
				success: false,
				message: 'Unauthorized access',
				error: 'Unauthorized',
			}
		}
		// Allow partial validation for updates
		const UpdateConsentimientoSchema = ConsentimientoSchema.partial()
		const validationResult = UpdateConsentimientoSchema.safeParse(data)

		if (!validationResult.success) {
			return {
				success: false,
				message: 'Validation failed',
				errors: validationResult.error.flatten().fieldErrors,
			}
		}

		const validatedData = validationResult.data
		console.log(validatedData, "\nidArchivo:", idConsentimiento)
		const updateData: Record<string, unknown> = {}

		if (validatedData.descripcion !== undefined)
			updateData.descripcion = validatedData.descripcion
		if (validatedData.etiquetas !== undefined)
			updateData.etiquetas = validatedData.etiquetas
		if (validatedData.esPublico !== undefined)
			updateData.esPublico = validatedData.esPublico

		const response = await fetch(`${baseUrl}/files/${id}/${idConsentimiento}`, {
			method: 'PATCH',
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
				message: errorData.error || 'Error al actualizar el consentimiento',
				error: 'Error actualizando el consentimiento'
			}
		}

		return { success: true, message: 'Se actualizo correctamente' }
	} catch (error) {
		console.error('Error actualizando el consentiminto:', error)
		return {
			success: false,
			message: 'Un error ocurrio al actualizar el consentimiento',
			error: 'Error actualizndo el consentimiento',
		}
	}

}

export async function deleteConsentimiento(idUsuario: number, idArchivo: number) {
	try {
		const user = await auth()
		if (!user.userId) {

			throw new Error('Unauthorized')
		}

		// Delete Expediente
		await fetch(`${baseUrl}/files/${idUsuario}/${idArchivo}`, {
			method: 'DELETE',
			headers: {
				authorization: `Bearer ${await user.getToken()}`
			}
		})
		return { success: true, message: 'Consentimiento archivado correctamente' }
	} catch (error) {
		console.error('Error archivando el consentimiento:', error)
		return {
			success: false,
			message: 'Un error ocurrio al archivar el consentimiento',
			error: 'Failed to delete issue',
		}
	}

}

export async function downloadConsentimiento(idUser: number, idArchivo: number) {
	const user = await auth();
	if (!user.userId) {
		return {
			success: false,
			message: 'Unauthorized access',
			error: 'Unauthorized',
		}
	}



	const res = await fetch(`${baseUrl}/files/${idUser}/${idArchivo}/download`, {
		method: 'GET',
		headers: {
			'Accept': 'application/octet-stream',
			authorization: `Bearer ${await user.getToken()}`
		},
		cache: 'no-store',
	});
	if (!res.ok) {
		throw new Error('Failed to fetch consentimientos');
	}

	const blob = await res.blob();
	if (blob.size === 0) {
		return {
			success: false,
			message: 'Error del servidor',
			error: 'Error al descargar el archivo',
		}
	}
	return {
		success: true,
		message: 'Exito al descargar el archivo',
		data: blob,
	}


}

