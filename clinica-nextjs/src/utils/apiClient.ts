import { useAuth } from '@clerk/nextjs';

/**
 * Cliente API para hacer llamadas autenticadas con Clerk
 */
export class ApiClient {
  private baseUrl: string;
  private getToken: () => Promise<string | null>;

  constructor(baseUrl: string, getToken: () => Promise<string | null>) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  /**
   * Hacer una llamada GET autenticada
   */
  async get(endpoint: string) {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Hacer una llamada POST autenticada
   */
  async post(endpoint: string, data: any) {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error('API Error Details:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.error('Could not parse error response:', e);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Hacer una llamada PUT autenticada
   */
  async put(endpoint: string, data: any) {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error('API Error Details:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.error('Could not parse error response:', e);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Hacer una llamada DELETE autenticada
   */
  async delete(endpoint: string) {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * Hook para crear un cliente API con autenticación de Clerk
 */
export function useApiClient() {
  const { getToken } = useAuth();
  
  return new ApiClient('http://localhost:3001/api', getToken);
}

/**
 * Funciones específicas de la API
 */
export const apiEndpoints = {
  // Usuario
  getCurrentUser: () => '/user/me',
  
  // Clerk
  clerkProfile: () => '/clerk/profile',
  clerkSync: () => '/clerk/profile', // Usar el mismo endpoint que clerkProfile
  
  // Citas
  getCitas: () => '/citas',
  createCita: () => '/citas',
  updateCita: (id: string) => `/citas/${id}`,
  deleteCita: (id: string) => `/citas/${id}`,
  
  // Servicios
  getServicios: () => '/servicios',
  createServicio: () => '/servicios',
  updateServicio: (id: string) => `/servicios/${id}`,
  deleteServicio: (id: string) => `/servicios/${id}`,
  
  // Usuarios
  getUsuarios: () => '/usuarios',
  createUsuario: () => '/usuarios',
  updateUsuario: (id: string) => `/usuarios/${id}`,
  deleteUsuario: (id: string) => `/usuarios/${id}`,
  
  // Perfiles
  getPerfiles: () => '/perfiles',
  createPerfil: () => '/perfiles',
  updatePerfil: (id: string) => `/perfiles/${id}`,
  deletePerfil: (id: string) => `/perfiles/${id}`,
  
  // Historias de éxito
  getHistoriasExito: () => '/historias-exito',
  createHistoriaExito: () => '/historias-exito',
  updateHistoriaExito: (id: string) => `/historias-exito/${id}`,
  deleteHistoriaExito: (id: string) => `/historias-exito/${id}`,
};
