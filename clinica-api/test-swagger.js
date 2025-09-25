// Script de prueba para verificar que Swagger funciona correctamente
const express = require('express');
const { specs, swaggerUi } = require('./src/config/swagger');

const app = express();

// Configurar Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Clínica Fisioterapéutica - Test'
}));

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Swagger configurado correctamente',
    swaggerUrl: '/api-docs',
    timestamp: new Date().toISOString()
  });
});

const PORT = 3002;

app.listen(PORT, () => {
  console.log(`🧪 Servidor de prueba ejecutándose en puerto ${PORT}`);
  console.log(`📚 Swagger UI disponible en: http://localhost:${PORT}/api-docs`);
  console.log(`🔍 Test endpoint: http://localhost:${PORT}/test`);
});

module.exports = app;

