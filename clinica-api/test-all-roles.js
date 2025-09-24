const jwt = require('jsonwebtoken');
const config = require('./src/config/env');
const { ROLES, ROLE_NAMES, ROLE_DESCRIPTIONS } = require('./src/constants/roles');

// Simular usuarios con diferentes roles
const usuarios = [
  {
    idUsuario: 1,
    correoElectronico: 'admin@test.com',
    nombre: 'Admin Test',
    apellido1: 'User',
    rol: { idRol: ROLES.ADMINISTRADOR, nombreRol: ROLE_NAMES[ROLES.ADMINISTRADOR] }
  },
  {
    idUsuario: 2,
    correoElectronico: 'fisio@test.com',
    nombre: 'Fisio Test',
    apellido1: 'User',
    rol: { idRol: ROLES.FISIOTERAPEUTA, nombreRol: ROLE_NAMES[ROLES.FISIOTERAPEUTA] }
  },
  {
    idUsuario: 3,
    correoElectronico: 'recepcion@test.com',
    nombre: 'Recepcion Test',
    apellido1: 'User',
    rol: { idRol: ROLES.RECEPCIONISTA, nombreRol: ROLE_NAMES[ROLES.RECEPCIONISTA] }
  },
  {
    idUsuario: 4,
    correoElectronico: 'paciente@test.com',
    nombre: 'Paciente Test',
    apellido1: 'User',
    rol: { idRol: ROLES.PACIENTE, nombreRol: ROLE_NAMES[ROLES.PACIENTE] }
  }
];

console.log('🔍 Probando todos los roles del sistema:\n');

usuarios.forEach((usuario, index) => {
  console.log(`--- Usuario ${index + 1}: ${usuario.rol.nombreRol} ---`);
  
  // Generar token
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

  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });

  console.log(`✅ Token generado: ${token.substring(0, 50)}...`);

  // Verificar token
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log(`✅ Token verificado exitosamente:`);
    console.log(`  - ID Usuario: ${decoded.idUsuario}`);
    console.log(`  - Email: ${decoded.correoElectronico}`);
    console.log(`  - Nombre: ${decoded.nombre}`);
    console.log(`  - Rol ID: ${decoded.rol?.idRol}`);
    console.log(`  - Rol Nombre: ${decoded.rol?.nombreRol}`);
    console.log(`  - Descripción: ${ROLE_DESCRIPTIONS[decoded.rol?.idRol]}`);
    
    // Simular validación de roles
    console.log(`  - Es Administrador: ${decoded.rol?.idRol === ROLES.ADMINISTRADOR}`);
    console.log(`  - Es Fisioterapeuta: ${decoded.rol?.idRol === ROLES.FISIOTERAPEUTA}`);
    console.log(`  - Es Recepcionista: ${decoded.rol?.idRol === ROLES.RECEPCIONISTA}`);
    console.log(`  - Es Paciente: ${decoded.rol?.idRol === ROLES.PACIENTE}`);
    
  } catch (error) {
    console.error(`❌ Error al verificar token: ${error.message}`);
  }
  
  console.log(''); // Línea en blanco para separar
});

console.log('🎯 Resumen de roles:');
Object.keys(ROLES).forEach(roleKey => {
  const roleId = ROLES[roleKey];
  console.log(`  - ID ${roleId}: ${ROLE_NAMES[roleId]} - ${ROLE_DESCRIPTIONS[roleId]}`);
});
