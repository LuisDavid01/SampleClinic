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
export async function getServicios(page: number, search?: string, limit: number = 10) {
  const user = await auth()
  if (!user.userId && !checkRole('admin')) {
    return []
  }

  // Validar y obtener el token de Clerk
  const token = await user.getToken()
  if (!token) {
    throw new Error('Token de autorización requerido')
  }

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    activo: 'all', // Mostrar todos los servicios (activos e inactivos)
    ...(search && { search }),
  })

  const res = await fetch(`${baseUrl}/servicios?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error('Failed to fetch servicios')
  return res.json()
}

/** ========= GET: por ID ========= */
export async function getServicioByID(id: number) {
  const user = await auth()
  if (!user.userId && !checkRole('admin')) {
    return []
  }

  // Validar y obtener el token de Clerk
  const token = await user.getToken()
  if (!token) {
    throw new Error('Token de autorización requerido')
  }

  const res = await fetch(`${baseUrl}/servicios/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error('Failed to fetch servicio')
  return res.json()
}

/** ========= POST: crear ========= */
export async function createServicio(data: ServicioData): Promise<ActionResponse> {
  try {
    const user = await auth()
    if (!user.userId && !checkRole('admin')) {
      return { success: false, message: 'Unauthorized access', error: 'Unauthorized' }
    }

    // Validar y obtener el token de Clerk
    const token = await user.getToken()
    if (!token) {
      return {
        success: false,
        message: 'Token de autorización requerido',
        error: 'Unauthorized - No token available',
      }
    }

    const validationResult = ServicioSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    const validatedData = validationResult.data

    const response = await fetch(`${baseUrl}/servicios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validatedData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        message: errorData.message || errorData.error || 'Error al crear el servicio',
        error: 'Failed to create servicio',
      }
    }

    const result = await response.json()
    return { 
      success: true, 
      message: result.message || 'Servicio creado con éxito' 
    }
  } catch (error) {
    console.error('Error creando el servicio:', error)
    return {
      success: false,
      message: 'Ha ocurrido un error al crear el servicio',
      error: 'No se pudo crear el servicio',
    }
  }
}

/** ========= PUT: actualizar ========= */
export async function updateServicio(
	id: number,
	data: Partial<ServicioData>
): Promise<ActionResponse> {
  try {
    const user = await auth()
    if (!user.userId && !checkRole('admin')) {
      return { success: false, message: 'Acceso no autorizado', error: 'Acceso no autorizado' }
    }

    // Validar y obtener el token de Clerk
    const token = await user.getToken()
    if (!token) {
      return {
        success: false,
        message: 'Token de autorización requerido',
        error: 'Unauthorized - No token available',
      }
    }

    const UpdateServicioSchema = ServicioSchema.partial()
    const validationResult = UpdateServicioSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    const validatedData = validationResult.data
    const updateData: Record<string, unknown> = {}

    if (validatedData.nombre !== undefined) updateData.nombre = validatedData.nombre
    if (validatedData.detalle !== undefined) updateData.detalle = validatedData.detalle
    if (validatedData.precio !== undefined) updateData.precio = validatedData.precio
    if (validatedData.estado !== undefined) updateData.estado = validatedData.estado

    const response = await fetch(`${baseUrl}/servicios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        message: errorData.message || errorData.error || 'Error al actualizar el servicio',
        error: 'Failed to update servicio',
      }
    }

    const result = await response.json()
    return { 
      success: true, 
      message: result.message || 'Servicio actualizado correctamente' 
    }
  } catch (error) {
    console.error('Error actualizando el servicio:', error)
    return {
      success: false,
      message: 'Ha ocurrido un error al actualizar el servicio',
      error: 'Error al actualizar el servicio',
    }
  }
}

/** ========= DELETE: activar/inactivar servicio ========= */
export async function deleteServicio(id: number): Promise<ActionResponse> {
  try {
    const user = await auth()
    if (!user.userId && !checkRole('admin')) {
      return { 
        success: false, 
        message: 'Acceso no autorizado', 
        error: 'Unauthorized' 
      }
    }

    // Validar y obtener el token de Clerk
    const token = await user.getToken()
    if (!token) {
      return {
        success: false,
        message: 'Token de autorización requerido',
        error: 'Unauthorized - No token available',
      }
    }

    const response = await fetch(`${baseUrl}/servicios/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        message: errorData.message || errorData.error || 'Error al cambiar el estado del servicio',
        error: 'Failed to toggle servicio status',
      }
    }

    const data = await response.json()
    return { 
      success: true, 
      message: data.message || 'Estado del servicio actualizado correctamente' 
    }
  } catch (error) {
    console.error('Error cambiando el estado del servicio:', error)
    return {
      success: false,
      message: 'Un error ocurrió al cambiar el estado del servicio',
      error: 'Failed to toggle servicio status',
    }
  }
}
