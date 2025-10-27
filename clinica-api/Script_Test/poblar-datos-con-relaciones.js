import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function poblarDatosConRelaciones() {
  console.log('🌱 Poblando base de datos con datos de ejemplo y relaciones...\n');

  try {
    // 1. Verificar usuarios existentes
    console.log('1️⃣ Verificando usuarios...');
    
    const medico = await prisma.usuario.findFirst({
      where: { idRol: 2 } // Fisioterapeuta
    });

    const paciente = await prisma.usuario.findFirst({
      where: { idRol: 1 } // Paciente
    });

    if (!medico || !paciente) {
      console.log('❌ No se encontraron médico o paciente. Creando usuarios de ejemplo...');
      
      // Crear médico de ejemplo
      const nuevoMedico = await prisma.usuario.create({
        data: {
          nombre: 'Dr. Juan',
          apellido1: 'Pérez',
          apellido2: 'García',
          correoElectronico: 'juan.perez@clinica.com',
          contrasena: 'password123',
          idRol: 2,
          telefonoPrincipal: '555-0101'
        }
      });

      // Crear paciente de ejemplo
      const nuevoPaciente = await prisma.usuario.create({
        data: {
          nombre: 'María',
          apellido1: 'González',
          apellido2: 'López',
          correoElectronico: 'maria.gonzalez@email.com',
          contrasena: 'password123',
          idRol: 1,
          telefonoPrincipal: '555-0102'
        }
      });

      console.log(`✅ Médico creado: ID ${nuevoMedico.idUsuario}`);
      console.log(`✅ Paciente creado: ID ${nuevoPaciente.idUsuario}`);
      
      medico = nuevoMedico;
      paciente = nuevoPaciente;
    } else {
      console.log(`✅ Médico encontrado: ID ${medico.idUsuario}`);
      console.log(`✅ Paciente encontrado: ID ${paciente.idUsuario}`);
    }

    // 2. Crear servicios si no existen
    console.log('\n2️⃣ Verificando servicios...');
    
    let servicio = await prisma.servicio.findFirst();
    if (!servicio) {
      servicio = await prisma.servicio.create({
        data: {
          nombreServicio: 'Consulta General',
          descripcion: 'Consulta de fisioterapia general',
          precio: 50.00
        }
      });
      console.log(`✅ Servicio creado: ID ${servicio.idServicio}`);
    } else {
      console.log(`✅ Servicio encontrado: ID ${servicio.idServicio}`);
    }

    // 3. Crear citas de ejemplo
    console.log('\n3️⃣ Creando citas de ejemplo...');
    
    const citas = [
      {
        idPaciente: paciente.idUsuario,
        idMedico: medico.idUsuario,
        idServicio: servicio.idServicio,
        fechaCita: new Date('2024-01-15'),
        descripcion: 'Consulta inicial por dolor en hombro izquierdo',
        estadoCita: 'completada'
      },
      {
        idPaciente: paciente.idUsuario,
        idMedico: medico.idUsuario,
        idServicio: servicio.idServicio,
        fechaCita: new Date('2024-01-20'),
        descripcion: 'Seguimiento por dolor en rodilla derecha',
        estadoCita: 'completada'
      },
      {
        idPaciente: paciente.idUsuario,
        idMedico: medico.idUsuario,
        idServicio: servicio.idServicio,
        fechaCita: new Date('2024-02-05'),
        descripcion: 'Consulta por dolor lumbar',
        estadoCita: 'completada'
      }
    ];

    const citasCreadas = [];
    for (const citaData of citas) {
      const citaExistente = await prisma.cita.findFirst({
        where: {
          idPaciente: citaData.idPaciente,
          fechaCita: citaData.fechaCita
        }
      });

      if (!citaExistente) {
        const cita = await prisma.cita.create({
          data: citaData
        });
        citasCreadas.push(cita);
        console.log(`   ✅ Cita creada: ID ${cita.idCita} - ${cita.descripcion}`);
      } else {
        citasCreadas.push(citaExistente);
        console.log(`   ✅ Cita existente: ID ${citaExistente.idCita} - ${citaExistente.descripcion}`);
      }
    }

    // 4. Crear evaluaciones con relaciones a citas
    console.log('\n4️⃣ Creando evaluaciones con relaciones...');
    
    const evaluaciones = [
      {
        idPaciente: paciente.idUsuario,
        idCita: citasCreadas[0].idCita,
        idDoctor: medico.idUsuario,
        diagnosticoPrincipal: 'Tendinitis del supraespinoso en hombro izquierdo',
        sintomasReportados: 'Dolor agudo en el hombro izquierdo, especialmente al levantar el brazo por encima de la cabeza.',
        evaluacionFisica: 'Examen físico revela dolor a la palpación del tendón supraespinoso, prueba de Jobe positiva.',
        planTratamiento: '1. Terapia manual para reducir la tensión muscular del manguito rotador\n2. Ejercicios de fortalecimiento progresivo del supraespinoso',
        recomendaciones: 'Evitar actividades que requieran elevación del brazo por encima de 90 grados durante las primeras 2 semanas.',
        fecha: new Date('2024-01-15')
      },
      {
        idPaciente: paciente.idUsuario,
        idCita: citasCreadas[1].idCita,
        idDoctor: medico.idUsuario,
        diagnosticoPrincipal: 'Tendinitis rotuliana en rodilla derecha',
        sintomasReportados: 'Dolor en la parte anterior de la rodilla derecha, especialmente al subir y bajar escaleras.',
        evaluacionFisica: 'Examen físico revela dolor a la palpación del polo inferior de la rótula, limitación del rango de movimiento.',
        planTratamiento: '1. Terapia manual para reducir la tensión muscular del cuádriceps\n2. Ejercicios de fortalecimiento excéntrico del cuádriceps',
        recomendaciones: 'Evitar actividades de alto impacto como correr o saltar durante 4-6 semanas.',
        fecha: new Date('2024-01-20')
      },
      {
        idPaciente: paciente.idUsuario,
        idCita: citasCreadas[2].idCita,
        idDoctor: medico.idUsuario,
        diagnosticoPrincipal: 'Lumbalgia mecánica por sobrecarga',
        sintomasReportados: 'Dolor en la región lumbar baja, especialmente al estar de pie por períodos prolongados.',
        evaluacionFisica: 'Examen físico revela dolor a la palpación de los músculos paraespinales lumbares.',
        planTratamiento: '1. Terapia manual para relajar la musculatura paraespinal\n2. Ejercicios de fortalecimiento del core',
        recomendaciones: 'Mantener postura correcta durante el trabajo, especialmente al estar sentado.',
        fecha: new Date('2024-02-05')
      }
    ];

    for (const evaluacionData of evaluaciones) {
      const evaluacionExistente = await prisma.evaluacionDiagnostico.findFirst({
        where: {
          idCita: evaluacionData.idCita
        }
      });

      if (!evaluacionExistente) {
        const evaluacion = await prisma.evaluacionDiagnostico.create({
          data: evaluacionData
        });
        console.log(`   ✅ Evaluación creada: ID ${evaluacion.idEvaluacion} para cita ${evaluacion.idCita}`);
      } else {
        console.log(`   ✅ Evaluación existente: ID ${evaluacionExistente.idEvaluacion} para cita ${evaluacionExistente.idCita}`);
      }
    }

    // 5. Verificar relaciones
    console.log('\n5️⃣ Verificando relaciones...');
    
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
      }
    });

    console.log(`📊 Citas con evaluaciones: ${citasConEvaluaciones.length}`);
    citasConEvaluaciones.forEach((cita, i) => {
      console.log(`\n   Cita ${cita.idCita} (${cita.fechaCita?.toLocaleDateString()}):`);
      console.log(`     Descripción: ${cita.descripcion}`);
      cita.evaluaciones.forEach((eval, j) => {
        console.log(`     📝 Evaluación ${eval.idEvaluacion}: ${eval.diagnosticoPrincipal}`);
      });
    });

    console.log('\n🎉 ¡Base de datos poblada exitosamente con relaciones!');

  } catch (error) {
    console.error('❌ Error poblando base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

poblarDatosConRelaciones();
