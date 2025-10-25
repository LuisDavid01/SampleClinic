import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { Cita } from '@/types/PacienteTypes';
import { CitasService } from '@/services/citasService';

interface CitaExpandida extends Cita {
  expandida: boolean;
}

interface UseCitasCronologicasReturn {
  citas: CitaExpandida[];
  paciente: any;
  loading: boolean;
  error: string | null;
  filtroEstado: string;
  filtroTipo: string;
  busqueda: string;
  setFiltroEstado: (estado: string) => void;
  setFiltroTipo: (tipo: string) => void;
  setBusqueda: (busqueda: string) => void;
  toggleExpansion: (citaId: string) => void;
  expandirTodas: () => void;
  colapsarTodas: () => void;
  citasFiltradas: CitaExpandida[];
  estadisticas: {
    total: number;
    completadas: number;
    programadas: number;
    proximaCita: Cita | null;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const useCitasCronologicas = (): UseCitasCronologicasReturn => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [citas, setCitas] = useState<CitaExpandida[]>([]);
  const [paciente, setPaciente] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  // Cargar citas desde la API
  useEffect(() => {
    const cargarCitas = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Obtener token de autenticación
        const token = await getToken();
        
        if (!token) {
          throw new Error('No hay token de autenticación disponible. Por favor, inicia sesión.');
        }
        
        // Cargar citas usando el servicio
        // Usar ID de Clerk del paciente autenticado
        const clerkId = user.id; // ID de Clerk del paciente autenticado
        const response = await CitasService.obtenerCitasPaciente(clerkId, token);
        
        // Si no hay citas, no es un error, simplemente no hay datos
        if (response.citas.length === 0) {
          setCitas([]);
          setPaciente(response.paciente);
          setLoading(false);
          return;
        }

        // Inicializar citas con estado de expansión
        const citasConExpansion = response.citas.map(cita => ({
          ...cita,
          expandida: false
        }));

        setCitas(citasConExpansion);
        setPaciente(response.paciente);
      } catch (err) {
        console.error('Error cargando citas:', err);
        
        // Si es un error de red o API, mostrar mensaje específico
        if (err instanceof Error) {
          if (err.message.includes('fetch')) {
            setError('No se pudo conectar con el servidor. Verifique que la API esté funcionando.');
          } else if (err.message.includes('401') || err.message.includes('403')) {
            setError('No tiene permisos para acceder a esta información.');
          } else if (err.message.includes('404')) {
            // 404 no es un error, simplemente no hay citas
            setCitas([]);
            setError(null);
          } else {
            setError(err.message);
          }
        } else {
          setError('Error desconocido al cargar las citas');
        }
      } finally {
        setLoading(false);
      }
    };

    cargarCitas();
  }, [user]);

  // Filtrar citas
  const citasFiltradas = citas.filter(cita => {
    const cumpleEstado = filtroEstado === 'todos' || cita.estado === filtroEstado;
    const cumpleTipo = filtroTipo === 'todos' || cita.tipo === filtroTipo;
    const cumpleBusqueda = busqueda === '' ||
      cita.fisioterapeutaNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cita.tipo.toLowerCase().includes(busqueda.toLowerCase()) ||
      cita.sintomas?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cita.diagnostico?.toLowerCase().includes(busqueda.toLowerCase());

    return cumpleEstado && cumpleTipo && cumpleBusqueda;
  });

  // Ordenar por fecha (más reciente primero)
  const citasOrdenadas = [...citasFiltradas].sort((a, b) =>
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  // Funciones de expansión
  const toggleExpansion = (citaId: string) => {
    setCitas(prevCitas => 
      prevCitas.map(cita => 
        cita.id === citaId 
          ? { ...cita, expandida: !cita.expandida }
          : cita
      )
    );
  };

  const expandirTodas = () => {
    setCitas(prevCitas => 
      prevCitas.map(cita => ({ ...cita, expandida: true }))
    );
  };

  const colapsarTodas = () => {
    setCitas(prevCitas => 
      prevCitas.map(cita => ({ ...cita, expandida: false }))
    );
  };

  // Calcular estadísticas
  const estadisticas = {
    total: citas.length,
    completadas: citas.filter(c => c.estado === 'completada').length,
    programadas: citas.filter(c => c.estado === 'programada').length,
    proximaCita: citas.filter(c => c.estado === 'programada' || c.estado === 'confirmada').sort((a, b) =>
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    )[0] || null
  };

  return {
    citas: citasOrdenadas,
    paciente,
    loading,
    error,
    filtroEstado,
    filtroTipo,
    busqueda,
    setFiltroEstado,
    setFiltroTipo,
    setBusqueda,
    toggleExpansion,
    expandirTodas,
    colapsarTodas,
    citasFiltradas: citasOrdenadas,
    estadisticas
  };
};
