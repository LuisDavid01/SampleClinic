import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

if (!process.env.ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY no está configurada. Debe establecerse en el entorno de producción.');
}
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

/**
 * Encripta un texto usando AES-256-CBC
 */
export function encrypt(text) {
  if (!text) return null;
  
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Error encriptando datos:', error);
    return null;
  }
}

/**
 * Desencripta un texto encriptado
 */
export function decrypt(encryptedText) {
  if (!encryptedText) return null;
  
  try {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedData = textParts.join(':');
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Error desencriptando datos:', error);
    return null;
  }
}

/**
 * Middleware para encriptar datos sensibles antes de guardar
 */
export const encryptSensitiveData = (req, res, next) => {
  if (req.body) {
    // Campos sensibles que deben ser encriptados
    const sensitiveFields = [
      'urgenciasMedicas',
      'contactoEmergenciaTelefono',
      'notasAdicionales'
    ];
    
    sensitiveFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = encrypt(req.body[field]);
      }
    });
  }
  
  next();
};

/**
 * Middleware para desencriptar datos sensibles antes de enviar
 */
export const decryptSensitiveData = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    try {
      if (data && typeof data === 'string') {
        const parsed = JSON.parse(data);
        if (parsed.data) {
          // Desencriptar campos sensibles en la respuesta
          const sensitiveFields = [
            'urgenciasMedicas',
            'contactoEmergenciaTelefono',
            'notasAdicionales'
          ];
          
          sensitiveFields.forEach(field => {
            if (parsed.data[field] && typeof parsed.data[field] === 'string') {
              const decrypted = decrypt(parsed.data[field]);
              if (decrypted) {
                parsed.data[field] = decrypted;
              }
            }
          });
          
          data = JSON.stringify(parsed);
        }
      }
    } catch (error) {
      console.error('Error desencriptando respuesta:', error);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Función para hashear datos para comparación (no reversible)
 */
export function hashData(data) {
  if (!data) return null;
  
  try {
    return crypto.createHash('sha256').update(data).digest('hex');
  } catch (error) {
    console.error('Error hasheando datos:', error);
    return null;
  }
}

/**
 * Valida la integridad de los datos usando hash
 */
export function validateDataIntegrity(originalData, currentData) {
  const originalHash = hashData(JSON.stringify(originalData));
  const currentHash = hashData(JSON.stringify(currentData));
  
  return originalHash === currentHash;
}
