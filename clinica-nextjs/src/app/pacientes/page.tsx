"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Download, 
  Stethoscope,
  Activity,
  TrendingUp,
  FileText,
  User
} from "lucide-react";
import { useApiClient, apiEndpoints } from "@/utils/apiClient";

interface UserData {
  idUsuario: number;
  nombre: string;
  apellido1: string;
  apellido2: string;
  correoElectronico: string;
  clerkId: string;
  rol?: {
    nombreRol: string;
  };
}

interface UserValidation {
  status: 'pending' | 'validating' | 'validated' | 'error';
  message: string;
  userData: UserData | null;
}

export default function PacientesPage() {
  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();
  const apiClient = useApiClient();
  const [userValidation, setUserValidation] = useState<UserValidation>({
    status: 'pending',
    message: '',
    userData: null
  });

  useEffect(() => {
    const validateAndSyncUser = async () => {
      if (isSignedIn && user) {
        setUserValidation({ status: 'validating', message: 'Validando usuario...', userData: null });
        
        try {
          // Obtener el token de Clerk
          const token = await getToken();
          
          if (token && token.split('.').length === 3) {
            console.log("🧪 Validando y sincronizando usuario...");
            
            try {
              // Sincronizar usuario con la base de datos
              const syncResult = await apiClient.get(apiEndpoints.clerkProfile());
              console.log("✅ Usuario sincronizado exitosamente:", syncResult);
              
              if (syncResult.dbUser) {
                setUserValidation({
                  status: 'validated',
                  message: 'Usuario validado y sincronizado correctamente',
                  userData: syncResult.dbUser
                });
                
              }

              // Consultar historias de éxito
              try {
                console.log("📚 Consultando historias de éxito...");
                const historiasResult = await apiClient.get(apiEndpoints.getHistoriasExito());
                console.log("✅ Historias de éxito obtenidas:", historiasResult);
                
                if (historiasResult && Array.isArray(historiasResult)) {
                  console.log(`📊 Total de historias encontradas: ${historiasResult.length}`);
                  historiasResult.forEach((historia, index) => {
                    console.log(`📖 Historia ${index + 1}:`, {
                      id: historia.idHistoriaExito,
                      titulo: historia.titulo,
                      descripcion: historia.descripcion,
                      fechaCreacion: historia.fechaCreacion,
                      activa: historia.activa,
                      paciente: historia.paciente ? {
                        nombre: historia.paciente.nombre,
                        apellido1: historia.paciente.apellido1,
                        apellido2: historia.paciente.apellido2
                      } : null
                    });
                  });
                } else {
                  console.log("📭 No se encontraron historias de éxito");
                }
              } catch (historiasError) {
                console.error("❌ Error consultando historias de éxito:", historiasError);
              }
              
            } catch (apiError) {
              console.error("❌ Error validando/sincronizando usuario:", apiError);
              setUserValidation({
                status: 'error',
                message: 'Error al validar usuario. Por favor, intenta de nuevo.',
                userData: null
              });
            }
          } else {
            setUserValidation({
              status: 'error',
              message: 'Token de autenticación inválido',
              userData: null
            });
          }
        } catch (error) {
          console.error("❌ Error obteniendo token:", error);
          setUserValidation({
            status: 'error',
            message: 'Error de autenticación. Por favor, inicia sesión nuevamente.',
            userData: null
          });
        }
      } else {
        setUserValidation({
          status: 'pending',
          message: 'Esperando autenticación...',
          userData: null
        });
      }
    };

    validateAndSyncUser();
  }, [isSignedIn, user, getToken]);

  return (
    <div className="min-h-screen bg-background">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con diseño médico */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Stethoscope className="w-8 h-8 text-accent" />
              </div>
              <div>

                <h1 className="text-3xl font-bold text-foreground">
                  Mi Historial Médico
                </h1>
                <p className="text-muted-foreground mt-1">
                  Seguimiento de tu progreso médico y tratamientos

                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="border-primary/20 text-accent hover:bg-primary/5 hover:text-accent"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Historial
              </Button>
            </div>
          </div>
        </div>

        {/* Indicador de estado de validación del usuario */}
        {userValidation.status !== 'pending' && (
          <div className="mb-6">
            <Card className={`border-l-4 ${
              userValidation.status === 'validated' ? 'border-green-500 bg-green-50 dark:bg-green-950' :
              userValidation.status === 'validating' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' :
              'border-red-500 bg-red-50 dark:bg-red-950'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    userValidation.status === 'validated' ? 'bg-green-500' :
                    userValidation.status === 'validating' ? 'bg-blue-500 animate-pulse' :
                    'bg-red-500'
                  }`}></div>
                  <div>
                    <p className={`font-medium ${
                      userValidation.status === 'validated' ? 'text-green-800 dark:text-green-200' :
                      userValidation.status === 'validating' ? 'text-blue-800 dark:text-blue-200' :
                      'text-red-800 dark:text-red-200'
                    }`}>
                      {userValidation.status === 'validated' ? '✅ Usuario validado' :
                       userValidation.status === 'validating' ? '🔄 Validando usuario...' :
                       '❌ Error de validación'}
                    </p>
                    <p className={`text-sm ${
                      userValidation.status === 'validated' ? 'text-green-600 dark:text-green-300' :
                      userValidation.status === 'validating' ? 'text-blue-600 dark:text-blue-300' :
                      'text-red-600 dark:text-red-300'
                    }`}>
                      {userValidation.message}
                    </p>
                    {userValidation.userData && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <p><strong>ID:</strong> {userValidation.userData.idUsuario}</p>
                        <p><strong>Nombre:</strong> {userValidation.userData.nombre} {userValidation.userData.apellido1} {userValidation.userData.apellido2}</p>
                        <p><strong>Email:</strong> {userValidation.userData.correoElectronico}</p>
                        <p><strong>Rol:</strong> {userValidation.userData.rol?.nombreRol || 'No asignado'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resumen de Salud */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>

                  <p className="text-sm font-medium text-muted-foreground">Estado General</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">Mejorando</p>

                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>

                  <p className="text-sm font-medium text-muted-foreground">Tratamientos Activos</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</p>

                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>

                  <p className="text-sm font-medium text-muted-foreground">Próxima Evaluación</p>
                  <p className="text-lg font-semibold text-foreground">
                    En 2 semanas

                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progreso del Tratamiento */}
        <Card className="bg-card border-0 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-accent" />
              Progreso del Tratamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Diagnóstico Principal */}
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Diagnóstico Principal: Tendinitis Rotuliana
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">75%</div>
                    <div className="text-sm text-muted-foreground">Recuperación</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">8</div>
                    <div className="text-sm text-muted-foreground">Sesiones Completadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</div>
                    <div className="text-sm text-muted-foreground">Semanas Restantes</div>
                  </div>
                </div>
              </div>

              {/* Síntomas y Mejoras */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-4">
                  <h5 className="font-semibold text-foreground mb-2">Síntomas Iniciales</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Dolor agudo en rodilla derecha</li>
                    <li>• Dificultad para subir escaleras</li>
                    <li>• Dolor al realizar sentadillas</li>
                    <li>• Molestias después del ejercicio</li>
                  </ul>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <h5 className="font-semibold text-foreground mb-2">Mejoras Observadas</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✅ Dolor reducido en 70%</li>
                    <li>✅ Mejor movilidad articular</li>
                    <li>✅ Capacidad de subir escaleras</li>
                    <li>🔄 Ejercicios sin dolor</li>
                  </ul>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>


        {/* Ejercicios de Rehabilitación */}
        <Card className="bg-card border-0 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="w-5 h-5 text-accent" />
              Ejercicios de Rehabilitación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-border rounded-lg p-4 bg-muted">
                <h5 className="font-semibold text-foreground mb-2">Ejercicios Diarios</h5>
                <p className="text-sm text-muted-foreground mb-3">3 series de 15 repeticiones</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Sentadillas asistidas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Estiramientos de cuádriceps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Ejercicios de equilibrio</span>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4 bg-muted">
                <h5 className="font-semibold text-foreground mb-2">Ejercicios Semanales</h5>
                <p className="text-sm text-muted-foreground mb-3">2-3 veces por semana</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Bicicleta estática</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Natación suave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Caminata moderada</span>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4 bg-muted">
                <h5 className="font-semibold text-foreground mb-2">Próximos Objetivos</h5>
                <p className="text-sm text-muted-foreground mb-3">Para las próximas 2 semanas</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Retorno al running</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Deportes de impacto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Evaluación final</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recomendaciones Médicas */}
        <Card className="bg-card border-0 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileText className="w-5 h-5 text-accent" />
              Recomendaciones Médicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-foreground mb-3">Actividades Recomendadas</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Continuar con ejercicios de fortalecimiento</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Mantener rutina de estiramientos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Aplicar hielo si hay inflamación</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-foreground mb-3">Actividades a Evitar</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Deportes de alto impacto</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Escaleras excesivas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Sentadillas profundas</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notas del Fisioterapeuta */}
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="w-5 h-5 text-accent" />
              Notas del Fisioterapeuta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-sm text-muted-foreground italic">
                  "El paciente muestra excelente progreso en la recuperación. La movilidad articular ha mejorado significativamente y el dolor se ha reducido considerablemente. Continuar con el programa de ejercicios actual y programar evaluación en 2 semanas para considerar el retorno gradual a actividades deportivas."
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  - Dr. Esteban Porras, 15 de Enero 2024
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
} 