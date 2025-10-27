#!/usr/bin/env node

/**
 * Script para poblar la tabla de evaluaciones y diagnósticos
 * con datos de ejemplo para probar los nuevos endpoints
 */

import prisma from '../src/config/database.js';

const poblarEvaluaciones = async () => {
  console.log('🌱 Poblando tabla de evaluaciones y diagnósticos...\n');

  try {
    // 1. Verificar que existen usuarios (paciente y médico)
    const paciente = await prisma.usuario.findFirst({
      where: { idUsuario: 12 },
      select: { idUsuario: true, nombre: true, apellido1: true }
    });

    const medico = await prisma.usuario.findFirst({
      where: { idUsuario: 10 },
      select: { idUsuario: true, nombre: true, apellido1: true }
    });

    if (!paciente) {
      console.error('❌ No se encontró el paciente con ID 12');
      return;
    }

    if (!medico) {
      console.error('❌ No se encontró el médico con ID 10');
      return;
    }

    console.log(`✅ Paciente encontrado: ${paciente.nombre} ${paciente.apellido1}`);
    console.log(`✅ Médico encontrado: ${medico.nombre} ${medico.apellido1}`);

    // 2. Limpiar evaluaciones existentes del paciente
    await prisma.evaluacionDiagnostico.deleteMany({
      where: { idPaciente: paciente.idUsuario }
    });
    console.log('🧹 Evaluaciones anteriores eliminadas');

    // 3. Crear evaluaciones de ejemplo
    const evaluaciones = await prisma.evaluacionDiagnostico.createMany({
      data: [
        {
          idPaciente: paciente.idUsuario,
          idDoctor: medico.idUsuario,
          diagnosticoPrincipal: "Tendinitis del supraespinoso en hombro izquierdo",
          sintomasReportados: "Dolor agudo en el hombro izquierdo, especialmente al levantar el brazo por encima de la cabeza. El dolor se intensifica durante la noche y mejora con el reposo. Limitación del rango de movimiento en abducción y rotación externa.",
          evaluacionFisica: "Examen físico revela dolor a la palpación del tendón supraespinoso, prueba de Jobe positiva, limitación del rango de movimiento en abducción a 90 grados, rotación externa limitada a 45 grados. Pruebas de resistencia positivas para tendinitis del supraespinoso. No se observa atrofia muscular significativa.",
          planTratamiento: "1. Terapia manual para reducir la tensión muscular del manguito rotador\n2. Ejercicios de fortalecimiento progresivo del supraespinoso\n3. Estiramientos específicos para el tendón supraespinoso\n4. Aplicación de hielo post-ejercicio durante 15-20 minutos\n5. Modificación de actividades que requieren elevación del brazo\n6. Seguimiento semanal para evaluar progreso",
          recomendaciones: "Evitar actividades que requieran elevación del brazo por encima de 90 grados durante las primeras 2 semanas. Aplicar hielo 3 veces al día por 15-20 minutos. Realizar ejercicios de fortalecimiento 3 veces por semana. Mantener postura correcta durante el trabajo. Consultar inmediatamente si el dolor empeora o se extiende al cuello.",
          fecha: new Date('2024-01-15')
        },
        {
          idPaciente: paciente.idUsuario,
          idDoctor: medico.idUsuario,
          diagnosticoPrincipal: "Tendinitis rotuliana en rodilla derecha",
          sintomasReportados: "Dolor en la parte anterior de la rodilla derecha, especialmente al subir y bajar escaleras. El dolor se intensifica después de actividades físicas y mejora con el reposo. Sensación de rigidez matutina en la rodilla.",
          evaluacionFisica: "Examen físico revela dolor a la palpación del polo inferior de la rótula, limitación del rango de movimiento en flexión de rodilla, y debilidad en el cuádriceps. Pruebas de resistencia positivas para tendinitis rotuliana. No se observa derrame articular significativo.",
          planTratamiento: "1. Terapia manual para reducir la tensión muscular del cuádriceps\n2. Ejercicios de fortalecimiento excéntrico del cuádriceps\n3. Estiramientos específicos para el tendón rotuliano\n4. Aplicación de hielo post-ejercicio durante 15-20 minutos\n5. Modificación de actividades deportivas de alto impacto\n6. Seguimiento quincenal para evaluar progreso",
          recomendaciones: "Evitar actividades de alto impacto como correr o saltar durante 4-6 semanas. Aplicar hielo 3 veces al día por 15-20 minutos. Realizar ejercicios de fortalecimiento 3 veces por semana. Usar calzado adecuado con buen soporte. Consultar si el dolor persiste después de 6 semanas de tratamiento.",
          fecha: new Date('2024-01-20')
        },
        {
          idPaciente: paciente.idUsuario,
          idDoctor: medico.idUsuario,
          diagnosticoPrincipal: "Lumbalgia mecánica por sobrecarga",
          sintomasReportados: "Dolor en la región lumbar baja, especialmente al estar de pie por períodos prolongados. El dolor se irradia hacia las nalgas pero no hacia las piernas. Mejora con el reposo y empeora con la flexión hacia adelante.",
          evaluacionFisica: "Examen físico revela dolor a la palpación de los músculos paraespinales lumbares, limitación del rango de movimiento en flexión hacia adelante, y tensión muscular en la región lumbar. Pruebas de movilidad lumbar positivas. No se observan signos de compromiso neurológico.",
          planTratamiento: "1. Terapia manual para relajar la musculatura paraespinal\n2. Ejercicios de fortalecimiento del core y músculos estabilizadores\n3. Estiramientos específicos para la musculatura lumbar\n4. Educación postural y ergonomía\n5. Aplicación de calor húmedo para relajación muscular\n6. Seguimiento semanal para evaluar progreso",
          recomendaciones: "Mantener postura correcta durante el trabajo, especialmente al estar sentado. Realizar pausas activas cada 2 horas. Fortalecer la musculatura del core con ejercicios específicos. Evitar levantar objetos pesados sin flexionar las rodillas. Consultar si el dolor se extiende hacia las piernas o persiste después de 4 semanas.",
          fecha: new Date('2024-02-05')
        }
      ]
    });

    console.log(`✅ ${evaluaciones.count} evaluaciones creadas`);

    // 4. Mostrar resumen
    console.log('\n📊 RESUMEN DE EVALUACIONES CREADAS:');
    console.log(`   👤 Paciente: ${paciente.nombre} ${paciente.apellido1} (ID: ${paciente.idUsuario})`);
    console.log(`   👨‍⚕️ Médico: ${medico.nombre} ${medico.apellido1} (ID: ${medico.idUsuario})`);
    console.log(`   📋 Evaluaciones: ${evaluaciones.count} evaluaciones creadas`);

    console.log('\n🎯 ENDPOINTS PARA PROBAR:');
    console.log(`   GET /api/evaluacion-diagnostico/paciente/${paciente.idUsuario}`);
    console.log(`   GET /api/evaluacion-diagnostico/1`);
    console.log(`   POST /api/evaluacion-diagnostico`);

    console.log('\n📋 CAMPOS INCLUIDOS EN CADA EVALUACIÓN:');
    console.log('   ✅ Diagnóstico Principal');
    console.log('   ✅ Síntomas Reportados');
    console.log('   ✅ Evaluación Física');
    console.log('   ✅ Plan de Tratamiento');
    console.log('   ✅ Recomendaciones');

    console.log('\n🎉 Tabla de evaluaciones y diagnósticos poblada exitosamente!');

  } catch (error) {
    console.error('❌ Error poblando evaluaciones:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Ejecutar script
poblarEvaluaciones()
  .then(() => {
    console.log('\n✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el script:', error);
    process.exit(1);
  });
