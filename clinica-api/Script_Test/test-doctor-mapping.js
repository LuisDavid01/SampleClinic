import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para verificar el mapeo de doctores en evaluaciones
 */
async function testDoctorMapping() {
  console.log('🔍 Verificando mapeo de doctores en evaluaciones...\n');

  try {
    // 1. Obtener todas las evaluaciones con información del doctor
    const evaluaciones = await prisma.evaluacionDiagnostico.findMany({
      include: {
        doctor: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true
          }
        },
        paciente: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    console.log(`📊 Total de evaluaciones encontradas: ${evaluaciones.length}\n`);

    if (evaluaciones.length === 0) {
      console.log('⚠️ No hay evaluaciones en la base de datos');
      return;
    }

    // 2. Mostrar cada evaluación con su doctor
    evaluaciones.forEach((evaluacion, index) => {
      console.log(`📋 Evaluación ${index + 1}:`);
      console.log(`   ID: ${evaluacion.idEvaluacion}`);
      console.log(`   Fecha: ${evaluacion.fecha}`);
      console.log(`   Diagnóstico: ${evaluacion.diagnosticoPrincipal?.substring(0, 50)}...`);
      console.log(`   Doctor ID: ${evaluacion.idDoctor}`);
      console.log(`   Doctor: ${evaluacion.doctor?.nombre} ${evaluacion.doctor?.apellido1} ${evaluacion.doctor?.apellido2 || ''}`);
      console.log(`   Email Doctor: ${evaluacion.doctor?.correoElectronico}`);
      console.log(`   Paciente: ${evaluacion.paciente?.nombre} ${evaluacion.paciente?.apellido1}`);
      console.log('');
    });

    // 3. Verificar si hay evaluaciones sin doctor
    const evaluacionesSinDoctor = evaluaciones.filter(e => !e.doctor);
    if (evaluacionesSinDoctor.length > 0) {
      console.log(`⚠️ Evaluaciones sin doctor mapeado: ${evaluacionesSinDoctor.length}`);
      evaluacionesSinDoctor.forEach(evaluacion => {
        console.log(`   - ID: ${evaluacion.idEvaluacion}, Doctor ID: ${evaluacion.idDoctor}`);
      });
    } else {
      console.log('✅ Todas las evaluaciones tienen doctor mapeado');
    }

    // 4. Obtener lista de doctores disponibles
    console.log('\n👨‍⚕️ Doctores disponibles en el sistema:');
    const doctores = await prisma.usuario.findMany({
      where: {
        idRol: 2 // Fisioterapeuta
      },
      select: {
        idUsuario: true,
        nombre: true,
        apellido1: true,
        apellido2: true,
        correoElectronico: true
      }
    });

    doctores.forEach(doctor => {
      console.log(`   - ${doctor.nombre} ${doctor.apellido1} ${doctor.apellido2 || ''} (ID: ${doctor.idUsuario})`);
    });

  } catch (error) {
    console.error('🚨 Error verificando mapeo de doctores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testDoctorMapping().catch(console.error);
}

export { testDoctorMapping };
