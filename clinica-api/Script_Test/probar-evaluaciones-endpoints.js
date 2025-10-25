#!/usr/bin/env node

/**
 * Script para probar los endpoints de evaluaciones y diagnósticos
 */

const API_BASE_URL = 'http://localhost:3001/api';

const probarEndpoints = async () => {
  console.log('🧪 Probando endpoints de evaluaciones y diagnósticos...\n');

  try {
    // 1. Probar obtener evaluaciones de un paciente
    console.log('1️⃣ Probando GET /api/evaluacion-diagnostico/paciente/12');
    const responsePaciente = await fetch(`${API_BASE_URL}/evaluacion-diagnostico/paciente/12`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      }
    });

    if (responsePaciente.ok) {
      const dataPaciente = await responsePaciente.json();
      console.log('✅ Evaluaciones del paciente obtenidas exitosamente');
      console.log(`   📊 Total de evaluaciones: ${dataPaciente.total}`);
      console.log(`   👤 Paciente: ${dataPaciente.paciente.nombre} ${dataPaciente.paciente.apellido1}`);
      
      if (dataPaciente.evaluaciones.length > 0) {
        const primeraEvaluacion = dataPaciente.evaluaciones[0];
        console.log(`   📋 Primera evaluación:`);
        console.log(`      - ID: ${primeraEvaluacion.idEvaluacion}`);
        console.log(`      - Fecha: ${primeraEvaluacion.fecha}`);
        console.log(`      - Diagnóstico: ${primeraEvaluacion.diagnosticoPrincipal}`);
        console.log(`      - Síntomas: ${primeraEvaluacion.sintomasReportados?.substring(0, 50)}...`);
        console.log(`      - Evaluación Física: ${primeraEvaluacion.evaluacionFisica?.substring(0, 50)}...`);
        console.log(`      - Plan de Tratamiento: ${primeraEvaluacion.planTratamiento?.substring(0, 50)}...`);
        console.log(`      - Recomendaciones: ${primeraEvaluacion.recomendaciones?.substring(0, 50)}...`);
        console.log(`      - Doctor: ${primeraEvaluacion.doctor.nombre} ${primeraEvaluacion.doctor.apellido1}`);
      }
    } else {
      console.log('❌ Error obteniendo evaluaciones del paciente:', responsePaciente.status, responsePaciente.statusText);
    }

    console.log('\n');

    // 2. Probar obtener una evaluación específica
    console.log('2️⃣ Probando GET /api/evaluacion-diagnostico/1');
    const responseEvaluacion = await fetch(`${API_BASE_URL}/evaluacion-diagnostico/1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      }
    });

    if (responseEvaluacion.ok) {
      const dataEvaluacion = await responseEvaluacion.json();
      console.log('✅ Evaluación específica obtenida exitosamente');
      console.log(`   📋 ID: ${dataEvaluacion.evaluacion.idEvaluacion}`);
      console.log(`   📅 Fecha: ${dataEvaluacion.evaluacion.fecha}`);
      console.log(`   🩺 Diagnóstico: ${dataEvaluacion.evaluacion.diagnosticoPrincipal}`);
      console.log(`   👤 Paciente: ${dataEvaluacion.evaluacion.paciente.nombre} ${dataEvaluacion.evaluacion.paciente.apellido1}`);
      console.log(`   👨‍⚕️ Doctor: ${dataEvaluacion.evaluacion.doctor.nombre} ${dataEvaluacion.evaluacion.doctor.apellido1}`);
    } else {
      console.log('❌ Error obteniendo evaluación específica:', responseEvaluacion.status, responseEvaluacion.statusText);
    }

    console.log('\n');

    // 3. Probar crear una nueva evaluación
    console.log('3️⃣ Probando POST /api/evaluacion-diagnostico');
    const nuevaEvaluacion = {
      idPaciente: 12,
      diagnosticoPrincipal: "Cervicalgia por postura inadecuada",
      sintomasReportados: "Dolor en la región cervical, especialmente al trabajar en computadora. Rigidez matutina y dolor de cabeza ocasional.",
      evaluacionFisica: "Examen físico revela tensión muscular en trapecio superior, limitación del rango de movimiento cervical, y puntos gatillo en músculos cervicales.",
      planTratamiento: "1. Terapia manual para relajar musculatura cervical\n2. Ejercicios de fortalecimiento de músculos profundos del cuello\n3. Educación postural y ergonomía\n4. Aplicación de calor húmedo para relajación\n5. Seguimiento semanal",
      recomendaciones: "Mantener postura correcta durante el trabajo, realizar pausas activas cada hora, ajustar altura del monitor y silla, fortalecer músculos del cuello con ejercicios específicos."
    };

    const responseCrear = await fetch(`${API_BASE_URL}/evaluacion-diagnostico`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      },
      body: JSON.stringify(nuevaEvaluacion)
    });

    if (responseCrear.ok) {
      const dataCrear = await responseCrear.json();
      console.log('✅ Nueva evaluación creada exitosamente');
      console.log(`   📋 ID: ${dataCrear.evaluacion.idEvaluacion}`);
      console.log(`   🩺 Diagnóstico: ${dataCrear.evaluacion.diagnosticoPrincipal}`);
      console.log(`   👤 Paciente: ${dataCrear.paciente.nombre} ${dataPaciente.paciente.apellido1}`);
    } else {
      console.log('❌ Error creando nueva evaluación:', responseCrear.status, responseCrear.statusText);
    }

    console.log('\n');

    // 4. Verificar que la nueva evaluación se creó
    console.log('4️⃣ Verificando que la nueva evaluación se creó');
    const responseVerificar = await fetch(`${API_BASE_URL}/evaluacion-diagnostico/paciente/12`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      }
    });

    if (responseVerificar.ok) {
      const dataVerificar = await responseVerificar.json();
      console.log('✅ Verificación exitosa');
      console.log(`   📊 Total de evaluaciones después de crear: ${dataVerificar.total}`);
    } else {
      console.log('❌ Error verificando evaluaciones:', responseVerificar.status, responseVerificar.statusText);
    }

    console.log('\n🎉 Pruebas de endpoints completadas!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
};

// Ejecutar pruebas
probarEndpoints()
  .then(() => {
    console.log('\n✅ Script de pruebas completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el script:', error);
    process.exit(1);
  });
