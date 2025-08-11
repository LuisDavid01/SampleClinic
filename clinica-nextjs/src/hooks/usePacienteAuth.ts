import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export interface PacienteAuth {
  isAuthenticated: boolean;
  isPaciente: boolean;
  isLoading: boolean;
  pacienteId?: string;
  userRole?: string;
  error?: string;
}

export function usePacienteAuth(): PacienteAuth {
  const { user, isLoaded } = useUser();
  const [authState, setAuthState] = useState<PacienteAuth>({
    isAuthenticated: false,
    isPaciente: false,
    isLoading: true,
  });

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!user) {
      setAuthState({
        isAuthenticated: false,
        isPaciente: false,
        isLoading: false,
        error: "Usuario no autenticado",
      });
      return;
    }

    const userRole = user.publicMetadata?.role as string;
    const pacienteId = user.publicMetadata?.pacienteId as string;

    // Usar la misma lógica que checkRole: si no tiene rol específico, se considera paciente
    const isPaciente = !userRole || userRole === "paciente" || !!pacienteId;

    setAuthState({
      isAuthenticated: true,
      isPaciente,
      isLoading: false,
      pacienteId,
      userRole,
    });
  }, [user, isLoaded]);

  return authState;
}

// Hook para verificar si el usuario tiene permisos para acceder a datos específicos
export function usePacientePermissions(pacienteId?: string) {
  const { user } = useUser();
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !pacienteId) {
      setHasPermission(false);
      setIsLoading(false);
      return;
    }

    // Verificar si el usuario es el propietario de los datos o tiene permisos de administrador
    const userPacienteId = user.publicMetadata?.pacienteId as string;
    const userRole = user.publicMetadata?.role as string;

    const canAccess = 
      userPacienteId === pacienteId || 
      userRole === "admin" || 
      userRole === "fisioterapeuta";

    setHasPermission(canAccess);
    setIsLoading(false);
  }, [user, pacienteId]);

  return { hasPermission, isLoading };
}

// Hook para obtener el ID del paciente actual
export function useCurrentPacienteId() {
  const { user } = useUser();
  const [pacienteId, setPacienteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const id = user.publicMetadata?.pacienteId as string;
      setPacienteId(id || null);
    }
  }, [user]);

  return pacienteId;
} 