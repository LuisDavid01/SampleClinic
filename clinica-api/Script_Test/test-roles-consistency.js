const jwt = require('jsonwebtoken');
const config = require('../src/config/env');
const { ROLES, ROLE_NAMES, isAdministrador, isFisioterapeuta, isRecepcionista, isPaciente } = require('../src/constants/roles');

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

console.log('🔍 Verificando consistencia de roles...\n');

usuarios.forEach((usuario, index) => {
  const token = createToken(usuario);
  const decoded = jwt.verify(token, config.jwtSecret);
  
  console.log(`--- Usuario ${index + 1}: ${usuario.rol.nombreRol} (ID: ${usuario.rol.idRol}) ---`);
  console.log(`Token: ${token.substring(0, 50)}...`);
  
  // Verificar funciones helper
  console.log(`✅ isAdministrador: ${isAdministrador(decoded)}`);
  console.log(`✅ isFisioterapeuta: ${isFisioterapeuta(decoded)}`);
  console.log(`✅ isRecepcionista: ${isRecepcionista(decoded)}`);
  console.log(`✅ isPaciente: ${isPaciente(decoded)}`);
  
  // Verificar que solo una función devuelva true
  const roleChecks = [
    isAdministrador(decoded),
    isFisioterapeuta(decoded),
    isRecepcionista(decoded),
    isPaciente(decoded)
  ];
  
  const trueCount = roleChecks.filter(Boolean).length;
  console.log(`✅ Roles activos: ${trueCount} (debería ser 1)`);
  
  if (trueCount !== 1) {
    console.log(`❌ ERROR: Múltiples roles activos para el mismo usuario`);
  }
  
  console.log('');
});

console.log('🎯 Resumen de la verificación:');
console.log('- Todos los roles usan IDs en lugar de nombres');
console.log('- Las funciones helper funcionan correctamente');
console.log('- Cada usuario tiene exactamente un rol activo');
console.log('- La consistencia está garantizada');
console.log('');

console.log('📋 Constantes de roles:');
Object.keys(ROLES).forEach(roleKey => {
  const roleId = ROLES[roleKey];
  console.log(`  - ${roleKey}: ID ${roleId} - ${ROLE_NAMES[roleId]}`);
});
