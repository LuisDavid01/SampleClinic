"use server"
import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
const TeamMemberSchema = z.object({
	idEquipo: z.string('Invalido'),
	descripcionBreve: z.string().min(10).max(200),
	experienciaProfesional: z.string().min(10).max(500),
	especialidad: z.string().min(1).max(100),
	fotografia: z.string().max(300).optional().nullable(),
	servicios: z.array(z.number()).min(1).max(5)
})

export type teamMemberData = z.infer<typeof TeamMemberSchema>
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

export const createTeamMember = async (data: teamMemberData) => {
	console.log(data.idEquipo, data.descripcionBreve, data.experienciaProfesional,data.servicios)

	const user = await auth()
	if (!user.userId) {
		return {
			success: false,
			message: 'Unauthorized access',
			error: 'Unauthorized',
		}
	}
	const token = await user.getToken()
	const client = await clerkClient();
	let imageProfile = ""
	try {
		const { imageUrl } = await client.users.getUser(data.idEquipo);
		console.log("url de la imagen: ", imageUrl)
		imageProfile = imageUrl
	} catch (e) {
		console.log(e)
	}
	const uploadData = {
		...data,
		fotografia: imageProfile
	}
	// Validate with Zod
	const validationResult = TeamMemberSchema.safeParse(uploadData)
	if (!validationResult.success) {
		return {
			success: false,
			message: 'Validation failed',
			errors: validationResult.error.flatten().fieldErrors,
		}
	}

	// Creamos el miembro del equipo con los datos validados
	const validatedData = validationResult.data

	const res = await fetch(`${baseUrl}/perfiles`, {
		method: 'POST',
		headers: {
			"content-type": 'application/json',
			"authorization": `Bearer ${token}`
		},
		body: JSON.stringify(validatedData),
	})
	if (!res.ok) {
		throw new Error('Failed to create team member');
	}
	return {
		success: true,
		message: 'Miembro de equipo correctamente agregado!',
	}
}

export const deleteTeamMember = async (idPerfil: number) => {
	console.log("Eliminando: ", idPerfil)
	const user = await auth()
	if (!user.userId) {
		return {
			success: false,
			message: 'Unauthorized access',
			error: 'Unauthorized',
		}
	}
	const token = await user.getToken()

	const res = await fetch(`${baseUrl}/perfiles/${idPerfil}`, {
		method: 'DELETE',
		headers: {
			"content-type": 'application/json',
			"authorization": `Bearer ${token}`
		},
	})
	if (!res.ok) {
		console.log(await res.text())
		throw new Error('Failed to delete team member');
	}
	return {
		success: true,
		message: 'Miembro eliminado correctamente!',
	}
}
export async function getEquipo(page: number, limit: number, search: string) {

	const params = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
		...(search && { search }),
	});
	const res = await fetch(`${baseUrl}/perfiles?${params}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',

		}
	});
	console.log(res.status)
	if (!res.ok) {
		throw new Error('Failed to fetch historias de exito');
	}
	return res.json();

}

export const editTeamMember = async (
	idPerfil: number,
	data: Partial<teamMemberData>,
	actualizarFoto: boolean) => {

	const user = await auth()
	if (!user.userId) {
		return {
			success: false,
			message: 'Unauthorized access',
			error: 'Unauthorized',
		}
	}
	const token = await user.getToken()
	let imageProfile = ""
	if (actualizarFoto) {
		try {
			const client = await clerkClient();
			const { imageUrl } = await client.users.getUser(data.idEquipo!);
			console.log("url de la imagen: ", imageUrl)
			imageProfile = imageUrl
		} catch (e) {
			console.log(e)
		}


		data = {
			...data,
			fotografia: imageProfile
		}
	}
	// Validate with Zod
	const validationResult = TeamMemberSchema.safeParse(data)
	if (!validationResult.success) {
		return {
			success: false,
			message: 'Validation failed',
			errors: validationResult.error.flatten().fieldErrors,
		}
	}

	// Creamos el miembro del equipo con los datos validados
	const validatedData = validationResult.data
	const updateData: Record<string, unknown> = {}

	if (validatedData.idEquipo !== undefined)
		updateData.idEquipo = validatedData.idEquipo
	if (validatedData.descripcionBreve !== undefined)
		updateData.descripcionBreve = validatedData.descripcionBreve
	if (validatedData.fotografia !== undefined && validatedData.fotografia !== "")
		updateData.fotografia = validatedData.fotografia
	if (validatedData.experienciaProfesional !== undefined)
		updateData.experienciaProfesional = validatedData.experienciaProfesional
	if (validatedData.especialidad !== undefined)
		updateData.especialidad = validatedData.especialidad
	if(validatedData.servicios !== undefined)
		updateData.servicios = validatedData.servicios
	console.log(updateData)

	const res = await fetch(`${baseUrl}/perfiles/${idPerfil}`, {
		method: 'PUT',
		headers: {
			"content-type": 'application/json',
			"authorization": `Bearer ${token}`
		},
		body: JSON.stringify(updateData),
	})
	if (!res.ok) {
		console.log("status code:", res.status)
		throw new Error('Failed to update team member');

	}
	return {
		success: true,
		message: 'Miembro de equipo editado!',
	}
}



