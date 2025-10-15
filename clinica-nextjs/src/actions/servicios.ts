'use server'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { checkRole } from '@/utils/roles'

/** ========= Schema ========= */
const ServicioSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  detalle: z.string().optional().nullable(),
  precio: z.number().refine((val) => !isNaN(val), {
  message: 'Precio inválido',
}),
  // Usa minúsculas si tu API las espera en minúsculas, igual que en expedientes:
  estado: z.enum(['activo', 'inactivo']),
})

export type ServicioData = z.infer<typeof ServicioSchema>

/** ========= Base URL ========= */
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

/** ========= GET: listado ========= */
export async function getServicios(page: number, search?: string, limit: number = 10) {
  const user = await auth()
  if (!user.userId && !checkRole('admin')) {
    return []
  }

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  })

  const res = await fetch(`${baseUrl}/servicios?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${await user.getToken()}`,
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

  const res = await fetch(`${baseUrl}/servicios/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${await user.getToken()}`,
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

    const validationResult = ServicioSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    const validatedData = validationResult.data

    await fetch(`${baseUrl}/servicios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${await user.getToken()}`,
      },
      body: JSON.stringify(validatedData),
    })

    return { success: true, message: 'Servicio creado con éxito' }
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

    await fetch(`${baseUrl}/servicios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${await user.getToken()}`,
      },
      body: JSON.stringify(updateData),
    })

    return { success: true, message: 'Servicio actualizado correctamente' }
  } catch (error) {
    console.error('Error actualizando el servicio:', error)
    return {
      success: false,
      message: 'Ha ocurrido un error al actualizar el servicio',
      error: 'Error al actualizar el servicio',
    }
  }
}

/** ========= DELETE: eliminar ========= */
export async function deleteServicio(id: number) {
  try {
    const user = await auth()
    if (!user.userId && !checkRole('admin')) {
      throw new Error('Unauthorized')
    }

    await fetch(`${baseUrl}/servicios/${id}`, {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${await user.getToken()}`,
      },
    })

    return { success: true, message: 'Servicio eliminado correctamente' }
  } catch (error) {
    console.error('Error eliminando el servicio:', error)
    return {
      success: false,
      message: 'Un error ocurrió al eliminar el servicio',
      error: 'Failed to delete servicio',
    }
  }
}
