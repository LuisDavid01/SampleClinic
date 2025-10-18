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

console.log('🔑 Tokens para pruebas en Swagger:\n');

usuarios.forEach((usuario, index) => {
  const token = createToken(usuario);
  console.log(`--- ${usuario.rol.nombreRol} (ID: ${usuario.rol.idRol}) ---`);
  console.log(`Email: ${usuario.correoElectronico}`);
  console.log(`Token: ${token}`);
  console.log('');
});

console.log('📋 Instrucciones para probar en Swagger:');
console.log('1. Ve a http://localhost:3001/api-docs');
console.log('2. Haz clic en "Authorize" (🔒) en la parte superior');
console.log('3. Pega uno de los tokens de arriba');
console.log('4. Prueba los endpoints de citas, servicios e historias de éxito');
console.log('');
console.log('🎯 Endpoints disponibles:');
console.log('- GET /api/citas - Ver citas (todos los roles)');
console.log('- POST /api/citas - Crear cita (Admin, Recepcionista, Fisioterapeuta)');
console.log('- PUT /api/citas/:id - Actualizar cita (Admin, Recepcionista, Fisioterapeuta)');
console.log('- DELETE /api/citas/:id - Cancelar cita (Admin, Recepcionista)');
console.log('- POST /api/citas/:id/notas - Agregar nota (Admin, Fisioterapeuta)');
console.log('- POST /api/citas/:id/resultados - Agregar resultado (Admin, Fisioterapeuta)');
console.log('');
console.log('- GET /api/servicios - Ver servicios (todos)');
console.log('- POST /api/servicios - Crear servicio (solo Admin)');
console.log('- PUT /api/servicios/:id - Actualizar servicio (solo Admin)');
console.log('- DELETE /api/servicios/:id - Eliminar servicio (solo Admin)');
console.log('');
console.log('- GET /api/historias-exito - Ver historias (todos)');
console.log('- POST /api/historias-exito - Crear historia (todos)');
console.log('- POST /api/historias-exito/:id/publicar - Publicar (solo Admin)');
console.log('- POST /api/historias-exito/:id/despublicar - Despublicar (solo Admin)');
