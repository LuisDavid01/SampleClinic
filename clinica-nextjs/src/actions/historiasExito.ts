'use server'
import { apiEndpoints, useApiClient } from "@/utils/apiClient";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import z from "zod";
const TesimonySchema = z.object({
	rating: z.number('Invalido').min(1, 'El rating debe ser mayor a 1').max(5, 'El rating no debe ser mayor a 5'),
	experiencia: z.string('Invalido').min(1, 'El campo no debe estar vacio').max(255, 'El maximo de caracteres son 255'),
	fechaTratamiento: z.string('Invalido').optional().nullable(),
	publicado: z.boolean('Invalido').optional().nullable(),
	isAnonimo: z.boolean('Invalido').optional().nullable(),
})

export type TestimonyData = z.infer<typeof TesimonySchema>

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

export const getTestimonies = async (page: number, limit: number, search: string, publicado?: boolean) => {

	const params = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
		...(search && { search }),
		...(publicado !== undefined && { publicado: publicado ? "true" : "false" }),
	});
	const res = await fetch(`${baseUrl}/historias-exito?${params}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',

		}
	});
	if (!res.ok) {
		throw new Error('Failed to fetch historias de exito');
	}
	return res.json();

}
export const getAllTestimonies = async (limit: number) => {
	const user = await auth();
	if (!user.userId) {
		return {
			success: false,
			message: 'Unauthorized access',
			error: 'Unauthorized',
		}
	}

	const params = new URLSearchParams({
		limit: limit.toString(),
	});
	const res = await fetch(`${baseUrl}/historias-exito?${params}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',

			authorization: `Bearer ${await user.getToken()}`
		}
	});
	if (!res.ok) {
		throw new Error('Failed to fetch historias de exito');
	}
	return res.json();

}

export const getTestimony = async (idHistoria: number) => {
	const user = await auth();
	if (!user.userId) {
		return {
			success: false,
			message: 'Unauthorized access',
			error: 'Unauthorized',
		}
	}


	const res = await fetch(`${baseUrl}/historias-exito/${idHistoria}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',

			authorization: `Bearer ${await user.getToken()}`
		}
	});
	if (!res.ok) {
		throw new Error('Failed to fetch historias de exito');
	}
	return res.json();

}

export const createTestimony = async (data: TestimonyData) => {
	try {
		const user = await auth()
		if (!user.userId) {
			return {
				success: false,
				message: 'Unauthorized access',
				error: 'Unauthorized',
			}
		}
		const token = await user.getToken()

		// Validate with Zod
		const validationResult = TesimonySchema.safeParse(data)
		if (!validationResult.success) {
			console.log('validation failes', validationResult.error);
			return {
				success: false,
				message: 'Error validando los archivos',
				errors: validationResult.error.flatten().fieldErrors,
			}
		}

		// Create expediente with validated data
		const validatedData = validationResult.data

		// fetch
		const response = await fetch(`${baseUrl}/historias-exito`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(validatedData),
		})
		// Check if the response is not ok
		if (!response.ok) {

			return {
				success: false,
				message: 'Error al subir la historia de exito',
				error: 'Error al subir la historia de exito',
			}

		}
		return {
			success: true,
			message: 'Exito al subir la historia de exito',
		}
	} catch (error) {
		return {
			success: false,
			message: 'Error interno del servidor',
			error: 'Error subiendo la historia de exito',
		}
	}

}

export const updateTestimony = async (
	id: number,
	data: Partial<TestimonyData>) => {

	try {

		const user = await auth();
		if (!user.userId) {
			return {
				success: false,
				message: 'Unauthorized access',
				error: 'Unauthorized',
			}
		}
		const token = await user.getToken()

		// Validate with Zod
		const validationResult = TesimonySchema.safeParse(data)
		if (!validationResult.success) {
			console.log('validation failes', validationResult.error);
			return {
				success: false,
				message: 'Error validando la historia de exito',
				errors: validationResult.error.flatten().fieldErrors,
			}
		}


		const validatedData = validationResult.data
		const updateData: Record<string, unknown> = {}

		if (validatedData.rating !== undefined)
			updateData.rating = validatedData.rating
		if (validatedData.experiencia !== undefined)
			updateData.experiencia = validatedData.experiencia
		if (validatedData.fechaTratamiento !== undefined)
			updateData.fechaTratamiento = validatedData.fechaTratamiento
		console.log(JSON.stringify(updateData))
		// actualizamos la historia de exito 
		const response = await fetch(`${baseUrl}/historias-exito/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(updateData),
		})
		// Check if the response is not ok
		if (!response.ok) {
			console.log(JSON.stringify(response))
			return {
				success: false,
				message: 'Error al actualizar la historia de exito',
				error: 'Error al actualizar la historia de exito',
			}

		}
		revalidatePath('/admin/testimonials')
		revalidatePath(`/admin/testimonials/edit/${id}`)
		return {
			success: true,
			message: 'Exito al actualizar la historia de exito',
		}
	} catch (err) {
		console.log(err)
		return {
			success: false,
			message: 'Error al actualizar la historia de exito',
			error: 'Error al actualizar la historia de exito',
		}

	}

}


export async function deleteTestimony(id: number) {
	const user = await auth();
	if (!user.userId) {
		return {
			success: false,
			message: 'Unauthorized access',
			error: 'Unauthorized',
		}
	}

	const token = await user.getToken()
	const res = await fetch(`${baseUrl}/historias-exito/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',

			authorization: `Bearer ${token}`
		}
	});
	if (!res.ok) {
		return {
			success: false,
			message: 'Error al eliminar  la historia  de exito',
			error: 'Error  al eliminar',
		}
	}
	return {
		success: true,
		message: 'Exito al eliminar la  historia',
	}

}



export async function publishTestimony(id: number) {
	const user = await auth();
	if (!user.userId) {
		return {
			success: false,
			message: 'Unauthorized access',
			error: 'Unauthorized',
		}
	}

	const token = await user.getToken()
	const res = await fetch(`${baseUrl}/historias-exito/${id}/publicar`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',

			authorization: `Bearer ${token}`
		}
	});
	if (!res.ok) {
		console.log(await res.json())
		return {
			success: false,
			message: 'Error al publicar  la historia  de exito',
			error: 'Error  al publicar',
		}
	}
	return {
		success: true,
		message: 'Exito al publicar la  historia',
	}

}


export async function unpublishTestimony(id: number) {
	const user = await auth();
	if (!user.userId) {
		return {
			success: false,
			message: 'Unauthorized access',
			error: 'Unauthorized',
		}
	}

	const token = await user.getToken()
	const res = await fetch(`${baseUrl}/historias-exito/${id}/despublicar`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',

			authorization: `Bearer ${token}`
		}
	});
	if (!res.ok) {
		return {
			success: false,
			message: 'Error al despublicar  la historia  de exito',
			error: 'Error  al despublicar',
		}
	}
	return {
		success: true,
		message: 'Exito al despublicar la  historia',
	}

}

// crear testimonio del cliente
export const createPacientTestimony = async (data: TestimonyData) => {
	// No se como sacar el id del usuario si el cliente solo tiene acceso
	// al clerk id y no tiene permisos para traer todos los usuarios
	try {
		const user = await auth()
		if (!user.userId) {
			return {
				success: false,
				message: 'Unauthorized access',
				error: 'Unauthorized_Client',
			}
		}
		const token = await user.getToken()
		console.log(data.rating, data.experiencia)
		const newData = {
			experiencia: data.experiencia,
			fechaTratamiento: new Date().toISOString(),
			rating: data.rating


		}
		// Validate with Zod
		const validationResult = TesimonySchema.safeParse(newData)
		if (!validationResult.success) {
			console.log('validation failes', validationResult.error);
			return {
				success: false,
				message: 'Error validando el testimonio',
				errors: validationResult.error.flatten().fieldErrors,
			}
		}

		// Create expediente with validated data
		const validatedData = validationResult.data

		// fetch

		const response = await fetch(`${baseUrl}/historias-exito`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(validatedData),
		})

		// Check if the response is not ok
		if (!response.ok) {
			console.log(JSON.stringify(response))
			return {
				success: false,
				message: 'Error al subir la historia de exito',
				error: 'Error al subir la historia de exito',
			}

		}
		return {
			success: true,
			message: 'Exito al subir la historia de exito',
		}
	} catch (error) {
		return {
			success: false,
			message: 'Error interno del servidor',
			error: 'Error subiendo la historia de exito',
		}
	}

}
