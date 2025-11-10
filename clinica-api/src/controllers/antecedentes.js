import prisma from '../config/database.js';
import { ROLES } from '../constants/roles.js';
import { encrypt, decrypt } from '../middleware/encryption.js';

/**
 * Crear antecedentes clínicos para un paciente
 * POST /api/pacientes/{id}/antecedentes
 */
export const createAntecedentes = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      historialMedico,
      condicionesPreexistentes,
      alergiasMedicamentos,
      alergiasAlimentos,
      alergiasAmbientales,
      alergiasOtras,
      medicamentosActuales,
      medicamentosPrevios,
      cirugiasPrevias,
      procedimientosMedicos,
      hospitalizacionesPrevias,
      antecedentesFamiliares,
      habitosToxicos,
      urgenciasMedicas,
      contactoEmergenciaNombre,
      contactoEmergenciaTelefono,
      contactoEmergenciaRelacion,
      notasAdicionales
    } = req.body;

    // Verificar que el paciente existe
    const paciente = await prisma.usuario.findUnique({
      where: { idUsuario: parseInt(id) },
      include: { rol: true }
    });

    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'Paciente no encontrado'
      });
    }

    // Verificar que el usuario es un paciente
    if (paciente.rol.idRol !== ROLES.PACIENTE) {
      return res.status(400).json({
        success: false,
        error: 'El usuario especificado no es un paciente'
      });
    }

    // Verificar que el paciente no tenga antecedentes ya registrados
    const antecedentesExistentes = await prisma.antecedenteClinico.findUnique({
      where: { idPaciente: parseInt(id) }
    });

    if (antecedentesExistentes) {
      return res.status(400).json({
        success: false,
        error: 'El paciente ya tiene antecedentes clínicos registrados'
      });
    }

    // Obtener el médico que está registrando (desde el token de Clerk)
    const clerkId = req.user?.id;
    
    // Buscar el usuario en la base de datos por Clerk ID
    const medico = await prisma.usuario.findFirst({
      where: { clerkId },
      select: { idUsuario: true }
    });
    
    if (!medico) {
      return res.status(404).json({
        success: false,
        error: 'Médico no encontrado en la base de datos'
      });
    }
    
    const medicoRegistro = medico.idUsuario;

    // NO encriptar estos campos - guardar directamente
    const urgenciasSinEncriptar = urgenciasMedicas;
    const telefonoSinEncriptar = contactoEmergenciaTelefono;
    const notasSinEncriptar = notasAdicionales;

    // Crear los antecedentes
    const antecedentes = await prisma.antecedenteClinico.create({
      data: {
        idPaciente: parseInt(id),
        historialMedico,
        condicionesPreexistentes,
        alergiasMedicamentos,
        alergiasAlimentos,
        alergiasAmbientales,
        alergiasOtras,
        medicamentosActuales,
        medicamentosPrevios,
        cirugiasPrevias,
        procedimientosMedicos,
        hospitalizacionesPrevias,
        antecedentesFamiliares,
        habitosToxicos,
        urgenciasMedicas: urgenciasSinEncriptar,
        contactoEmergenciaNombre,
        contactoEmergenciaTelefono: telefonoSinEncriptar,
        contactoEmergenciaRelacion,
        idMedicoRegistro: medicoRegistro,
        notasAdicionales: notasSinEncriptar
      },
      include: {
        paciente: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true
          }
        },
        medicoRegistro: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true
          }
        }
      }
    });


    res.status(201).json({
      success: true,
      message: 'Antecedentes clínicos creados exitosamente',
      data: antecedentes
    });

  } catch (error) {
    console.error('Error creando antecedentes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

/**
 * Obtener antecedentes clínicos de un paciente
 * GET /api/pacientes/{id}/antecedentes
 */
export const getAntecedentes = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el paciente existe
    const paciente = await prisma.usuario.findUnique({
      where: { idUsuario: parseInt(id) },
      include: { rol: true }
    });

    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'Paciente no encontrado'
      });
    }

    // Buscar antecedentes del paciente
    const antecedentes = await prisma.antecedenteClinico.findUnique({
      where: { idPaciente: parseInt(id) },
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
        medicoRegistro: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true
          }
        }
      }
    });

    if (!antecedentes) {
      return res.status(404).json({
        success: false,
        error: 'No se encontraron antecedentes clínicos para este paciente'
      });
    }

    // NO desencriptar - los datos ya están en texto plano
    const antecedentesSinDesencriptar = {
      ...antecedentes
    };

    res.json({
      success: true,
      data: antecedentesSinDesencriptar
    });

  } catch (error) {
    console.error('Error obteniendo antecedentes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

/**
 * Actualizar antecedentes clínicos de un paciente
 * PUT /api/pacientes/{id}/antecedentes
 */
export const updateAntecedentes = async (req, res) => {
  try {
    
    const { id } = req.params;
    const updateData = req.body;

    
    


    // Verificar que el paciente existe
    const paciente = await prisma.usuario.findUnique({
      where: { idUsuario: parseInt(id) },
      include: { rol: true }
    });

    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'Paciente no encontrado'
      });
    }

    // Verificar que los antecedentes existen
    const antecedentesExistentes = await prisma.antecedenteClinico.findUnique({
      where: { idPaciente: parseInt(id) }
    });

    if (!antecedentesExistentes) {
      return res.status(404).json({
        success: false,
        error: 'No se encontraron antecedentes clínicos para este paciente'
      });
    }

    // NO encriptar estos campos - guardar directamente
    const urgenciasSinEncriptar = updateData.urgenciasMedicas;
    const telefonoSinEncriptar = updateData.contactoEmergenciaTelefono;
    const notasSinEncriptar = updateData.notasAdicionales;

    // Transformar datos para manejar cadenas vacías - SOLO convertir cadenas vacías a null, NO valores reales
    const transformedData = {
      ...updateData,
      // Solo convertir cadenas vacías a null para campos opcionales, mantener valores reales
      contactoEmergenciaNombre: (updateData.contactoEmergenciaNombre === '' || updateData.contactoEmergenciaNombre === null || updateData.contactoEmergenciaNombre === undefined) ? null : updateData.contactoEmergenciaNombre,
      contactoEmergenciaTelefono: telefonoSinEncriptar, // Usar el valor sin encriptar
      contactoEmergenciaRelacion: (updateData.contactoEmergenciaRelacion === '' || updateData.contactoEmergenciaRelacion === null || updateData.contactoEmergenciaRelacion === undefined) ? null : updateData.contactoEmergenciaRelacion,
      // Usar los valores sin encriptar para los campos problemáticos
      urgenciasMedicas: urgenciasSinEncriptar, // Usar el valor sin encriptar
      notasAdicionales: notasSinEncriptar, // Usar el valor sin encriptar
      fechaActualizacion: new Date()
    };



    // Actualizar los antecedentes
    const antecedentes = await prisma.antecedenteClinico.update({
      where: { idPaciente: parseInt(id) },
      data: transformedData,
      include: {
        paciente: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true
          }
        },
        medicoRegistro: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true
          }
        }
      }
    });


    res.json({
      success: true,
      message: 'Antecedentes clínicos actualizados exitosamente',
      data: antecedentes
    });

  } catch (error) {
    console.error('💥 [BACKEND] Error en updateAntecedentes:', error);
    console.error('💥 [BACKEND] Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

/**
 * Obtener historial de cambios de antecedentes
 * GET /api/pacientes/{id}/antecedentes/historial
 */
export const getHistorialAntecedentes = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el paciente existe
    const paciente = await prisma.usuario.findUnique({
      where: { idUsuario: parseInt(id) }
    });

    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'Paciente no encontrado'
      });
    }

    // Obtener antecedentes con información de auditoría
    const antecedentes = await prisma.antecedenteClinico.findUnique({
      where: { idPaciente: parseInt(id) },
      include: {
        paciente: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true
          }
        },
        medicoRegistro: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true
          }
        }
      }
    });

    if (!antecedentes) {
      return res.status(404).json({
        success: false,
        error: 'No se encontraron antecedentes clínicos para este paciente'
      });
    }

    // Preparar información del historial
    const historial = {
      antecedentes,
      historialCambios: {
        fechaCreacion: antecedentes.fechaCreacion,
        fechaUltimaActualizacion: antecedentes.fechaActualizacion,
        medicoRegistro: antecedentes.medicoRegistro,
        totalActualizaciones: antecedentes.fechaCreacion.getTime() === antecedentes.fechaActualizacion.getTime() ? 0 : 1
      }
    };

    res.json({
      success: true,
      data: historial
    });

  } catch (error) {
    console.error('Error obteniendo historial de antecedentes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};
