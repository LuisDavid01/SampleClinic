import prisma from '../config/database.js';
import { ROLES } from '../constants/roles.js';

/**
 * Obtener todas las encuestas con filtros
 */
export const getEncuestas = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      idUsuario, 
      calificacion,
      fechaDesde,
      fechaHasta
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construir filtros
    const where = {};

    if (search) {
      where.comentario = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (idUsuario) {
      where.idUsuario = parseInt(idUsuario);
    }

    if (calificacion) {
      where.calificacion = parseInt(calificacion);
    }

    if (fechaDesde || fechaHasta) {
      where.fechaRegistro = {};
      if (fechaDesde) {
        where.fechaRegistro.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fechaRegistro.lte = new Date(fechaHasta);
      }
    }

    // Obtener encuestas con relaciones
    const [encuestas, total] = await Promise.all([
      prisma.encuesta.findMany({
        where,
        skip,
        take,
        include: {
          usuario: {
            select: {
              idUsuario: true,
              nombre: true,
              apellido1: true,
              apellido2: true,
              correoElectronico: true,
              rol: {
                select: {
                  nombreRol: true
                }
              }
            }
          }
        },
        orderBy: {
          fechaRegistro: 'desc'
        }
      }),
      prisma.encuesta.count({ where })
    ]);

    // Calcular estadísticas
    const estadisticas = await prisma.encuesta.aggregate({
      where,
      _avg: {
        calificacion: true
      },
      _count: {
        calificacion: true
      }
    });

    const distribucionCalificaciones = await prisma.encuesta.groupBy({
      by: ['calificacion'],
      where,
      _count: {
        calificacion: true
      },
      orderBy: {
        calificacion: 'asc'
      }
    });

    res.json({
      success: true,
      data: {
        encuestas,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        estadisticas: {
          promedio: estadisticas._avg.calificacion || 0,
          total: estadisticas._count.calificacion,
          distribucion: distribucionCalificaciones
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener encuestas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener encuesta por ID
 */
export const getEncuestaById = async (req, res) => {
  try {
    const { id } = req.params;

    const encuesta = await prisma.encuesta.findUnique({
      where: {
        idEncuesta: parseInt(id)
      },
      include: {
        usuario: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true,
            rol: {
              select: {
                nombreRol: true
              }
            }
          }
        }
      }
    });

    if (!encuesta) {
      return res.status(404).json({
        success: false,
        message: 'Encuesta no encontrada'
      });
    }

    res.json({
      success: true,
      data: encuesta
    });
  } catch (error) {
    console.error('Error al obtener encuesta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Crear nueva encuesta
 */
export const createEncuesta = async (req, res) => {
	try {
		const { calificacion, comentario, ClerkId } = req.body;

		// Validar que el usuario existe
		const usuario = await prisma.usuario.findUnique({
			where: {
				clerkId: ClerkId
			}
		});

		if (!usuario) {
			return res.status(404).json({
				success: false,
				message: 'Usuario no encontrado'
			});
		}

		// Crear la encuesta
		const encuesta = await prisma.encuesta.create({
			data: {
				calificacion: parseInt(calificacion),
				comentario: comentario || null,
				clerkId: ClerkId

			},
			include: {
				usuario: {
					select: {
						idUsuario: true,
						nombre: true,
						apellido1: true,
						apellido2: true,
						correoElectronico: true,
						rol: {
							select: {
								nombreRol: true
							}
						}
					}
				}
			}
		});

		res.status(201).json({
			success: true,
			message: 'Encuesta creada exitosamente',
			data: encuesta
		});
	} catch (error) {
		console.error('Error al crear encuesta:', error);

    res.status(201).json({
      success: true,
      message: 'Encuesta creada exitosamente',
      data: encuesta
    });
  } catch (error) {
    console.error('Error al crear encuesta:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una encuesta con estos datos'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener encuestas por usuario
 */
export const getEncuestasByUsuario = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: {
        idUsuario: parseInt(idUsuario)
      }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const [encuestas, total] = await Promise.all([
      prisma.encuesta.findMany({
        where: {
          idUsuario: parseInt(idUsuario)
        },
        skip,
        take,
        include: {
          usuario: {
            select: {
              idUsuario: true,
              nombre: true,
              apellido1: true,
              apellido2: true,
              correoElectronico: true,
              rol: {
                select: {
                  nombreRol: true
                }
              }
            }
          }
        },
        orderBy: {
          fechaRegistro: 'desc'
        }
      }),
      prisma.encuesta.count({
        where: {
          idUsuario: parseInt(idUsuario)
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        encuestas,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener encuestas del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener estadísticas de encuestas
 */
export const getEstadisticasEncuestas = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;

    const where = {};
    if (fechaDesde || fechaHasta) {
      where.fechaRegistro = {};
      if (fechaDesde) {
        where.fechaRegistro.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fechaRegistro.lte = new Date(fechaHasta);
      }
    }

    const [
      estadisticasGenerales,
      distribucionCalificaciones,
      encuestasRecientes
    ] = await Promise.all([
      prisma.encuesta.aggregate({
        where,
        _avg: {
          calificacion: true
        },
        _count: {
          calificacion: true
        },
        _min: {
          calificacion: true
        },
        _max: {
          calificacion: true
        }
      }),
      prisma.encuesta.groupBy({
        by: ['calificacion'],
        where,
        _count: {
          calificacion: true
        },
        orderBy: {
          calificacion: 'asc'
        }
      }),
      prisma.encuesta.findMany({
        where,
        take: 5,
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
          fechaRegistro: 'desc'
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        estadisticas: {
          promedio: estadisticasGenerales._avg.calificacion || 0,
          total: estadisticasGenerales._count.calificacion,
          minima: estadisticasGenerales._min.calificacion,
          maxima: estadisticasGenerales._max.calificacion
        },
        distribucion: distribucionCalificaciones,
        encuestasRecientes
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de encuestas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

