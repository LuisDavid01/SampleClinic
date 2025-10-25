import { Cita } from '@/types/PacienteTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface CitaDetallesCompletos extends Omit<Cita, 'notas'> {
  diagnosticos?: any[];
  expediente?: any;
  archivos?: any[];
  documentos?: any[];
  notas?: any[];
  resultados?: any[];
}

export class CitasService {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtener todas las citas de un paciente
   */
  static async obtenerCitasPaciente(pacienteId: string, token: string): Promise<{citas: Cita[], paciente: any}> {
    try {
      console.log('🔍 Intentando conectar con API real...');
      
      // SIEMPRE intentar conectar con la API real primero
      const response = await this.makeRequest(`/citas/paciente/${pacienteId}`, {
        headers: {
          'Authorization': `Bearer mock-token`
        }
      });
      
      console.log('✅ API real conectada exitosamente');
      console.log('📊 Citas recibidas de la API:', response.citas.length);
      console.log('👤 Información del paciente:', response.paciente);
      
      // Guardar información del paciente para uso posterior
      const pacienteInfo = response.paciente;
      
      // Transformar datos de la API al formato esperado por el frontend
      const citasMapeadas = response.citas.map((cita: any) => {
        console.log(`🔍 Mapeando cita ${cita.idCita}:`);
        console.log(`   - evaluaciones:`, cita.evaluaciones);
        console.log(`   - archivos:`, cita.archivos);
        
        // Obtener la evaluación más reciente de esta cita específica
        const evaluacion = cita.evaluaciones?.[0];
        console.log(`   - evaluacion:`, evaluacion);
        
        const citaMapeada = {
          id: cita.idCita.toString(),
          pacienteId: cita.idPaciente.toString(),
          fisioterapeutaId: cita.idMedico.toString(),
          fisioterapeutaNombre: `${cita.medico.nombre} ${cita.medico.apellido1} ${cita.medico.apellido2 || ''}`.trim(),
          fecha: this.parseFechaSegura(cita.fechaCita), // Manejar fechas sin problemas de zona horaria
          hora: '', // Eliminar la hora
          duracion: 60, // Valor por defecto, se puede obtener de la API si está disponible
          estado: cita.estadoCita,
          tipo: this.mapTipoCita(cita.servicio?.nombreServicio || 'consulta'),
          sintomas: evaluacion?.sintomasReportados || cita.descripcion || '',
          diagnostico: evaluacion?.diagnosticoPrincipal || '',
          evaluacionFisica: evaluacion?.evaluacionFisica || '',
          planTratamiento: evaluacion?.planTratamiento || '',
          recomendaciones: evaluacion?.recomendaciones || cita.notas?.[0]?.nota || '',
          // Mapear archivos
          archivos: cita.archivos?.map(archivo => ({
            id: archivo.idArchivo,
            nombreArchivo: archivo.nombreArchivo,
            nombreOriginal: archivo.nombreOriginal,
            rutaArchivo: archivo.rutaArchivo,
            tipoMime: archivo.tipoMime,
            tamanoArchivo: archivo.tamanoArchivo,
            extension: archivo.extension,
            descripcion: archivo.descripcion,
            categoria: archivo.categoria,
            etiquetas: archivo.etiquetas,
            fechaSubida: new Date(archivo.fechaSubida)
          })) || [],
          // Datos adicionales de la evaluación
          evaluacionCompleta: evaluacion ? {
            idEvaluacion: evaluacion.idEvaluacion,
            fechaEvaluacion: evaluacion.fecha,
            doctorEvaluacion: evaluacion.doctor ? 
              `${evaluacion.doctor.nombre} ${evaluacion.doctor.apellido1} ${evaluacion.doctor.apellido2 || ''}`.trim() : 
              `${cita.medico.nombre} ${cita.medico.apellido1} ${cita.medico.apellido2 || ''}`.trim(),
            diagnosticoPrincipal: evaluacion.diagnosticoPrincipal,
            sintomasReportados: evaluacion.sintomasReportados,
            evaluacionFisica: evaluacion.evaluacionFisica,
            planTratamiento: evaluacion.planTratamiento,
            recomendaciones: evaluacion.recomendaciones
          } : null
        };
        
        console.log(`   ✅ Cita mapeada:`);
        console.log(`      - ID: ${cita.idCita}`);
        console.log(`      - evaluacionCompleta:`, evaluacion ? 'Sí' : 'No');
        if (evaluacion) {
          console.log(`      - ID Evaluación: ${evaluacion.idEvaluacion}`);
          console.log(`      - Diagnóstico: ${evaluacion.diagnosticoPrincipal}`);
        }
        
        return citaMapeada;
      });
      
      // Retornar tanto las citas como la información del paciente
      return {
        citas: citasMapeadas,
        paciente: pacienteInfo
      };
    } catch (error) {
      console.error('❌ Error conectando con API real:', error);
      
      // NO usar datos de ejemplo - forzar uso de datos reales
      console.error('❌ Error en API real:', error);
      throw new Error(`Error conectando con la API: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }


  /**
   * Parsear fecha de manera segura para evitar problemas de zona horaria
   */
  private static parseFechaSegura(fechaString: string): Date {
    // Extraer solo la parte de la fecha (YYYY-MM-DD)
    const fechaSolo = fechaString.split('T')[0];
    const [año, mes, dia] = fechaSolo.split('-');
    
    // Crear la fecha en zona horaria local para evitar desfase
    return new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
  }

  /**
   * Mapear tipo de servicio a tipo de cita
   */
  private static mapTipoCita(nombreServicio: string): 'consulta' | 'tratamiento' | 'evaluacion' | 'seguimiento' {
    const servicio = nombreServicio.toLowerCase();
    if (servicio.includes('consulta')) return 'consulta';
    if (servicio.includes('tratamiento')) return 'tratamiento';
    if (servicio.includes('evaluación') || servicio.includes('evaluacion')) return 'evaluacion';
    if (servicio.includes('seguimiento')) return 'seguimiento';
    return 'consulta'; // Por defecto
  }

  /**
   * Obtener detalles completos de una cita específica
   */
  static async obtenerDetallesCompletos(citaId: string, token: string): Promise<CitaDetallesCompletos> {
    try {
      // Llamada real a la API
      const response = await this.makeRequest(`/citas/${citaId}/detalles-completos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const cita = response.cita;
      
      // Transformar datos de la API al formato esperado por el frontend
      return {
        id: cita.idCita.toString(),
        pacienteId: cita.idPaciente.toString(),
        fisioterapeutaId: cita.idMedico.toString(),
        fisioterapeutaNombre: `${cita.medico.nombre} ${cita.medico.apellido1} ${cita.medico.apellido2 || ''}`.trim(),
        fecha: new Date(cita.fechaCita),
        hora: new Date(cita.fechaCita).toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        duracion: 60, // Valor por defecto
        estado: cita.estadoCita,
        tipo: this.mapTipoCita(cita.servicio?.nombreServicio || 'consulta'),
        sintomas: cita.descripcion || '',
        diagnostico: cita.diagnosticosPaciente?.[0]?.diagnostico || '',
        recomendaciones: cita.notas?.[0]?.nota || '',
        diagnosticos: cita.diagnosticosPaciente || [],
        expediente: cita.expedientePaciente || null,
        archivos: cita.expedientePaciente?.archivos || [],
        documentos: cita.expedientePaciente?.documentos || [],
        notas: cita.notas || [],
        resultados: cita.resultados || []
      };
    } catch (error) {
      console.error('Error obteniendo detalles completos de la cita:', error);
      throw error;
    }
  }

  /**
   * Obtener diagnósticos relacionados con una cita
   */
  static async obtenerDiagnosticos(citaId: string, token: string): Promise<any[]> {
    try {
      // Llamada real a la API
      const response = await this.makeRequest(`/citas/${citaId}/diagnosticos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.diagnosticos;
    } catch (error) {
      console.error('Error obteniendo diagnósticos:', error);
      throw error;
    }
  }

  /**
   * Obtener documentos y archivos relacionados con una cita
   */
  static async obtenerDocumentos(citaId: string, token: string): Promise<any> {
    try {
      // Llamada real a la API
      const response = await this.makeRequest(`/citas/${citaId}/documentos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response;
    } catch (error) {
      console.error('Error obteniendo documentos:', error);
      throw error;
    }
  }

  /**
   * Obtener recetas relacionadas con una cita
   */
  static async obtenerRecetas(citaId: string, token: string): Promise<any[]> {
    try {
      // Llamada real a la API
      const response = await this.makeRequest(`/citas/${citaId}/recetas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.recetas;
    } catch (error) {
      console.error('Error obteniendo recetas:', error);
      throw error;
    }
  }
}
