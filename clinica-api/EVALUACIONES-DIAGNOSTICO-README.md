# Evaluaciones y Diagnósticos - Nueva Estructura

## 📋 Resumen de Cambios

Se ha modificado la estructura de la base de datos y creado nuevos endpoints para manejar evaluaciones y diagnósticos con información más detallada.

## 🗄️ Cambios en la Base de Datos

### Tabla Renombrada
- **Antes**: `diagnostico`
- **Después**: `evaluacion_diagnostico`

### Nuevas Columnas Agregadas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `sintomas_reportados` | TEXT | Síntomas reportados por el paciente |
| `evaluacion_fisica` | TEXT | Evaluación física realizada por el médico |
| `plan_tratamiento` | TEXT | Plan de tratamiento propuesto |
| `recomendaciones` | TEXT | Recomendaciones para el paciente |

### Columna Renombrada
- **Antes**: `diagnostico`
- **Después**: `diagnostico_principal`

## 🚀 Nuevos Endpoints

### 1. Obtener Evaluaciones de un Paciente
```
GET /api/evaluacion-diagnostico/paciente/{pacienteId}
```

**Respuesta:**
```json
{
  "evaluaciones": [
    {
      "idEvaluacion": 1,
      "fecha": "2024-01-15T00:00:00.000Z",
      "diagnosticoPrincipal": "Tendinitis del supraespinoso",
      "sintomasReportados": "Dolor agudo en el hombro...",
      "evaluacionFisica": "Examen físico revela...",
      "planTratamiento": "1. Terapia manual...",
      "recomendaciones": "Evitar actividades...",
      "doctor": {
        "idUsuario": 10,
        "nombre": "Dr. Juan",
        "apellido1": "Pérez"
      }
    }
  ],
  "total": 1,
  "paciente": {
    "idUsuario": 12,
    "nombre": "Ana",
    "apellido1": "García"
  }
}
```

### 2. Obtener Evaluación Específica
```
GET /api/evaluacion-diagnostico/{evaluacionId}
```

### 3. Crear Nueva Evaluación
```
POST /api/evaluacion-diagnostico
```

**Body:**
```json
{
  "idPaciente": 12,
  "diagnosticoPrincipal": "Cervicalgia por postura inadecuada",
  "sintomasReportados": "Dolor en la región cervical...",
  "evaluacionFisica": "Examen físico revela...",
  "planTratamiento": "1. Terapia manual...",
  "recomendaciones": "Mantener postura correcta..."
}
```

## 🔧 Scripts de Implementación

### 1. Ejecutar Migración
```bash
node Script_Test/ejecutar-migracion-evaluaciones.js
```

### 2. Poblar Datos de Ejemplo
```bash
node Script_Test/poblar-evaluaciones-diagnostico.js
```

### 3. Probar Endpoints
```bash
node Script_Test/probar-evaluaciones-endpoints.js
```

## 📊 Estructura de Datos

### Evaluación Completa
```typescript
interface EvaluacionDiagnostico {
  idEvaluacion: number;
  idPaciente: number;
  fecha: Date;
  idDoctor: number;
  diagnosticoPrincipal: string;
  sintomasReportados?: string;
  evaluacionFisica?: string;
  planTratamiento?: string;
  recomendaciones?: string;
  idExpediente?: number;
  doctor: Usuario;
  paciente: Usuario;
}
```

## 🔐 Permisos y Seguridad

- **Pacientes**: Pueden ver sus propias evaluaciones
- **Médicos**: Pueden ver evaluaciones de sus pacientes
- **Administradores**: Pueden ver todas las evaluaciones
- **Solo médicos y administradores**: Pueden crear nuevas evaluaciones

## 🎯 Casos de Uso

### Para Pacientes
- Ver historial completo de evaluaciones
- Acceder a diagnósticos detallados
- Revisar planes de tratamiento
- Seguir recomendaciones médicas

### Para Médicos
- Crear evaluaciones detalladas
- Registrar síntomas reportados
- Documentar evaluación física
- Establecer planes de tratamiento
- Proporcionar recomendaciones específicas

## 📈 Beneficios

1. **Información Más Completa**: Síntomas, evaluación física, plan de tratamiento y recomendaciones
2. **Mejor Seguimiento**: Historial detallado de evaluaciones
3. **Comunicación Mejorada**: Información clara para pacientes
4. **Documentación Profesional**: Estructura médica estándar

## 🔄 Migración de Datos Existentes

Los datos existentes en la tabla `diagnostico` se migrarán automáticamente:
- El campo `diagnostico` se convertirá en `diagnostico_principal`
- Los nuevos campos se inicializarán como `NULL`
- Se mantendrán todas las relaciones existentes

## 🧪 Pruebas

### Endpoints a Probar
1. `GET /api/evaluacion-diagnostico/paciente/12`
2. `GET /api/evaluacion-diagnostico/1`
3. `POST /api/evaluacion-diagnostico`

### Datos de Prueba
- **Paciente ID**: 12
- **Médico ID**: 10
- **Evaluaciones de ejemplo**: 3 evaluaciones con datos completos

## 📝 Notas Importantes

- La tabla anterior `diagnostico` se mantiene para compatibilidad
- Los nuevos endpoints son independientes
- Se recomienda migrar gradualmente a la nueva estructura
- Los datos existentes no se perderán durante la migración
