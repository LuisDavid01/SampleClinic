# 🐳 Docker - Sistema de Recordatorios

Guía específica para configurar y desplegar el sistema de recordatorios por email en Docker.

## 📋 Requisitos Previos

1. Docker y Docker Compose instalados
2. Credenciales SMTP configuradas (Gmail, SendGrid, etc.)
3. URL del frontend configurada

## 🚀 Configuración Rápida

### 1. Configurar Variables de Entorno

Edita `docker-compose.yaml` o crea un archivo `.env`:

```yaml
# Email Configuration
SMTP_HOST: smtp.gmail.com
SMTP_PORT: 587
SMTP_SECURE: false
SMTP_USER: tu-email@gmail.com
SMTP_PASS: tu-app-password
EMAIL_FROM: noreply@clinicaestebanporras.com
EMAIL_FROM_NAME: Clínica Esteban Porras

# Frontend URL
FRONTEND_URL: http://localhost:3000

# Recordatorios
RECORDATORIO_DIAS_ANTES: 2
CRON_SCHEDULE_RECORDATORIOS: 0 9 * * *
TZ: America/Costa_Rica
```

### 2. Construir y Ejecutar

```bash
docker-compose up --build -d
```

### 3. Verificar Migraciones

Las migraciones se ejecutan automáticamente. Verifica:

```bash
# Verificar que las tablas existan
docker-compose exec postgres psql -U postgres -d salena_fisio -c "\d email_logs"
docker-compose exec postgres psql -U postgres -d salena_fisio -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'citas' AND column_name LIKE 'recordatorio%';"
```

## ✅ Verificación

### 1. Verificar que el Job se Inicie

```bash
docker-compose logs clinica-api | grep -i "job de recordatorios"
```

Deberías ver:
```
📅 Programando job de recordatorios con cron: 0 9 * * *
✅ Job de recordatorios iniciado correctamente
```

### 2. Verificar Configuración SMTP

```bash
docker-compose exec clinica-api env | grep SMTP
```

### 3. Probar Envío Manual

```bash
# Ejecutar job manualmente
curl -X POST http://localhost:3001/api/recordatorios/ejecutar
```

## 🔧 Configuración de SMTP

### Gmail

1. Habilitar "Verificación en 2 pasos"
2. Generar "Contraseña de aplicación": https://myaccount.google.com/apppasswords
3. Usar esa contraseña en `SMTP_PASS`

### Otros Proveedores

- **SendGrid**: Usar API Key en lugar de contraseña
- **Mailgun**: Configurar según documentación
- **Outlook**: `smtp-mail.outlook.com:587`

## 📊 Monitoreo

### Ver Logs de Recordatorios

```bash
# Logs en tiempo real
docker-compose logs -f clinica-api | grep -i recordatorio

# Ver últimos logs
docker-compose logs --tail=100 clinica-api | grep -i recordatorio
```

### Consultar Logs en Base de Datos

```bash
docker-compose exec postgres psql -U postgres -d salena_fisio -c "SELECT * FROM email_logs ORDER BY fecha_envio DESC LIMIT 10;"
```

### Estadísticas

```bash
docker-compose exec postgres psql -U postgres -d salena_fisio -c "SELECT tipo_email, estado, COUNT(*) FROM email_logs GROUP BY tipo_email, estado;"
```

## 🐛 Troubleshooting

### El Job No se Ejecuta

1. Verificar timezone:
   ```bash
   docker-compose exec clinica-api date
   ```

2. Verificar logs de inicio:
   ```bash
   docker-compose logs clinica-api | grep -i "reminderJob\|cron"
   ```

3. Verificar que el servidor esté corriendo:
   ```bash
   curl http://localhost:3001/api/health
   ```

### Emails No se Envían

1. Verificar configuración SMTP:
   ```bash
   docker-compose exec clinica-api node -e "
   const nodemailer = require('nodemailer');
   const t = nodemailer.createTransport({
     host: process.env.SMTP_HOST,
     port: process.env.SMTP_PORT,
     auth: {
       user: process.env.SMTP_USER,
       pass: process.env.SMTP_PASS
     }
   });
   t.verify()
     .then(() => console.log('✅ SMTP OK'))
     .catch(e => console.error('❌ SMTP Error:', e.message));
   "
   ```

2. Verificar logs de email:
   ```bash
   docker-compose logs clinica-api | grep -i "email\|smtp"
   ```

3. Verificar que las variables estén configuradas:
   ```bash
   docker-compose exec clinica-api env | grep -E "SMTP|EMAIL"
   ```

### Migraciones No se Aplican

1. Verificar logs de migración:
   ```bash
   docker-compose logs clinica-api | grep -i "migrate\|prisma"
   ```

2. Aplicar migraciones manualmente:
   ```bash
   docker-compose exec clinica-api npx prisma migrate deploy
   ```

3. Verificar estado de migraciones:
   ```bash
   docker-compose exec clinica-api npx prisma migrate status
   ```

## 🔄 Actualizar Configuración

Para actualizar la configuración sin reconstruir:

1. Editar `docker-compose.yaml`
2. Reiniciar el servicio:
   ```bash
   docker-compose restart clinica-api
   ```

Para cambios en código o dependencias:

```bash
docker-compose up --build -d clinica-api
```

## 📝 Notas Importantes

- El job se ejecuta automáticamente según el cron configurado
- Los emails se registran en la tabla `email_logs`
- El timezone afecta la hora de ejecución del cron
- Las migraciones se ejecutan automáticamente al iniciar el contenedor
- El frontend debe estar accesible desde la URL configurada en `FRONTEND_URL`

## 🔗 Referencias

- [RECORDATORIOS-SETUP.md](./RECORDATORIOS-SETUP.md) - Configuración completa del sistema
- [DOCKER.md](./DOCKER.md) - Documentación general de Docker

