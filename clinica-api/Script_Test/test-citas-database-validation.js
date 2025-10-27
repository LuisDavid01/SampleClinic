#!/usr/bin/env node

/**
 * Script para validar que la base de datos tiene todos los campos necesarios
 * para cumplir con la historia de usuario de citas
 * 
 * Historia de usuario: Como paciente de la clínica, necesito ver los detalles 
 * de cada una de mis citas con la finalidad de entender mejor los tratamientos 
 * que he recibido
 * 
 * Campos esperados:
 * - Fecha de la cita
 * - Diagnóstico planteado
 * - Razón de la cita
 * - Doctor que realizó el tratamiento
 * - Recetas
 * - Documentos relacionados
 */

import prisma from '../src/config/database.js';
import { ROLES } from '../src/constants/roles.js';

const validateCitasDatabase = async () => {
  console.log('🔍 Validando estructura de base de datos para citas...\n');

  try {
    // 1. Verificar que existe la tabla de citas
    console.log('1. Verificando tabla de citas...');
    const citasCount = await prisma.cita.count();
    console.log(`   ✅ Tabla 'citas' existe con ${citasCount} registros`);

    // 2. Verificar campos básicos de citas
    console.log('\n2. Verificando campos básicos de citas...');
    const sampleCita = await prisma.cita.findFirst({
      include: {
        paciente: true,
        medico: true,
        servicio: true,
        notas: true,
        resultados: true
      }
    });

    if (sampleCita) {
      console.log('   ✅ Campos básicos encontrados:');
      console.log(`      - ID: ${sampleCita.idCita}`);
      console.log(`      - Fecha: ${sampleCita.fechaCita}`);
      console.log(`      - Descripción: ${sampleCita.descripcion || 'N/A'}`);
      console.log(`      - Estado: ${sampleCita.estadoCita}`);
      console.log(`      - Paciente: ${sampleCita.paciente?.nombre} ${sampleCita.paciente?.apellido1}`);
      console.log(`      - Médico: ${sampleCita.medico?.nombre} ${sampleCita.medico?.apellido1}`);
      console.log(`      - Servicio: ${sampleCita.servicio?.nombreServicio || 'N/A'}`);
    } else {
      console.log('   ⚠️  No hay citas de ejemplo para verificar campos');
    }

    // 3. Verificar tabla de diagnósticos
    console.log('\n3. Verificando tabla de diagnósticos...');
    const diagnosticosCount = await prisma.diagnostico.count();
    console.log(`   ✅ Tabla 'diagnostico' existe con ${diagnosticosCount} registros`);

    // Verificar relación entre citas y diagnósticos
    const diagnosticosConCitas = await prisma.diagnostico.findMany({
      where: {
        paciente: {
          citasComoPaciente: {
            some: {}
          }
        }
      },
      include: {
        paciente: {
          include: {
            citasComoPaciente: {
              take: 1,
              include: {
                medico: true,
                servicio: true
              }
            }
          }
        },
        doctor: true
      },
      take: 3
    });

    console.log(`   ✅ Se encontraron ${diagnosticosConCitas.length} diagnósticos relacionados con citas`);

    // 4. Verificar tabla de archivos/documentos
    console.log('\n4. Verificando tabla de archivos...');
    const archivosCount = await prisma.archivo.count();
    console.log(`   ✅ Tabla 'archivos' existe con ${archivosCount} registros`);

    // 5. Verificar tabla de expedientes
    console.log('\n5. Verificando tabla de expedientes...');
    const expedientesCount = await prisma.expediente.count();
    console.log(`   ✅ Tabla 'expediente' existe con ${expedientesCount} registros`);

    // 6. Verificar tabla de documentos
    console.log('\n6. Verificando tabla de documentos...');
    const documentosCount = await prisma.documento.count();
    console.log(`   ✅ Tabla 'documentos' existe con ${documentosCount} registros`);

    // 7. Probar consulta completa de detalles de cita
    console.log('\n7. Probando consulta completa de detalles de cita...');
    
    const citaCompleta = await prisma.cita.findFirst({
      where: {
        paciente: {
          diagnosticosComoPaciente: {
            some: {}
          }
        }
      },
      include: {
        paciente: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true,
            telefonoPrincipal: true
          }
        },
        medico: {
          select: {
            idUsuario: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            correoElectronico: true,
            telefonoPrincipal: true
          }
        },
        servicio: true,
        notas: {
          orderBy: { fechaCreacion: 'desc' }
        },
        resultados: {
          orderBy: { fechaRegistro: 'desc' }
        }
      }
    });

    if (citaCompleta) {
      console.log('   ✅ Consulta completa exitosa:');
      console.log(`      - Cita ID: ${citaCompleta.idCita}`);
      console.log(`      - Fecha: ${citaCompleta.fechaCita}`);
      console.log(`      - Paciente: ${citaCompleta.paciente.nombre} ${citaCompleta.paciente.apellido1}`);
      console.log(`      - Médico: ${citaCompleta.medico.nombre} ${citaCompleta.medico.apellido1}`);
      console.log(`      - Servicio: ${citaCompleta.servicio?.nombreServicio || 'N/A'}`);
      console.log(`      - Notas: ${citaCompleta.notas.length}`);
      console.log(`      - Resultados: ${citaCompleta.resultados.length}`);
    }

    // 8. Verificar diagnósticos del paciente
    console.log('\n8. Verificando diagnósticos del paciente...');
    if (citaCompleta) {
      const diagnosticosPaciente = await prisma.diagnostico.findMany({
        where: {
          idPaciente: citaCompleta.paciente.idUsuario
        },
        include: {
          doctor: {
            select: {
              idUsuario: true,
              nombre: true,
              apellido1: true,
              apellido2: true
            }
          }
        },
        orderBy: { fecha: 'desc' },
        take: 5
      });

      console.log(`   ✅ Se encontraron ${diagnosticosPaciente.length} diagnósticos para el paciente`);
      diagnosticosPaciente.forEach((diag, index) => {
        console.log(`      ${index + 1}. ${diag.diagnostico} (${diag.fecha}) - Dr. ${diag.doctor?.nombre || 'N/A'}`);
      });
    }

    // 9. Verificar archivos del paciente
    console.log('\n9. Verificando archivos del paciente...');
    if (citaCompleta) {
      const archivosPaciente = await prisma.archivo.findMany({
        where: {
          idUsuario: citaCompleta.paciente.idUsuario,
          activo: true
        },
        orderBy: { fechaSubida: 'desc' },
        take: 5
      });

      console.log(`   ✅ Se encontraron ${archivosPaciente.length} archivos para el paciente`);
      archivosPaciente.forEach((archivo, index) => {
        console.log(`      ${index + 1}. ${archivo.nombreOriginal} (${archivo.categoria || 'Sin categoría'})`);
      });
    }

    // 10. Verificar expediente del paciente
    console.log('\n10. Verificando expediente del paciente...');
    if (citaCompleta) {
      const expedientePaciente = await prisma.expediente.findFirst({
        where: {
          idPaciente: citaCompleta.paciente.idUsuario
        },
        include: {
          documentos: {
            orderBy: { fechaCreacion: 'desc' },
            take: 3
          }
        }
      });

      if (expedientePaciente) {
        console.log(`   ✅ Expediente encontrado: ${expedientePaciente.cedula} (${expedientePaciente.estado})`);
        console.log(`      - Documentos: ${expedientePaciente.documentos.length}`);
        expedientePaciente.documentos.forEach((doc, index) => {
          console.log(`         ${index + 1}. ${doc.tipoDocumento} - ${doc.url}`);
        });
      } else {
        console.log('   ⚠️  No se encontró expediente para el paciente');
      }
    }

    console.log('\n🎉 Validación completada exitosamente!');
    console.log('\n📋 RESUMEN DE CAMPOS DISPONIBLES:');
    console.log('✅ Fecha de la cita: fechaCita');
    console.log('✅ Razón de la cita: descripcion');
    console.log('✅ Doctor que realizó el tratamiento: medico (relación)');
    console.log('✅ Diagnóstico planteado: tabla diagnostico (relación con paciente)');
    console.log('✅ Documentos relacionados: tabla archivos y documentos');
    console.log('✅ Notas de la cita: tabla notas_citas');
    console.log('✅ Resultados de la cita: tabla resultados_citas');

    console.log('\n🔧 CAMPOS QUE PODRÍAN NECESITAR MEJORAS:');
    console.log('⚠️  Recetas: No hay tabla específica para recetas (podría usar archivos con categoría "receta")');
    console.log('⚠️  Relación directa cita-diagnóstico: No hay relación directa, se relaciona por paciente');

  } catch (error) {
    console.error('❌ Error durante la validación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Ejecutar validación
validateCitasDatabase()
  .then(() => {
    console.log('\n✅ Validación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en la validación:', error);
    process.exit(1);
  });
