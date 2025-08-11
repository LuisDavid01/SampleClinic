"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ClerkErrorBoundaryProps {
  children: React.ReactNode;
}

export function ClerkErrorBoundary({ children }: ClerkErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('Clerk')) {
        setHasError(true);
        setError(event.error);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Error de Autenticación
          </h2>
          <p className="text-muted-foreground mb-4">
            Ha ocurrido un problema con el sistema de autenticación. Esto puede ser temporal.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recargar Página
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setHasError(false)}
              className="w-full"
            >
              Intentar de Nuevo
            </Button>
          </div>
          {error && (
            <details className="mt-4 text-left">
              <summary className="text-sm text-muted-foreground cursor-pointer">
                Ver detalles del error
              </summary>
              <pre className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 