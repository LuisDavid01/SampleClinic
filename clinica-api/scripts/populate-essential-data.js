#!/usr/bin/env node

/**
 * Script para llenar la base de datos con datos esenciales
 * Incluye: roles, usuarios, servicios, expedientes, citas, diagnósticos, 
 * antecedentes clínicos, y archivos de ejemplo
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Datos esenciales para poblar la base de datos
const essentialData = {
  roles: [
    { idRol: 1, nombreRol: 'Administrador', descripcion: 'Administrador del sistema' },
    { idRol: 2, nombreRol: 'Fisioterapeuta', descripcion: 'Médico fisioterapeuta' },
    { idRol: 3, nombreRol: 'Recepcionista', descripcion: 'Recepcionista de la clínica' },
    { idRol: 4, nombreRol: 'Paciente', descripcion: 'Paciente de la clínica' }
  ],
  
  usuarios: [
    {
      idUsuario: 1,
      nombre: 'Admin',
      apellido1: 'Sistema',
      apellido2: '',
      correoElectronico: 'admin@clinica.com',
      contrasena: 'admin123',
      idRol: 1,
      activo: true,
      clerkId: 'user_clerk_test' // ID del token de Clerk
    },
    {
      idUsuario: 2,
      nombre: 'Dr. Juan',
      apellido1: 'Pérez',
      apellido2: 'García',
      correoElectronico: 'juan.perez@clinica.com',
      contrasena: 'medico123',
      idRol: 2,
      activo: true
    },
    {
      idUsuario: 3,
      nombre: 'María',
      apellido1: 'López',
      apellido2: 'Martínez',
      correoElectronico: 'maria.lopez@clinica.com',
      contrasena: 'recepcion123',
      idRol: 3,
      activo: true
    },
    {
      idUsuario: 4,
      nombre: 'Carlos',
      apellido1: 'Rodríguez',
      apellido2: 'Sánchez',
      correoElectronico: 'carlos.rodriguez@clinica.com',
      contrasena: 'paciente123',
      idRol: 4,
      activo: true
    }
  ],
  
  servicios: [
    {
      nombreServicio: 'Consulta General',
      descripcion: 'Consulta inicial de fisioterapia',
      precio: 50.00,
      activo: true
    },
    {
      nombreServicio: 'Terapia Manual',
      descripcion: 'Tratamiento manual especializado',
      precio: 80.00,
      activo: true
    },
    {
      nombreServicio: 'Rehabilitación Deportiva',
      descripcion: 'Rehabilitación para deportistas',
      precio: 100.00,
      activo: true
    },
    {
      nombreServicio: 'Fisioterapia Neurológica',
      descripcion: 'Tratamiento para problemas neurológicos',
      precio: 90.00,
      activo: true
    },
    {
      nombreServicio: 'Terapia Respiratoria',
      descripcion: 'Tratamiento para problemas respiratorios',
      precio: 70.00,
      activo: true
    }
  ],
  
  expedientes: [
    {
      idPaciente: 4,
      cedula: '12345678',
      estado: 'activo',
      idMedico: 2,
      descripcion: 'Expediente de prueba para Carlos Rodríguez'
    },
    {
      idPaciente: 4,
      cedula: '87654321',
      estado: 'en_tratamiento',
      idMedico: 2,
      descripcion: 'Expediente de seguimiento'
    }
  ],
  
  citas: [
    {
      idPaciente: 4,
      idMedico: 2,
      fechaCita: new Date('2024-01-15T10:00:00Z'),
      descripcion: 'Consulta inicial',
      estadoCita: 'programada'
      // idServicio se asignará después de crear los servicios
    },
    {
      idPaciente: 4,
      idMedico: 2,
      fechaCita: new Date('2024-01-20T14:30:00Z'),
      descripcion: 'Seguimiento de tratamiento',
      estadoCita: 'programada'
      // idServicio se asignará después de crear los servicios
    }
  ],
  
  diagnosticos: [
    {
      idPaciente: 4,
      fecha: new Date('2024-01-15'),
      idDoctor: 2,
      diagnostico: 'Dolor lumbar crónico por postura incorrecta en el trabajo',
      idExpediente: null // Se asignará después de crear expedientes
    },
    {
      idPaciente: 4,
      fecha: new Date('2024-01-20'),
      idDoctor: 2,
      diagnostico: 'Mejora significativa en la movilidad lumbar tras tratamiento',
      idExpediente: null // Se asignará después de crear expedientes
    }
  ],
  
  antecedentesClinicos: [
    {
      idPaciente: 4,
      historialMedico: 'Paciente de 35 años con antecedentes de dolor lumbar recurrente',
      condicionesPreexistentes: 'Ninguna condición médica preexistente',
      alergiasMedicamentos: 'Ninguna alergia conocida a medicamentos',
      alergiasAlimentos: 'Intolerancia leve a la lactosa',
      alergiasAmbientales: 'Alergia estacional al polen',
      medicamentosActuales: 'Ibuprofeno 400mg según necesidad',
      medicamentosPrevios: 'Paracetamol (descontinuado)',
      cirugiasPrevias: 'Ninguna cirugía previa',
      procedimientosMedicos: 'Radiografías lumbares (2023)',
      hospitalizacionesPrevias: 'Ninguna hospitalización previa',
      antecedentesFamiliares: 'Madre con artritis reumatoide',
      habitosToxicos: 'No fuma, consumo ocasional de alcohol',
      urgenciasMedicas: 'Contacto de emergencia: María Rodríguez (esposa) - 555-0123',
      contactoEmergenciaNombre: 'María Rodríguez',
      contactoEmergenciaTelefono: '555-0123',
      contactoEmergenciaRelacion: 'Esposa',
      idMedicoRegistro: 2,
      notasAdicionales: 'Paciente colaborador, buena adherencia al tratamiento'
    }
  ],
  
  archivosEjemplo: [
    {
      nombreOriginal: 'radiografia_lumbar_2024.pdf',
      nombreArchivo: 'radiografia_lumbar_2024-1234567890.pdf',
      rutaArchivo: 'user_4/radiografia_lumbar_2024-1234567890.pdf',
      tipoMime: 'application/pdf',
      tamanoArchivo: 1024000,
      extension: '.pdf',
      descripcion: 'Radiografía lumbar del paciente Carlos Rodríguez',
      categoria: 'Imágenes Médicas',
      etiquetas: 'radiografía,lumbar,columna',
      esPublico: false,
      idUsuario: 4,
      idExpediente: null, // Se asignará después de crear expedientes
      activo: true
    },
    {
      nombreOriginal: 'consentimiento_informado.pdf',
      nombreArchivo: 'consentimiento_informado-1234567891.pdf',
      rutaArchivo: 'user_4/consentimiento_informado-1234567891.pdf',
      tipoMime: 'application/pdf',
      tamanoArchivo: 512000,
      extension: '.pdf',
      descripcion: 'Consentimiento informado para tratamiento de fisioterapia',
      categoria: 'Documentos Legales',
      etiquetas: 'consentimiento,tratamiento,legal',
      esPublico: false,
      idUsuario: 4,
      idExpediente: null, // Se asignará después de crear expedientes
      activo: true
    }
  ]
};

// Función para hashear contraseñas
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Función para poblar roles
const populateRoles = async () => {
  console.log('🔄 Poblando roles...');
  
  for (const role of essentialData.roles) {
    try {
      await prisma.rol.upsert({
        where: { idRol: role.idRol },
        update: role,
        create: role
      });
      console.log(`✅ Rol creado/actualizado: ${role.nombreRol}`);
    } catch (error) {
      console.error(`❌ Error creando rol ${role.nombreRol}:`, error.message);
    }
  }
};

// Función para poblar usuarios
const populateUsers = async () => {
  console.log('🔄 Poblando usuarios...');
  
  for (const user of essentialData.usuarios) {
    try {
      const hashedPassword = await hashPassword(user.contrasena);
      
      await prisma.usuario.upsert({
        where: { idUsuario: user.idUsuario },
        update: {
          ...user,
          contrasena: hashedPassword
        },
        create: {
          ...user,
          contrasena: hashedPassword
        }
      });
      console.log(`✅ Usuario creado/actualizado: ${user.nombre} ${user.apellido1}`);
    } catch (error) {
      console.error(`❌ Error creando usuario ${user.nombre}:`, error.message);
    }
  }
};

// Función para poblar servicios
const populateServices = async () => {
  console.log('🔄 Poblando servicios...');
  
  for (const service of essentialData.servicios) {
    try {
      // Verificar si el servicio ya existe
      const existingService = await prisma.servicio.findFirst({
        where: { nombreServicio: service.nombreServicio }
      });
      
      if (!existingService) {
        await prisma.servicio.create({
          data: service
        });
        console.log(`✅ Servicio creado: ${service.nombreServicio}`);
      } else {
        console.log(`⚠️ Servicio ya existe: ${service.nombreServicio}`);
      }
    } catch (error) {
      console.error(`❌ Error creando servicio ${service.nombreServicio}:`, error.message);
    }
  }
};

// Función para poblar expedientes
const populateExpedientes = async () => {
  console.log('🔄 Poblando expedientes...');
  
  for (const expediente of essentialData.expedientes) {
    try {
      await prisma.expediente.create({
        data: expediente
      });
      console.log(`✅ Expediente creado: Cédula ${expediente.cedula}`);
    } catch (error) {
      console.error(`❌ Error creando expediente ${expediente.cedula}:`, error.message);
    }
  }
};

// Función para poblar citas
const populateCitas = async () => {
  console.log('🔄 Poblando citas...');
  
  // Obtener los servicios creados para asignar IDs correctos
  const servicios = await prisma.servicio.findMany();
  
  for (let i = 0; i < essentialData.citas.length; i++) {
    const cita = essentialData.citas[i];
    try {
      // Asignar el primer servicio disponible o null si no hay servicios
      const servicioId = servicios.length > 0 ? servicios[0].idServicio : null;
      
      const citaData = {
        ...cita,
        idServicio: servicioId
      };
      
      await prisma.cita.create({
        data: citaData
      });
      console.log(`✅ Cita creada: ${cita.descripcion}`);
    } catch (error) {
      console.error(`❌ Error creando cita ${cita.descripcion}:`, error.message);
    }
  }
};

// Función para poblar diagnósticos
const populateDiagnosticos = async () => {
  console.log('🔄 Poblando diagnósticos...');
  
  // Obtener expedientes para asignar IDs correctos
  const expedientes = await prisma.expediente.findMany();
  
  for (let i = 0; i < essentialData.diagnosticos.length; i++) {
    const diagnostico = essentialData.diagnosticos[i];
    try {
      // Asignar el primer expediente disponible o null si no hay expedientes
      const expedienteId = expedientes.length > 0 ? expedientes[0].idExpediente : null;
      
      const diagnosticoData = {
        ...diagnostico,
        idExpediente: expedienteId
      };
      
      await prisma.diagnostico.create({
        data: diagnosticoData
      });
      console.log(`✅ Diagnóstico creado: ${diagnostico.diagnostico.substring(0, 50)}...`);
    } catch (error) {
      console.error(`❌ Error creando diagnóstico:`, error.message);
    }
  }
};

// Función para poblar antecedentes clínicos
const populateAntecedentesClinicos = async () => {
  console.log('🔄 Poblando antecedentes clínicos...');
  
  for (const antecedente of essentialData.antecedentesClinicos) {
    try {
      await prisma.antecedenteClinico.create({
        data: antecedente
      });
      console.log(`✅ Antecedentes clínicos creados para paciente ${antecedente.idPaciente}`);
    } catch (error) {
      console.error(`❌ Error creando antecedentes clínicos:`, error.message);
    }
  }
};

// Función para poblar archivos de ejemplo
const populateArchivosEjemplo = async () => {
  console.log('🔄 Poblando archivos de ejemplo...');
  
  // Obtener expedientes para asignar IDs correctos
  const expedientes = await prisma.expediente.findMany();
  
  for (let i = 0; i < essentialData.archivosEjemplo.length; i++) {
    const archivo = essentialData.archivosEjemplo[i];
    try {
      // Asignar el primer expediente disponible o null si no hay expedientes
      const expedienteId = expedientes.length > 0 ? expedientes[0].idExpediente : null;
      
      const archivoData = {
        ...archivo,
        idExpediente: expedienteId
      };
      
      await prisma.archivo.create({
        data: archivoData
      });
      console.log(`✅ Archivo creado: ${archivo.nombreOriginal}`);
    } catch (error) {
      console.error(`❌ Error creando archivo ${archivo.nombreOriginal}:`, error.message);
    }
  }
};

// Función para verificar datos existentes
const checkExistingData = async () => {
  console.log('🔍 Verificando datos existentes...');
  
  const rolesCount = await prisma.rol.count();
  const usersCount = await prisma.usuario.count();
  const servicesCount = await prisma.servicio.count();
  const expedientesCount = await prisma.expediente.count();
  const citasCount = await prisma.cita.count();
  const diagnosticosCount = await prisma.diagnostico.count();
  const antecedentesCount = await prisma.antecedenteClinico.count();
  const archivosCount = await prisma.archivo.count();
  
  console.log(`📊 Datos actuales:`);
  console.log(`   - Roles: ${rolesCount}`);
  console.log(`   - Usuarios: ${usersCount}`);
  console.log(`   - Servicios: ${servicesCount}`);
  console.log(`   - Expedientes: ${expedientesCount}`);
  console.log(`   - Citas: ${citasCount}`);
  console.log(`   - Diagnósticos: ${diagnosticosCount}`);
  console.log(`   - Antecedentes: ${antecedentesCount}`);
  console.log(`   - Archivos: ${archivosCount}`);
  
  return { 
    rolesCount, 
    usersCount, 
    servicesCount, 
    expedientesCount, 
    citasCount,
    diagnosticosCount,
    antecedentesCount,
    archivosCount
  };
};

// Función principal
const populateDatabase = async () => {
  try {
    console.log('🚀 Iniciando población de base de datos con datos esenciales...\n');
    
    // Verificar datos existentes
    const existingData = await checkExistingData();
    
    // Poblar datos en orden de dependencias
    await populateRoles();
    console.log('');
    
    await populateUsers();
    console.log('');
    
    await populateServices();
    console.log('');
    
    await populateExpedientes();
    console.log('');
    
    await populateCitas();
    console.log('');
    
    await populateDiagnosticos();
    console.log('');
    
    await populateAntecedentesClinicos();
    console.log('');
    
    await populateArchivosEjemplo();
    console.log('');
    
    // Verificar datos finales
    console.log('🔍 Verificando datos finales...');
    const finalData = await checkExistingData();
    
    console.log('\n📊 Resumen final:');
    console.log(`✅ Roles: ${finalData.rolesCount}`);
    console.log(`✅ Usuarios: ${finalData.usersCount}`);
    console.log(`✅ Servicios: ${finalData.servicesCount}`);
    console.log(`✅ Expedientes: ${finalData.expedientesCount}`);
    console.log(`✅ Citas: ${finalData.citasCount}`);
    console.log(`✅ Diagnósticos: ${finalData.diagnosticosCount}`);
    console.log(`✅ Antecedentes: ${finalData.antecedentesCount}`);
    console.log(`✅ Archivos: ${finalData.archivosCount}`);
    
    console.log('\n🎉 ¡Base de datos poblada exitosamente con datos esenciales!');
    
    // Mostrar información de acceso
    console.log('\n🔑 Información de acceso:');
    console.log('   Admin: admin@clinica.com / admin123');
    console.log('   Médico: juan.perez@clinica.com / medico123');
    console.log('   Recepcionista: maria.lopez@clinica.com / recepcion123');
    console.log('   Paciente: carlos.rodriguez@clinica.com / paciente123');
    
  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Ejecutar si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  populateDatabase().catch(console.error);
}

export { populateDatabase, essentialData };
