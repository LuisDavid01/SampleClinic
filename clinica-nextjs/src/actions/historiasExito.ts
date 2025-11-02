'use server'
import { auth } from "@clerk/nextjs/server";
import  z  from "zod";
const TesimonySchema = z.object({
	idServicio: z.number('Invalido'),
	idMedico: z.number('Invalido'),
idPaciente: z.number('Invalido'),
titulo: z.string('Invalido'),
descripcion: z.string('Invalido'),
fechaInicio: z.string('Invalido'),
fechaFin: z.string('Invalido'),
resultado: z.string('Invalido'),
testimonio: z.string('Invalido'),
})

export type TestimonyData = z.infer<typeof TesimonySchema>

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

export const getTestimonies = async (page:number, limit: number, search: string) => {
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
				error: validationResult.error.flatten().formErrors,
			}
		}

		// Create expediente with validated data
		const validatedData = validationResult.data

		// fetch
		const response = await fetch(`${baseUrl}/files/${validatedData.idPaciente}/upload`, {
			method: 'POST',
			headers: {
				contentType: 'application/json',
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
