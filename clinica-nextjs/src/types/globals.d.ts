export {};

// Create a type for the roles
export type Roles = "admin" | "moderator" | "paciente";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
