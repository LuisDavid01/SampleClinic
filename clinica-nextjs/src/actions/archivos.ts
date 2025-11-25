
'use server'

import { baseUrl } from '@/utils/apiClient';
import { getUserRole } from '@/utils/roles';
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
// import { checkRole } from '@/utils/client-roles'

// Schema de validación para diagnósticos
const ArchivoSchema = z.object({
	idPaciente: z.number().min(1, 'ID del paciente es requerido'),
	categoria: z.enum(['consentimiento', 'archivo']),
	idExpediente: z.number().min(1, 'ID del expediente es requerido'),
	files: z.array(
		z.instanceof(File).refine(
			(file) => file.size > 0,
			{ message: 'Los archivos no pueden estar vacíos' }
		).refine(
			(file) => {
				const allowedTypes = [
					'image/jpeg', 'image/png', 'image/gif', 'image/bmp',
					'application/pdf',
				];
				return allowedTypes.includes(file.type);
			},
			{ message: 'Solo se permiten archivos JPEG, PNG, GIF, BMP y PDF' }
		).refine(
			(file) => file.size <= 5 * 1024 * 1024, // 5MB por archivo
			{ message: 'Cada archivo no puede ser mayor a 5MB' }
		)
	).min(1, 'Al menos un archivo es requerido')
		.max(5, 'Máximo 5 archivos permitidos')
		.refine(
			(files) => files.reduce((total, file) => total + file.size, 0) <= 25 * 1024 * 1024,
			{ message: 'El tamaño total de todos los archivos no puede exceder 25MB' }
		),
})

export type ArchivoData = z.infer<typeof ArchivoSchema>

export async function getArchivosByUser(idUser: number, page: number, limit: number) {
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

export async function createArchivo(data: ArchivoData) {
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
		const validationResult = ArchivoSchema.safeParse(data)
		if (!validationResult.success) {
			console.log('validation failes', validationResult.error);
			return {
				success: false,
				message: 'Error validando los archivos',
				error: validationResult.error.flatten().formErrors,
			}
		}

		// Create expediente with validated data
		const validatedData = validationResult.data

		const formData = new FormData();

		formData.append('idUsuario', validatedData.idPaciente.toString());
		formData.append('expedienteId', validatedData.idExpediente.toString());
		formData.append('categoria', validatedData.categoria);
		validatedData.files.forEach((file) => {
			formData.append('files', file);
		})



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
				error: 'Error al subir el archivo',
			}

		}
		return {
			success: true,
			message: 'Exito al subir el archivo',
		}
	} catch (error) {
		return {
			success: false,
			message: 'Error interno del servidor',
			error: 'Error subiendo el archivo',
		}
	}
}


export async function deleteArchivo(idArchivo: number, idUser: number) {
	const user = await auth();
	if (!user.userId) {
		return {
			success: false,
			message: 'Unauthorized access',
			error: 'Unauthorized',
		}
	}



	const res = await fetch(`${baseUrl}/files/${idUser}/${idArchivo}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',

			authorization: `Bearer ${await user.getToken()}`
		}
	});
	if (!res.ok) {
		return {
			success: false,
			message: 'Error al eliminar el archivo',
			error: 'ERROR',
		}
	}
	return {
		success: true,
		message: 'Exito al eliminar el archivo',
	}


}

export async function downloadArchivo(idUser: number, idArchivo: number) {
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
		throw new Error('Failed to fetch archivos del paciente');
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
