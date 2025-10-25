import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function actualizarRelacionesCitas() {
  console.log('🔧 Actualizando relaciones entre citas y evaluaciones...\n');

  try {
    // 1. Verificar el estado actual
    console.log('1️⃣ Verificando estado actual...');
    
    const evaluacionesSinCita = await prisma.evaluacionDiagnostico.findMany({
      where: { idCita: null },
      select: {
        idEvaluacion: true,
        idPaciente: true,
        fecha: true,
        diagnosticoPrincipal: true
      }
    });

    console.log(`📊 Evaluaciones sin cita: ${evaluacionesSinCita.length}`);

    const citas = await prisma.cita.findMany({
      where: { idPaciente: 12 }, // Paciente de ejemplo
      select: {
        idCita: true,
        idPaciente: true,
        fechaCita: true,
        descripcion: true
      },
      orderBy: { fechaCita: 'asc' }
    });

    console.log(`📊 Citas disponibles: ${citas.length}`);
    citas.forEach((cita, i) => {
      console.log(`   ${i + 1}. ID: ${cita.idCita}, Fecha: ${cita.fechaCita}, Desc: ${cita.descripcion}`);
    });

    // 2. Asociar evaluaciones a citas basándose en fechas similares
    console.log('\n2️⃣ Asociando evaluaciones a citas...');
    
    let actualizadas = 0;
    
    for (const evaluacion of evaluacionesSinCita) {
      // Buscar la cita más cercana en fecha para el mismo paciente
      const citaCercana = await prisma.cita.findFirst({
        where: {
          idPaciente: evaluacion.idPaciente,
          fechaCita: {
            gte: new Date(new Date(evaluacion.fecha).getTime() - 7 * 24 * 60 * 60 * 1000), // 7 días antes
            lte: new Date(new Date(evaluacion.fecha).getTime() + 7 * 24 * 60 * 60 * 1000)  // 7 días después
          }
        },
        orderBy: {
          fechaCita: 'asc'
        }
      });

      if (citaCercana) {
        await prisma.evaluacionDiagnostico.update({
          where: { idEvaluacion: evaluacion.idEvaluacion },
          data: { idCita: citaCercana.idCita }
        });
        
        console.log(`   ✅ Evaluación ${evaluacion.idEvaluacion} asociada a cita ${citaCercana.idCita}`);
        actualizadas++;
      } else {
        console.log(`   ⚠️ No se encontró cita cercana para evaluación ${evaluacion.idEvaluacion}`);
      }
    }

    // 3. Verificar el resultado
    console.log('\n3️⃣ Verificando resultado...');
    
    const evaluacionesConCita = await prisma.evaluacionDiagnostico.count({
      where: { idCita: { not: null } }
    });

    const evaluacionesSinCitaFinal = await prisma.evaluacionDiagnostico.count({
      where: { idCita: null }
    });

    console.log(`✅ Evaluaciones con cita: ${evaluacionesConCita}`);
    console.log(`⚠️ Evaluaciones sin cita: ${evaluacionesSinCitaFinal}`);
    console.log(`📊 Total actualizadas: ${actualizadas}`);

    // 4. Mostrar relaciones finales
    console.log('\n4️⃣ Mostrando relaciones finales...');
    
    const citasConEvaluaciones = await prisma.cita.findMany({
      where: {
        evaluaciones: {
          some: {}
        }
      },
      include: {
        evaluaciones: {
          select: {
            idEvaluacion: true,
            diagnosticoPrincipal: true,
            fecha: true
          }
        }
      },
      orderBy: { fechaCita: 'asc' }
    });

    console.log(`📋 Citas con evaluaciones: ${citasConEvaluaciones.length}`);
    citasConEvaluaciones.forEach((cita, i) => {
      console.log(`\n   Cita ${cita.idCita} (${cita.fechaCita}):`);
      cita.evaluaciones.forEach((evaluacion, j) => {
        console.log(`     📝 Evaluación ${evaluacion.idEvaluacion}: ${evaluacion.diagnosticoPrincipal}`);
      });
    });

    console.log('\n🎉 ¡Actualización completada exitosamente!');

  } catch (error) {
    console.error('❌ Error actualizando relaciones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

actualizarRelacionesCitas();
