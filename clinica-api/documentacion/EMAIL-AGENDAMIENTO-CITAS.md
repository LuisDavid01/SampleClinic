# Envío de Email al Agendar Cita

## 📋 Historia de Usuario
Como Administrador de la clínica, necesito que cada vez que se agende una cita en el calendario, se le envíe un correo al cliente de la clínica comunicándole que la cita fue agendada.

## 🗄️ Requisitos a Nivel de Base de Datos

### Tablas y Campos Existentes (Ya implementados)

1. **Tabla `citas`**
   - ✅ `id_cita` (PK)
   - ✅ `fecha_cita` (DATE)
   - ✅ `id_paciente` (FK a usuarios)
   - ✅ `id_medico` (FK a usuarios)
   - ✅ `id_servicio` (FK a servicios, opcional)
   - ✅ `descripcion` (TEXT)
   - ✅ `estado_cita` (VARCHAR)
   - ✅ `token_confirmacion` (VARCHAR, único)
   - ✅ `recordatorio_enviado` (BOOLEAN)
   - ✅ `fecha_recordatorio_enviado` (DATE)

2. **Tabla `usuarios`**
   - ✅ `id_usuario` (PK)
   - ✅ `correo_electronico` (VARCHAR, único) - **NECESARIO para enviar email**
   - ✅ `nombre`, `apellido1`, `apellido2`

3. **Tabla `email_logs`**
   - ✅ `id_log` (PK)
   - ✅ `id_cita` (FK a citas)
   - ✅ `tipo_email` (VARCHAR) - **NUEVO VALOR: 'agendamiento'**
   - ✅ `destinatario` (VARCHAR)
   - ✅ `asunto` (VARCHAR)
   - ✅ `fecha_envio` (TIMESTAMP)
   - ✅ `estado` (VARCHAR: 'enviado', 'fallido')
   - ✅ `error_message` (TEXT, nullable)
   - ✅ `token_confirmacion` (VARCHAR, nullable)

### Cambios Necesarios en BD
**NINGUNO** - La estructura actual es suficiente. Solo necesitamos usar el tipo de email 'agendamiento' en la tabla `email_logs`.

## 🔌 Requisitos a Nivel de API

### Servicios Existentes (Ya implementados)

1. **`emailService.js`**
   - ✅ Configuración SMTP
   - ✅ Método `enviarRecordatorioCita()` - Para recordatorios 2 días antes
   - ✅ Método `enviarConfirmacionRespuesta()` - Para confirmar/rechazar
   - ✅ Método `registrarEmailLog()` - Para registrar logs
   - ❌ **FALTA: Método `enviarEmailAgendamiento()`** - Para notificar al crear cita

### Endpoints Existentes

1. **POST `/api/citas`**
   - ✅ Crea citas correctamente
   - ✅ Valida datos de entrada
   - ✅ Incluye información de paciente y médico
   - ❌ **FALTA: Incluir `correoElectronico` en el include del paciente**
   - ❌ **FALTA: Llamar al servicio de email después de crear la cita**

### Cambios Necesarios en API

1. **Nuevo método en `emailService.js`**
   ```javascript
   async enviarEmailAgendamiento(cita)
   ```
   - Debe enviar un email informativo al paciente cuando se agenda la cita
   - Diferente al recordatorio (que se envía 2 días antes)
   - Debe incluir: fecha, hora, médico, servicio
   - Debe registrar el log con tipo 'agendamiento'

2. **Modificación en `routes/citas.js` (POST)**
   - Incluir `correoElectronico` en el select del paciente
   - Llamar a `emailService.enviarEmailAgendamiento()` después de crear la cita
   - El envío de email NO debe bloquear la respuesta (usar async/await sin esperar)
   - Si el email falla, registrar el error pero no fallar la creación de la cita

### Configuración Necesaria

**Ya existe en `env.js`:**
- ✅ `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- ✅ `EMAIL_FROM`, `EMAIL_FROM_NAME`
- ✅ `FRONTEND_URL`

**No se requieren cambios en configuración.**

## 📧 Contenido del Email de Agendamiento

El email debe incluir:
- Saludo personalizado con nombre del paciente
- Confirmación de que la cita fue agendada exitosamente
- Detalles de la cita:
  - Fecha y hora
  - Fisioterapeuta asignado
  - Servicio (si aplica)
  - Descripción (si existe)
- Información de contacto de la clínica
- Nota sobre recordatorio (se enviará 2 días antes)

## ✅ Resumen de Implementación

### Lo que YA existe:
- ✅ Estructura de BD completa
- ✅ Servicio de email configurado
- ✅ Tabla de logs de email
- ✅ Endpoint de creación de citas

### Lo que FALTA implementar:
1. Método `enviarEmailAgendamiento()` en `emailService.js`
2. Modificar POST `/api/citas` para:
   - Incluir `correoElectronico` en el include
   - Llamar al método de email después de crear la cita

### Consideraciones:
- El envío de email debe ser asíncrono y no bloquear la respuesta
- Si el email falla, la cita debe crearse igualmente
- Registrar siempre el intento de envío en `email_logs`
- Validar que el paciente tenga `correoElectronico` antes de enviar

