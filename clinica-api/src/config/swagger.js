const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Clínica Fisioterapéutica',
      version: '1.0.0',
      description: 'API REST para el sistema de gestión de clínica fisioterapéutica',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'admocas@hotmail.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api`,
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.stackkub.com/api',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticación'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          required: ['nombre', 'apellido1', 'correoElectronico', 'contrasena'],
          properties: {
            idUsuario: {
              type: 'integer',
              description: 'ID único del usuario'
            },
            nombre: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Nombre del usuario'
            },
            apellido1: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Primer apellido'
            },
            apellido2: {
              type: 'string',
              maxLength: 100,
              description: 'Segundo apellido (opcional)'
            },
            fechaNacimiento: {
              type: 'string',
              format: 'date',
              description: 'Fecha de nacimiento'
            },
            fechaRegistro: {
              type: 'string',
              format: 'date',
              description: 'Fecha de registro'
            },
            telefonoPrincipal: {
              type: 'string',
              maxLength: 20,
              description: 'Teléfono principal'
            },
            telefonoSecundario: {
              type: 'string',
              maxLength: 20,
              description: 'Teléfono secundario'
            },
            correoElectronico: {
              type: 'string',
              format: 'email',
              maxLength: 150,
              description: 'Correo electrónico único'
            },
            direccionResidencia: {
              type: 'string',
              maxLength: 255,
              description: 'Dirección de residencia'
            },
            idRol: {
              type: 'integer',
              description: 'ID del rol del usuario'
            },
            activo: {
              type: 'boolean',
              description: 'Estado del usuario'
            },
            rol: {
              $ref: '#/components/schemas/Rol'
            }
          }
        },
        Rol: {
          type: 'object',
          properties: {
            idRol: {
              type: 'integer',
              description: 'ID único del rol (1: Administrador, 2: Fisioterapeuta, 3: Recepcionista, 4: Paciente)'
            },
            nombreRol: {
              type: 'string',
              enum: ['Administrador', 'Fisioterapeuta', 'Recepcionista', 'Paciente'],
              description: 'Nombre del rol'
            },
            descripcion: {
              type: 'string',
              maxLength: 255,
              description: 'Descripción del rol'
            }
          }
        },
        Cita: {
          type: 'object',
          required: ['idPaciente', 'idMedico', 'fechaCita'],
          properties: {
            idCita: {
              type: 'integer',
              description: 'ID único de la cita'
            },
            fechaCita: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de la cita',
              example: '2024-01-15T10:00:00Z'
            },
            idPaciente: {
              type: 'integer',
              description: 'ID del paciente'
            },
            idMedico: {
              type: 'integer',
              description: 'ID del fisioterapeuta'
            },
            idServicio: {
              type: 'integer',
              description: 'ID del servicio (opcional)'
            },
            descripcion: {
              type: 'string',
              maxLength: 1000,
              description: 'Descripción de la cita',
              example: 'Sesión de fisioterapia para lesión de rodilla'
            },
            estadoCita: {
              type: 'string',
              enum: ['programada', 'confirmada', 'en_progreso', 'completada', 'cancelada'],
              description: 'Estado de la cita',
              example: 'programada'
            },
            notas: {
              type: 'string',
              description: 'Notas adicionales del fisioterapeuta'
            },
            resultado: {
              type: 'string',
              description: 'Resultado de la cita'
            },
            resumenResultado: {
              type: 'string',
              description: 'Resumen del resultado'
            },
            fechaCreacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            paciente: {
              $ref: '#/components/schemas/Usuario'
            },
            medico: {
              $ref: '#/components/schemas/Usuario'
            },
            servicio: {
              $ref: '#/components/schemas/Servicio'
            }
          }
        },
        Servicio: {
          type: 'object',
          required: ['nombreServicio'],
          properties: {
            idServicio: {
              type: 'integer',
              description: 'ID único del servicio'
            },
            nombreServicio: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Nombre del servicio'
            },
            descripcion: {
              type: 'string',
              maxLength: 1000,
              description: 'Descripción del servicio'
            },
            precio: {
              type: 'number',
              format: 'decimal',
              description: 'Precio del servicio'
            },
            activo: {
              type: 'boolean',
              description: 'Estado del servicio'
            }
          }
        },
        Perfil: {
          type: 'object',
          required: ['idMedico'],
          properties: {
            idPerfil: {
              type: 'integer',
              description: 'ID único del perfil'
            },
            idMedico: {
              type: 'integer',
              description: 'ID del médico'
            },
            fotografia: {
              type: 'string',
              maxLength: 255,
              description: 'Ruta de la fotografía'
            },
            experienciaProfesional: {
              type: 'string',
              maxLength: 2000,
              description: 'Experiencia profesional'
            },
            descripcionBreve: {
              type: 'string',
              maxLength: 500,
              description: 'Descripción breve'
            },
            especialidad: {
              type: 'string',
              maxLength: 100,
              description: 'Especialidad del médico'
            },
            medico: {
              $ref: '#/components/schemas/Usuario'
            }
          }
        },
        HistoriaExito: {
          type: 'object',
          properties: {
            idHistoria: {
              type: 'integer',
              description: 'ID único de la historia'
            },
            idServicio: {
              type: 'integer',
              description: 'ID del servicio'
            },
            idMedico: {
              type: 'integer',
              description: 'ID del médico'
            },
            idPaciente: {
              type: 'integer',
              description: 'ID del paciente'
            },
            fechaTratamiento: {
              type: 'string',
              format: 'date',
              description: 'Fecha del tratamiento'
            },
            experiencia: {
              type: 'string',
              maxLength: 5000,
              description: 'Experiencia del paciente'
            },
            publicado: {
              type: 'boolean',
              description: 'Estado de publicación'
            },
            fechaPublicacion: {
              type: 'string',
              format: 'date',
              description: 'Fecha de publicación'
            },
            servicio: {
              $ref: '#/components/schemas/Servicio'
            },
            medico: {
              $ref: '#/components/schemas/Usuario'
            },
            paciente: {
              $ref: '#/components/schemas/Usuario'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Tipo de error'
            },
            message: {
              type: 'string',
              description: 'Mensaje de error'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              },
              description: 'Detalles del error'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Página actual'
            },
            limit: {
              type: 'integer',
              description: 'Elementos por página'
            },
            total: {
              type: 'integer',
              description: 'Total de elementos'
            },
            pages: {
              type: 'integer',
              description: 'Total de páginas'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['correoElectronico', 'contrasena'],
          properties: {
            correoElectronico: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario'
            },
            contrasena: {
              type: 'string',
              minLength: 6,
              description: 'Contraseña del usuario'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['nombre', 'apellido1', 'correoElectronico', 'contrasena'],
          properties: {
            nombre: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Nombre del usuario'
            },
            apellido1: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Primer apellido'
            },
            apellido2: {
              type: 'string',
              maxLength: 100,
              description: 'Segundo apellido (opcional)'
            },
            correoElectronico: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico único'
            },
            contrasena: {
              type: 'string',
              minLength: 6,
              description: 'Contraseña del usuario'
            },
            telefonoPrincipal: {
              type: 'string',
              maxLength: 20,
              description: 'Teléfono principal'
            },
            direccionResidencia: {
              type: 'string',
              maxLength: 255,
              description: 'Dirección de residencia'
            },
            idRol: {
              type: 'integer',
              description: 'ID del rol (opcional, por defecto paciente)'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de respuesta'
            },
            token: {
              type: 'string',
              description: 'Token JWT'
            },
            usuario: {
              $ref: '#/components/schemas/Usuario'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints de autenticación y autorización'
      },
      {
        name: 'Usuarios',
        description: 'Gestión de usuarios del sistema'
      },
      {
        name: 'Citas',
        description: 'Gestión de citas médicas'
      },
      {
        name: 'Servicios',
        description: 'Gestión de servicios de la clínica'
      },
      {
        name: 'Perfiles',
        description: 'Perfiles profesionales de médicos'
      },
      {
        name: 'Historias de Éxito',
        description: 'Testimonios y casos de éxito'
      },
      {
        name: 'Sistema',
        description: 'Endpoints del sistema'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/index.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};

