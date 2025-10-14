import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Hook personalizado para manejar la invalidación automática de queries de expedientes
 * Proporciona funcionalidad de refresh automático cuando:
 * - El componente se monta
 * - La ventana recibe foco
 * - La pestaña se vuelve visible
 */
export const useExpedientesRefresh = () => {
  const queryClient = useQueryClient();

  // Función para invalidar todas las queries de expedientes
  const refreshExpedientes = () => {
    queryClient.invalidateQueries({ queryKey: ['expedientes'] });
  };

  // Invalidar queries cuando el componente se monta (navegación de vuelta)
  useEffect(() => {
    refreshExpedientes();
  }, [queryClient]);

  // Invalidar queries cuando se detecta foco o visibilidad
  useEffect(() => {
    const handleFocus = () => {
      refreshExpedientes();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshExpedientes();
      }
    };

    // Escuchar eventos de foco y visibilidad
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  return {
    refreshExpedientes
  };
};
