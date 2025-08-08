import { Roles } from "@/types/globals";
import { useUser } from "@clerk/nextjs";

// Función para verificar roles en el lado del cliente
export const useCheckRole = (role: Roles) => {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role;
  
  // Si el usuario no tiene rol específico, se considera paciente por defecto
  if (!userRole && role === "paciente") {
    return true;
  }
  
  return userRole === role;
};

// Función del lado del cliente para verificar si un usuario es paciente
export const useCheckIsPaciente = () => {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role;
  
  // Si el usuario no tiene rol específico, se considera paciente por defecto
  return !userRole || userRole === "paciente";
}; 