import jwt from 'jsonwebtoken';
import config from './src/config/env.js';
import { ROLES, ROLE_NAMES } from './src/constants/roles.js';

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

console.log('🔑 Tokens para pruebas de Expedientes en Swagger:\n');

usuarios.forEach((usuario, index) => {
  const token = createToken(usuario);
  console.log(`--- ${usuario.rol.nombreRol} (ID: ${usuario.rol.idRol}) ---`);
  console.log(`Email: ${usuario.correoElectronico}`);
  console.log(`Token: ${token}`);
  console.log('');
});

console.log('📋 Instrucciones para probar Expedientes en Swagger:');
console.log('1. Ve a http://localhost:3000/api-docs');
console.log('2. Haz clic en "Authorize" (🔒) en la parte superior');
console.log('3. Pega uno de los tokens de arriba');
console.log('4. Prueba los endpoints de expedientes');
console.log('');
console.log('🎯 Endpoints de Expedientes disponibles:');
console.log('- GET /api/expedientes - Ver expedientes (todos los roles)');
console.log('  * Pacientes: solo ven sus propios expedientes');
console.log('  * Fisioterapeutas/Admin: ven todos los expedientes');
console.log('- POST /api/expedientes - Crear expediente (Admin, Fisioterapeuta)');
console.log('- GET /api/expedientes/:id - Ver expediente específico (todos los roles)');
console.log('- PUT /api/expedientes/:id - Actualizar expediente (Admin, Fisioterapeuta)');
console.log('- DELETE /api/expedientes/:id - Eliminar expediente (solo Admin)');
console.log('');
console.log('📝 Datos de prueba para crear expedientes:');
console.log(JSON.stringify({
  idPaciente: 4,
  cedula: '12345678',
  estado: 'activo',
  idMedico: 2,
  descripcion: 'Expediente de prueba para paciente'
}, null, 2));
console.log('');
console.log('🔍 Filtros disponibles en GET /api/expedientes:');
console.log('- ?cedula=12345678 - Filtrar por cédula');
console.log('- ?estado=activo - Filtrar por estado');
console.log('- ?idMedico=2 - Filtrar por médico');
console.log('- ?page=1&limit=10 - Paginación');
