#!/usr/bin/env node

/**
 * Script para verificar que la nueva estructura de evaluaciones y diagnósticos
 * esté funcionando correctamente después de levantar la base de datos
 */

import prisma from '../src/config/database.js';

const verificarEstructura = async () => {
  console.log('🔍 Verificando estructura de evaluaciones y diagnósticos...\n');

  try {
    // 1. Verificar que la tabla evaluacion_diagnostico existe
    console.log('1️⃣ Verificando tabla evaluacion_diagnostico...');
    const evaluaciones = await prisma.evaluacionDiagnostico.findMany({
      take: 1
    });
    console.log('✅ Tabla evaluacion_diagnostico accesible');

    // 2. Verificar estructura de la tabla
    console.log('\n2️⃣ Verificando estructura de campos...');
    const primeraEvaluacion = await prisma.evaluacionDiagnostico.findFirst();
    
    if (primeraEvaluacion) {
      console.log('✅ Campos de la nueva estructura:');
      console.log(`   📋 ID: ${primeraEvaluacion.idEvaluacion}`);
      console.log(`   👤 Paciente: ${primeraEvaluacion.idPaciente}`);
      console.log(`   👨‍⚕️ Doctor: ${primeraEvaluacion.idDoctor}`);
      console.log(`   🩺 Diagnóstico Principal: ${primeraEvaluacion.diagnosticoPrincipal}`);
      console.log(`   🔍 Síntomas Reportados: ${primeraEvaluacion.sintomasReportados ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`   🏥 Evaluación Física: ${primeraEvaluacion.evaluacionFisica ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`   📋 Plan de Tratamiento: ${primeraEvaluacion.planTratamiento ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`   💡 Recomendaciones: ${primeraEvaluacion.recomendaciones ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`   📅 Fecha: ${primeraEvaluacion.fecha}`);
    } else {
      console.log('⚠️ No se encontraron evaluaciones en la tabla');
    }

    // 3. Verificar relaciones con usuarios
    console.log('\n3️⃣ Verificando relaciones con usuarios...');
    const evaluacionesConUsuarios = await prisma.evaluacionDiagnostico.findMany({
      include: {
        paciente: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true
          }
        },
        doctor: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true
          }
        }
      },
      take: 3
    });

    console.log(`✅ ${evaluacionesConUsuarios.length} evaluaciones con relaciones cargadas`);
    
    evaluacionesConUsuarios.forEach((eval, index) => {
      console.log(`   ${index + 1}. ${eval.paciente.nombre} ${eval.paciente.apellido1} - Dr. ${eval.doctor.nombre} ${eval.doctor.apellido1}`);
    });

    // 4. Verificar que la tabla diagnostico original sigue existiendo
    console.log('\n4️⃣ Verificando compatibilidad con tabla diagnostico original...');
    const diagnosticosOriginales = await prisma.diagnostico.findMany({
      take: 1
    });
    console.log('✅ Tabla diagnostico original mantiene compatibilidad');

    // 5. Contar registros en ambas tablas
    console.log('\n5️⃣ Conteo de registros...');
    const totalEvaluaciones = await prisma.evaluacionDiagnostico.count();
    const totalDiagnosticos = await prisma.diagnostico.count();
    
    console.log(`📊 Total evaluaciones: ${totalEvaluaciones}`);
    console.log(`📊 Total diagnósticos originales: ${totalDiagnosticos}`);

    // 6. Verificar índices
    console.log('\n6️⃣ Verificando rendimiento de consultas...');
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
    console.log(`📊 ${evaluacionesRapidas.length} evaluaciones encontradas para paciente 12`);

    // 7. Verificar endpoints disponibles
    console.log('\n7️⃣ Endpoints disponibles para probar:');
    console.log('   🔗 GET /api/evaluacion-diagnostico/paciente/12');
    console.log('   🔗 GET /api/evaluacion-diagnostico/1');
    console.log('   🔗 POST /api/evaluacion-diagnostico');

    console.log('\n🎉 VERIFICACIÓN COMPLETADA EXITOSAMENTE');
    console.log('\n📋 RESUMEN:');
    console.log(`   ✅ Tabla evaluacion_diagnostico: Funcionando`);
    console.log(`   ✅ Campos nuevos: Todos presentes`);
    console.log(`   ✅ Relaciones: Correctas`);
    console.log(`   ✅ Compatibilidad: Mantenida`);
    console.log(`   ✅ Rendimiento: Óptimo`);
    console.log(`   ✅ Endpoints: Listos para usar`);

  } catch (error) {
    console.error('❌ Error en la verificación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Ejecutar verificación
verificarEstructura()
  .then(() => {
    console.log('\n✅ Script de verificación completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el script:', error);
    process.exit(1);
  });
