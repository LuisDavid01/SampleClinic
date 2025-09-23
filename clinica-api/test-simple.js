// Script de prueba simple para Swagger
const express = require('express');
const cors = require('cors');
const { specs, swaggerUi } = require('./src/config/swagger');

const app = express();

// Configurar CORS para desarrollo
app.use(cors({
  origin: '*',
  credentials: true
}));

// Middleware básico
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Clínica - Test'
}));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente',
    swagger: 'http://localhost:3002/api-docs',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'API funcionando',
    timestamp: new Date().toISOString()
  });
});

const PORT = 3002;

app.listen(PORT, () => {
  console.log(`🧪 Servidor de prueba en puerto ${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`🏠 Home: http://localhost:${PORT}`);
});

module.exports = app;
