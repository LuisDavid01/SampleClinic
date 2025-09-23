// Script de prueba para JWT
const jwt = require('jsonwebtoken');
const config = require('./src/config/env');

console.log('🔍 JWT Secret:', config.jwtSecret ? 'Presente' : 'Ausente');
console.log('🔍 JWT Secret length:', config.jwtSecret ? config.jwtSecret.length : 0);

// Crear un token de prueba
const payload = {
  idUsuario: 1,
  correoElectronico: 'test@test.com',
  nombre: 'Test User',
  rol: 'admin'
};

console.log('🔍 Payload:', payload);

try {
  // Generar token
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
  console.log('✅ Token generado:', token.substring(0, 50) + '...');
  
  // Verificar token
  const decoded = jwt.verify(token, config.jwtSecret);
  console.log('✅ Token verificado exitosamente:', decoded);
  
  // Probar con token inválido
  try {
    jwt.verify('token_invalido', config.jwtSecret);
  } catch (error) {
    console.log('✅ Error esperado con token inválido:', error.message);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
