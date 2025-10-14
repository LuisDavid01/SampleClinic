import prisma from '../config/database.js';
import { getAuditHistory, getAuditStats } from '../middleware/audit.js';

/**
 * Obtener historial de auditoría para un paciente específico
 * GET /api/auditoria/pacientes/{id}/antecedentes
 */
export const getHistorialAuditoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const pacienteId = parseInt(id);
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Obtener historial de auditoría
    const historial = await prisma.auditoriaAntecedentes.findMany({
      where: {
        recurso: 'ANTECEDENTES_CLINICOS',
        recursoId: pacienteId
      },
      include: {
        usuario: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      skip: offset,
      take: parseInt(limit)
    });
    
    // Obtener total de registros
    const total = await prisma.auditoriaAntecedentes.count({
      where: {
        recurso: 'ANTECEDENTES_CLINICOS',
        recursoId: pacienteId
      }
    });
    
    res.json({
      success: true,
      data: {
        historial,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo historial de auditoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

/**
 * Obtener estadísticas de auditoría
 * GET /api/auditoria/estadisticas
 */
export const getEstadisticasAuditoria = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, usuarioId } = req.query;
    
    // Construir filtros
    const whereClause = {
      recurso: 'ANTECEDENTES_CLINICOS'
    };
    
    if (fechaInicio && fechaFin) {
      whereClause.timestamp = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin)
      };
    }
    
    if (usuarioId) {
      whereClause.usuarioId = parseInt(usuarioId);
    }
    
    // Estadísticas por acción
    const statsPorAccion = await prisma.auditoriaAntecedentes.groupBy({
      by: ['accion'],
      where: whereClause,
      _count: {
        id: true
      }
    });
    
    // Estadísticas por usuario
    const statsPorUsuario = await prisma.auditoriaAntecedentes.groupBy({
      by: ['usuarioId'],
      where: whereClause,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });
    
    // Obtener información de usuarios para las estadísticas
    const usuariosIds = statsPorUsuario.map(stat => stat.usuarioId).filter(Boolean);
    const usuarios = await prisma.usuario.findMany({
      where: {
        idUsuario: {
          in: usuariosIds
        }
      },
      select: {
        idUsuario: true,
        nombre: true,
        apellido1: true,
        apellido2: true
      }
    });
    
    // Combinar estadísticas con información de usuarios
    const statsPorUsuarioConInfo = statsPorUsuario.map(stat => ({
      ...stat,
      usuario: usuarios.find(u => u.idUsuario === stat.usuarioId)
    }));
    
    // Actividad reciente (últimas 24 horas)
    const actividadReciente = await prisma.auditoriaAntecedentes.count({
      where: {
        ...whereClause,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
    
    res.json({
      success: true,
      data: {
        estadisticasPorAccion: statsPorAccion,
        estadisticasPorUsuario: statsPorUsuarioConInfo,
        actividadReciente,
        totalRegistros: await prisma.auditoriaAntecedentes.count({
          where: whereClause
        })
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo estadísticas de auditoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

/**
 * Obtener logs de seguridad
 * GET /api/auditoria/seguridad
 */
export const getLogsSeguridad = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, nivel = 'all' } = req.query;
    
    // Construir filtros
    const whereClause = {
      recurso: 'ANTECEDENTES_CLINICOS'
    };
    
    if (fechaInicio && fechaFin) {
      whereClause.timestamp = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin)
      };
    }
    
    // Filtrar por nivel de seguridad
    if (nivel === 'high') {
      whereClause.statusCode = {
        in: [403, 404, 500]
      };
    } else if (nivel === 'medium') {
      whereClause.statusCode = {
        in: [400, 401]
      };
    }
    
    const logs = await prisma.auditoriaAntecedentes.findMany({
      where: whereClause,
      include: {
        usuario: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100
    });
    
    res.json({
      success: true,
      data: logs
    });
    
  } catch (error) {
    console.error('Error obteniendo logs de seguridad:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

/**
 * Exportar datos de auditoría
 * GET /api/auditoria/exportar
 */
export const exportarAuditoria = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, formato = 'json' } = req.query;
    
    const whereClause = {
      recurso: 'ANTECEDENTES_CLINICOS'
    };
    
    if (fechaInicio && fechaFin) {
      whereClause.timestamp = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin)
      };
    }
    
    const datos = await prisma.auditoriaAntecedentes.findMany({
      where: whereClause,
      include: {
        usuario: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    if (formato === 'csv') {
      // Convertir a CSV
      const csv = convertToCSV(datos);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="auditoria_antecedentes.csv"');
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: datos,
        metadata: {
          total: datos.length,
          fechaExportacion: new Date().toISOString(),
          rangoFechas: {
            inicio: fechaInicio,
            fin: fechaFin
          }
        }
      });
    }
    
  } catch (error) {
    console.error('Error exportando auditoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

/**
 * Convierte datos a formato CSV
 */
function convertToCSV(data) {
  if (!data.length) return '';
  
  const headers = [
    'ID',
    'Acción',
    'Recurso',
    'Recurso ID',
    'Método',
    'URL',
    'Status Code',
    'Usuario ID',
    'IP Address',
    'User Agent',
    'Timestamp'
  ];
  
  const rows = data.map(item => [
    item.id,
    item.accion,
    item.recurso,
    item.recursoId,
    item.metodo,
    item.url,
    item.statusCode,
    item.usuarioId,
    item.ipAddress,
    item.userAgent,
    item.timestamp.toISOString()
  ]);
  
  return [headers, ...rows].map(row => 
    row.map(field => `"${field || ''}"`).join(',')
  ).join('\n');
}
