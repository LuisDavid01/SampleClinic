
// Create a type for the roles
export type Roles = "paciente" | "admin" | "moderator" | "fisioterapeuta" | "recepcion";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }

  // tipo generico para las respuestas de los formularios

export type ActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  error?: string
}
}



