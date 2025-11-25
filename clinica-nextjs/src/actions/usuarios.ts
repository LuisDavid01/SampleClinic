'use server'
import { auth } from '@clerk/nextjs/server'
import { checkRole } from '@/utils/roles'

type ActionResponse = {
  success: boolean
  message: string
  error?: string
  errors?: Record<string, string[]>
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

export interface UsuarioData {
  nombre: string
  apellido1: string
  apellido2?: string
  fechaNacimiento?: string
  telefonoPrincipal: string
  telefonoSecundario?: string
  correoElectronico: string
  direccionResidencia?: string
  idRol: number
  activo?: boolean
}

/** ========= POST: crear usuario ========= */
export async function createUsuario(data: UsuarioData): Promise<ActionResponse> {
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

    const response = await fetch(`${baseUrl}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
        activo: data.activo ?? true,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        message: errorData.message || errorData.error || 'Error al crear el usuario',
        error: 'Failed to create usuario',
        errors: errorData.errors,
      }
    }

    const responseData = await response.json()
    return { 
      success: true, 
      message: responseData.message || 'Usuario creado correctamente' 
    }
  } catch (error) {
    console.error('Error creando el usuario:', error)
    return {
      success: false,
      message: 'Un error ocurrió al crear el usuario',
      error: 'Failed to create usuario',
    }
  }
}

/** ========= DELETE: inactivar usuario ========= */
export async function inactivarUsuario(id: number): Promise<ActionResponse> {
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

    const response = await fetch(`${baseUrl}/usuarios/${id}`, {
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
        message: errorData.message || errorData.error || 'Error al inactivar el usuario',
        error: 'Failed to deactivate usuario',
      }
    }

    const data = await response.json()
    return { 
      success: true, 
      message: data.message || 'Usuario inactivado correctamente' 
    }
  } catch (error) {
    console.error('Error inactivando el usuario:', error)
    return {
      success: false,
      message: 'Un error ocurrió al inactivar el usuario',
      error: 'Failed to deactivate usuario',
    }
  }
}

