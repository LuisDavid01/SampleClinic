import { Router } from 'express';
import prisma from '../config/database.js';
import { authenticateToken, requireRole, requireOwnershipOrAdmin } from '../middleware/auth.js';
import { clerkAuth, requireClerkRole } from '../middleware/clerkAuth.js';
import { ROLES, isPaciente, isFisioterapeuta, isAdministrador, canManageAppointments } from '../constants/roles.js';
import { validateCita, validateId } from '../middleware/validation.js';
import { auditMiddleware } from '../middleware/audit.js';
import emailService from '../services/emailService.js';
import { startOfDay, endOfDay } from 'date-fns';
const router = Router();

function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * @swagger
 * /citas/solicitar:
 *   post:
 *     summary: Solicitar cita (público)
 *     description: Endpoint público para que los usuarios soliciten una cita. Crea o busca el usuario y crea una cita borrador.
 *     tags: [Citas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - telefono
 *               - fecha
 *               - hora
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre completo del paciente
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del paciente
 *               telefono:
 *                 type: string
 *                 description: Teléfono del paciente
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Fecha preferida para la cita
 *               hora:
 *                 type: string
 *                 description: Hora preferida (formato HH:mm)
 *               servicio:
 *                 type: string
 *                 description: Nombre del servicio de interés
 *               mensaje:
 *                 type: string
 *                 description: Mensaje adicional o razón de la cita
 *     responses:
 *       201:
 *         description: Solicitud de cita creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
// POST /api/citas/solicitar - Solicitar cita (público, sin autenticación)
router.post('/solicitar', async (req, res) => {
	try {
		const { nombre, email, telefono, fecha, hora, servicio, mensaje } = req.body;

		// Validar datos requeridos
		if (!nombre || !email || !telefono || !fecha || !hora) {
			return res.status(400).json({
				error: 'Datos incompletos',
				message: 'Por favor complete todos los campos requeridos'
			});
		}

		// Validar formato de email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({
				error: 'Email inválido',
				message: 'Por favor proporcione un email válido'
			});
		}

		// Buscar o crear usuario (paciente)
		let paciente = await prisma.usuario.findUnique({
			where: { correoElectronico: email }
		});

		if (!paciente) {
			// Separar nombre en nombre y apellidos
			const nombres = nombre.trim().split(' ');
			const nombreUsuario = nombres[0] || nombre;
			const apellido1 = nombres[1] || '';
			const apellido2 = nombres.slice(2).join(' ') || null;

			// Crear nuevo usuario (paciente)
			paciente = await prisma.usuario.create({
				data: {
					nombre: nombreUsuario,
					apellido1: apellido1,
					apellido2: apellido2,
					correoElectronico: email,
					telefonoPrincipal: telefono,
					contrasena: 'temp_password_' + Date.now(), // Contraseña temporal, el usuario deberá cambiarla
					idRol: 4, // Rol de paciente
					activo: true
				}
			});
		} else {
			// Actualizar teléfono si es diferente
			if (telefono && paciente.telefonoPrincipal !== telefono) {
				paciente = await prisma.usuario.update({
					where: { idUsuario: paciente.idUsuario },
					data: { telefonoPrincipal: telefono }
				});
			}
		}

		// Buscar servicio por ID o nombre si se proporciona
		let idServicio = null;
		if (servicio) {
			// Si es un número, buscar por ID
			const servicioId = parseInt(servicio);
			if (!isNaN(servicioId)) {
				const servicioEncontrado = await prisma.servicio.findUnique({
					where: { idServicio: servicioId }
				});
				if (servicioEncontrado && servicioEncontrado.activo) {
					idServicio = servicioEncontrado.idServicio;
				}
			} else {
				// Si es texto, buscar por nombre
				const servicioEncontrado = await prisma.servicio.findFirst({
					where: {
						nombreServicio: {
							contains: servicio,
							mode: 'insensitive'
						},
						activo: true
					}
				});
				if (servicioEncontrado) {
					idServicio = servicioEncontrado.idServicio;
				}
			}
		}

		// Combinar fecha y hora
		const fechaHora = new Date(`${fecha}T${hora}:00`);

		// Crear cita borrador
		const cita = await prisma.cita.create({
			data: {
				fechaCita: fechaHora,
				idPaciente: paciente.idUsuario,
				idMedico: null, // Sin médico asignado aún (borrador)
				idServicio: idServicio,
				descripcion: mensaje || `Solicitud de cita para ${servicio || 'consulta general'}`,
				estadoCita: 'borrador'
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
				servicio: true
			}
		});

		// Enviar email de notificación (asíncrono)
		emailService.enviarNotificacionSolicitudCita(cita).catch(error => {
			console.error('Error al enviar email de solicitud (no crítico):', error);
		});

		res.status(201).json({
			message: 'Solicitud de cita recibida exitosamente. Recibirá una notificación por correo electrónico.',
			cita: {
				idCita: cita.idCita,
				fechaCita: cita.fechaCita,
				estadoCita: cita.estadoCita
			}
		});

	} catch (error) {
		console.error('Error al procesar solicitud de cita:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo procesar la solicitud de cita. Por favor, intente nuevamente.'
		});
	}
});

/**
 * @swagger
 * /citas:
 *   get:
 *     summary: Obtener todas las citas
 *     description: Obtiene una lista paginada de citas con filtros opcionales. Los pacientes solo ven sus propias citas, los fisioterapeutas pueden ver todas o solo las suyas.
 *     tags: [Citas]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de elementos por página
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar citas
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar citas
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [programada, confirmada, en_progreso, completada, cancelada]
 *         description: Estado de la cita
 *       - in: query
 *         name: idPaciente
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *       - in: query
 *         name: idMedico
 *         schema:
 *           type: integer
 *         description: ID del fisioterapeuta
 *       - in: query
 *         name: idServicio
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *       - in: query
 *         name: soloMias
 *         schema:
 *           type: boolean
 *         description: Solo para fisioterapeutas - mostrar solo sus citas
 *     responses:
 *       200:
 *         description: Lista de citas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 citas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cita'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/citas - Obtener todas las citas
router.get('/', clerkAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      fechaInicio, 
      fechaFin, 
      estado, 
      idPaciente, 
      idMedico,
      idServicio 
    } = req.query;
    const skip = (page - 1) * limit;

		// Construir filtros
		const where = {};

		if (fechaInicio || fechaFin) {
			where.fechaCita = {};
			if (fechaInicio) where.fechaCita.gte = new Date(fechaInicio);
			if (fechaFin) where.fechaCita.lte = new Date(fechaFin);
		}

		if (estado) {
			where.estadoCita = estado;
		}

		if (idPaciente) {
			where.idPaciente = parseInt(idPaciente);
		}

		if (idMedico) {
			where.idMedico = parseInt(idMedico);
		}

		if (idServicio) {
			where.idServicio = parseInt(idServicio);
		}

		// Si es paciente, solo mostrar sus propias citas
		if (isPaciente(req.user)) {
			where.idPaciente = req.user.idUsuario;
		} else if (isFisioterapeuta(req.user)) {
			// Los fisioterapeutas pueden ver todas las citas o solo las suyas
			if (req.query.soloMias === 'true') {
				where.idMedico = req.user.idUsuario;
			}
		}

		const [citas, total] = await Promise.all([
			prisma.cita.findMany({
				where,
				include: {
					paciente: {
						select: {
							idUsuario: true,
							nombre: true,
							apellido1: true,
							apellido2: true,
							telefonoPrincipal: true,
							correoElectronico: true
						}
					},
					medico: {
						select: {
							idUsuario: true,
							nombre: true,
							apellido1: true,
							apellido2: true,
							telefonoPrincipal: true,
							correoElectronico: true
						}
					},
					servicio: true,
					notas: {
						orderBy: { fechaCreacion: 'desc' },
						take: 1
					},
					resultados: {
						orderBy: { fechaRegistro: 'desc' },
						take: 1
					}
				},
				skip: parseInt(skip),
				take: parseInt(limit),
				orderBy: { fechaCita: 'desc' }
			}),
			prisma.cita.count({ where })
		]);

		res.json({
			citas,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit)
			}
		});

	} catch (error) {
		console.error('Error al obtener citas:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudieron obtener las citas'
		});
	}
});

/**
 * @swagger
 * /citas/{id}:
 *   get:
 *     summary: Obtener cita específica
 *     description: Obtiene los detalles de una cita específica por su ID. Los pacientes solo pueden ver sus propias citas.
 *     tags: [Citas]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *         example: 1
 *     responses:
 *       200:
 *         description: Cita obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cita:
 *                   $ref: '#/components/schemas/Cita'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - no puede ver esta cita
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cita no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/citas/:id - Obtener cita por ID
router.get('/:id', clerkAuth, validateId, async (req, res) => {
  try {
    const { id } = req.params;

		const cita = await prisma.cita.findUnique({
			where: { idCita: parseInt(id) },
			include: {
				paciente: {
					select: {
						idUsuario: true,
						nombre: true,
						apellido1: true,
						apellido2: true,
						telefonoPrincipal: true,
						correoElectronico: true
					}
				},
				medico: {
					select: {
						idUsuario: true,
						nombre: true,
						apellido1: true,
						apellido2: true,
						telefonoPrincipal: true,
						correoElectronico: true
					}
				},
				servicio: true,
				notas: {
					orderBy: { fechaCreacion: 'desc' }
				},
				resultados: {
					orderBy: { fechaRegistro: 'desc' }
				}
			}
		});

		if (!cita) {
			return res.status(404).json({
				error: 'Cita no encontrada',
				message: 'No existe una cita con el ID proporcionado'
			});
		}

		// Verificar permisos: solo el paciente, médico o admin pueden ver la cita
		const isPaciente = cita.idPaciente === req.user.idUsuario;
		const isMedico = cita.idMedico === req.user.idUsuario;
		const isAdmin = isAdministrador(req.user);

		if (!isPaciente && !isMedico && !isAdmin) {
			return res.status(403).json({
				error: 'Acceso denegado',
				message: 'No tiene permisos para ver esta cita'
			});
		}

		res.json(cita);

	} catch (error) {
		console.error('Error al obtener cita:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo obtener la cita'
		});
	}
});

// GET /api/citas/hoy/mis-citas - Cargar citas del día del médico logueado
router.get("/hoy/mis-citas", clerkAuth, async (req, res) => {
  try {
	const clerkUserId = req.user.id;

    if (!clerkUserId) {
      return res.status(401).json({ error: "No se pudo obtener información del usuario" });
    }

    // Buscar el médico en la BD por clerk_id
    const medico = await prisma.usuario.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!medico) {
      return res.status(404).json({ error: "No se encontró un usuario asociado a este Clerk ID" });
    }

	// Obtener inicio y fin del día actual
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);

    // Obtener citas asociadas al médico
    const citas = await prisma.cita.findMany({
      where: {
        idMedico: medico.idUsuario,
		fechaCita: {
          gte: inicioDia,
          lte: finDia
        }
      },
      orderBy: {
        fechaCita: "asc"
      },
      include: {
        paciente: true,
        servicio: true,

        // Traer TODAS las evaluaciones (relación directa cita.evaluaciones)
        evaluaciones: {
          include: {
            expediente: true,
            doctor: true,
            paciente: true
          }
        },

        // Obtener expediente DEL PACIENTE (no de la cita)
        paciente: {
          include: {
            expedientesComoPaciente: {
              include: {
                evaluaciones: true,
                documentos: true,
                archivos: true
              }
            }
          }
        }
      }
    });

    return res.json({ citas });

  } catch (error) {
    console.error("ERROR en mis-citas:", error);
    return res.status(500).json({ error: "Error al obtener citas" });
  }
});

// GET /api/citas/dashboard/estadisticas - Obtener estadísticas para el dashboard
router.get("/dashboard/estadisticas", clerkAuth, async (req, res) => {
  try {
    const clerkUserId = req.user.id;

    if (!clerkUserId) {
      return res.status(401).json({ error: "No se pudo obtener información del usuario" });
    }

    // Buscar el usuario en la BD
    const usuario = await prisma.usuario.findUnique({
      where: { clerkId: clerkUserId },
      include: { rol: true }
    });

    if (!usuario) {
      return res.status(404).json({ error: "No se encontró un usuario asociado a este Clerk ID" });
    }

    // Fechas para cálculos
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const finHoy = new Date();
    finHoy.setHours(23, 59, 59, 999);
    
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);

    // Construir filtros según el rol
    // Los administradores ven estadísticas globales (sin filtros)
    const whereCitas = {};
    const esAdministrador = usuario.rol?.idRol === ROLES.ADMINISTRADOR;
    if (usuario.rol?.idRol === ROLES.FISIOTERAPEUTA) {
      whereCitas.idMedico = usuario.idUsuario;
    } else if (usuario.rol?.idRol === ROLES.PACIENTE) {
      whereCitas.idPaciente = usuario.idUsuario;
    }
    // Si es administrador, whereCitas queda vacío para mostrar todas las citas

    // 1. Pacientes del día (pacientes únicos con citas hoy)
    const citasHoy = await prisma.cita.findMany({
      where: {
        ...whereCitas,
        fechaCita: {
          gte: hoy,
          lte: finHoy
        }
      },
      select: {
        idPaciente: true
      },
      distinct: ['idPaciente']
    });
    const pacientesHoy = citasHoy.length;

    // Pacientes de ayer para comparación
    const citasAyer = await prisma.cita.findMany({
      where: {
        ...whereCitas,
        fechaCita: {
          gte: ayer,
          lt: hoy
        }
      },
      select: {
        idPaciente: true
      },
      distinct: ['idPaciente']
    });
    const pacientesAyer = citasAyer.length;
    const cambioPacientes = pacientesAyer > 0 
      ? Math.round(((pacientesHoy - pacientesAyer) / pacientesAyer) * 100)
      : pacientesHoy > 0 ? 100 : 0;

    // 2. Citas programadas (esta semana)
    const citasSemana = await prisma.cita.count({
      where: {
        ...whereCitas,
        fechaCita: {
          gte: inicioSemana,
          lte: finHoy
        },
        estadoCita: {
          in: ['programada', 'confirmada', 'en_progreso']
        }
      }
    });

    const citasSemanaAnterior = await prisma.cita.count({
      where: {
        ...whereCitas,
        fechaCita: {
          gte: new Date(inicioSemana.getTime() - 7 * 24 * 60 * 60 * 1000),
          lt: inicioSemana
        },
        estadoCita: {
          in: ['programada', 'confirmada', 'en_progreso']
        }
      }
    });
    const cambioCitas = citasSemanaAnterior > 0
      ? Math.round(((citasSemana - citasSemanaAnterior) / citasSemanaAnterior) * 100)
      : citasSemana > 0 ? 100 : 0;

    // 3. Citas de hoy
    const citasHoyLista = await prisma.cita.findMany({
      where: {
        ...whereCitas,
        fechaCita: {
          gte: hoy,
          lte: finHoy
        }
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
        servicio: {
          select: {
            idServicio: true,
            nombreServicio: true
          }
        }
      },
      orderBy: {
        fechaCita: 'asc'
      },
      take: 10
    });

    // 4. Pacientes recientes (últimos 10 con citas)
    const pacientesRecientes = await prisma.cita.findMany({
      where: whereCitas,
      include: {
        paciente: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            fechaNacimiento: true
          }
        },
        servicio: {
          select: {
            nombreServicio: true
          }
        }
      },
      orderBy: {
        fechaCita: 'desc'
      },
      take: 10,
      distinct: ['idPaciente']
    });

    // 5. Datos mensuales (últimos 6 meses)
    const meses = [];
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() - i + 1, 0, 23, 59, 59, 999);
      
      const consultas = await prisma.cita.count({
        where: {
          ...whereCitas,
          fechaCita: {
            gte: fechaInicio,
            lte: fechaFin
          },
          estadoCita: {
            not: 'cancelada'
          }
        }
      });

      const terapias = await prisma.cita.count({
        where: {
          ...whereCitas,
          fechaCita: {
            gte: fechaInicio,
            lte: fechaFin
          },
          estadoCita: 'completada'
        }
      });

      const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      monthlyData.push({
        month: mesesNombres[fechaInicio.getMonth()],
        consultas,
        terapias
      });
    }

    // 6. Distribución de tratamientos (por servicios)
    const serviciosConCitas = await prisma.cita.groupBy({
      by: ['idServicio'],
      where: {
        ...whereCitas,
        fechaCita: {
          gte: inicioMes,
          lte: finMes
        },
        idServicio: {
          not: null
        }
      },
      _count: {
        idCita: true
      }
    });

    const totalCitasServicios = serviciosConCitas.reduce((sum, s) => sum + s._count.idCita, 0);
    
    const treatmentData = await Promise.all(
      serviciosConCitas.map(async (servicio) => {
        const servicioInfo = await prisma.servicio.findUnique({
          where: { idServicio: servicio.idServicio },
          select: { nombreServicio: true }
        });
        
        return {
          treatment: servicioInfo?.nombreServicio || 'Sin servicio',
          value: totalCitasServicios > 0 
            ? Math.round((servicio._count.idCita / totalCitasServicios) * 100)
            : 0
        };
      })
    );

    // 7. Tiempo promedio de sesión (duración promedio de citas completadas)
    const citasCompletadas = await prisma.cita.findMany({
      where: {
        ...whereCitas,
        estadoCita: 'completada',
        duracionMinutos: {
          not: null
        },
        fechaCita: {
          gte: inicioMes,
          lte: finMes
        }
      },
      select: {
        duracionMinutos: true
      }
    });

    const tiempoPromedio = citasCompletadas.length > 0
      ? Math.round(
          citasCompletadas.reduce((sum, c) => sum + (c.duracionMinutos || 0), 0) / citasCompletadas.length
        )
      : 45;

    // Estadísticas adicionales para administradores
    let estadisticasAdmin = {};
    if (esAdministrador) {
      // Total de usuarios por rol
      const totalUsuarios = await prisma.usuario.count({
        where: { activo: true }
      });
      
      const totalPacientes = await prisma.usuario.count({
        where: {
          activo: true,
          rol: {
            idRol: ROLES.PACIENTE
          }
        }
      });
      
      const totalFisioterapeutas = await prisma.usuario.count({
        where: {
          activo: true,
          rol: {
            idRol: ROLES.FISIOTERAPEUTA
          }
        }
      });

      // Total de citas (todas)
      const totalCitas = await prisma.cita.count();
      const citasCompletadasTotal = await prisma.cita.count({
        where: { estadoCita: 'completada' }
      });
      const citasCanceladas = await prisma.cita.count({
        where: { estadoCita: 'cancelada' }
      });

      estadisticasAdmin = {
        totalUsuarios,
        totalPacientes,
        totalFisioterapeutas,
        totalCitas,
        citasCompletadasTotal,
        citasCanceladas
      };
    }

    return res.json({
      pacientesHoy,
      cambioPacientes,
      citasProgramadas: citasSemana,
      cambioCitas,
      tiempoPromedio,
      citasHoy: citasHoyLista.map(c => ({
        id: c.idCita,
        name: `${c.paciente.nombre} ${c.paciente.apellido1}`,
        time: new Date(c.fechaCita).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        treatment: c.servicio?.nombreServicio || 'Sin servicio'
      })),
      pacientesRecientes: pacientesRecientes.map(c => {
        const edad = c.paciente.fechaNacimiento
          ? new Date().getFullYear() - new Date(c.paciente.fechaNacimiento).getFullYear()
          : null;
        return {
          id: c.paciente.idUsuario,
          name: `${c.paciente.nombre} ${c.paciente.apellido1}`,
          lastVisit: new Date(c.fechaCita).toLocaleDateString('es-ES'),
          age: edad,
          treatment: c.servicio?.nombreServicio || 'Sin servicio',
          status: c.estadoCita === 'completada' ? 'Completado' : 
                  c.estadoCita === 'cancelada' ? 'Cancelado' : 
                  c.estadoCita === 'en_progreso' ? 'En tratamiento' : 'Activo'
        };
      }),
      monthlyData,
      treatmentData: treatmentData.length > 0 ? treatmentData : [
        { treatment: "Fisioterapia", value: 0 },
        { treatment: "Rehabilitación", value: 0 },
        { treatment: "Masoterapia", value: 0 },
        { treatment: "Electroterapia", value: 0 },
        { treatment: "Ejercicios", value: 0 },
        { treatment: "Evaluación", value: 0 }
      ],
      ...estadisticasAdmin
    });

  } catch (error) {
    console.error("ERROR en dashboard/estadisticas:", error);
    return res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});





/**
 * @swagger
 * /citas:
 *   post:
 *     summary: Crear nueva cita
 *     description: Crea una nueva cita. Solo administradores, recepcionistas y fisioterapeutas pueden crear citas.
 *     tags: [Citas]
 *     security:
 *       - clerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fechaCita
 *               - idPaciente
 *               - idMedico
 *             properties:
 *               fechaCita:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de la cita
 *                 example: "2024-01-15T10:00:00Z"
 *               idPaciente:
 *                 type: integer
 *                 description: ID del paciente
 *                 example: 1
 *               idMedico:
 *                 type: integer
 *                 description: ID del fisioterapeuta
 *                 example: 2
 *               idServicio:
 *                 type: integer
 *                 description: ID del servicio (opcional)
 *                 example: 1
 *               descripcion:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Descripción de la cita
 *                 example: "Sesión de fisioterapia para lesión de rodilla"
 *               estadoCita:
 *                 type: string
 *                 enum: [programada, confirmada, en_progreso, completada, cancelada]
 *                 default: programada
 *                 description: Estado inicial de la cita
 *     responses:
 *       201:
 *         description: Cita creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cita creada exitosamente"
 *                 cita:
 *                   $ref: '#/components/schemas/Cita'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - rol insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/citas - Crear nueva cita
router.post('/', auditMiddleware, clerkAuth, requireClerkRole(['admin', ROLES.RECEPCIONISTA, ROLES.FISIOTERAPEUTA, 'fisioterapeuta']), validateCita, async (req, res) => {
  console.log("Body completo recibido:", req.body);
console.log("fechaCita recibida:", req.body.fechaCita);
  try {
    const { fechaCita, idPaciente, idMedico, idServicio, descripcion, estadoCita } = req.body;
		const estadoFinal = estadoCita || 'programada';
		const esBorrador = estadoFinal === 'borrador';

		// Verificar que el paciente existe
		const paciente = await prisma.usuario.findUnique({ where: { idUsuario: idPaciente } });
		if (!paciente) {
			return res.status(400).json({
				error: 'Datos inválidos',
				message: 'El paciente especificado no existe'
			});
		}

		// Si no es borrador, el médico es requerido
		if (!esBorrador) {
			if (!idMedico) {
				return res.status(400).json({
					error: 'Datos inválidos',
					message: 'El médico es requerido para citas programadas'
				});
			}

			const medico = await prisma.usuario.findUnique({ where: { idUsuario: idMedico } });
			if (!medico) {
				return res.status(400).json({
					error: 'Datos inválidos',
					message: 'El médico especificado no existe'
				});
			}
		} else {
			// Para borradores, el médico es opcional pero si se proporciona debe existir
			if (idMedico) {
				const medico = await prisma.usuario.findUnique({ where: { idUsuario: idMedico } });
				if (!medico) {
					return res.status(400).json({
						error: 'Datos inválidos',
						message: 'El médico especificado no existe'
					});
				}
			}
		}

		// Verificar que el servicio existe si se proporciona
		if (idServicio) {
			const servicio = await prisma.servicio.findUnique({ where: { idServicio } });
			if (!servicio) {
				return res.status(400).json({
					error: 'Datos inválidos',
					message: 'El servicio especificado no existe'
				});
			}
		}

		// Validar solapamiento de horarios si se proporciona fecha
		if (fechaCita && !esBorrador) {
			const duracionMinutos = req.body.duracionMinutos ?? 30;
			const newStart = new Date(fechaCita);
			const newDur = Number(duracionMinutos);
			const newEnd = new Date(newStart.getTime() + newDur * 60000);

			const dayStart = startOfDay(newStart);
			const dayEnd = endOfDay(newStart);

			// Buscar citas del mismo médico o paciente el mismo día
			const posibles = await prisma.cita.findMany({
				where: {
					AND: [
						{ fechaCita: { gte: dayStart } },
						{ fechaCita: { lte: dayEnd } },
						{
							OR: [
								{ idMedico: idMedico },
								{ idPaciente: idPaciente }
							]
						}
					]
				}
			});

			// Revisar solapamiento
			for (const ex of posibles) {
				const exStart = ex.fechaCita ? new Date(ex.fechaCita) : null;
				const exDur = ex.duracionMinutos ?? 30;
				const exEnd = exStart ? new Date(exStart.getTime() + exDur * 60000) : null;

				if (exStart && exEnd && intervalsOverlap(newStart, newEnd, exStart, exEnd)) {
					return res.status(200).json({
						success: false,
						info: 'Conflicto de horario',
						message: `No es posible agendar dos citas en el mismo horario. Ya existe una cita programada (id: ${ex.idCita}) que se solapa con el horario solicitado. Por favor elija otro horario.`,
						conflictId: ex.idCita
					});
				}
			}
		}
    const fechaUTC = new Date(fechaCita);
		const cita = await prisma.cita.create({
			data: {
				//fechaCita: fechaCita ? new Date(fechaCita) : null,
        fechaCita: fechaUTC,
				duracionMinutos: req.body.duracionMinutos ? Number(req.body.duracionMinutos) : 30,
				idPaciente,
				idMedico: esBorrador ? (idMedico || null) : idMedico,
				idServicio,
				descripcion,
				estadoCita: estadoFinal
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
				servicio: true
			}
		});

		// Enviar email según el estado de la cita
		if (esBorrador) {
			// Email de notificación de solicitud (borrador)
			emailService.enviarNotificacionSolicitudCita(cita).catch(error => {
				console.error('Error al enviar email de solicitud (no crítico):', error);
			});
		} else {
			// Email de confirmación de agendamiento (programada)
			emailService.enviarEmailAgendamiento(cita).catch(error => {
				console.error('Error al enviar email de agendamiento (no crítico):', error);
			});
		}

		res.status(201).json({
			message: esBorrador 
				? 'Solicitud de cita creada exitosamente. El usuario recibirá una notificación por correo.'
				: 'Cita creada exitosamente',
			cita
		});

  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo crear la cita'
    });
  }
});

/**
 * @swagger
 * /citas/{id}:
 *   put:
 *     summary: Actualizar cita
 *     description: Actualiza una cita existente. Solo administradores, recepcionistas y fisioterapeutas pueden actualizar citas.
 *     tags: [Citas]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fechaCita:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva fecha y hora de la cita
 *                 example: "2024-01-15T10:00:00Z"
 *               idPaciente:
 *                 type: integer
 *                 description: ID del paciente
 *                 example: 4
 *               idMedico:
 *                 type: integer
 *                 description: ID del fisioterapeuta
 *                 example: 2
 *               idServicio:
 *                 type: integer
 *                 description: ID del servicio (opcional)
 *                 example: 1
 *               descripcion:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Descripción de la cita
 *                 example: "Sesión de fisioterapia para lesión de rodilla"
 *               estadoCita:
 *                 type: string
 *                 enum: [programada, confirmada, en_progreso, completada, cancelada]
 *                 description: Estado de la cita
 *                 example: "confirmada"
 *     responses:
 *       200:
 *         description: Cita actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cita actualizada exitosamente"
 *                 cita:
 *                   $ref: '#/components/schemas/Cita'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - rol insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cita no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// PUT /api/citas/:id - Actualizar cita
router.put('/:id', auditMiddleware, clerkAuth, requireClerkRole(['admin','fisioterapeuta',ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA, ROLES.FISIOTERAPEUTA]), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaCita, duracionMinutos, idPaciente, idMedico, idServicio, descripcion, estadoCita } = req.body;

    const citaActual = await prisma.cita.findUnique({ where: { idCita: parseInt(id) } });
    if (!citaActual) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    // Si cambian paciente/medico validar existencia
    if (idPaciente) {
      const p = await prisma.usuario.findUnique({ where: { idUsuario: idPaciente } });
      if (!p) return res.status(400).json({ error: 'Paciente no existe' });
    }
    if (idMedico) {
      const m = await prisma.usuario.findUnique({ where: { idUsuario: idMedico } });
      if (!m) return res.status(400).json({ error: 'Medico no existe' });
    }

    // Validar cambio de borrador a programada
    const esCambioABorrador = estadoCita === 'borrador';
    const esCambioAProgramada = estadoCita === 'programada';
    const eraBorrador = citaActual.estadoCita === 'borrador';
    const estaConfirmandoBorrador = eraBorrador && esCambioAProgramada;
    const idMedicoFinal = idMedico ?? citaActual.idMedico;

    // Si se está confirmando un borrador (cambiando a programada), el médico es obligatorio
    if (estaConfirmandoBorrador) {
      if (!idMedicoFinal) {
        return res.status(400).json({
          error: 'Datos inválidos',
          message: 'Debe asignar un médico para confirmar la cita borrador'
        });
      }
    }

    // Si se está cambiando a programada (no desde borrador), validar médico
    if (esCambioAProgramada && !estaConfirmandoBorrador) {
      if (!idMedicoFinal) {
        return res.status(400).json({
          error: 'Datos inválidos',
          message: 'El médico es requerido para citas programadas'
        });
      }
    }

    // Si cambian fecha/duración -> validar solapamiento
    const newStart = fechaCita ? new Date(fechaCita) : (citaActual.fechaCita ? new Date(citaActual.fechaCita) : null);
    const newDur = duracionMinutos ?? citaActual.duracionMinutos ?? 30;
    const newEnd = newStart ? new Date(newStart.getTime() + Number(newDur) * 60000) : null;

    if (newStart && newEnd) {
      const dayStart = startOfDay(newStart);
      const dayEnd = endOfDay(newStart);

      // Buscar otras citas del mismo medico o paciente en el mismo día (excluir la propia)
      const posibles = await prisma.cita.findMany({
        where: {
          AND: [
            { idCita: { not: parseInt(id) } },
            { fechaCita: { gte: dayStart } },
            { fechaCita: { lte: dayEnd } },
            {
              OR: [
                { idMedico: idMedicoFinal },
                { idPaciente: idPaciente ?? citaActual.idPaciente }
              ]
            }
          ]
        }
      });

      // Revisar solapamiento en JS
      for (const ex of posibles) {
        const exStart = ex.fechaCita ? new Date(ex.fechaCita) : null;
        const exDur = ex.duracionMinutos ?? 30;
        const exEnd = exStart ? new Date(exStart.getTime() + exDur * 60000) : null;

        if (exStart && exEnd && intervalsOverlap(newStart, newEnd, exStart, exEnd)) {
          return res.status(200).json({
            success: false,
            info: 'Conflicto de horario',
            message: `No es posible actualizar la cita. El nuevo horario se solapa con otra cita existente (id: ${ex.idCita}). Por favor elija otro horario.`,
            conflictId: ex.idCita
          });
        }
      }
    }

    // Actualizar cita
    const cita = await prisma.cita.update({
      where: { idCita: parseInt(id) },
      data: {
        fechaCita: fechaCita ? new Date(fechaCita) : citaActual.fechaCita,
        duracionMinutos: duracionMinutos !== undefined ? Number(duracionMinutos) : citaActual.duracionMinutos,
        idPaciente: idPaciente ?? citaActual.idPaciente,
        idMedico: idMedicoFinal,
        idServicio: idServicio ?? citaActual.idServicio,
        descripcion: descripcion ?? citaActual.descripcion,
        estadoCita: estadoCita ?? citaActual.estadoCita
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
        servicio: true
      }
    });

    // Si se confirmó un borrador, enviar email de agendamiento
    if (estaConfirmandoBorrador) {
      emailService.enviarEmailAgendamiento(cita).catch(error => {
        console.error('Error al enviar email de agendamiento (no crítico):', error);
      });
    }

    res.json({
      message: estaConfirmandoBorrador 
        ? 'Cita confirmada exitosamente. El paciente recibirá una notificación por correo.'
        : 'Cita actualizada exitosamente',
      cita
    });

  } catch (error) {
    console.error('Error al actualizar cita:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar la cita'
    });
  }
});

/**
 * @swagger
 * /citas/{id}:
 *   delete:
 *     summary: Cancelar cita
 *     description: Cancela una cita existente. Solo administradores y recepcionistas pueden cancelar citas.
 *     tags: [Citas]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *         example: 1
 *     responses:
 *       200:
 *         description: Cita cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cita cancelada exitosamente"
 *                 cita:
 *                   $ref: '#/components/schemas/Cita'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - solo administradores y recepcionistas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cita no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// DELETE /api/citas/:id - Cancelar cita
router.delete('/:id', auditMiddleware, clerkAuth, requireClerkRole([ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA]), validateId, async (req, res) => {
  try {
    const { id } = req.params;

		const citaExistente = await prisma.cita.findUnique({
			where: { idCita: parseInt(id) }
		});

		if (!citaExistente) {
			return res.status(404).json({
				error: 'Cita no encontrada',
				message: 'No existe una cita con el ID proporcionado'
			});
		}

		// Verificar permisos: paciente, médico o admin pueden cancelar
		const isPaciente = citaExistente.idPaciente === req.user.idUsuario;
		const isMedico = citaExistente.idMedico === req.user.idUsuario;
		const isAdmin = isAdministrador(req.user);

		if (!isPaciente && !isMedico && !isAdmin) {
			return res.status(403).json({
				error: 'Acceso denegado',
				message: 'No tiene permisos para cancelar esta cita'
			});
		}

		// Actualizar estado a cancelada en lugar de eliminar
		const cita = await prisma.cita.update({
			where: { idCita: parseInt(id) },
			data: { estadoCita: 'cancelada' }
		});

		res.json({
			message: 'Cita cancelada exitosamente'
		});

	} catch (error) {
		console.error('Error al cancelar cita:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo cancelar la cita'
		});
	}
});

/**
 * @swagger
 * /citas/{id}/notas:
 *   post:
 *     summary: Agregar nota a cita
 *     description: Agrega una nota médica a una cita existente. Solo administradores y fisioterapeutas pueden agregar notas.
 *     tags: [Citas]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nota
 *             properties:
 *               nota:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Nota médica para la cita
 *                 example: "Paciente presenta mejoría en la movilidad de la rodilla. Continuar con ejercicios de fortalecimiento."
 *     responses:
 *       200:
 *         description: Nota agregada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Nota agregada exitosamente"
 *                 cita:
 *                   $ref: '#/components/schemas/Cita'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - solo administradores y fisioterapeutas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cita no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/citas/:id/notas - Agregar nota a cita
router.post('/:id/notas', auditMiddleware, clerkAuth, requireClerkRole([ROLES.ADMINISTRADOR, ROLES.FISIOTERAPEUTA]), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { nota } = req.body;

		if (!nota || nota.trim().length === 0) {
			return res.status(400).json({
				error: 'Datos inválidos',
				message: 'La nota no puede estar vacía'
			});
		}

		// Verificar que la cita existe
		const citaExistente = await prisma.cita.findUnique({
			where: { idCita: parseInt(id) }
		});

		if (!citaExistente) {
			return res.status(404).json({
				error: 'Cita no encontrada',
				message: 'No existe una cita con el ID proporcionado'
			});
		}

		// Verificar permisos: solo el médico o admin pueden agregar notas
		const isMedico = citaExistente.idMedico === req.user.idUsuario;
		const isAdmin = isAdministrador(req.user);

		if (!isMedico && !isAdmin) {
			return res.status(403).json({
				error: 'Acceso denegado',
				message: 'Solo el médico asignado o un administrador pueden agregar notas'
			});
		}

		const notaCita = await prisma.notaCita.create({
			data: {
				idCita: parseInt(id),
				nota: nota.trim()
			}
		});

		res.status(201).json({
			message: 'Nota agregada exitosamente',
			nota: notaCita
		});

	} catch (error) {
		console.error('Error al agregar nota:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo agregar la nota'
		});
	}
});

/**
 * @swagger
 * /citas/{id}/resultados:
 *   post:
 *     summary: Agregar resultado a cita
 *     description: Agrega un resultado médico a una cita existente. Solo administradores y fisioterapeutas pueden agregar resultados.
 *     tags: [Citas]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resultado
 *             properties:
 *               resultado:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Resultado médico de la cita
 *                 example: "Paciente completó exitosamente la sesión de fisioterapia. Rango de movimiento mejorado en 20%."
 *               resumenResultado:
 *                 type: string
 *                 maxLength: 500
 *                 description: Resumen del resultado
 *                 example: "Mejora significativa en movilidad de rodilla"
 *     responses:
 *       200:
 *         description: Resultado agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Resultado agregado exitosamente"
 *                 cita:
 *                   $ref: '#/components/schemas/Cita'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - solo administradores y fisioterapeutas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cita no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/citas/:id/resultados - Agregar resultado a cita
router.post('/:id/resultados', auditMiddleware, clerkAuth, requireClerkRole([ROLES.ADMINISTRADOR, ROLES.FISIOTERAPEUTA]), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { resultado, resumenResultado } = req.body;

		if (!resultado || resultado.trim().length === 0) {
			return res.status(400).json({
				error: 'Datos inválidos',
				message: 'El resultado no puede estar vacío'
			});
		}

		// Verificar que la cita existe
		const citaExistente = await prisma.cita.findUnique({
			where: { idCita: parseInt(id) }
		});

		if (!citaExistente) {
			return res.status(404).json({
				error: 'Cita no encontrada',
				message: 'No existe una cita con el ID proporcionado'
			});
		}

		// Verificar permisos: solo el médico o admin pueden agregar resultados
		const isMedico = citaExistente.idMedico === req.user.idUsuario;
		const isAdmin = isAdministrador(req.user);

		if (!isMedico && !isAdmin) {
			return res.status(403).json({
				error: 'Acceso denegado',
				message: 'Solo el médico asignado o un administrador pueden agregar resultados'
			});
		}

		const resultadoCita = await prisma.resultadoCita.create({
			data: {
				idCita: parseInt(id),
				resultado: resultado.trim(),
				resumenResultado: resumenResultado?.trim() || null,
				fechaRegistro: new Date()
			}
		});

		res.status(201).json({
			message: 'Resultado agregado exitosamente',
			resultado: resultadoCita
		});

	} catch (error) {
		console.error('Error al agregar resultado:', error);
		res.status(500).json({
			error: 'Error interno del servidor',
			message: 'No se pudo agregar el resultado'
		});
	}
});

export default router;
