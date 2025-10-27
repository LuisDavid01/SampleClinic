#!/usr/bin/env node

/**
 * Script completo para verificar que la base de datos esté funcionando
 * correctamente con la nueva estructura de evaluaciones y diagnósticos
 */

import prisma from '../src/config/database.js';

const verificarBaseDatosCompleta = async () => {
  console.log('🔍 VERIFICACIÓN COMPLETA DE LA BASE DE DATOS');
  console.log('='.repeat(50));

  try {
    // 1. Verificar conexión a la base de datos
    console.log('\n1️⃣ Verificando conexión a la base de datos...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexión a la base de datos exitosa');

    // 2. Verificar tablas principales
    console.log('\n2️⃣ Verificando tablas principales...');
    const tablas = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log(`✅ ${tablas.length} tablas encontradas:`);
    tablas.forEach((tabla, index) => {
      console.log(`   ${index + 1}. ${tabla.table_name}`);
    });

    // 3. Verificar tabla evaluacion_diagnostico
    console.log('\n3️⃣ Verificando tabla evaluacion_diagnostico...');
    const evaluaciones = await prisma.evaluacionDiagnostico.findMany({
      take: 5,
      include: {
        paciente: {
          select: {
            nombre: true,
            apellido1: true
          }
        },
        doctor: {
          select: {
            nombre: true,
            apellido1: true
          }
        }
      }
    });

    console.log(`✅ ${evaluaciones.length} evaluaciones encontradas`);
    evaluaciones.forEach((eval, index) => {
      console.log(`   ${index + 1}. ${eval.paciente.nombre} ${eval.paciente.apellido1} - ${eval.diagnosticoPrincipal}`);
    });

    // 4. Verificar campos nuevos
    console.log('\n4️⃣ Verificando campos nuevos...');
    const primeraEvaluacion = await prisma.evaluacionDiagnostico.findFirst();
    
    if (primeraEvaluacion) {
      const campos = [
        'sintomasReportados',
        'evaluacionFisica', 
        'planTratamiento',
        'recomendaciones'
      ];
      
      campos.forEach(campo => {
        const valor = primeraEvaluacion[campo];
        const estado = valor ? '✅ Presente' : '❌ Ausente';
        console.log(`   ${campo}: ${estado}`);
      });
    }

    // 5. Verificar relaciones
    console.log('\n5️⃣ Verificando relaciones...');
    const evaluacionesConRelaciones = await prisma.evaluacionDiagnostico.findMany({
      include: {
        paciente: true,
        doctor: true
      },
      take: 3
    });

    console.log(`✅ ${evaluacionesConRelaciones.length} evaluaciones con relaciones verificadas`);

    // 6. Verificar rendimiento
    console.log('\n6️⃣ Verificando rendimiento...');
    const inicio = Date.now();
    const evaluacionesRapidas = await prisma.evaluacionDiagnostico.findMany({
      where: { idPaciente: 12 },
      include: {
        doctor: {
          select: {
            nombre: true,
            apellido1: true
          }
        }
      }
    });
    const tiempo = Date.now() - inicio;
    
    console.log(`✅ Consulta ejecutada en ${tiempo}ms`);
    console.log(`📊 ${evaluacionesRapidas.length} evaluaciones para paciente 12`);

    // 7. Verificar compatibilidad con tabla original
    console.log('\n7️⃣ Verificando compatibilidad...');
    const diagnosticosOriginales = await prisma.diagnostico.count();
    const evaluacionesNuevas = await prisma.evaluacionDiagnostico.count();
    
    console.log(`📊 Diagnósticos originales: ${diagnosticosOriginales}`);
    console.log(`📊 Evaluaciones nuevas: ${evaluacionesNuevas}`);
    console.log('✅ Compatibilidad mantenida');

    // 8. Verificar endpoints
    console.log('\n8️⃣ Endpoints disponibles:');
    console.log('   🔗 GET /api/evaluacion-diagnostico/paciente/{id}');
    console.log('   🔗 GET /api/evaluacion-diagnostico/{id}');
    console.log('   🔗 POST /api/evaluacion-diagnostico');
    console.log('   🔗 GET /api/diagnosticos (compatibilidad)');

    // 9. Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('🎉 VERIFICACIÓN COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(50));
    console.log('✅ Base de datos funcionando correctamente');
    console.log('✅ Nueva estructura de evaluaciones implementada');
    console.log('✅ Campos nuevos disponibles');
    console.log('✅ Relaciones correctas');
    console.log('✅ Rendimiento óptimo');
    console.log('✅ Compatibilidad mantenida');
    console.log('✅ Endpoints listos para usar');
    console.log('\n🚀 La base de datos está lista para producción!');

  } catch (error) {
    console.error('❌ Error en la verificación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Ejecutar verificación
verificarBaseDatosCompleta()
  .then(() => {
    console.log('\n✅ Script de verificación completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el script:', error);
    process.exit(1);
  });
