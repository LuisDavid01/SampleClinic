# Sistema de Citas Borrador

## 📋 Historia de Usuario
Como Administrador de la clínica, necesito que cada vez el usuario llene el formulario para solicitar una cita, se genere una cita borrador y en el calendario aparezca el borrador. Se le debe de notificar al usuario la solicitud de la cita.

## 👁️ Visualización Esperada por el Cliente
El cliente debe poder visualizar:
- ✅ **Fecha de la cita** - Campo `fechaCita` en tabla `citas`
- ✅ **Diagnóstico planteado** - Relación con `evaluacion_diagnostico` (ya existe `idCita`)
- ✅ **Razón de la cita** - Campo `descripcion` en tabla `citas`
- ✅ **Doctor que realizó el tratamiento** - Relación `medico` en tabla `citas`
- ⚠️ **Recetas** - Necesita relación entre `archivos` y `citas` (usar categoría "receta")
- ⚠️ **Documentos relacionados** - Necesita relación entre `archivos` y `citas`

## 🗄️ Requisitos a Nivel de Base de Datos

### Cambios Realizados en el Schema

**Se realizó un cambio necesario en el schema:**

- **Campo `idMedico` en tabla `citas`**: Cambiado de requerido a opcional (`Int?`)
  - Permite crear citas borrador sin médico asignado
  - La relación `medico` también es opcional (`Usuario?`)
  - Cambio aplicado con `prisma db push`

- Los **documentos y recetas** se obtienen a través del **expediente del paciente**:
  - `citas` → `paciente` (relación directa)
  - `paciente` → `expediente` (relación 1:1)
  - `expediente` → `archivos` (relación 1:N)
  - Los archivos con `categoria = 'receta'` son las recetas
  - Los archivos con `categoria = 'documento'` son los documentos relacionados

- El campo `estadoCita` ya existe y puede usar el valor `'borrador'`

### Estados de Cita Permitidos
- `borrador` - Cita solicitada por el usuario, pendiente de confirmación
- `programada` - Cita confirmada y programada
- `confirmada` - Cita confirmada por el paciente
- `en_progreso` - Cita en curso
- `completada` - Cita finalizada
- `cancelada` - Cita cancelada

### Estructura Actual (Ya Existe)
- ✅ Tabla `citas` con campo `estadoCita` (VARCHAR)
- ✅ Relación `citas` → `evaluacion_diagnostico` (a través de `idCita` en evaluacion_diagnostico)
- ✅ Relación `citas` → `usuarios` (paciente y médico)
- ✅ Tabla `archivos` con categorías
- ✅ Tabla `email_logs` para notificaciones

### Estado de Implementación
- ✅ Endpoint para crear citas borrador desde formulario público (`POST /api/citas/solicitar`)
- ✅ Notificación al usuario cuando se crea borrador (email automático)
- ✅ Endpoint para obtener detalles completos de cita (`GET /api/citas/:id/detalles-completos`)
- ✅ Modificación del schema para permitir citas sin médico

## 🔌 Requisitos a Nivel de API

### Endpoints Necesarios

#### 1. **POST `/api/citas/solicitar` ✅ IMPLEMENTADO - Público (sin autenticación)**
- Crear cita con estado `borrador`
- Buscar o crear usuario (paciente) automáticamente
- Validar datos del formulario
- Notificar al usuario por email
- **Request Body:**
  ```json
  {
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "telefono": "1234567890",
    "fecha": "2024-01-15",
    "hora": "10:00",
    "servicio": "1",  // ID del servicio (opcional, puede ser número o nombre)
    "mensaje": "Razón de la cita o mensaje adicional"  // Opcional
  }
  ```
- **Response:**
  ```json
  {
    "message": "Solicitud de cita recibida exitosamente. Recibirá una notificación por correo electrónico.",
    "cita": {
      "idCita": 1,
      "fechaCita": "2024-01-15T10:00:00.000Z",
      "estadoCita": "borrador"
    }
  }
  ```
- **Características:**
  - No requiere autenticación (endpoint público)
  - Busca usuario por email, si no existe lo crea automáticamente
  - Separa el nombre completo en nombre y apellidos
  - Busca servicio por ID (número) o por nombre (texto)
  - Crea la cita sin médico asignado (`idMedico: null`)
  - Envía email de notificación automáticamente

#### 2. **GET `/api/citas/:id/detalles-completos` ✅ IMPLEMENTADO**
- Obtener cita con toda la información relacionada
- Requiere autenticación (solo paciente, médico o admin pueden ver)
- **Incluye:**
  - Información básica de la cita
  - Diagnósticos del paciente (todos los diagnósticos, no solo los de la cita)
  - Expediente del paciente con documentos
  - Archivos del paciente (incluyendo recetas y documentos por categoría)
  - Notas de la cita
  - Resultados de la cita
- **Response:**
  ```json
  {
    "cita": {
      "idCita": 1,
      "fechaCita": "2024-01-15",
      "descripcion": "Razón de la cita",
      "estadoCita": "borrador",
      "paciente": { ... },
      "medico": { ... },  // Puede ser null si es borrador
      "servicio": { ... },
      "notas": [ ... ],
      "resultados": [ ... ]
    },
    "diagnosticos": [
      {
        "idEvaluacion": 1,
        "diagnostico": "...",
        "fecha": "2024-01-15",
        "doctor": { ... }
      }
    ],
    "expediente": {
      "idExpediente": 1,
      "cedula": "123456789",
      "estado": "activo",
      "descripcion": "...",
      "fechaCreacion": "...",
      "documentos": [ ... ]
    },
    "archivos": [
      {
        "idArchivo": 1,
        "nombreOriginal": "receta.pdf",
        "categoria": "receta",
        ...
      }
    ]
  }
  ```

#### 3. **PUT `/api/citas/:id/confirmar-borrador` ⚠️ PENDIENTE**
- Convertir cita borrador en cita programada
- Asignar médico si no está asignado
- Notificar al paciente
- **Nota:** Este endpoint aún no está implementado. Se puede usar el endpoint PUT `/api/citas/:id` existente para actualizar el estado.

#### 4. **POST `/api/citas` ✅ MODIFICADO**
- Permite crear citas con estado `borrador`
- Si el estado es `borrador`, `idMedico` es opcional
- Si el estado no es `borrador`, `idMedico` es requerido
- Envía email de agendamiento si es `programada`, o email de solicitud si es `borrador`
- Requiere autenticación (admin, recepcionista o fisioterapeuta)

### Servicios Implementados

#### 1. **Método en `emailService.js` ✅ IMPLEMENTADO**
```javascript
async enviarNotificacionSolicitudCita(cita)
```
- Envía email al usuario cuando se crea una solicitud de cita (borrador)
- Incluye información de la solicitud (fecha, hora, servicio)
- Indica que será contactado para confirmar
- Registra el log en `email_logs` con tipo `'solicitud'`
- Plantilla HTML profesional con diseño responsive

### Flujo de Trabajo

1. **Usuario llena formulario** → POST `/api/citas/solicitar`
2. **Sistema crea cita borrador** → Estado: `borrador`
3. **Sistema envía notificación** → Email al usuario
4. **Cita aparece en calendario** → Con estado `borrador` (visual diferente)
5. **Administrador revisa** → Puede confirmar o asignar médico
6. **Administrador confirma** → PUT `/api/citas/:id/confirmar-borrador`
7. **Cita cambia a programada** → Estado: `programada`
8. **Se envía email de agendamiento** → (Ya implementado)

## 📧 Contenido del Email de Solicitud

El email debe incluir:
- Confirmación de que la solicitud fue recibida
- Detalles de la solicitud:
  - Fecha solicitada
  - Servicio solicitado (si aplica)
  - Razón de la cita
- Nota de que será contactado para confirmar
- Información de contacto de la clínica

## ✅ Resumen de Implementación

### Cambios en BD:
1. ✅ **Schema actualizado**: `idMedico` y relación `medico` ahora son opcionales en tabla `citas`
   - Permite crear citas borrador sin médico asignado
   - Cambio aplicado con `prisma db push`

### Cambios en API:
1. ✅ **Endpoint POST `/api/citas/solicitar`** - Público, sin autenticación
   - Busca o crea usuario automáticamente
   - Crea cita borrador sin médico
   - Envía email de notificación
2. ✅ **Endpoint POST `/api/citas` modificado** - Permite estado `borrador`
   - `idMedico` opcional para borradores
   - Envía email según el estado (solicitud o agendamiento)
3. ✅ **Endpoint GET `/api/citas/:id/detalles-completos`** - Ya existía, mejorado
   - Incluye diagnósticos, expediente, archivos, notas y resultados
4. ✅ **Método `enviarNotificacionSolicitudCita()`** en `emailService.js`
   - Plantilla HTML profesional
   - Registra logs en base de datos
5. ✅ **Validación actualizada** - Permite estado `'borrador'` en validaciones
6. ✅ **Frontend actualizado** - Formulario `CitasForm` conectado al endpoint real

### Consideraciones:
- ✅ Las citas borrador pueden crearse sin médico asignado (`idMedico: null`)
- ⚠️ Las citas borrador deben aparecer en el calendario con visual diferente (pendiente en frontend)
- ✅ Los archivos están relacionados con expedientes (no directamente con citas)
- ✅ Las recetas se identifican por `categoria = 'receta'` en archivos del expediente
- ✅ Los documentos se identifican por `categoria = 'documento'` en archivos del expediente
- ✅ Para obtener documentos/recetas de una cita: `cita → paciente → expediente → archivos`
- ✅ El email de solicitud es diferente al email de agendamiento
- ✅ El endpoint `/api/citas/solicitar` es público y no requiere autenticación
- ✅ El sistema crea usuarios automáticamente si no existen (buscando por email)
- ✅ Los usuarios creados automáticamente reciben una contraseña temporal que deberán cambiar

### Flujo Implementado:
1. Usuario llena formulario público → Envía datos a `/api/citas/solicitar`
2. Sistema busca usuario por email → Si no existe, lo crea automáticamente
3. Sistema crea cita borrador → Con `estadoCita: 'borrador'` y `idMedico: null`
4. Sistema envía email → Notificación de solicitud recibida
5. Cita aparece en calendario → Administrador puede revisar y asignar médico
6. Administrador actualiza cita → Cambia estado a `'programada'` y asigna médico
7. Sistema envía email de agendamiento → Confirmación con detalles completos

