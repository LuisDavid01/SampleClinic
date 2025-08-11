# Módulo de Pacientes

Este módulo permite a los pacientes acceder a su información médica, citas, diagnósticos y consentimientos de manera segura y organizada.

## Características

### 1. Visualización Cronológica de Citas
- Lista todas las citas del paciente ordenadas por fecha
- Filtros por estado y búsqueda por fisioterapeuta o síntomas
- Vista detallada de cada cita con toda la información relevante

### 2. Detalles Completos de Citas
- Información completa de cada cita (fecha, hora, duración, fisioterapeuta)
- Diagnósticos detallados con síntomas, evaluaciones y tratamientos
- Medicamentos recetados con dosis e instrucciones
- Archivos adjuntos (radiografías, documentos, etc.)

### 3. Exportación de Diagnósticos
- Exportación de diagnósticos específicos a PDF
- Formato profesional con toda la información médica
- Incluye medicamentos, recomendaciones y plan de tratamiento

### 4. Gestión de Consentimientos
- Visualización de todos los consentimientos firmados
- Descarga de copias digitales de los consentimientos
- Información sobre versiones y fechas de firma

## Estructura del Módulo

```
src/app/pacientes/
├── layout.tsx                    # Layout principal con navegación
├── page.tsx                      # Página principal (lista de citas)
├── citas/
│   └── [id]/
│       └── page.tsx              # Detalles de una cita específica
├── consentimientos/
│   └── page.tsx                  # Lista de consentimientos
└── README.md                     # Esta documentación
```

## Autenticación y Autorización

El módulo utiliza Clerk para la autenticación y autorización:

### Hooks Personalizados
- `usePacienteAuth`: Verifica si el usuario es un paciente autenticado
- `usePacientePermissions`: Verifica permisos sobre datos específicos
- `useCurrentPacienteId`: Obtiene el ID del paciente actual

### Componentes de Protección
- `PacienteRouteGuard`: Protege todas las rutas del módulo
- `PacienteDataGuard`: Verifica permisos sobre datos específicos

## Tipos de Datos

### Paciente
```typescript
interface Paciente {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  fechaNacimiento: Date;
  genero: 'masculino' | 'femenino' | 'otro';
  direccion: string;
  cedula: string;
  fechaRegistro: Date;
  estado: 'activo' | 'inactivo';
  foto?: string;
}
```

### Cita
```typescript
interface Cita {
  id: string;
  pacienteId: string;
  fisioterapeutaId: string;
  fisioterapeutaNombre: string;
  fecha: Date;
  hora: string;
  duracion: number;
  estado: 'programada' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada';
  tipo: 'consulta' | 'tratamiento' | 'evaluacion' | 'seguimiento';
  sintomas?: string;
  diagnostico?: string;
  tratamiento?: string;
  recomendaciones?: string;
}
```

### Diagnóstico
```typescript
interface Diagnostico {
  id: string;
  citaId: string;
  pacienteId: string;
  fisioterapeutaId: string;
  fecha: Date;
  sintomas: string;
  evaluacion: string;
  diagnostico: string;
  planTratamiento: string;
  recomendaciones: string;
  medicamentos?: Medicamento[];
  archivos?: Archivo[];
}
```

## Historias de Usuario Implementadas

### 1. Visualización Cronológica de Citas ✅
**Como paciente de la clínica, necesito visualizar cronológicamente todas las citas registradas a mi nombre, con la finalidad de llevar un control claro de mi historial de atenciones.**

- Implementado en: `/pacientes/page.tsx`
- Características:
  - Lista cronológica de citas
  - Filtros por estado
  - Búsqueda por fisioterapeuta o síntomas
  - Vista previa de información relevante

### 2. Detalles Completos de Citas ✅
**Como paciente de la clínica, necesito ver los detalles de cada una de mis citas, incluyendo fecha, fisioterapeuta asignado, tratamiento, duración, recetas, medicamentos y archivos, con la finalidad de entender mejor los tratamientos que he recibido.**

- Implementado en: `/pacientes/citas/[id]/page.tsx`
- Características:
  - Información completa de la cita
  - Diagnóstico detallado
  - Lista de medicamentos con instrucciones
  - Archivos adjuntos descargables
  - Botones para ver y descargar

### 3. Exportación de Diagnósticos ✅
**Como paciente de la clínica, necesito exportar en PDF la información de un diagnóstico específico, con la finalidad de conservar una copia física o digital para futuras consultas o trámites.**

- Implementado en: `components/PDFExport/PDFExport.tsx`
- Características:
  - Generación de PDF profesional
  - Incluye toda la información del diagnóstico
  - Tabla de medicamentos
  - Formato médico estándar

### 4. Gestión de Consentimientos ✅
**Como paciente, necesito visualizar y descargar los consentimientos informados que he firmado, con la finalidad de tener evidencia de los tratamientos autorizados y su fecha.**

- Implementado en: `/pacientes/consentimientos/page.tsx`
- Características:
  - Lista de consentimientos firmados
  - Filtros por tipo y estado
  - Descarga de copias digitales
  - Información sobre versiones

## Configuración de Clerk

### Lógica de Roles Simplificada

El módulo utiliza una lógica de roles simplificada:

- **Sin rol específico**: Se considera automáticamente como paciente ✅
- **Rol "paciente"**: Acceso completo al módulo ✅
- **Rol "admin"**: Acceso completo al módulo ✅
- **Otros roles**: Acceso restringido ❌

### Metadatos Opcionales

Los usuarios pueden tener los siguientes metadatos en Clerk (opcionales):

```json
{
  "role": "paciente",           // Opcional - si no se especifica, se considera paciente
  "pacienteId": "id-del-paciente-en-la-base-de-datos"  // Opcional - para identificación específica
}
```

### Ejemplos de Configuración

```json
// Usuario sin rol específico - ACCESO PERMITIDO
{}

// Usuario con rol paciente - ACCESO PERMITIDO
{
  "role": "paciente"
}

// Usuario con rol admin - ACCESO PERMITIDO
{
  "role": "admin"
}

// Usuario con otro rol - ACCESO DENEGADO
{
  "role": "moderator"
}
```

## Próximos Pasos

1. **Integración con Base de Datos**: Conectar con una base de datos real para obtener datos de pacientes
2. **Generación Real de PDFs**: Implementar una librería como jsPDF o usar una API de generación de PDFs
3. **Subida de Archivos**: Implementar sistema de subida y almacenamiento de archivos médicos
4. **Notificaciones**: Sistema de notificaciones para citas y actualizaciones
5. **Historial Médico Completo**: Expandir para incluir historial médico completo
6. **Chat con Fisioterapeutas**: Sistema de comunicación directa

## Tecnologías Utilizadas

- **Next.js 15**: Framework de React
- **Clerk**: Autenticación y autorización
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos
- **Lucide React**: Iconos
- **Radix UI**: Componentes de interfaz 