'use server'

import { z } from 'zod'
import { auth, User } from '@clerk/nextjs/server'
import { checkRole } from '@/utils/roles'
/** ========= Schema alineado con la API ========= */
const ServicioSchema = z.object({
	nombreServicio: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
	descripcion: z.string().optional().nullable(),
	precio: z.coerce.number().min(0, 'El precio debe ser mayor a 0'),
	activo: z.enum(['true', 'false']).transform(val => val === 'true')
})

export type ServicioData = z.infer<typeof ServicioSchema>


/** ========= Base URL ========= */
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

function ensureBaseUrl() {
	// realmente no se necesita ???
	if (!baseUrl) throw new Error('API base URL no configurada (NEXT_PUBLIC_API_BASE_URL)')
	return baseUrl.replace(/\/$/, '')
}


/** ========= GET: listado ========= */
export async function getServicios(page = 1, search?: string, limit = 10, activo?: boolean) {
	const user = await auth()
	if (!user.userId) {
		return { success: false, message: 'no autenticado', error: 'UnAuthenticated' }
	}
	const token = await user.getToken()
	const base = ensureBaseUrl()

	const url = new URL(`${base}/servicios`)
	url.search = new URLSearchParams({
		page: String(page),
		limit: String(limit),
		...(search ? { search } : {}),
		...(typeof activo === 'boolean' ? { activo: String(activo) } : {}),
	}).toString()

	const res = await fetch(url.toString(), {
		method: 'GET',
		headers: { Authorization: `Bearer ${token}` },
		cache: 'no-store',
	})

	if (!res.ok) {
		const body = await res.text().catch(() => '')
		throw new Error(`GET ${url.pathname} → ${res.status} ${res.statusText}. Body: ${body.slice(0, 800)}`)
	}

	return res.json()
}

/** ========= GET: por ID ========= */
export async function getServicioByID(id: number) {
	// validamos el usuario
	const user = await auth()
	if (!user.userId) {
		return { success: false, message: 'no autenticado', error: 'UnAuthenticated' }
	}
	const token = await user.getToken()
	const base = ensureBaseUrl()

	const res = await fetch(`${base}/servicios/${id}`, {
		method: 'GET',
		headers: { Authorization: `Bearer ${token}` },
	})

	if (!res.ok) {
		const body = await res.text().catch(() => '')
		throw new Error(`GET /servicios/${id} → ${res.status} ${res.statusText}. Body: ${body.slice(0, 800)}`)
	}

	return res.json()
}

/** ========= POST: crear ========= */
export async function createServicio(data: ServicioData): Promise<ActionResponse> {
	try {
		// validamos el usuario
		const user = await auth()
		if (!user.userId) {
			return { success: false, message: 'no autenticado', error: 'UnAuthenticated' }
		}
		const token = await user.getToken()


		const parsed = ServicioSchema.safeParse(data)
		if (!parsed.success) {
			console.log(parsed.error.flatten().fieldErrors)
			return {
				success: false,
				message: 'Validación fallida',
				errors: parsed.error.flatten().fieldErrors,
			}
		}

		const res = await fetch(`${baseUrl}/servicios`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(parsed.data),
		})

		if (!res.ok) {
			return {
				success: false,
				message: `Error API (${res.status})`,
				error: 'Error al  crear el servicio',
			}
		}
		return { success: true, message: 'Servicio creado con éxito' }
	} catch (error: any) {
		console.error('Error creando el servicio:', error)
		return {
			success: false,
			message: 'Ha ocurrido un error al crear el servicio',
			error: error?.message ?? 'No se pudo crear el servicio',
		}
	}
}

/** ========= PUT: actualizar ========= */
export async function updateServicio(
	id: number,
	data: Partial<ServicioData>
): Promise<ActionResponse> {
	try {
		if (!Number.isFinite(id)) {
			return { success: false, message: 'ID inválido', error: 'ID inválido' }
		}

		// validamos el usuario
		const user = await auth()
		if (!user.userId) {
			return { success: false, message: 'no autenticado', error: 'UnAuthenticated' }
		}
		const token = await user.getToken()

		const base = ensureBaseUrl()

		// safepase valida los datos no se necesita validar manualmente
		const validationResult = ServicioSchema.safeParse(data)

		if (!validationResult.success) {
			return {
				success: false,
				message: 'Validación fallida',
				errors: validationResult.error.flatten().fieldErrors,
			}
		}


		// en caso de haber datos nulos cambiarlos por su valor anteior
		const validatedData = validationResult.data

		//pasa esta variable al api
		const updateData: Record<string, unknown> = {}

		// hazlo con todos los campos
		if (validatedData?.nombreServicio !== undefined) {
			updateData.nombreServicio = validatedData.nombreServicio
		}

		const res = await fetch(`${base}/servicios/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(updateData),
		})

		if (!res.ok) {
			return {
				success: false,
				message: `Error al actualizar el servicio)`,
				error: JSON.stringify('no se pudo actualizar el servicio'),
			}
		}

		return { success: true, message: 'Servicio actualizado correctamente' }
	} catch (error: any) {
		console.error('Error actualizando el servicio:', error)
		return {
			success: false,
			message: 'Ha ocurrido un error al actualizar el servicio',
			error: error?.message ?? 'Error al actualizar el servicio',
		}
	}
}

/** ========= DELETE ========= */
export async function deleteServicio(id: number): Promise<ActionResponse> {
	try {
		if (!Number.isFinite(id)) {
			return { success: false, message: 'ID inválido', error: 'ID inválido' }
		}

		// validamos el usuario
		const user = await auth()
		if (!user.userId) {
			return { success: false, message: 'no autenticado', error: 'UnAuthenticated' }
		}
		const token = await user.getToken()
		const base = ensureBaseUrl()

		const res = await fetch(`${base}/servicios/${id}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		})

		if (!res.ok) {
			return {
				success: false,
				message: `Error al eliminar el servicio`,
				error: 'Error elimnando el servicio',
			}
		}

		return { success: true, message: 'Servicio desactivado correctamente' }
	} catch (error: any) {
		console.error('Error eliminando/desactivando el servicio:', error)
		return {
			success: false,
			message: 'Un error ocurrió al desactivar el servicio',
			error: error?.message ?? 'Failed to delete servicio',
		}
	}
}
