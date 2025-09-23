const crypto = require('crypto');
const prisma = require('../config/database');
const config = require('../config/env');

class SessionService {
  constructor() {
    this.maxInactiveTime = 30 * 60 * 1000; // 30 minutos en milisegundos
    this.cleanupInterval = 5 * 60 * 1000; // 5 minutos en milisegundos
    this.startCleanupTask();
  }

  /**
   * Crear hash del token para almacenamiento seguro
   */
  createTokenHash(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Crear nueva sesión
   */
  async createSession(userId, token, req = null) {
    try {
      const tokenHash = this.createTokenHash(token);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.maxInactiveTime);

      // Invalidar sesiones anteriores del usuario (sesión única)
      await this.invalidateUserSessions(userId);

      const session = await prisma.sesion.create({
        data: {
          idUsuario: userId,
          tokenHash,
          fechaCreacion: now,
          ultimaActividad: now,
          expiraEn: expiresAt,
          activa: true,
          ipAddress: req?.ip || req?.connection?.remoteAddress,
          userAgent: req?.get('User-Agent')
        }
      });

      console.log(`✅ Nueva sesión creada para usuario ${userId}`);
      return session;
    } catch (error) {
      console.error('Error creando sesión:', error);
      throw error;
    }
  }

  /**
   * Validar sesión activa
   */
  async validateSession(token) {
    try {
      const tokenHash = this.createTokenHash(token);
      
      const session = await prisma.sesion.findUnique({
        where: { tokenHash },
        include: { usuario: { include: { rol: true } } }
      });

      if (!session || !session.activa) {
        return { valid: false, reason: 'Sesión no encontrada o inactiva' };
      }

      // Verificar si la sesión ha expirado
      const now = new Date();
      if (now > session.expiraEn) {
        await this.invalidateSession(session.idSesion);
        return { valid: false, reason: 'Sesión expirada' };
      }

      // Verificar inactividad
      const timeSinceLastActivity = now - session.ultimaActividad;
      if (timeSinceLastActivity > this.maxInactiveTime) {
        await this.invalidateSession(session.idSesion);
        return { valid: false, reason: 'Sesión inactiva por demasiado tiempo' };
      }

      // Actualizar última actividad
      await this.updateLastActivity(session.idSesion);

      return {
        valid: true,
        session,
        user: session.usuario
      };
    } catch (error) {
      console.error('Error validando sesión:', error);
      return { valid: false, reason: 'Error interno del servidor' };
    }
  }

  /**
   * Actualizar última actividad de la sesión
   */
  async updateLastActivity(sessionId) {
    try {
      await prisma.sesion.update({
        where: { idSesion: sessionId },
        data: { ultimaActividad: new Date() }
      });
    } catch (error) {
      console.error('Error actualizando última actividad:', error);
    }
  }

  /**
   * Invalidar sesión específica
   */
  async invalidateSession(sessionId) {
    try {
      await prisma.sesion.update({
        where: { idSesion: sessionId },
        data: { activa: false }
      });
      console.log(`❌ Sesión ${sessionId} invalidada`);
    } catch (error) {
      console.error('Error invalidando sesión:', error);
    }
  }

  /**
   * Invalidar todas las sesiones de un usuario
   */
  async invalidateUserSessions(userId) {
    try {
      await prisma.sesion.updateMany({
        where: { 
          idUsuario: userId,
          activa: true
        },
        data: { activa: false }
      });
      console.log(`❌ Todas las sesiones del usuario ${userId} invalidadas`);
    } catch (error) {
      console.error('Error invalidando sesiones del usuario:', error);
    }
  }

  /**
   * Invalidar sesión por token
   */
  async invalidateSessionByToken(token) {
    try {
      const tokenHash = this.createTokenHash(token);
      await prisma.sesion.updateMany({
        where: { 
          tokenHash,
          activa: true
        },
        data: { activa: false }
      });
      console.log(`❌ Sesión con token invalidada`);
    } catch (error) {
      console.error('Error invalidando sesión por token:', error);
    }
  }

  /**
   * Obtener sesiones activas de un usuario
   */
  async getUserActiveSessions(userId) {
    try {
      const sessions = await prisma.sesion.findMany({
        where: { 
          idUsuario: userId,
          activa: true
        },
        orderBy: { ultimaActividad: 'desc' }
      });
      return sessions;
    } catch (error) {
      console.error('Error obteniendo sesiones del usuario:', error);
      return [];
    }
  }

  /**
   * Obtener información de sesión actual
   */
  async getSessionInfo(token) {
    try {
      const tokenHash = this.createTokenHash(token);
      const session = await prisma.sesion.findUnique({
        where: { tokenHash },
        include: { usuario: { include: { rol: true } } }
      });
      return session;
    } catch (error) {
      console.error('Error obteniendo información de sesión:', error);
      return null;
    }
  }

  /**
   * Limpiar sesiones expiradas (tarea automática)
   */
  async cleanupExpiredSessions() {
    try {
      const now = new Date();
      const result = await prisma.sesion.updateMany({
        where: {
          OR: [
            { expiraEn: { lt: now } },
            { 
              AND: [
                { activa: true },
                { ultimaActividad: { lt: new Date(now.getTime() - this.maxInactiveTime) } }
              ]
            }
          ]
        },
        data: { activa: false }
      });

      if (result.count > 0) {
        console.log(`🧹 ${result.count} sesiones expiradas limpiadas`);
      }
    } catch (error) {
      console.error('Error limpiando sesiones expiradas:', error);
    }
  }

  /**
   * Iniciar tarea de limpieza automática
   */
  startCleanupTask() {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.cleanupInterval);

    console.log('🔄 Tarea de limpieza de sesiones iniciada');
  }

  /**
   * Obtener estadísticas de sesiones
   */
  async getSessionStats() {
    try {
      const totalSessions = await prisma.sesion.count();
      const activeSessions = await prisma.sesion.count({
        where: { activa: true }
      });
      const expiredSessions = totalSessions - activeSessions;

      return {
        total: totalSessions,
        active: activeSessions,
        expired: expiredSessions
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de sesiones:', error);
      return { total: 0, active: 0, expired: 0 };
    }
  }
}

module.exports = new SessionService();
