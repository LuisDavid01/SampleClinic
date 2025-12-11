import { useAuth } from '@clerk/nextjs';

/**
 * Cliente API para hacer llamadas autenticadas con Clerk
 */
export const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
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

		// Validar que baseUrl esté configurado
		if (!this.baseUrl) {
			throw new Error('La URL del API no está configurada');
		}

		// Construir URL completa
		// Asegurarse de que no haya doble slash
		const baseUrlClean = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
		const endpointClean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
		const url = `${baseUrlClean}${endpointClean}`;
		
		// Agregar timeout para móvil
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 segundos

		try {
			// Log para debug en móvil
			const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			if (isMobile) {
				console.log('📱 [ApiClient.get] Móvil detectado:', {
					url: url,
					baseUrl: this.baseUrl,
					endpoint: endpoint,
					hasToken: !!token,
					tokenLength: token?.length || 0
				});
			}

			const response = await Promise.race([
				fetch(url, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					},
					signal: controller.signal,
					cache: 'no-cache',
					credentials: 'omit'
				}),
				new Promise<Response>((_, reject) => {
					setTimeout(() => reject(new Error('Timeout: La solicitud tardó demasiado')), 20000);
				})
			]);

			clearTimeout(timeoutId);

			if (!response.ok) {
				let errorMessage = `Error ${response.status}: ${response.statusText}`;
				try {
					const errorData = await response.json();
					if (errorData.message) {
						errorMessage = errorData.message;
					} else if (errorData.error) {
						errorMessage = errorData.error;
					}
				} catch (e) {
					// Si no se puede parsear JSON, usar el mensaje por defecto
				}
				throw new Error(errorMessage);
			}

			return response.json();
		} catch (error: any) {
			clearTimeout(timeoutId);
			
			// Log detallado del error en móvil
			const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			if (isMobile) {
				console.error('📱 [ApiClient.get] Error en móvil:', {
					error: error,
					errorName: error?.name,
					errorMessage: error?.message,
					url: url,
					baseUrl: this.baseUrl,
					endpoint: endpoint,
					stack: error?.stack
				});
			}
			
			if (error.name === 'AbortError' || error.message?.includes('Timeout')) {
				throw new Error('La conexión tardó demasiado. Verifica tu conexión a internet.');
			}
			if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
				throw new Error('Error de conexión. Verifica tu conexión a internet y vuelve a intentar.');
			}
			if (error.message?.includes('CORS')) {
				throw new Error('Error de CORS. El servidor no permite esta solicitud.');
			}
			throw error;
		}
	}

	/**
	 * Hacer una llamada POST autenticada
	 */
	async post(endpoint: string, data: any) {
		const token = await this.getToken();
		if (!token) {
			throw new Error('No hay token de autenticación disponible');
		}

		// Agregar timeout para móvil
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 segundos

		try {
			const response = await Promise.race([
				fetch(`${this.baseUrl}${endpoint}`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					},
					body: JSON.stringify(data),
					signal: controller.signal,
					cache: 'no-cache',
					credentials: 'omit'
				}),
				new Promise<Response>((_, reject) => {
					setTimeout(() => reject(new Error('Timeout: La solicitud tardó demasiado')), 20000);
				})
			]);

			clearTimeout(timeoutId);

			if (!response.ok) {
				let errorMessage = `Error ${response.status}: ${response.statusText}`;
				try {
					const errorData = await response.json();
					
					// Solo mostrar como error si realmente hay información de error
					// Si el objeto está vacío, solo loguear como información
					if (Object.keys(errorData).length === 0) {
						console.log('API Response Info: Respuesta vacía del servidor');
					} else {
						console.error('API Error Details:', errorData);
					}
					
					// Intentar obtener el mensaje de error de diferentes formas
					if (errorData.message) {
						errorMessage = errorData.message;
					} else if (errorData.error) {
						errorMessage = errorData.error;
					} else if (errorData.details && Array.isArray(errorData.details)) {
						// Si hay detalles de validación, construir un mensaje más descriptivo
						const validationErrors = errorData.details
							.map((detail: any) => detail.msg || detail.message)
							.filter(Boolean)
							.join(', ');
						if (validationErrors) {
							errorMessage = `Errores de validación: ${validationErrors}`;
						}
					} else if (Object.keys(errorData).length > 0) {
						// Si el objeto no está vacío pero no tiene message/error, mostrar el objeto completo
						errorMessage = `Error: ${JSON.stringify(errorData)}`;
					}
				} catch (e) {
					// Si no se puede parsear JSON, intentar leer como texto
					try {
						const text = await response.text();
						if (text) {
							errorMessage = text;
						}
					} catch (textError) {
						console.error('Could not parse error response:', e);
					}
				}
				throw new Error(errorMessage);
			}

			return response.json();
		} catch (error: any) {
			clearTimeout(timeoutId);
			if (error.name === 'AbortError' || error.message?.includes('Timeout')) {
				throw new Error('La conexión tardó demasiado. Verifica tu conexión a internet.');
			}
			if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
				throw new Error('Error de conexión. Verifica tu conexión a internet y vuelve a intentar.');
			}
			throw error;
		}
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
		//console.log('response', response);
		if (!response.ok) {
			let errorMessage = `Error ${response.status}: ${response.statusText}`;
			try {
				const errorData = await response.json();
				
				// Solo mostrar como error si realmente hay información de error
				// Si el objeto está vacío, solo loguear como información
				if (response.status === 200) {
					console.log('API Response Info: Respuesta vacía del servidor');
				} else {
					console.error('API Error Details:', errorData);
				}
				
				// Intentar obtener el mensaje de error de diferentes formas
				if (errorData.message) {
					errorMessage = errorData.message;
				} else if (errorData.error) {
					errorMessage = errorData.error;
				} else if (errorData.details && Array.isArray(errorData.details)) {
					// Si hay detalles de validación, construir un mensaje más descriptivo
					const validationErrors = errorData.details
						.map((detail: any) => detail.msg || detail.message)
						.filter(Boolean)
						.join(', ');
					if (validationErrors) {
						errorMessage = `Errores de validación: ${validationErrors}`;
					}
				} else if (Object.keys(errorData).length > 0) {
					// Si el objeto no está vacío pero no tiene message/error, mostrar el objeto completo
					errorMessage = `Error: ${JSON.stringify(errorData)}`;
				}
			} catch (e) {
				// Si no se puede parsear JSON, intentar leer como texto
				try {
					const text = await response.text();
					if (text) {
						errorMessage = text;
					}
				} catch (textError) {
					console.error('Could not parse error response:', e);
				}
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
			},
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

	// Obtener baseUrl con fallback robusto para móvil
	const getBaseUrl = () => {
		// En el cliente (especialmente móvil), usar el proxy de Next.js para evitar CORS
		if (typeof window !== 'undefined') {
			const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			
			// Usar el proxy de Next.js (/api) que está configurado en next.config.ts
			// Esto evita problemas de CORS y funciona mejor en móvil
			const proxyUrl = '/api';
			console.log('🔧 [useApiClient] Cliente detectado - usando proxy Next.js:', { 
				isMobile, 
				url: proxyUrl,
				hostname: window.location.hostname,
				protocol: window.location.protocol
			});
			return proxyUrl;
		}
		
		// En el servidor, usar la URL directa del API
		if (process.env.NEXT_PUBLIC_API_BASE_URL) {
			const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
			console.log('🔧 [useApiClient] Servidor - usando NEXT_PUBLIC_API_BASE_URL:', envUrl);
			return envUrl;
		}
		
		// Fallback para servidor
		const serverUrl = 'http://localhost:3001/api';
		console.log('🔧 [useApiClient] Servidor - usando fallback:', serverUrl);
		return serverUrl;
	};

	return new ApiClient(getBaseUrl(), getToken);
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

	// Expedientes
	getExpedientes: () => '/expedientes',
	createExpediente: () => '/expedientes',
	updateExpediente: (id: string) => `/expedientes/${id}`,
	deleteExpediente: (id: string) => `/expedientes/${id}`,

	//Auditoria
	getAuditoria: () => '/auditoria',
};
