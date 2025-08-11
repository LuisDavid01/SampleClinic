"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
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

export default function PacientesPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con diseño médico */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Stethoscope className="w-8 h-8 text-primary" />
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
                className="border-primary/20 text-primary hover:bg-primary/5"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Historial
              </Button>
            </div>
          </div>
        </div>

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
              <TrendingUp className="w-5 h-5 text-primary" />
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
              <Activity className="w-5 h-5 text-primary" />
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
              <FileText className="w-5 h-5 text-primary" />
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
              <User className="w-5 h-5 text-primary" />
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