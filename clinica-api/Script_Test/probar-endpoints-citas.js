#!/usr/bin/env node

/**
 * Script para probar los endpoints de citas con datos reales
 * Utiliza los datos poblados en la base de datos
 */

import prisma from '../src/config/database.js';

const probarEndpoints = async () => {
  console.log('🧪 Probando endpoints de citas con datos reales...\n');

  try {
    // 1. Obtener citas disponibles
    console.log('1. Obteniendo citas disponibles...');
    const citas = await prisma.cita.findMany({
      include: {
        paciente: true,
        medico: true,
        servicio: true
      },
      orderBy: { fechaCita: 'desc' }
    });

    if (citas.length === 0) {
      console.log('   ⚠️  No hay citas en la base de datos');
      console.log('   💡 Ejecuta primero: node Script_Test/poblar-bd-pruebas.js');
      return;
    }

    console.log(`   ✅ Se encontraron ${citas.length} citas`);
    citas.forEach((cita, index) => {
      console.log(`      ${index + 1}. ID ${cita.idCita} - ${cita.paciente.nombre} ${cita.paciente.apellido1} (${cita.estadoCita})`);
    });

    // 2. Probar endpoint de detalles completos
    console.log('\n2. Probando endpoint de detalles completos...');
    const citaId = citas[0].idCita;
    
    const citaCompleta = await prisma.cita.findUnique({
      where: { idCita: citaId },
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

    console.log('   ✅ Detalles completos obtenidos:');
    console.log(`      - Cita ID: ${citaCompleta.idCita}`);
    console.log(`      - Fecha: ${citaCompleta.fechaCita}`);
    console.log(`      - Paciente: ${citaCompleta.paciente.nombre} ${citaCompleta.paciente.apellido1}`);
    console.log(`      - Médico: ${citaCompleta.medico.nombre} ${citaCompleta.medico.apellido1}`);
    console.log(`      - Servicio: ${citaCompleta.servicio.nombreServicio}`);
    console.log(`      - Notas: ${citaCompleta.notas.length}`);
    console.log(`      - Resultados: ${citaCompleta.resultados.length}`);

    // 3. Probar consulta de diagnósticos
    console.log('\n3. Probando consulta de diagnósticos...');
    const diagnosticos = await prisma.diagnostico.findMany({
      where: { idPaciente: citaCompleta.idPaciente },
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
      orderBy: { fecha: 'desc' }
    });

    console.log(`   ✅ Se encontraron ${diagnosticos.length} diagnósticos para el paciente`);
    diagnosticos.forEach((diag, index) => {
      console.log(`      ${index + 1}. ${diag.diagnostico.substring(0, 50)}... (${diag.fecha}) - Dr. ${diag.doctor.nombre}`);
    });

    // 4. Probar consulta de expediente
    console.log('\n4. Probando consulta de expediente...');
    const expediente = await prisma.expediente.findFirst({
      where: { idPaciente: citaCompleta.idPaciente },
      include: {
        documentos: {
          orderBy: { fechaCreacion: 'desc' }
        }
      }
    });

    if (expediente) {
      console.log(`   ✅ Expediente encontrado: ${expediente.cedula} (${expediente.estado})`);
      console.log(`      - Documentos: ${expediente.documentos.length}`);
      expediente.documentos.forEach((doc, index) => {
        console.log(`         ${index + 1}. ${doc.tipoDocumento} - ${doc.url}`);
      });
    } else {
      console.log('   ⚠️  No se encontró expediente para el paciente');
    }

    // 5. Probar consulta de archivos
    console.log('\n5. Probando consulta de archivos...');
    const archivos = await prisma.archivo.findMany({
      where: {
        idUsuario: citaCompleta.idPaciente,
        activo: true
      },
      orderBy: { fechaSubida: 'desc' }
    });

    console.log(`   ✅ Se encontraron ${archivos.length} archivos para el paciente`);
    archivos.forEach((archivo, index) => {
      console.log(`      ${index + 1}. ${archivo.nombreOriginal} (${archivo.categoria || 'Sin categoría'})`);
    });

    // 6. Probar consulta de recetas
    console.log('\n6. Probando consulta de recetas...');
    const recetas = await prisma.archivo.findMany({
      where: {
        idUsuario: citaCompleta.idPaciente,
        activo: true,
        categoria: 'receta'
      },
      orderBy: { fechaSubida: 'desc' }
    });

    console.log(`   ✅ Se encontraron ${recetas.length} recetas para el paciente`);
    recetas.forEach((receta, index) => {
      console.log(`      ${index + 1}. ${receta.nombreOriginal} (${receta.categoria})`);
    });

    // 7. Mostrar URLs de prueba
    console.log('\n🌐 URLs PARA PROBAR LOS ENDPOINTS:');
    console.log(`   Base URL: http://localhost:3001/api`);
    console.log(`   `);
    console.log(`   📋 Endpoints disponibles:`);
    console.log(`   GET  /citas/${citaId}/detalles-completos`);
    console.log(`   GET  /citas/${citaId}/diagnosticos`);
    console.log(`   GET  /citas/${citaId}/documentos`);
    console.log(`   GET  /citas/${citaId}/recetas`);
    console.log(`   POST /citas/${citaId}/recetas`);
    console.log(`   `);
    console.log(`   📊 Ejemplos de URLs completas:`);
    console.log(`   http://localhost:3001/api/citas/${citaId}/detalles-completos`);
    console.log(`   http://localhost:3001/api/citas/${citaId}/diagnosticos`);
    console.log(`   http://localhost:3001/api/citas/${citaId}/documentos`);
    console.log(`   http://localhost:3001/api/citas/${citaId}/recetas`);

    // 8. Mostrar datos de prueba para POST
    console.log('\n📝 DATOS PARA PROBAR POST /recetas:');
    console.log(`   {`);
    console.log(`     "nombreOriginal": "receta_nueva_prueba.pdf",`);
    console.log(`     "descripcion": "Receta de prueba para testing",`);
    console.log(`     "tipoMime": "application/pdf",`);
    console.log(`     "tamanoArchivo": 1024000,`);
    console.log(`     "extension": ".pdf"`);
    console.log(`   }`);

    console.log('\n🎉 Pruebas completadas exitosamente!');
    console.log('   Los endpoints están listos para ser probados.');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Ejecutar pruebas
probarEndpoints()
  .then(() => {
    console.log('\n✅ Script de pruebas completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el script de pruebas:', error);
    process.exit(1);
  });
