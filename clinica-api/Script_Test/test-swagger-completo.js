const jwt = require('jsonwebtoken');
const config = require('../src/config/env');
const { ROLES, ROLE_NAMES } = require('../src/constants/roles');

// Crear tokens para diferentes roles
const createToken = (usuario) => {
  const payload = {
    idUsuario: usuario.idUsuario,
    correoElectronico: usuario.correoElectronico,
    nombre: usuario.nombre,
    apellido1: usuario.apellido1,
    rol: {
      idRol: usuario.rol.idRol,
      nombreRol: usuario.rol.nombreRol
    }
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

// Usuarios de prueba
const usuarios = [
  {
    idUsuario: 1,
    correoElectronico: 'admin@test.com',
    nombre: 'Admin',
    apellido1: 'Test',
    rol: { idRol: ROLES.ADMINISTRADOR, nombreRol: ROLE_NAMES[ROLES.ADMINISTRADOR] }
  },
  {
    idUsuario: 2,
    correoElectronico: 'fisio@test.com',
    nombre: 'Fisio',
    apellido1: 'Test',
    rol: { idRol: ROLES.FISIOTERAPEUTA, nombreRol: ROLE_NAMES[ROLES.FISIOTERAPEUTA] }
  },
  {
    idUsuario: 3,
    correoElectronico: 'recepcion@test.com',
    nombre: 'Recepcion',
    apellido1: 'Test',
    rol: { idRol: ROLES.RECEPCIONISTA, nombreRol: ROLE_NAMES[ROLES.RECEPCIONISTA] }
  },
  {
    idUsuario: 4,
    correoElectronico: 'paciente@test.com',
    nombre: 'Paciente',
    apellido1: 'Test',
    rol: { idRol: ROLES.PACIENTE, nombreRol: ROLE_NAMES[ROLES.PACIENTE] }
  }
];

console.log('🚀 API de Clínica Fisioterapéutica - Swagger Testing');
console.log('=' .repeat(60));
console.log('');

console.log('🔑 Tokens para pruebas en Swagger:');
console.log('-' .repeat(40));

usuarios.forEach((usuario, index) => {
  const token = createToken(usuario);
  console.log(`\n${index + 1}. ${usuario.rol.nombreRol} (ID: ${usuario.rol.idRol})`);
  console.log(`   Email: ${usuario.correoElectronico}`);
  console.log(`   Token: ${token}`);
});

console.log('\n📋 Instrucciones para probar en Swagger:');
console.log('-' .repeat(40));
console.log('1. Ve a http://localhost:3001/api-docs');
console.log('2. Haz clic en "Authorize" (🔒) en la parte superior');
console.log('3. Pega uno de los tokens de arriba');
console.log('4. Prueba los endpoints según los permisos de cada rol');
console.log('');

console.log('🎯 Endpoints disponibles por rol:');
console.log('=' .repeat(60));

console.log('\n📅 CITAS:');
console.log('GET    /api/citas                    - Ver citas (todos)');
console.log('POST   /api/citas                    - Crear cita (Admin, Recepcionista, Fisioterapeuta)');
console.log('PUT    /api/citas/:id                - Actualizar cita (Admin, Recepcionista, Fisioterapeuta)');
console.log('DELETE /api/citas/:id                - Cancelar cita (Admin, Recepcionista)');
console.log('POST   /api/citas/:id/notas          - Agregar nota (Admin, Fisioterapeuta)');
console.log('POST   /api/citas/:id/resultados     - Agregar resultado (Admin, Fisioterapeuta)');

console.log('\n🏥 SERVICIOS:');
console.log('GET    /api/servicios                - Ver servicios (todos)');
console.log('GET    /api/servicios/:id            - Ver servicio específico (todos)');
console.log('POST   /api/servicios                - Crear servicio (solo Admin)');
console.log('PUT    /api/servicios/:id            - Actualizar servicio (solo Admin)');
console.log('DELETE /api/servicios/:id            - Eliminar servicio (solo Admin)');
console.log('POST   /api/servicios/:id/perfiles   - Asociar perfil (solo Admin)');
console.log('DELETE /api/servicios/:id/perfiles/:idPerfil - Desasociar perfil (solo Admin)');

console.log('\n📖 HISTORIAS DE ÉXITO:');
console.log('GET    /api/historias-exito          - Ver historias (todos)');
console.log('GET    /api/historias-exito/:id      - Ver historia específica (todos)');
console.log('POST   /api/historias-exito          - Crear historia (todos)');
console.log('PUT    /api/historias-exito/:id      - Actualizar historia (todos)');
console.log('DELETE /api/historias-exito/:id      - Eliminar historia (todos)');
console.log('POST   /api/historias-exito/:id/publicar    - Publicar (solo Admin)');
console.log('POST   /api/historias-exito/:id/despublicar - Despublicar (solo Admin)');

console.log('\n👥 USUARIOS:');
console.log('GET    /api/usuarios                 - Ver usuarios (solo Admin)');
console.log('GET    /api/usuarios/:id             - Ver usuario específico (todos)');
console.log('PUT    /api/usuarios/:id             - Actualizar usuario (todos)');
console.log('DELETE /api/usuarios/:id             - Desactivar usuario (solo Admin)');

console.log('\n🔐 AUTENTICACIÓN:');
console.log('POST   /api/auth/login               - Iniciar sesión');
console.log('POST   /api/auth/register            - Registrarse');
console.log('POST   /api/auth/refresh             - Renovar token');
console.log('GET    /api/test-auth                - Probar autenticación');

console.log('\n💡 Ejemplos de uso:');
console.log('-' .repeat(40));
console.log('1. Usa el token de Administrador para probar todos los endpoints');
console.log('2. Usa el token de Fisioterapeuta para probar gestión de citas');
console.log('3. Usa el token de Recepcionista para probar creación de citas');
console.log('4. Usa el token de Paciente para probar visualización de citas');
console.log('');

console.log('🔍 Filtros disponibles:');
console.log('- Citas: fechaInicio, fechaFin, estado, idPaciente, idMedico, idServicio');
console.log('- Servicios: search, activo');
console.log('- Historias: search, publicada');
console.log('- Usuarios: search, rol, activo');
console.log('');

console.log('✅ ¡Todo listo para probar en Swagger!');
console.log('🌐 URL: http://localhost:3001/api-docs');
