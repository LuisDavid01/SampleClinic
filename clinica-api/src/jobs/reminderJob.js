import cron from 'node-cron';
import config from '../config/env.js';
import reminderService from '../services/reminderService.js';

class ReminderJob {
	constructor() {
		this.job = null;
		this.isRunning = false;
	}

	/**
	 * Iniciar el job programado
	 */
	start() {
		const schedule = config.recordatorio.cronSchedule || '0 9 * * *'; // Por defecto: todos los días a las 9 AM

		console.log(`📅 Programando job de recordatorios con cron: ${schedule}`);

		// Obtener timezone de variable de entorno o usar default
		const timezone = process.env.TZ || "America/Costa_Rica";

		this.job = cron.schedule(schedule, async () => {
			// Evitar ejecuciones simultáneas
			if (this.isRunning) {
				console.log('⏸️  Job de recordatorios ya en ejecución, omitiendo...');
				return;
			}

			this.isRunning = true;
			console.log('🚀 Iniciando job de recordatorios...');

			try {
				const resultado = await reminderService.procesarRecordatorios();
				
				if (resultado.success) {
					console.log(`✅ Job completado: ${resultado.enviados} recordatorios enviados, ${resultado.fallidos} fallidos`);
				} else {
					console.error('❌ Error en job de recordatorios:', resultado.error);
				}
			} catch (error) {
				console.error('❌ Error crítico en job de recordatorios:', error);
			} finally {
				this.isRunning = false;
			}
		}, {
			scheduled: true,
			timezone: timezone
		});

		console.log('✅ Job de recordatorios iniciado correctamente');
	}

	/**
	 * Detener el job programado
	 */
	stop() {
		if (this.job) {
			this.job.stop();
			console.log('⏹️  Job de recordatorios detenido');
		}
	}

	/**
	 * Ejecutar manualmente el job (útil para testing)
	 */
	async ejecutarManual() {
		if (this.isRunning) {
			console.log('⏸️  Job ya en ejecución');
			return { success: false, error: 'Job ya en ejecución' };
		}

		this.isRunning = true;
		console.log('🔧 Ejecutando job de recordatorios manualmente...');

		try {
			const resultado = await reminderService.procesarRecordatorios();
			return resultado;
		} catch (error) {
			console.error('Error ejecutando job manualmente:', error);
			return { success: false, error: error.message };
		} finally {
			this.isRunning = false;
		}
	}

	/**
	 * Obtener estado del job
	 */
	getEstado() {
		return {
			activo: this.job !== null,
			ejecutando: this.isRunning,
			schedule: config.recordatorio.cronSchedule
		};
	}
}

// Exportar instancia única (singleton)
const reminderJob = new ReminderJob();

/**
 * Función para iniciar el job (llamada desde index.js)
 */
export function startReminderJob() {
	reminderJob.start();
	return reminderJob;
}

export default reminderJob;

