# Guía de Configuración: Sistema de Recordatorios de Citas

## 📋 Descripción

Sistema automatizado que envía correos electrónicos a los pacientes 2 días antes de sus citas programadas, permitiéndoles confirmar o rechazar la asistencia.

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Agregar las siguientes variables al archivo `.env`:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
EMAIL_FROM=noreply@clinicaestebanporras.com
EMAIL_FROM_NAME="Clínica Esteban Porras"

# Frontend URL (para links de confirmación)
FRONTEND_URL=http://localhost:3000

# Configuración de Recordatorios
RECORDATORIO_DIAS_ANTES=2
CRON_SCHEDULE_RECORDATORIOS=0 9 * * *
```

### 2. Configurar SMTP

#### Para Gmail:
1. Habilitar "Verificación en 2 pasos" en tu cuenta de Google
2. Generar una "Contraseña de aplicación":
   - Ir a: https://myaccount.google.com/apppasswords
   - Seleccionar "Correo" y "Otro (nombre personalizado)"
   - Usar esa contraseña en `SMTP_PASS`

#### Para otros proveedores:
- **Outlook/Hotmail**: `smtp-mail.outlook.com:587`
- **SendGrid**: Usar API Key en lugar de contraseña
- **Mailgun**: Configurar según documentación

### 3. Migración de Base de Datos

Ejecutar la migración de Prisma para agregar los nuevos campos:

```bash
cd clinica-api
npm run db:migrate
```

O si prefieres sincronizar el schema:

```bash
npm run db:push
```

## 📧 Funcionamiento

### Automático
- El sistema ejecuta un job programado diariamente (por defecto a las 9:00 AM)
- Busca citas programadas para dentro de 2 días
- Envía emails de recordatorio a los pacientes
- Genera tokens únicos para confirmación/rechazo

### Manual
Los administradores pueden ejecutar el job manualmente:

```bash
POST /api/recordatorios/ejecutar
Authorization: Bearer <token>
```

## 🔗 Endpoints de Confirmación

### Confirmar Cita
```
POST /api/citas/:id/confirmar?token=<token>
```

### Rechazar Cita
```
POST /api/citas/:id/rechazar?token=<token>
```

### Validar Token
```
GET /api/citas/:id/validar-token?token=<token>
```

## 📝 Estructura de Archivos Creados

```
clinica-api/
├── src/
│   ├── services/
│   │   ├── emailService.js          # Servicio de envío de emails
│   │   └── reminderService.js       # Lógica de recordatorios
│   ├── jobs/
│   │   └── reminderJob.js           # Tarea programada (cron)
│   └── routes/
│       └── citas-confirmacion.js     # Endpoints de confirmación
```

## 🗄️ Cambios en Base de Datos

### Tabla `citas` - Nuevos campos:
- `recordatorio_enviado` (BOOLEAN)
- `fecha_recordatorio_enviado` (TIMESTAMP)
- `token_confirmacion` (VARCHAR, UNIQUE)
- `fecha_confirmacion` (TIMESTAMP)

### Nueva tabla `email_logs`:
- Registro de todos los emails enviados
- Estado de envío (enviado/fallido)
- Mensajes de error
- Tokens de confirmación

## 🧪 Testing

### 1. Probar envío manual:
```bash
# Como administrador
curl -X POST http://localhost:3001/api/recordatorios/ejecutar \
  -H "Authorization: Bearer <token>"
```

### 2. Crear cita de prueba:
- Crear una cita con fecha dentro de 2 días
- Estado: `programada` o `confirmada`
- Asegurarse que el paciente tenga email válido

### 3. Verificar logs:
```sql
SELECT * FROM email_logs ORDER BY fecha_envio DESC;
```

## ⚙️ Configuración del Cron

El formato del cron es: `minuto hora día mes día-semana`

Ejemplos:
- `0 9 * * *` - Todos los días a las 9:00 AM
- `0 */6 * * *` - Cada 6 horas
- `0 8 * * 1-5` - Lunes a Viernes a las 8:00 AM
- `30 14 * * *` - Todos los días a las 2:30 PM

## 🔒 Seguridad

- Los tokens son únicos y se generan por cita
- Los tokens no expiran (pero se pueden invalidar cambiando el estado de la cita)
- Solo se pueden confirmar/rechazar citas con estado `programada` o `confirmada`
- Los endpoints de confirmación no requieren autenticación (usan token)

## 📊 Monitoreo

### Ver estado del job:
El job se inicia automáticamente al arrancar el servidor. Ver logs para:
- Citas encontradas
- Emails enviados exitosamente
- Errores de envío

### Consultar logs en BD:
```sql
-- Ver últimos emails enviados
SELECT * FROM email_logs 
WHERE estado = 'enviado' 
ORDER BY fecha_envio DESC 
LIMIT 10;

-- Ver emails fallidos
SELECT * FROM email_logs 
WHERE estado = 'fallido' 
ORDER BY fecha_envio DESC;

-- Estadísticas
SELECT 
  tipo_email,
  estado,
  COUNT(*) as cantidad
FROM email_logs
GROUP BY tipo_email, estado;
```

## 🐛 Troubleshooting

### Emails no se envían:
1. Verificar configuración SMTP en `.env`
2. Verificar que `SMTP_USER` y `SMTP_PASS` estén correctos
3. Revisar logs del servidor para errores
4. Verificar que el job esté ejecutándose (logs al iniciar servidor)

### Token inválido:
1. Verificar que el token coincida exactamente
2. Verificar que la cita esté en estado válido
3. Verificar que la cita no haya sido ya confirmada/rechazada

### Job no se ejecuta:
1. Verificar que el servidor esté corriendo
2. Verificar logs al iniciar (debe aparecer "Job de recordatorios iniciado")
3. Verificar formato del cron en `CRON_SCHEDULE_RECORDATORIOS`

## 📚 Archivos Relacionados

- `ANALISIS-EMAIL-RECORDATORIOS.md` - Análisis completo del sistema
- `src/services/emailService.js` - Servicio de emails
- `src/services/reminderService.js` - Lógica de recordatorios
- `src/jobs/reminderJob.js` - Job programado

## ✅ Checklist de Implementación

- [x] Dependencias instaladas (nodemailer, node-cron, uuid)
- [x] Schema de Prisma actualizado
- [x] Servicio de email implementado
- [x] Servicio de recordatorios implementado
- [x] Job programado implementado
- [x] Endpoints de confirmación/rechazo creados
- [x] Integración en index.js
- [ ] Configurar variables de entorno
- [ ] Ejecutar migración de base de datos
- [ ] Probar envío de emails
- [ ] Configurar frontend para mostrar páginas de confirmación

