'use server'

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { checkRole } from '@/utils/roles'

/** ========= Schema alineado con la API ========= */
const ServicioSchema = z.object({
  nombreServicio: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().optional().nullable(),
  precio: z.number().nullable().refine((v) => v === null || !Number.isNaN(v), {
    message: 'Precio inválido',
  }),
  activo: z.boolean().default(true),
})

export type ServicioData = z.infer<typeof ServicioSchema>
export type ActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  error?: string
}

/** ========= Base URL ========= */
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
function ensureBaseUrl() {
  if (!baseUrl) throw new Error('API base URL no configurada (NEXT_PUBLIC_API_BASE_URL)')
  return baseUrl.replace(/\/$/, '')
}

/** ========= Helpers de auth ========= */
async function requireAuthToken() {
  const a = await auth()
  if (!a?.userId) throw new Error('No autenticado')
  const token = await a.getToken()
  if (!token) throw new Error('Token de autenticación no disponible')
  return token
}

async function requireAdminToken() {
  const a = await auth()
  if (!a?.userId) throw new Error('No autenticado')
  if (!checkRole('admin')) throw new Error('Acceso no autorizado (requiere rol admin)')
  const token = await a.getToken()
  if (!token) throw new Error('Token de autenticación no disponible')
  return token
}

/** ========= GET: listado ========= */
export async function getServicios(page = 1, search?: string, limit = 10, activo?: boolean) {
  const token = await requireAuthToken()
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
  if (!Number.isFinite(id)) throw new Error('ID inválido')

  const token = await requireAuthToken()
  const base = ensureBaseUrl()

  const res = await fetch(`${base}/servicios/${id}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`GET /servicios/${id} → ${res.status} ${res.statusText}. Body: ${body.slice(0, 800)}`)
  }

  return res.json()
}

/** ========= POST: crear ========= */
export async function createServicio(raw: {
  nombreServicio: string
  descripcion?: string | null
  precio?: string | number | null
  activo?: boolean | string // <-- Acepta string desde el front
}): Promise<ActionResponse> {
  try {
    const token = await requireAdminToken()
    const base = ensureBaseUrl()

    // ✅ Conversión string → boolean
    const activoBool =
      typeof raw.activo === 'string'
        ? raw.activo.toLowerCase() === 'activo'
        : Boolean(raw.activo)

    // Normaliza precio
    const precioNum =
      raw.precio === '' || raw.precio === undefined
        ? null
        : raw.precio === null
        ? null
        : typeof raw.precio === 'string'
        ? raw.precio.trim()
          ? Number(raw.precio)
          : null
        : Number(raw.precio)

    const toValidate: ServicioData = {
      nombreServicio: raw.nombreServicio,
      descripcion: raw.descripcion ?? null,
      precio: precioNum,
      activo: activoBool,
    }

    const parsed = ServicioSchema.safeParse(toValidate)
    if (!parsed.success) {
      return {
        success: false,
        message: 'Validación fallida',
        errors: parsed.error.flatten().fieldErrors,
      }
    }

    const res = await fetch(`${base}/servicios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      return {
        success: false,
        message: `Error API (${res.status})`,
        error: JSON.stringify(json),
      }
    }

    return { success: true, message: json?.message ?? 'Servicio creado con éxito' }
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
  data: Partial<{
    nombreServicio: string
    descripcion: string | null
    precio: string | number | null
    activo: boolean | string
  }>
): Promise<ActionResponse> {
  try {
    if (!Number.isFinite(id)) {
      return { success: false, message: 'ID inválido', error: 'ID inválido' }
    }

    const token = await requireAdminToken()
    const base = ensureBaseUrl()

    const updateRaw: any = {}

    if (data.nombreServicio !== undefined) updateRaw.nombreServicio = data.nombreServicio
    if (data.descripcion !== undefined) updateRaw.descripcion = data.descripcion ?? null

    // ✅ Conversión string → boolean
    if (data.activo !== undefined) {
      updateRaw.activo =
        typeof data.activo === 'string'
          ? data.activo.toLowerCase() === 'activo'
          : Boolean(data.activo)
    }

    if (data.precio !== undefined) {
      const precioNum =
        data.precio === '' || data.precio === undefined
          ? null
          : data.precio === null
          ? null
          : typeof data.precio === 'string'
          ? data.precio.trim()
            ? Number(data.precio)
            : null
          : Number(data.precio)
      updateRaw.precio = precioNum
    }

    const UpdateSchema = ServicioSchema.partial()
    const parsed = UpdateSchema.safeParse(updateRaw)
    if (!parsed.success) {
      return {
        success: false,
        message: 'Validación fallida',
        errors: parsed.error.flatten().fieldErrors,
      }
    }

    const res = await fetch(`${base}/servicios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      return {
        success: false,
        message: `Error API (${res.status})`,
        error: JSON.stringify(json),
      }
    }

    return { success: true, message: json?.message ?? 'Servicio actualizado correctamente' }
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

    const token = await requireAdminToken()
    const base = ensureBaseUrl()

    const res = await fetch(`${base}/servicios/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      return {
        success: false,
        message: `Error API (${res.status})`,
        error: JSON.stringify(json),
      }
    }

    return { success: true, message: json?.message ?? 'Servicio desactivado correctamente' }
  } catch (error: any) {
    console.error('Error eliminando/desactivando el servicio:', error)
    return {
      success: false,
      message: 'Un error ocurrió al desactivar el servicio',
      error: error?.message ?? 'Failed to delete servicio',
    }
  }
}
