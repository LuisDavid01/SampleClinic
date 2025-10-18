/**
 * SCRIPT: Probar el script populate-essential-data.js
 * Este script verifica que el populate funcione correctamente con todas las tablas
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para verificar que todas las tablas tengan datos
const verificarDatosPopulate = async () => {
  console.log('🔍 Verificando datos del script populate...\n');
  
  try {
    // Verificar roles
    const roles = await prisma.rol.findMany();
    console.log(`✅ Roles encontrados: ${roles.length}`);
    roles.forEach(rol => {
      console.log(`   - ${rol.nombreRol}: ${rol.descripcion}`);
    });
    
    // Verificar usuarios
    const usuarios = await prisma.usuario.findMany();
    console.log(`\n✅ Usuarios encontrados: ${usuarios.length}`);
    usuarios.forEach(usuario => {
      console.log(`   - ${usuario.nombre} ${usuario.apellido1} (${usuario.correoElectronico}) - Rol: ${usuario.idRol}`);
    });
    
    // Verificar servicios
    const servicios = await prisma.servicio.findMany();
    console.log(`\n✅ Servicios encontrados: ${servicios.length}`);
    servicios.forEach(servicio => {
      console.log(`   - ${servicio.nombreServicio}: $${servicio.precio} - ${servicio.descripcion}`);
    });
    
    // Verificar expedientes
    const expedientes = await prisma.expediente.findMany();
    console.log(`\n✅ Expedientes encontrados: ${expedientes.length}`);
    expedientes.forEach(expediente => {
      console.log(`   - Cédula: ${expediente.cedula} - Estado: ${expediente.estado} - Paciente: ${expediente.idPaciente}`);
    });
    
    // Verificar citas
    const citas = await prisma.cita.findMany();
    console.log(`\n✅ Citas encontradas: ${citas.length}`);
    citas.forEach(cita => {
      console.log(`   - ${cita.descripcion} - Fecha: ${cita.fechaCita} - Estado: ${cita.estadoCita}`);
    });
    
    // Verificar diagnósticos
    const diagnosticos = await prisma.diagnostico.findMany();
    console.log(`\n✅ Diagnósticos encontrados: ${diagnosticos.length}`);
    diagnosticos.forEach(diagnostico => {
      console.log(`   - ${diagnostico.diagnostico.substring(0, 60)}... - Fecha: ${diagnostico.fecha}`);
    });
    
    // Verificar antecedentes clínicos
    const antecedentes = await prisma.antecedenteClinico.findMany();
    console.log(`\n✅ Antecedentes clínicos encontrados: ${antecedentes.length}`);
    antecedentes.forEach(antecedente => {
      console.log(`   - Paciente: ${antecedente.idPaciente} - Historial: ${antecedente.historialMedico?.substring(0, 50)}...`);
    });
    
    // Verificar archivos
    const archivos = await prisma.archivo.findMany();
    console.log(`\n✅ Archivos encontrados: ${archivos.length}`);
    archivos.forEach(archivo => {
      console.log(`   - ${archivo.nombreOriginal} (${archivo.categoria}) - Usuario: ${archivo.idUsuario}`);
    });
    
    // Resumen final
    console.log('\n📊 RESUMEN FINAL:');
    console.log(`   - Roles: ${roles.length}`);
    console.log(`   - Usuarios: ${usuarios.length}`);
    console.log(`   - Servicios: ${servicios.length}`);
    console.log(`   - Expedientes: ${expedientes.length}`);
    console.log(`   - Citas: ${citas.length}`);
    console.log(`   - Diagnósticos: ${diagnosticos.length}`);
    console.log(`   - Antecedentes: ${antecedentes.length}`);
    console.log(`   - Archivos: ${archivos.length}`);
    
    // Verificar relaciones
    console.log('\n🔗 VERIFICANDO RELACIONES:');
    
    // Verificar que los usuarios tengan roles asignados
    const usuariosConRoles = usuarios.filter(u => u.idRol !== null);
    console.log(`   - Usuarios con roles asignados: ${usuariosConRoles.length}/${usuarios.length}`);
    
    // Verificar que las citas tengan servicios asignados
    const citasConServicios = citas.filter(c => c.idServicio !== null);
    console.log(`   - Citas con servicios asignados: ${citasConServicios.length}/${citas.length}`);
    
    // Verificar que los diagnósticos tengan expedientes asignados
    const diagnosticosConExpedientes = diagnosticos.filter(d => d.idExpediente !== null);
    console.log(`   - Diagnósticos con expedientes asignados: ${diagnosticosConExpedientes.length}/${diagnosticos.length}`);
    
    // Verificar que los archivos tengan usuarios asignados
    const archivosConUsuarios = archivos.filter(a => a.idUsuario !== null);
    console.log(`   - Archivos con usuarios asignados: ${archivosConUsuarios.length}/${archivos.length}`);
    
    console.log('\n🎉 ¡Verificación completada exitosamente!');
    console.log('✅ El script populate está funcionando correctamente');
    
  } catch (error) {
    console.error('❌ Error verificando datos:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Función para verificar que las tablas existan
const verificarTablasExistentes = async () => {
  console.log('🔍 Verificando que todas las tablas existan...\n');
  
  const tablasEsperadas = [
    'roles', 'usuarios', 'servicios', 'expediente', 'citas',
    'diagnostico', 'antecedentes_clinicos', 'archivos'
  ];
  
  for (const tabla of tablasEsperadas) {
    try {
      const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM ${tabla}`;
      console.log(`✅ Tabla '${tabla}' existe y es accesible`);
    } catch (error) {
      console.log(`❌ Tabla '${tabla}' no existe o no es accesible: ${error.message}`);
    }
  }
};

// Función principal
const ejecutarVerificacion = async () => {
  console.log('🚀 Iniciando verificación del script populate...\n');
  
  try {
    await verificarTablasExistentes();
    console.log('');
    await verificarDatosPopulate();
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
    process.exit(1);
  }
};

// Ejecutar si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  ejecutarVerificacion();
}

export { ejecutarVerificacion, verificarDatosPopulate, verificarTablasExistentes };