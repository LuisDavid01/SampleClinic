#!/usr/bin/env node

/**
 * Script para poblar la base de datos con datos reales
 * para probar el historial de citas con información 100% real
 */

import prisma from '../src/config/database.js';
import { ROLES } from '../src/constants/roles.js';

const poblarDatosReales = async () => {
  console.log('🌱 Poblando base de datos con datos reales para historial de citas...\n');

  try {
    // 1. Crear roles si no existen
    console.log('1. Verificando roles...');
    await prisma.rol.createMany({
      data: [
        { idRol: ROLES.ADMINISTRADOR, nombreRol: 'Administrador', descripcion: 'Administrador del sistema' },
        { idRol: ROLES.FISIOTERAPEUTA, nombreRol: 'Fisioterapeuta', descripcion: 'Fisioterapeuta' },
        { idRol: ROLES.PACIENTE, nombreRol: 'Paciente', descripcion: 'Paciente' }
      ],
      skipDuplicates: true
    });
    console.log('   ✅ Roles verificados');

    // 2. Crear usuario paciente
    console.log('\n2. Creando usuario paciente...');
    const paciente = await prisma.usuario.upsert({
      where: { correoElectronico: 'paciente.real@clinica.com' },
      update: {},
      create: {
        nombre: 'Ana',
        apellido1: 'García',
        apellido2: 'López',
        correoElectronico: 'paciente.real@clinica.com',
        contrasena: 'paciente123',
        telefonoPrincipal: '555-1001',
        idRol: ROLES.PACIENTE,
        activo: true,
        clerkId: 'user_paciente_real' // ID de Clerk para pruebas
      }
    });
    console.log(`   ✅ Paciente creado: ${paciente.nombre} ${paciente.apellido1} (ID: ${paciente.idUsuario})`);

    // 3. Crear fisioterapeutas
    console.log('\n3. Creando fisioterapeutas...');
    const fisio1 = await prisma.usuario.upsert({
      where: { correoElectronico: 'dr.esteban@clinica.com' },
      update: {},
      create: {
        nombre: 'Dr. Esteban',
        apellido1: 'Porras',
        apellido2: 'Martínez',
        correoElectronico: 'dr.esteban@clinica.com',
        contrasena: 'fisio123',
        telefonoPrincipal: '555-2001',
        idRol: ROLES.FISIOTERAPEUTA,
        activo: true,
        clerkId: 'user_fisio_esteban'
      }
    });

    const fisio2 = await prisma.usuario.upsert({
      where: { correoElectronico: 'dra.maria@clinica.com' },
      update: {},
      create: {
        nombre: 'Dra. María',
        apellido1: 'González',
        apellido2: 'Ruiz',
        correoElectronico: 'dra.maria@clinica.com',
        contrasena: 'fisio123',
        telefonoPrincipal: '555-2002',
        idRol: ROLES.FISIOTERAPEUTA,
        activo: true,
        clerkId: 'user_fisio_maria'
      }
    });
    console.log(`   ✅ Fisioterapeutas creados: ${fisio1.nombre} y ${fisio2.nombre}`);

    // 4. Crear servicios
    console.log('\n4. Creando servicios...');
    const servicios = await prisma.servicio.createMany({
      data: [
        {
          nombreServicio: 'Consulta Inicial',
          descripcion: 'Evaluación inicial y diagnóstico',
          precio: 50.00,
          activo: true
        },
        {
          nombreServicio: 'Fisioterapia de Rodilla',
          descripcion: 'Tratamiento especializado para lesiones de rodilla',
          precio: 60.00,
          activo: true
        },
        {
          nombreServicio: 'Fisioterapia de Hombro',
          descripcion: 'Tratamiento especializado para lesiones de hombro',
          precio: 65.00,
          activo: true
        },
        {
          nombreServicio: 'Seguimiento de Tratamiento',
          descripcion: 'Control y seguimiento del progreso',
          precio: 45.00,
          activo: true
        }
      ],
      skipDuplicates: true
    });

    const serviciosCreados = await prisma.servicio.findMany();
    console.log(`   ✅ ${serviciosCreados.length} servicios creados`);

    // 5. Crear expediente del paciente
    console.log('\n5. Creando expediente del paciente...');
    const expediente = await prisma.expediente.upsert({
      where: { cedula: '12345678' },
      update: {},
      create: {
        idPaciente: paciente.idUsuario,
        cedula: '12345678',
        estado: 'activo',
        idMedico: fisio1.idUsuario,
        descripcion: 'Expediente médico de Ana García López',
        fechaCreacion: new Date('2024-01-01')
      }
    });
    console.log(`   ✅ Expediente creado: ${expediente.cedula}`);

    // 6. Crear citas reales con fechas cronológicas
    console.log('\n6. Creando citas reales...');
    
    const citas = await prisma.cita.createMany({
      data: [
        // Cita más antigua
        {
          fechaCita: new Date('2024-01-15T09:00:00Z'),
          idPaciente: paciente.idUsuario,
          idMedico: fisio1.idUsuario,
          idServicio: serviciosCreados[0].idServicio, // Consulta Inicial
          descripcion: 'Primera consulta por dolor en rodilla derecha',
          estadoCita: 'completada'
        },
        {
          fechaCita: new Date('2024-01-22T10:30:00Z'),
          idPaciente: paciente.idUsuario,
          idMedico: fisio1.idUsuario,
          idServicio: serviciosCreados[1].idServicio, // Fisioterapia de Rodilla
          descripcion: 'Sesión de fisioterapia para rodilla',
          estadoCita: 'completada'
        },
        {
          fechaCita: new Date('2024-01-29T14:00:00Z'),
          idPaciente: paciente.idUsuario,
          idMedico: fisio1.idUsuario,
          idServicio: serviciosCreados[3].idServicio, // Seguimiento
          descripcion: 'Seguimiento del tratamiento de rodilla',
          estadoCita: 'completada'
        },
        {
          fechaCita: new Date('2024-02-05T11:00:00Z'),
          idPaciente: paciente.idUsuario,
          idMedico: fisio2.idUsuario,
          idServicio: serviciosCreados[2].idServicio, // Fisioterapia de Hombro
          descripcion: 'Nueva consulta por dolor en hombro izquierdo',
          estadoCita: 'completada'
        },
        {
          fechaCita: new Date('2024-02-12T16:00:00Z'),
          idPaciente: paciente.idUsuario,
          idMedico: fisio2.idUsuario,
          idServicio: serviciosCreados[3].idServicio, // Seguimiento
          descripcion: 'Seguimiento del tratamiento de hombro',
          estadoCita: 'completada'
        },
        // Cita más reciente
        {
          fechaCita: new Date('2024-02-20T09:30:00Z'),
          idPaciente: paciente.idUsuario,
          idMedico: fisio1.idUsuario,
          idServicio: serviciosCreados[3].idServicio, // Seguimiento
          descripcion: 'Evaluación final de ambos tratamientos',
          estadoCita: 'programada'
        }
      ]
    });

    const citasCreadas = await prisma.cita.findMany({
      where: { idPaciente: paciente.idUsuario },
      orderBy: { fechaCita: 'desc' }
    });
    console.log(`   ✅ ${citasCreadas.length} citas creadas`);

    // 7. Agregar notas a las citas
    console.log('\n7. Agregando notas a las citas...');
    const notas = await prisma.notaCita.createMany({
      data: [
        {
          idCita: citasCreadas[0].idCita, // Cita más reciente
          nota: 'Paciente muestra excelente progreso. Dolor reducido significativamente.',
          fechaCreacion: new Date('2024-02-20T10:00:00Z')
        },
        {
          idCita: citasCreadas[1].idCita,
          nota: 'Seguimiento satisfactorio. Continuar con ejercicios de fortalecimiento.',
          fechaCreacion: new Date('2024-02-12T16:30:00Z')
        },
        {
          idCita: citasCreadas[2].idCita,
          nota: 'Primera sesión de hombro. Paciente responde bien al tratamiento.',
          fechaCreacion: new Date('2024-02-05T11:30:00Z')
        },
        {
          idCita: citasCreadas[3].idCita,
          nota: 'Progreso notable en la rodilla. Reducir frecuencia de sesiones.',
          fechaCreacion: new Date('2024-01-29T14:30:00Z')
        },
        {
          idCita: citasCreadas[4].idCita,
          nota: 'Segunda sesión de rodilla. Mejora del 40% en movilidad.',
          fechaCreacion: new Date('2024-01-22T11:00:00Z')
        },
        {
          idCita: citasCreadas[5].idCita,
          nota: 'Consulta inicial. Diagnóstico: Tendinitis rotuliana.',
          fechaCreacion: new Date('2024-01-15T09:30:00Z')
        }
      ]
    });
    console.log(`   ✅ ${notas.count} notas agregadas`);

    // 8. Agregar resultados a las citas
    console.log('\n8. Agregando resultados a las citas...');
    const resultados = await prisma.resultadoCita.createMany({
      data: [
        {
          idCita: citasCreadas[0].idCita,
          resultado: 'Evaluación final exitosa. Paciente ha recuperado el 90% de la funcionalidad.',
          resumenResultado: 'Recuperación completa de lesiones',
          fechaRegistro: new Date('2024-02-20T10:30:00Z')
        },
        {
          idCita: citasCreadas[1].idCita,
          resultado: 'Seguimiento positivo. Hombro recuperado en un 85%.',
          resumenResultado: 'Excelente progreso en hombro',
          fechaRegistro: new Date('2024-02-12T17:00:00Z')
        },
        {
          idCita: citasCreadas[2].idCita,
          resultado: 'Primera sesión de hombro completada. Paciente tolera bien el tratamiento.',
          resumenResultado: 'Inicio exitoso del tratamiento de hombro',
          fechaRegistro: new Date('2024-02-05T12:00:00Z')
        },
        {
          idCita: citasCreadas[3].idCita,
          resultado: 'Rodilla mejorada en un 70%. Reducir sesiones a una por semana.',
          resumenResultado: 'Progreso significativo en rodilla',
          fechaRegistro: new Date('2024-01-29T15:00:00Z')
        },
        {
          idCita: citasCreadas[4].idCita,
          resultado: 'Segunda sesión de rodilla. Mejora del 40% en dolor y movilidad.',
          resumenResultado: 'Progreso moderado en rodilla',
          fechaRegistro: new Date('2024-01-22T11:30:00Z')
        },
        {
          idCita: citasCreadas[5].idCita,
          resultado: 'Consulta inicial completada. Plan de tratamiento establecido.',
          resumenResultado: 'Diagnóstico y plan de tratamiento',
          fechaRegistro: new Date('2024-01-15T10:00:00Z')
        }
      ]
    });
    console.log(`   ✅ ${resultados.count} resultados agregados`);

    // 9. Crear evaluaciones y diagnósticos
    console.log('\n9. Creando evaluaciones y diagnósticos...');
    const evaluaciones = await prisma.evaluacionDiagnostico.createMany({
      data: [
        {
          idPaciente: paciente.idUsuario,
          idDoctor: fisio1.idUsuario,
          diagnosticoPrincipal: 'Tendinitis rotuliana en rodilla derecha',
          sintomasReportados: 'Dolor en la parte anterior de la rodilla derecha, especialmente al subir y bajar escaleras. El dolor se intensifica después de actividades físicas y mejora con el reposo.',
          evaluacionFisica: 'Examen físico revela dolor a la palpación del polo inferior de la rótula, limitación del rango de movimiento en flexión de rodilla, y debilidad en el cuádriceps.',
          planTratamiento: '1. Terapia manual para reducir la tensión muscular del cuádriceps\n2. Ejercicios de fortalecimiento excéntrico del cuádriceps\n3. Estiramientos específicos para el tendón rotuliano',
          recomendaciones: 'Evitar actividades de alto impacto como correr o saltar durante 4-6 semanas. Aplicar hielo 3 veces al día por 15-20 minutos.',
          fecha: new Date('2024-01-15')
        },
        {
          idPaciente: paciente.idUsuario,
          idDoctor: fisio2.idUsuario,
          diagnosticoPrincipal: 'Tendinitis del supraespinoso en hombro izquierdo',
          sintomasReportados: 'Dolor agudo en el hombro izquierdo, especialmente al levantar el brazo por encima de la cabeza. El dolor se intensifica durante la noche y mejora con el reposo.',
          evaluacionFisica: 'Examen físico revela dolor a la palpación del tendón supraespinoso, prueba de Jobe positiva, limitación del rango de movimiento en abducción a 90 grados.',
          planTratamiento: '1. Terapia manual para reducir la tensión muscular del manguito rotador\n2. Ejercicios de fortalecimiento progresivo del supraespinoso\n3. Estiramientos específicos para el tendón supraespinoso',
          recomendaciones: 'Evitar actividades que requieran elevación del brazo por encima de 90 grados durante las primeras 2 semanas. Aplicar hielo 3 veces al día por 15-20 minutos.',
          fecha: new Date('2024-02-05')
        }
      ]
    });
    console.log(`   ✅ ${evaluaciones.count} evaluaciones creadas`);

    // 10. Crear documentos y archivos
    console.log('\n10. Creando documentos y archivos...');
    const documentos = await prisma.documento.createMany({
      data: [
        {
          url: '/documentos/consentimiento_12345678.pdf',
          tipoDocumento: 'consentimiento',
          idExpediente: expediente.idExpediente,
          fechaCreacion: new Date('2024-01-01')
        },
        {
          url: '/documentos/historia_clinica_12345678.pdf',
          tipoDocumento: 'expediente',
          idExpediente: expediente.idExpediente,
          fechaCreacion: new Date('2024-01-15')
        }
      ]
    });

    const archivos = await prisma.archivo.createMany({
      data: [
        {
          nombreOriginal: 'radiografia_rodilla_ana.pdf',
          nombreArchivo: 'radiografia_rodilla_ana_123456.pdf',
          rutaArchivo: 'user_paciente_real/radiografia_rodilla_ana_123456.pdf',
          tipoMime: 'application/pdf',
          tamanoArchivo: 1024000,
          extension: '.pdf',
          descripcion: 'Radiografía de rodilla derecha de Ana García',
          categoria: 'imagenes_medicas',
          idUsuario: paciente.idUsuario,
          idExpediente: expediente.idExpediente,
          activo: true
        },
        {
          nombreOriginal: 'receta_antiinflamatorios_ana.pdf',
          nombreArchivo: 'receta_antiinflamatorios_ana_789012.pdf',
          rutaArchivo: 'user_paciente_real/recetas/receta_antiinflamatorios_ana_789012.pdf',
          tipoMime: 'application/pdf',
          tamanoArchivo: 512000,
          extension: '.pdf',
          descripcion: 'Receta de antiinflamatorios para tratamiento de rodilla',
          categoria: 'receta',
          idUsuario: paciente.idUsuario,
          idExpediente: expediente.idExpediente,
          activo: true
        },
        {
          nombreOriginal: 'resonancia_hombro_ana.pdf',
          nombreArchivo: 'resonancia_hombro_ana_345678.pdf',
          rutaArchivo: 'user_paciente_real/resonancia_hombro_ana_345678.pdf',
          tipoMime: 'application/pdf',
          tamanoArchivo: 2048000,
          extension: '.pdf',
          descripcion: 'Resonancia magnética de hombro izquierdo',
          categoria: 'imagenes_medicas',
          idUsuario: paciente.idUsuario,
          idExpediente: expediente.idExpediente,
          activo: true
        }
      ]
    });

    console.log(`   ✅ ${documentos.count} documentos y ${archivos.count} archivos creados`);

    // 11. Mostrar resumen
    console.log('\n📊 RESUMEN DE DATOS REALES CREADOS:');
    console.log(`   👤 Paciente: ${paciente.nombre} ${paciente.apellido1} (ID: ${paciente.idUsuario})`);
    console.log(`   👨‍⚕️ Fisioterapeutas: ${fisio1.nombre} ${fisio1.apellido1}, ${fisio2.nombre} ${fisio2.apellido1}`);
    console.log(`   🏥 Servicios: ${serviciosCreados.length} servicios disponibles`);
    console.log(`   📋 Expediente: ${expediente.cedula} (${expediente.estado})`);
    console.log(`   📅 Citas: ${citasCreadas.length} citas creadas`);
    console.log(`   📝 Notas: ${notas.count} notas médicas`);
    console.log(`   📊 Resultados: ${resultados.count} resultados de citas`);
    console.log(`   🩺 Evaluaciones: ${evaluaciones.count} evaluaciones y diagnósticos`);
    console.log(`   📄 Documentos: ${documentos.count} documentos`);
    console.log(`   📁 Archivos: ${archivos.count} archivos`);

    console.log('\n🎯 DATOS PARA PROBAR EN EL FRONTEND:');
    console.log(`   🔗 Usuario: paciente.real@clinica.com`);
    console.log(`   🔑 Clerk ID: user_paciente_real`);
    console.log(`   📅 Citas disponibles: ${citasCreadas.length} citas cronológicas`);
    console.log(`   📊 Estados: ${citasCreadas.filter(c => c.estadoCita === 'completada').length} completadas, ${citasCreadas.filter(c => c.estadoCita === 'programada').length} programadas`);

    console.log('\n🌐 ENDPOINTS PARA PROBAR:');
    console.log(`   GET /api/citas/paciente/${paciente.idUsuario}`);
    console.log(`   GET /api/citas/${citasCreadas[0].idCita}/detalles-completos`);
    console.log(`   GET /api/citas/${citasCreadas[0].idCita}/diagnosticos`);
    console.log(`   GET /api/citas/${citasCreadas[0].idCita}/documentos`);
    console.log(`   GET /api/citas/${citasCreadas[0].idCita}/recetas`);
    console.log(`   GET /api/evaluacion-diagnostico/paciente/${paciente.idUsuario}`);
    console.log(`   GET /api/evaluacion-diagnostico/1`);
    console.log(`   POST /api/evaluacion-diagnostico`);

    console.log('\n🎉 Base de datos poblada con datos reales exitosamente!');
    console.log('   El historial de citas ahora mostrará información 100% real.');

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Ejecutar script
poblarDatosReales()
  .then(() => {
    console.log('\n✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el script:', error);
    process.exit(1);
  });
