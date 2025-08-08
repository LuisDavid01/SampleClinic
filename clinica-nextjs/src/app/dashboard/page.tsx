import {
  Calendar,
  Clock,
  FileText,
  CalendarX,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { checkRole } from "@/utils/roles";
import { redirect } from "next/navigation";
// Datos de ejemplo
const patientData = {
  name: "María González",
  id: "P-2024-001",
  nextAppointment: "15 de Enero, 2024 - 10:00 AM",
  totalSessions: 12,
  completedSessions: 8,
};

const upcomingAppointments = [
  {
    id: 1,
    date: "15 de Enero, 2024",
    time: "10:00 AM",
    therapist: "Dr. Carlos Ruiz",
    type: "Terapia Manual",
    status: "confirmada",
  },
  {
    id: 2,
    date: "18 de Enero, 2024",
    time: "2:00 PM",
    therapist: "Dra. Ana López",
    type: "Electroterapia",
    status: "pendiente",
  },
  {
    id: 3,
    date: "22 de Enero, 2024",
    time: "11:30 AM",
    therapist: "Dr. Carlos Ruiz",
    type: "Ejercicios Terapéuticos",
    status: "confirmada",
  },
];

const cancelableAppointments = [
  {
    id: 4,
    date: "25 de Enero, 2024",
    time: "9:00 AM",
    therapist: "Dra. Ana López",
    type: "Masoterapia",
    canCancel: true,
  },
  {
    id: 5,
    date: "29 de Enero, 2024",
    time: "3:00 PM",
    therapist: "Dr. Carlos Ruiz",
    type: "Terapia Manual",
    canCancel: true,
  },
];

const medicalRecords = [
  {
    id: 1,
    date: "10 de Enero, 2024",
    type: "Evaluación Inicial",
    therapist: "Dr. Carlos Ruiz",
    diagnosis: "Lumbalgia mecánica",
    notes: "Dolor en región lumbar baja, limitación en flexión anterior",
  },
  {
    id: 2,
    date: "8 de Enero, 2024",
    type: "Sesión de Terapia",
    therapist: "Dra. Ana López",
    treatment: "Electroterapia + Ejercicios",
    progress: "Mejoría del 30% en rango de movimiento",
  },
  {
    id: 3,
    date: "5 de Enero, 2024",
    type: "Seguimiento",
    therapist: "Dr. Carlos Ruiz",
    treatment: "Terapia Manual",
    progress: "Reducción significativa del dolor",
  },
];
export default async function Page () {

  if (await checkRole("admin")) {
      redirect("/admin");
    }else{
      redirect("/pacientes");
    }
    
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            ¡Bienvenid@, Otra vez!
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Aquí puedes gestionar tus citas y revisar tu progreso en el
            tratamiento.
          </p>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="bg-card-secondary border-0">
            <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-text-primary leading-tight">
                  Próxima Cita
                </CardTitle>
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-text-accent flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-base sm:text-lg font-bold text-text-primary">
                15 Ene
              </div>
              <p className="text-xs text-muted-foreground">10:00 AM</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-0">
            <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-text-primary leading-tight">
                  Sesiones
                </CardTitle>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-text-accent flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-base sm:text-lg font-bold text-text-primary">
                {patientData.completedSessions}/{patientData.totalSessions}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(
                  (patientData.completedSessions / patientData.totalSessions) *
                    100,
                )}
                % completado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-0">
            <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-text-primary leading-tight">
                  Expedientes
                </CardTitle>
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-text-accent flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-base sm:text-lg font-bold text-text-primary">
                {medicalRecords.length}
              </div>
              <p className="text-xs text-muted-foreground">Registros</p>
            </CardContent>
          </Card>

          <Card className="bg-card-secondary border-0">
            <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-text-primary leading-tight">
                  Cancelables
                </CardTitle>
                <CalendarX className="h-3 w-3 sm:h-4 sm:w-4 text-text-accent flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-base sm:text-lg font-bold text-text-primary">
                {cancelableAppointments.length}
              </div>
              <p className="text-xs text-muted-foreground">Disponibles</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Citas Próximas */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-0">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-text-primary flex items-center gap-2 text-base sm:text-lg">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-text-accent" />
                  Citas Próximas
                </CardTitle>
                <CardDescription className="text-sm">
                  Tus próximas sesiones de fisioterapia
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-3 sm:space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-background rounded-lg border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <h4 className="font-medium text-text-primary text-sm sm:text-base truncate">
                          {appointment.type}
                        </h4>
                        <Badge
                          variant={
                            appointment.status === "confirmada"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            appointment.status === "confirmada"
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        {appointment.date} - {appointment.time}
                      </p>
                      <p className="text-xs sm:text-sm text-text-accent truncate">
                        {appointment.therapist}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2 flex-shrink-0 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Ver detalles</span>
                      <ChevronRight className="h-4 w-4 sm:hidden" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Expedientes Médicos */}
          <Card className="bg-card border-0">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-text-primary flex items-center gap-2 text-base sm:text-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-text-accent" />
                Expedientes Médicos
              </CardTitle>
              <CardDescription className="text-sm">
                Historial de tratamientos
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 space-y-3 sm:space-y-4">
              {medicalRecords.slice(0, 2).map((record) => (
                <div
                  key={record.id}
                  className="p-3 sm:p-4 bg-background rounded-lg border"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                    <h4 className="font-medium text-text-primary text-sm sm:text-base">
                      {record.type}
                    </h4>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {record.date}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-accent mb-2">
                    {record.therapist}
                  </p>
                  {record.diagnosis && (
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      <strong>Diagnóstico:</strong> {record.diagnosis}
                    </p>
                  )}
                  {record.progress && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      <strong>Progreso:</strong> {record.progress}
                    </p>
                  )}
                </div>
              ))}
              <Button variant="outline" className="w-full text-sm">
                Ver todos los expedientes
              </Button>
            </CardContent>
          </Card>

          {/* Citas por Cancelar */}
          <Card className="bg-card-secondary border-0">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-text-primary flex items-center gap-2 text-base sm:text-lg">
                <CalendarX className="w-4 h-4 sm:w-5 sm:h-5 text-text-accent" />
                Citas por Cancelar
              </CardTitle>
              <CardDescription className="text-sm">
                Citas que puedes cancelar
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 space-y-3 sm:space-y-4">
              {cancelableAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-background rounded-lg border"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-primary mb-1 text-sm sm:text-base truncate">
                      {appointment.type}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      {appointment.date} - {appointment.time}
                    </p>
                    <p className="text-xs sm:text-sm text-text-accent truncate">
                      {appointment.therapist}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-2 flex-shrink-0 text-xs sm:text-sm hover:bg-red-600"
                  >
                    Cancelar
                  </Button>
                </div>
              ))}
              {cancelableAppointments.length === 0 && (
                <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm">
                  No tienes citas disponibles para cancelar
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
