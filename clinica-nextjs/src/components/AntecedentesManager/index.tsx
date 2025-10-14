'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, FileText, AlertCircle } from 'lucide-react';
import { AntecedenteClinico } from '@/types/Antecedentes';
import { getAntecedentes } from '@/actions/antecedentes';
import AntecedentesForm from '../AntecedentesForm';
import AntecedentesView from '../AntecedentesView';

interface AntecedentesManagerProps {
  pacienteId: number;
  expedienteId: number;
  canEdit?: boolean;
}

type ViewMode = 'view' | 'create' | 'edit';

export default function AntecedentesManager({ pacienteId, expedienteId, canEdit = true }: AntecedentesManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('view');
  const [antecedente, setAntecedente] = useState<AntecedenteClinico | null>(null);
  const queryClient = useQueryClient();

  // Query para obtener antecedentes
  const { 
    data: antecedentesData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['antecedentes', pacienteId],
    queryFn: () => getAntecedentes(pacienteId),
    enabled: !!pacienteId,
    retry: 1
  });

  useEffect(() => {
    console.log('🔄 [AntecedentesManager] useEffect - antecedentesData:', antecedentesData);
    if (antecedentesData?.success && antecedentesData.data) {
      setAntecedente(antecedentesData.data);
      setViewMode('view');
    } else if (antecedentesData?.success && !antecedentesData.data) {
      setAntecedente(null);
      setViewMode('create');
    }
  }, [antecedentesData]);

  const handleSuccess = async () => {
   
    
    // Invalidar todas las queries relacionadas
    queryClient.invalidateQueries({ queryKey: ['antecedentes', pacienteId] });
    queryClient.invalidateQueries({ queryKey: ['antecedentes'] });
    
    // Forzar refetch
    const result = await refetch();
  
    
    // Actualizar estado local si es necesario
    if (result.data?.success && result.data.data) {
      console.log('✅ [AntecedentesManager] Actualizando estado local con nuevos datos');
      setAntecedente(result.data.data);
    }
    
    setViewMode('view');
  };

  const handleEdit = () => {
    setViewMode('edit');
  };

  const handleCancel = () => {
    setViewMode('view');
  };

  const handleCreate = () => {
    setViewMode('create');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Cargando antecedentes clínicos...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Error al cargar los antecedentes clínicos. Por favor, intente nuevamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Antecedentes Clínicos
              </CardTitle>
              <CardDescription>
                Historial médico completo del paciente
              </CardDescription>
            </div>
            {canEdit && viewMode === 'view' && (
              <div className="flex gap-2">
                {antecedente ? (
                  <Button onClick={handleEdit} variant="outline">
                    Editar Antecedentes
                  </Button>
                ) : (
                  <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Antecedentes
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Contenido principal */}
      {viewMode === 'view' && antecedente && (
        <AntecedentesView 
          antecedente={antecedente}
          onEdit={canEdit ? handleEdit : undefined}
          canEdit={canEdit}
        />
      )}

      {viewMode === 'view' && !antecedente && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay antecedentes registrados</h3>
            <p className="text-muted-foreground mb-4">
              Este paciente no tiene antecedentes clínicos registrados aún.
            </p>
            {canEdit && (
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Antecedentes
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <AntecedentesForm
          pacienteId={pacienteId}
          antecedente={viewMode === 'edit' ? antecedente || undefined : undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
