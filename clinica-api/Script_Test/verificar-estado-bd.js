import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarEstadoBD() {
  console.log('🔍 Verificando estado de la base de datos...\n');

  try {
    // 1. Verificar estructura de la tabla evaluacion_diagnostico
    console.log('1️⃣ Verificando estructura de evaluacion_diagnostico...');
    const evaluaciones = await prisma.evaluacionDiagnostico.findMany({
      take: 3,
      select: {
        idEvaluacion: true,
        idPaciente: true,
        idCita: true,
        fecha: true,
        diagnosticoPrincipal: true
      }
    });

    console.log(`✅ Encontradas ${evaluaciones.length} evaluaciones`);
    evaluaciones.forEach((evaluacion, i) => {
      console.log(`   ${i + 1}. ID: ${evaluacion.idEvaluacion}, Paciente: ${evaluacion.idPaciente}, Cita: ${evaluacion.idCita || 'NULL'}`);
    });

    // 2. Verificar citas
    console.log('\n2️⃣ Verificando citas...');
    const citas = await prisma.cita.findMany({
      take: 3,
      select: {
        idCita: true,
        idPaciente: true,
        fechaCita: true,
        estadoCita: true
      }
    });

    console.log(`✅ Encontradas ${citas.length} citas`);
    citas.forEach((cita, i) => {
      console.log(`   ${i + 1}. ID: ${cita.idCita}, Paciente: ${cita.idPaciente}, Fecha: ${cita.fechaCita}`);
    });

    // 3. Verificar relaciones
    console.log('\n3️⃣ Verificando relaciones...');
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
            diagnosticoPrincipal: true
          }
        }
      },
      take: 2
    });

    console.log(`✅ Citas con evaluaciones relacionadas: ${citasConEvaluaciones.length}`);
    citasConEvaluaciones.forEach((cita, i) => {
      console.log(`   Cita ${cita.idCita}: ${cita.evaluaciones.length} evaluaciones`);
    });

    // 4. Verificar si hay evaluaciones sin cita
    console.log('\n4️⃣ Verificando evaluaciones sin cita...');
    const evaluacionesSinCita = await prisma.evaluacionDiagnostico.findMany({
      where: {
        idCita: null
      },
      select: {
        idEvaluacion: true,
        idPaciente: true,
        diagnosticoPrincipal: true
      }
    });

    console.log(`⚠️ Evaluaciones sin cita relacionada: ${evaluacionesSinCita.length}`);
    if (evaluacionesSinCita.length > 0) {
      console.log('   Estas evaluaciones necesitan ser asociadas a citas:');
    evaluacionesSinCita.forEach((evaluacion, i) => {
      console.log(`   ${i + 1}. ID: ${evaluacion.idEvaluacion}, Paciente: ${evaluacion.idPaciente}`);
    });
    }

    // 5. Verificar usuarios
    console.log('\n5️⃣ Verificando usuarios...');
    const usuarios = await prisma.usuario.findMany({
      where: {
        OR: [
          { idRol: 1 }, // Pacientes
          { idRol: 2 }  // Fisioterapeutas
        ]
      },
      select: {
        idUsuario: true,
        nombre: true,
        apellido1: true,
        idRol: true
      },
      take: 5
    });

    console.log(`✅ Encontrados ${usuarios.length} usuarios`);
    usuarios.forEach((user, i) => {
      const rol = user.idRol === 1 ? 'Paciente' : user.idRol === 2 ? 'Fisioterapeuta' : 'Otro';
      console.log(`   ${i + 1}. ${user.nombre} ${user.apellido1} (${rol})`);
    });

    console.log('\n🎯 Resumen del estado:');
    console.log(`   📊 Evaluaciones totales: ${await prisma.evaluacionDiagnostico.count()}`);
    console.log(`   📊 Citas totales: ${await prisma.cita.count()}`);
    console.log(`   📊 Usuarios totales: ${await prisma.usuario.count()}`);
    console.log(`   📊 Evaluaciones con cita: ${await prisma.evaluacionDiagnostico.count({ where: { idCita: { not: null } } })}`);
    console.log(`   📊 Evaluaciones sin cita: ${await prisma.evaluacionDiagnostico.count({ where: { idCita: null } })}`);

  } catch (error) {
    console.error('❌ Error verificando base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarEstadoBD();
