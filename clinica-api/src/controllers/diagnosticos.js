import prisma from '../config/database.js';
import { ROLES } from '../constants/roles.js';

/**
 * Obtener todos los diagnósticos con filtros
 */
export const getDiagnosticos = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      idPaciente, 
      idDoctor,
      fechaDesde,
      fechaHasta
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construir filtros
    const where = {};

    if (search) {
      where.diagnostico = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (idPaciente) {
      where.idPaciente = parseInt(idPaciente);
    }

    if (idDoctor) {
      where.idDoctor = parseInt(idDoctor);
    }

    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) {
        where.fecha.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fecha.lte = new Date(fechaHasta);
      }
    }

    // Obtener diagnósticos con relaciones
    const diagnosticos = await prisma.evaluacionDiagnostico.findMany({
      where,
      skip,
      take,
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
        doctor: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true
          }
        },
        expediente: {
          select: {
            idExpediente: true,
            cedula: true,
            estado: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    // Contar total de registros
    const total = await prisma.evaluacionDiagnostico.count({ where });

    res.json({
      success: true,
      data: diagnosticos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error obteniendo diagnósticos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los diagnósticos'
    });
  }
};

/**
 * Obtener un diagnóstico por ID
 */
export const getDiagnosticoById = async (req, res) => {
  try {
    const { id } = req.params;
    const diagnosticoId = parseInt(id);

    if (isNaN(diagnosticoId)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'El ID del diagnóstico debe ser un número válido'
      });
    }

    const diagnostico = await prisma.evaluacionDiagnostico.findUnique({
      where: { idEvaluacion: diagnosticoId },
      include: {
        paciente: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true,
            telefonoPrincipal: true
          }
        },
        doctor: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true,
            telefonoPrincipal: true
          }
        },
        expediente: {
          select: {
            idExpediente: true,
            cedula: true,
            estado: true,
            descripcion: true,
            fechaCreacion: true
          }
        }
      }
    });

    if (!diagnostico) {
      return res.status(404).json({
        success: false,
        error: 'Diagnóstico no encontrado',
        message: 'No se encontró el diagnóstico con el ID especificado'
      });
    }

    res.json({
      success: true,
      data: diagnostico
    });

  } catch (error) {
    console.error('Error obteniendo diagnóstico:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el diagnóstico'
    });
  }
};

/**
 * Crear un nuevo diagnóstico
 */
export const createDiagnostico = async (req, res) => {
  try {
    const { idPaciente, idDoctor, diagnostico, idExpediente, fecha } = req.body;
    const userId = req.user.id;


    // Validar datos requeridos
    if (!idPaciente || !diagnostico || !fecha) {
      return res.status(400).json({
        success: false,
        error: 'Datos requeridos faltantes',
        message: 'El paciente, diagnóstico y fecha son campos obligatorios'
      });
    }

    // Verificar que el paciente existe
    const paciente = await prisma.usuario.findUnique({
      where: { idUsuario: parseInt(idPaciente) },
      include: { rol: true }
    });


    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'Paciente no encontrado',
        message: 'El paciente especificado no existe'
      });
    }

    // Verificar que el paciente tiene rol de paciente
    if (paciente.rol?.idRol !== ROLES.PACIENTE) {
      return res.status(400).json({
        success: false,
        error: 'Usuario inválido',
        message: 'El usuario especificado no es un paciente'
      });
    }

    // Si se especifica un doctor, verificar que existe y es médico
    let doctorId = null;
    if (idDoctor) {
      const doctor = await prisma.usuario.findUnique({
        where: { idUsuario: parseInt(idDoctor) },
        include: { rol: true }
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor no encontrado',
          message: 'El doctor especificado no existe'
        });
      }

      // Verificar que el doctor tiene rol de fisioterapeuta o administrador
      if (doctor.rol?.idRol !== ROLES.FISIOTERAPEUTA && doctor.rol?.idRol !== ROLES.ADMINISTRADOR) {
        return res.status(400).json({
          success: false,
          error: 'Usuario inválido',
          message: 'El usuario especificado no es un fisioterapeuta o administrador'
        });
      }

      doctorId = doctor.idUsuario;
    }

    // Si se especifica un expediente, verificar que existe y pertenece al paciente
    let expedienteId = null;
    if (idExpediente) {
      const expediente = await prisma.expediente.findUnique({
        where: { idExpediente: parseInt(idExpediente) },
        include: { medico: { include: { rol: true } } }
      });

      if (!expediente) {
        return res.status(404).json({
          success: false,
          error: 'Expediente no encontrado',
          message: 'El expediente especificado no existe'
        });
      }

      if (expediente.idPaciente !== parseInt(idPaciente)) {
        return res.status(400).json({
          success: false,
          error: 'Expediente inválido',
          message: 'El expediente no pertenece al paciente especificado'
        });
      }

      // Verificar que el fisioterapeuta solo puede crear diagnósticos en expedientes asignados a él
      const currentUser = await prisma.usuario.findUnique({
        where: { clerkId: userId },
        include: { rol: true }
      });

      if (currentUser?.rol?.idRol === ROLES.FISIOTERAPEUTA) {
        // Si es fisioterapeuta, verificar que el expediente esté asignado a él
        if (expediente.idMedico !== currentUser.idUsuario) {
          return res.status(403).json({
            success: false,
            error: 'Acceso denegado',
            message: 'Solo puedes crear diagnósticos en expedientes asignados a ti'
          });
        }
      }

      expedienteId = expediente.idExpediente;
    }

    // Crear el diagnóstico
    const nuevoDiagnostico = await prisma.evaluacionDiagnostico.create({
      data: {
        idPaciente: parseInt(idPaciente),
        idDoctor: doctorId,
        diagnostico,
        idExpediente: expedienteId,
        fecha: new Date(fecha)
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
        doctor: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true
          }
        },
        expediente: {
          select: {
            idExpediente: true,
            cedula: true,
            estado: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: nuevoDiagnostico,
      message: 'Diagnóstico creado exitosamente'
    });

  } catch (error) {
    console.error('Error creando diagnóstico:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo crear el diagnóstico'
    });
  }
};

/**
 * Actualizar un diagnóstico
 */
export const updateDiagnostico = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnostico, idDoctor, idExpediente } = req.body;
    const diagnosticoId = parseInt(id);

    if (isNaN(diagnosticoId)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'El ID del diagnóstico debe ser un número válido'
      });
    }

    // Verificar que el diagnóstico existe
    const diagnosticoExistente = await prisma.evaluacionDiagnostico.findUnique({
      where: { idEvaluacion: diagnosticoId },
      include: { paciente: true }
    });

    if (!diagnosticoExistente) {
      return res.status(404).json({
        success: false,
        error: 'Diagnóstico no encontrado',
        message: 'No se encontró el diagnóstico con el ID especificado'
      });
    }

    // Si se especifica un doctor, verificar que existe y es médico
    let doctorId = diagnosticoExistente.idDoctor;
    if (idDoctor !== undefined) {
      if (idDoctor === null) {
        doctorId = null;
      } else {
        const doctor = await prisma.usuario.findUnique({
          where: { idUsuario: parseInt(idDoctor) },
          include: { rol: true }
        });

        if (!doctor) {
          return res.status(404).json({
            success: false,
            error: 'Doctor no encontrado',
            message: 'El doctor especificado no existe'
          });
        }

        if (doctor.rol?.idRol !== ROLES.FISIOTERAPEUTA) {
          return res.status(400).json({
            success: false,
            error: 'Usuario inválido',
            message: 'El usuario especificado no es un fisioterapeuta'
          });
        }

        doctorId = doctor.idUsuario;
      }
    }

    // Si se especifica un expediente, verificar que existe y pertenece al paciente
    let expedienteId = diagnosticoExistente.idExpediente;
    if (idExpediente !== undefined) {
      if (idExpediente === null) {
        expedienteId = null;
      } else {
        const expediente = await prisma.expediente.findUnique({
          where: { idExpediente: parseInt(idExpediente) }
        });

        if (!expediente) {
          return res.status(404).json({
            success: false,
            error: 'Expediente no encontrado',
            message: 'El expediente especificado no existe'
          });
        }

        if (expediente.idPaciente !== diagnosticoExistente.idPaciente) {
          return res.status(400).json({
            success: false,
            error: 'Expediente inválido',
            message: 'El expediente no pertenece al paciente del diagnóstico'
          });
        }

        expedienteId = expediente.idExpediente;
      }
    }

    // Actualizar el diagnóstico
    const diagnosticoActualizado = await prisma.evaluacionDiagnostico.update({
      where: { idEvaluacion: diagnosticoId },
      data: {
        diagnostico: diagnostico || diagnosticoExistente.diagnostico,
        idDoctor: doctorId,
        idExpediente: expedienteId
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
        doctor: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true
          }
        },
        expediente: {
          select: {
            idExpediente: true,
            cedula: true,
            estado: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: diagnosticoActualizado,
      message: 'Diagnóstico actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando diagnóstico:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el diagnóstico'
    });
  }
};

/**
 * Eliminar un diagnóstico
 */
export const deleteDiagnostico = async (req, res) => {
  try {
    const { id } = req.params;
    const diagnosticoId = parseInt(id);

    if (isNaN(diagnosticoId)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'El ID del diagnóstico debe ser un número válido'
      });
    }

    // Verificar que el diagnóstico existe
    const diagnostico = await prisma.evaluacionDiagnostico.findUnique({
      where: { idEvaluacion: diagnosticoId }
    });

    if (!diagnostico) {
      return res.status(404).json({
        success: false,
        error: 'Diagnóstico no encontrado',
        message: 'No se encontró el diagnóstico con el ID especificado'
      });
    }

    // Eliminar el diagnóstico
    await prisma.evaluacionDiagnostico.delete({
      where: { idEvaluacion: diagnosticoId }
    });

    res.json({
      success: true,
      message: 'Diagnóstico eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando diagnóstico:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar el diagnóstico'
    });
  }
};

/**
 * Obtener diagnósticos de un paciente específico
 */
export const getDiagnosticosByPaciente = async (req, res) => {
  try {
    const { idPaciente } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const pacienteId = parseInt(idPaciente);

    if (isNaN(pacienteId)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'El ID del paciente debe ser un número válido'
      });
    }

    // Verificar que el paciente existe
    const paciente = await prisma.usuario.findUnique({
      where: { idUsuario: pacienteId },
      include: { rol: true }
    });

    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'Paciente no encontrado',
        message: 'El paciente especificado no existe'
      });
    }

    // Obtener diagnósticos del paciente
    const diagnosticos = await prisma.evaluacionDiagnostico.findMany({
      where: { idPaciente: pacienteId },
      skip,
      take,
      include: {
        doctor: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true
          }
        },
        expediente: {
          select: {
            idExpediente: true,
            cedula: true,
            estado: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    // Contar total de diagnósticos del paciente
    const total = await prisma.evaluacionDiagnostico.count({
      where: { idPaciente: pacienteId }
    });

    res.json({
      success: true,
      data: diagnosticos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error obteniendo diagnósticos del paciente:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los diagnósticos del paciente'
    });
  }
};

/**
 * Obtener diagnósticos por expediente
 */
export const getDiagnosticosByExpediente = async (req, res) => {
  try {
    const { expedienteId } = req.params;
    const userId = req.user.id;

    // Verificar que el expediente existe
    const expediente = await prisma.expediente.findUnique({
      where: { idExpediente: parseInt(expedienteId) }
    });

    if (!expediente) {
      return res.status(404).json({
        success: false,
        error: 'Expediente no encontrado',
        message: 'El expediente especificado no existe'
      });
    }

    // Verificar que el fisioterapeuta solo puede ver diagnósticos de expedientes asignados a él
    const currentUser = await prisma.usuario.findUnique({
      where: { clerkId: userId },
      include: { rol: true }
    });

    if (currentUser?.rol?.idRol === ROLES.FISIOTERAPEUTA) {
      // Si es fisioterapeuta, verificar que el expediente esté asignado a él
      if (expediente.idMedico !== currentUser.idUsuario) {
        return res.status(403).json({
          success: false,
          error: 'Acceso denegado',
          message: 'Solo puedes ver diagnósticos de expedientes asignados a ti'
        });
      }
    }

    // Obtener diagnósticos del expediente
    const diagnosticos = await prisma.evaluacionDiagnostico.findMany({
      where: {
        idPaciente: expediente.idPaciente
      },
      include: {
        doctor: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true
          }
        },
        paciente: {
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
        fecha: 'desc'
      }
    });

    res.json({
      success: true,
      diagnosticos,
      total: diagnosticos.length
    });

  } catch (error) {
    console.error('Error obteniendo diagnósticos del expediente:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los diagnósticos del expediente'
    });
  }
};
