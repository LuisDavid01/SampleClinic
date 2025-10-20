import { z } from 'zod';

export interface ValidationResult<T> {
  success: boolean;
  data: T | null;
  errors: Record<string, string[]> | null;
}

export function validateFormData<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return { 
      success: true, 
      data: validatedData, 
      errors: null 
    };
  } catch (error) {
    // Manejo de errores de Zod (compatible con versiones 3.x y 4.x)
    if (error instanceof z.ZodError) {
      try {
        const issues = (error as any).issues || (error as any).errors;
        
        if (issues && Array.isArray(issues)) {
          const fieldErrors: Record<string, string[]> = {};
          
          issues.forEach((issue: any) => {
            const field = issue.path ? issue.path.join('.') : 'unknown';
            const message = issue.message || 'Error de validación';
            
            if (!fieldErrors[field]) {
              fieldErrors[field] = [];
            }
            fieldErrors[field].push(message);
          });
          
          return { 
            success: false, 
            data: null, 
            errors: fieldErrors 
          };
        }
      } catch (nestedError) {
        console.error('Error al procesar issues de Zod:', nestedError);
      }
    }
    
    // Fallback para cualquier otro tipo de error
    console.error('Error de validación:', error);
    
    return { 
      success: false, 
      data: null, 
      errors: { general: ['Error de validación'] } 
    };
  }
}

// Función helper para validar campos individuales
export function validateField<T>(
  schema: z.ZodSchema<T>, 
  fieldName: string, 
  value: unknown
): string | null {
  try {
    // Para validar un campo individual, usamos el esquema completo
    // y extraemos el error específico del campo
    schema.parse({ [fieldName]: value } as T);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      try {
        const issues = (error as any).issues || (error as any).errors;
        if (issues && Array.isArray(issues) && issues.length > 0) {
          // Buscar el error específico del campo
          const fieldError = issues.find((issue: any) => 
            issue.path && issue.path.includes(fieldName)
          );
          return fieldError ? fieldError.message : 'Error de validación';
        }
      } catch (nestedError) {
        console.error('Error al procesar issues en validateField:', nestedError);
      }
    }
    return 'Error de validación';
  }
}
