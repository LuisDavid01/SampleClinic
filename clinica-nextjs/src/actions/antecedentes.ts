'use server';

import { auth } from '@clerk/nextjs/server';
import { AntecedenteClinico, AntecedenteFormData } from '@/types/Antecedentes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

async function fetchWithAuth(url: string, options?: RequestInit) {
	try {


		const user = await auth();
		const token = await user.getToken();

		if (!token) {
			throw new Error('Token de autorización requerido');
		}

		const headers = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
			...options?.headers,
		};


		// Verificar el contenido del body antes de enviarlo
		if (options?.body && typeof options.body === 'string') {
			try {
				const bodyData = JSON.parse(options.body);
				console.log('📡 [FETCH] Datos del body parseados:');
				console.log('- urgenciasMedicas en body:', bodyData.urgenciasMedicas, typeof bodyData.urgenciasMedicas);
				console.log('- contactoEmergenciaTelefono en body:', bodyData.contactoEmergenciaTelefono, typeof bodyData.contactoEmergenciaTelefono);
				console.log('- notasAdicionales en body:', bodyData.notasAdicionales, typeof bodyData.notasAdicionales);

				// Verificar si los campos están vacíos en el JSON
				console.log('📡 [FETCH] Verificación de campos en JSON:');
				console.log('- urgenciasMedicas está vacío:', !bodyData.urgenciasMedicas || bodyData.urgenciasMedicas.trim() === '');
				console.log('- contactoEmergenciaTelefono está vacío:', !bodyData.contactoEmergenciaTelefono || bodyData.contactoEmergenciaTelefono.trim() === '');
				console.log('- notasAdicionales está vacío:', !bodyData.notasAdicionales || bodyData.notasAdicionales.trim() === '');
			} catch (e) {
				console.log('📡 [FETCH] Error parseando body:', e);
			}
		}

		const response = await fetch(url, { ...options, headers });


		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Error en la solicitud');
		}

		const responseData = await response.json();
		return responseData;
	} catch (error) {
		console.error('💥 [FETCH] Error en fetchWithAuth:', error);
		throw error;
	}
}

export interface ActionResponse {
	success: boolean;
	data?: any;
	error?: string;
	details?: string;
}

/**
 * Obtener antecedentes clínicos de un paciente
 */
export async function getAntecedentes(pacienteId: number): Promise<ActionResponse> {
	try {
		const response = await fetchWithAuth(`${API_BASE_URL}/pacientes/${pacienteId}/antecedentes`);

		return {
			success: true,
			data: response.data
		};
	} catch (error: any) {
		console.error('Error obteniendo antecedentes:', error);
		return {
			success: false,
			error: 'Error obteniendo antecedentes clínicos',
			details: error.message
		};
	}
}

/**
 * Crear antecedentes clínicos para un paciente
 */
export async function createAntecedentes(
	pacienteId: number,
	data: AntecedenteFormData
): Promise<ActionResponse> {
	try {
		const response = await fetchWithAuth(`${API_BASE_URL}/pacientes/${pacienteId}/antecedentes`, {
			method: 'POST',
			body: JSON.stringify(data)
		});

		return {
			success: true,
			data: response.data,
			details: 'Antecedentes clínicos creados exitosamente'
		};
	} catch (error: any) {
		console.error('Error creando antecedentes:', error);
		return {
			success: false,
			error: 'Error creando antecedentes clínicos',
			details: error.message
		};
	}
}

/**
 * Actualizar antecedentes clínicos de un paciente
 */
export async function updateAntecedentes(
	pacienteId: number,
	data: AntecedenteFormData
): Promise<ActionResponse> {
	try {

		// Preparar las opciones de la petición
		const requestOptions = {
			method: 'PUT',
			body: JSON.stringify(data)
		};


		// Usar los datos directamente sin procesamiento adicional
		const response = await fetchWithAuth(`${API_BASE_URL}/pacientes/${pacienteId}/antecedentes`, requestOptions);

		return {
			success: true,
			data: response.data,
			details: 'Antecedentes clínicos actualizados exitosamente'
		};
	} catch (error: any) {
		console.error('Error actualizando antecedentes:', error);
		return {
			success: false,
			error: 'Error actualizando antecedentes clínicos',
			details: error.message
		};
	}
}

/**
 * Obtener historial de cambios de antecedentes
 */
export async function getHistorialAntecedentes(pacienteId: number): Promise<ActionResponse> {
	try {
		const response = await fetchWithAuth(`${API_BASE_URL}/pacientes/${pacienteId}/antecedentes/historial`);

		return {
			success: true,
			data: response.data
		};
	} catch (error: any) {
		console.error('Error obteniendo historial de antecedentes:', error);
		return {
			success: false,
			error: 'Error obteniendo historial de antecedentes',
			details: error.message
		};
	}
}
