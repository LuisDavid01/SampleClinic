import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database.js';
import config from '../config/env.js';
import emailService from './emailService.js';

class ReminderService {
	constructor() {
		this.diasAntes = config.recordatorio.diasAntes || 2;
	}

	/**
	 * Buscar citas que necesitan recordatorio
	 * @returns {Promise<Array>} Lista de citas que necesitan recordatorio
	 */
	async buscarCitasParaRecordatorio() {
		try {
			// Calcular fecha objetivo (2 días desde hoy)
			const fechaObjetivo = new Date();
			fechaObjetivo.setDate(fechaObjetivo.getDate() + this.diasAntes);
			fechaObjetivo.setHours(0, 0, 0, 0);

			// Fecha límite (fin del día objetivo)
			const fechaLimite = new Date(fechaObjetivo);
			fechaLimite.setHours(23, 59, 59, 999);

			// Buscar citas que:
			// 1. Tienen fecha de cita dentro de 2 días
			// 2. Están en estado 'programada' o 'confirmada'
			// 3. No se les ha enviado recordatorio aún
			// 4. Tienen fecha de cita válida
			// 5. El paciente está activo y tiene email
			const citas = await prisma.cita.findMany({
				where: {
					fechaCita: {
						gte: fechaObjetivo,
						lte: fechaLimite
					},
					estadoCita: {
						in: ['programada', 'confirmada']
					},
					recordatorioEnviado: {
						not: true
					},
					paciente: {
						activo: true
					}
				},
				include: {
					paciente: {
						select: {
							idUsuario: true,
							nombre: true,
							apellido1: true,
							apellido2: true,
							correoElectronico: true
						}
					},
					medico: {
						select: {
							idUsuario: true,
							nombre: true,
							apellido1: true,
							apellido2: true
						}
					},
					servicio: {
						select: {
							idServicio: true,
							nombreServicio: true
						}
					}
				}
			});

			return citas;
		} catch (error) {
			console.error('Error buscando citas para recordatorio:', error);
			throw error;
		}
	}

	/**
	 * Generar token único de confirmación
	 * @param {Number} idCita - ID de la cita
	 * @returns {String} Token único
	 */
	generarTokenConfirmacion(idCita) {
		// Combinar UUID con ID de cita para mayor seguridad
		const uuid = uuidv4();
		const timestamp = Date.now();
		return `${idCita}-${uuid}-${timestamp}`.replace(/-/g, '');
	}

	/**
	 * Enviar recordatorio para una cita específica
	 * @param {Object} cita - Objeto de cita
	 * @returns {Promise<Object>} Resultado del envío
	 */
	async enviarRecordatorio(cita) {
		try {
			// Validar que la cita tenga los datos necesarios
			if (!cita.paciente?.correoElectronico) {
				console.warn(`⚠️  Cita #${cita.idCita} no tiene email de paciente`);
				return { success: false, error: 'Email de paciente no disponible' };
			}

			// Generar token único si no existe
			let tokenConfirmacion = cita.tokenConfirmacion;
			if (!tokenConfirmacion) {
				tokenConfirmacion = this.generarTokenConfirmacion(cita.idCita);
			}

			// Enviar email
			const resultado = await emailService.enviarRecordatorioCita(cita, tokenConfirmacion);

			if (resultado.success) {
				// Actualizar cita con información del recordatorio
				await prisma.cita.update({
					where: { idCita: cita.idCita },
					data: {
						recordatorioEnviado: true,
						fechaRecordatorioEnviado: new Date(),
						tokenConfirmacion: tokenConfirmacion
					}
				});

				console.log(`✅ Recordatorio enviado para cita #${cita.idCita}`);
				return { success: true, citaId: cita.idCita };
			} else {
				console.error(`❌ Error enviando recordatorio para cita #${cita.idCita}:`, resultado.error);
				return { success: false, error: resultado.error, citaId: cita.idCita };
			}
		} catch (error) {
			console.error(`Error procesando recordatorio para cita #${cita.idCita}:`, error);
			return { success: false, error: error.message, citaId: cita.idCita };
		}
	}

	/**
	 * Procesar todos los recordatorios pendientes
	 * @returns {Promise<Object>} Resumen del procesamiento
	 */
	async procesarRecordatorios() {
		try {
			console.log('🔍 Buscando citas que necesitan recordatorio...');
			const citas = await this.buscarCitasParaRecordatorio();

			if (citas.length === 0) {
				console.log('✅ No hay citas que necesiten recordatorio en este momento');
				return {
					success: true,
					total: 0,
					enviados: 0,
					fallidos: 0
				};
			}

			console.log(`📧 Encontradas ${citas.length} citas que necesitan recordatorio`);

			let enviados = 0;
			let fallidos = 0;
			const errores = [];

			// Procesar cada cita
			for (const cita of citas) {
				const resultado = await this.enviarRecordatorio(cita);
				if (resultado.success) {
					enviados++;
				} else {
					fallidos++;
					errores.push({
						citaId: cita.idCita,
						error: resultado.error
					});
				}

				// Pequeña pausa para no saturar el servidor de email
				await new Promise(resolve => setTimeout(resolve, 500));
			}

			const resumen = {
				success: true,
				total: citas.length,
				enviados,
				fallidos,
				errores: errores.length > 0 ? errores : undefined
			};

			console.log(`✅ Procesamiento completado: ${enviados} enviados, ${fallidos} fallidos`);
			return resumen;
		} catch (error) {
			console.error('Error procesando recordatorios:', error);
			return {
				success: false,
				error: error.message
			};
		}
	}

	/**
	 * Validar token de confirmación
	 * @param {Number} idCita - ID de la cita
	 * @param {String} token - Token a validar
	 * @returns {Promise<Boolean>} True si el token es válido
	 */
	async validarToken(idCita, token) {
		try {
			const cita = await prisma.cita.findUnique({
				where: { idCita },
				select: { tokenConfirmacion: true, estadoCita: true }
			});

			if (!cita) {
				return false;
			}

			// Validar que el token coincida y la cita esté en estado válido
			return cita.tokenConfirmacion === token && 
				   (cita.estadoCita === 'programada' || cita.estadoCita === 'confirmada');
		} catch (error) {
			console.error('Error validando token:', error);
			return false;
		}
	}

	/**
	 * Confirmar cita con token
	 * @param {Number} idCita - ID de la cita
	 * @param {String} token - Token de confirmación
	 * @returns {Promise<Object>} Resultado de la confirmación
	 */
	async confirmarCita(idCita, token) {
		try {
			// Validar token
			const tokenValido = await this.validarToken(idCita, token);
			if (!tokenValido) {
				return { success: false, error: 'Token inválido o cita no disponible' };
			}

			// Actualizar cita
			const cita = await prisma.cita.update({
				where: { idCita },
				data: {
					estadoCita: 'confirmada',
					fechaConfirmacion: new Date()
				},
				include: {
					paciente: {
						select: {
							idUsuario: true,
							nombre: true,
							apellido1: true,
							correoElectronico: true
						}
					}
				}
			});

			// Enviar email de confirmación
			await emailService.enviarConfirmacionRespuesta(cita, true);

			return { success: true, cita };
		} catch (error) {
			console.error('Error confirmando cita:', error);
			return { success: false, error: error.message };
		}
	}

	/**
	 * Rechazar cita con token
	 * @param {Number} idCita - ID de la cita
	 * @param {String} token - Token de confirmación
	 * @returns {Promise<Object>} Resultado del rechazo
	 */
	async rechazarCita(idCita, token) {
		try {
			// Validar token
			const tokenValido = await this.validarToken(idCita, token);
			if (!tokenValido) {
				return { success: false, error: 'Token inválido o cita no disponible' };
			}

			// Actualizar cita
			const cita = await prisma.cita.update({
				where: { idCita },
				data: {
					estadoCita: 'cancelada'
				},
				include: {
					paciente: {
						select: {
							idUsuario: true,
							nombre: true,
							apellido1: true,
							correoElectronico: true
						}
					}
				}
			});

			// Enviar email de confirmación
			await emailService.enviarConfirmacionRespuesta(cita, false);

			return { success: true, cita };
		} catch (error) {
			console.error('Error rechazando cita:', error);
			return { success: false, error: error.message };
		}
	}
}

// Exportar instancia única (singleton)
export default new ReminderService();

