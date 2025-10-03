"use client"

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useApiClient, apiEndpoints } from "@/utils/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	Users,
	Calendar,
	Activity,
	Clock,
	TrendingUp,
	TrendingDown,
	Search,
	Filter,
	MoreHorizontal,
} from "lucide-react"
import {
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	AreaChart,
	Area,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	Radar,
} from "recharts"

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

export default function AdminDashboard() {
  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();
  const apiClient = useApiClient();
  const [userValidation, setUserValidation] = useState<UserValidation>({
    status: 'pending',
    message: '',
    userData: null
  });

  useEffect(() => {
    const validateUser = async () => {
      if (isSignedIn && user) {
        setUserValidation({ status: 'validating', message: 'Validando usuario...', userData: null });
        
        try {
          const token = await getToken();
          
          if (token && token.split('.').length === 3) {
            console.log("🔄 Validación de usuario en admin iniciada...");
            
            try {
              // Obtener perfil del usuario desde Clerk
              const profileResult = await apiClient.get(apiEndpoints.clerkProfile());
              console.log("✅ Usuario validado en admin:", profileResult);
              
              if (profileResult.dbUser) {
                setUserValidation({
                  status: 'validated',
                  message: 'Usuario validado correctamente',
                  userData: profileResult.dbUser
                });
                
                console.log("👤 Usuario admin en base de datos:");
                console.log("  - ID:", profileResult.dbUser.idUsuario);
                console.log("  - Nombre:", profileResult.dbUser.nombre);
                console.log("  - Email:", profileResult.dbUser.correoElectronico);
                console.log("  - Rol:", profileResult.dbUser.rol?.nombreRol);
              }
            } catch (apiError) {
              console.error("❌ Error en validación de admin:", apiError);
              const errorMessage = apiError instanceof Error ? apiError.message : 'Error desconocido';
              setUserValidation({
                status: 'error',
                message: `Error al validar usuario: ${errorMessage}`,
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
          console.error("❌ Error obteniendo token en admin:", error);
          setUserValidation({
            status: 'error',
            message: 'Error de autenticación',
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

    validateUser();
  }, [isSignedIn, user, getToken]);

	const monthlyData = [
		{ month: "Ene", consultas: 180, terapias: 165 },
		{ month: "Feb", consultas: 220, terapias: 195 },
		{ month: "Mar", consultas: 195, terapias: 180 },
		{ month: "Abr", consultas: 240, terapias: 220 },
		{ month: "May", consultas: 280, terapias: 250 },
		{ month: "Jun", consultas: 320, terapias: 290 },
	]

	const treatmentData = [
		{ treatment: "Fisioterapia", value: 85 },
		{ treatment: "Rehabilitación", value: 70 },
		{ treatment: "Masoterapia", value: 60 },
		{ treatment: "Electroterapia", value: 45 },
		{ treatment: "Ejercicios", value: 90 },
		{ treatment: "Evaluación", value: 75 },
	]

	const todayAppointments = [
		{
			id: 1,
			name: "María González",
			time: "09:00",
			treatment: "Fisioterapia",
			avatar: "/placeholder.svg?height=32&width=32",
		},
		{
			id: 2,
			name: "Carlos Rodríguez",
			time: "10:30",
			treatment: "Rehabilitación",
			avatar: "/placeholder.svg?height=32&width=32",
		},
		{
			id: 3,
			name: "Ana Martínez",
			time: "11:45",
			treatment: "Masoterapia",
			avatar: "/placeholder.svg?height=32&width=32",
		},
		{
			id: 4,
			name: "Luis Fernández",
			time: "14:00",
			treatment: "Electroterapia",
			avatar: "/placeholder.svg?height=32&width=32",
		},
	]

	const recentPatients = [
		{
			id: 1,
			name: "María González",
			lastVisit: "15-01-2025",
			age: 45,
			treatment: "Fisioterapia",
			status: "Activo",
			avatar: "/placeholder.svg?height=32&width=32",
		},
		{
			id: 2,
			name: "Carlos Rodríguez",
			lastVisit: "14-01-2025",
			age: 38,
			treatment: "Rehabilitación",
			status: "En tratamiento",
			avatar: "/placeholder.svg?height=32&width=32",
		},
		{
			id: 3,
			name: "Ana Martínez",
			lastVisit: "13-01-2025",
			age: 52,
			treatment: "Masoterapia",
			status: "Completado",
			avatar: "/placeholder.svg?height=32&width=32",
		},
		{
			id: 4,
			name: "Luis Fernández",
			lastVisit: "12-01-2025",
			age: 29,
			treatment: "Electroterapia",
			status: "Activo",
			avatar: "/placeholder.svg?height=32&width=32",
		},
	]
	return (
		<div className="min-h-screen bg-background p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold ">Clínica Esteban Porras</h1>
						<p className="text-muted-foreground mt-1">Dashboard de Administración</p>
					</div>
					<div className="text-right">
						<p className="text-sm text-muted-foreground">Hoy</p>
						<p className="text-lg font-semibold ">{new Date().toLocaleDateString("es-ES", { timeZone: "UTC" })}</p>
					</div>
				</div>

				{/* Indicador de estado de validación del usuario */}
				{userValidation.status !== 'pending' && (
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
				)}

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<Card className="bg-card border-0 shadow-sm">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Pacientes Hoy</p>
									<p className="text-3xl font-bold ">12</p>
									<div className="flex items-center mt-2">
										<TrendingUp className="h-4 w-4 text-accent mr-1" />
										<span className="text-sm text-accent font-medium">+8%</span>
										<span className="text-sm text-muted-foreground ml-1">vs ayer</span>
									</div>
								</div>
								<div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
									<Users className="h-6 w-6 text-accent" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-0 shadow-sm">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Citas Programadas</p>
									<p className="text-3xl font-bold ">28</p>
									<div className="flex items-center mt-2">
										<TrendingUp className="h-4 w-4 text-accent mr-1" />
										<span className="text-sm text-accent font-medium">+12%</span>
										<span className="text-sm text-muted-foreground ml-1">esta semana</span>
									</div>
								</div>
								<div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
									<Calendar className="h-6 w-6 text-accent" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-0 shadow-sm">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Salas Disponibles</p>
									<p className="text-3xl font-bold ">
										3<span className="text-lg text-muted-foreground">/4</span>
									</p>
									<div className="flex items-center mt-2">
										<TrendingDown className="h-4 w-4 text-complementario mr-1" />
										<span className="text-sm text-complementario font-medium">-25%</span>
										<span className="text-sm text-muted-foreground ml-1">ocupación</span>
									</div>
								</div>
								<div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
									<Activity className="h-6 w-6 text-accent" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-0 shadow-sm">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
									<p className="text-3xl font-bold ">
										45<span className="text-lg text-muted-foreground">min</span>
									</p>
									<div className="flex items-center mt-2">
										<Clock className="h-4 w-4  mr-1" />
										<span className="text-sm  font-medium">Óptimo</span>
										<span className="text-sm text-muted-foreground ml-1">por sesión</span>
									</div>
								</div>
								<div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
									<Clock className="h-6 w-6 text-accent" />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Charts Section */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Monthly Trends */}
					<Card className="lg:col-span-2 bg-card border-0 shadow-sm">
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg font-semibold ">Tendencias Mensuales</CardTitle>
								<Button variant="outline" size="sm" className="text-xs bg-transparent">
									Este Año
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={monthlyData}>
										<defs>
											<linearGradient id="consultas" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
												<stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
											</linearGradient>
											<linearGradient id="terapias" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
												<stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" />
										<XAxis dataKey="month" stroke="var(--muted-foreground)" />
										<YAxis stroke="var(--muted-foreground)" />
										<Area
											type="monotone"
											dataKey="consultas"
											stroke="var(--primary)"
											fillOpacity={1}
											fill="url(#consultas)"
											strokeWidth={2}
										/>
										<Area
											type="monotone"
											dataKey="terapias"
											stroke="var(--accent)"
											fillOpacity={1}
											fill="url(#terapias)"
											strokeWidth={2}
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
							<div className="flex items-center justify-center space-x-6 mt-4">
								<div className="flex items-center">
									<div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
									<span className="text-sm text-muted-foreground">Consultas</span>
								</div>
								<div className="flex items-center">
									<div className="w-3 h-3 bg-text-accent rounded-full mr-2"></div>
									<span className="text-sm text-muted-foreground">Terapias</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Treatment Distribution */}
					<Card className="bg-card border-0 shadow-sm">
						<CardHeader className="pb-4">
							<CardTitle className="text-lg font-semibold ">Distribución de Tratamientos</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<RadarChart data={treatmentData}>
										<PolarGrid stroke="var(--muted)" />
										<PolarAngleAxis dataKey="treatment" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
										<PolarRadiusAxis
											angle={90}
											domain={[0, 100]}
											tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
										/>
										<Radar
											name="Tratamientos"
											dataKey="value"
											stroke="var(--primary)"
											fill="var(--primary)"
											fillOpacity={0.2}
											strokeWidth={2}
										/>
									</RadarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Bottom Section */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Today's Appointments */}
					<Card className="bg-card border-0 shadow-sm">
						<CardHeader className="pb-4">
							<CardTitle className="text-lg font-semibold ">Citas de Hoy</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{todayAppointments.map((appointment) => (
								<div key={appointment.id} className="flex items-center space-x-3">
									<Avatar className="h-10 w-10">
										<AvatarImage src={appointment.avatar || "/placeholder.svg"} />
										<AvatarFallback className="bg-primary/10 text-primary">
											{appointment.name
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium  truncate">{appointment.name}</p>
										<p className="text-xs text-muted-foreground">{appointment.treatment}</p>
									</div>
									<div className="text-right">
										<p className="text-sm font-medium ">{appointment.time}</p>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Recent Patients */}
					<Card className="lg:col-span-2 bg-card border-0 shadow-sm">
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg font-semibold ">Pacientes Recientes</CardTitle>
								<div className="flex items-center space-x-2">
									<div className="relative">
										<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
										<Input placeholder="Buscar paciente..." className="pl-8 w-64 bg-input border-0" />
									</div>
									<Button variant="outline" size="sm">
										<Filter className="h-4 w-4 mr-2" />
										Filtrar
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow className="border-muted">
										<TableHead className="text-muted-foreground">Paciente</TableHead>
										<TableHead className="text-muted-foreground">Última Visita</TableHead>
										<TableHead className="text-muted-foreground">Edad</TableHead>
										<TableHead className="text-muted-foreground">Tratamiento</TableHead>
										<TableHead className="text-muted-foreground">Estado</TableHead>
										<TableHead className="text-muted-foreground w-12"></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{recentPatients.map((patient) => (
										<TableRow key={patient.id} className="border-muted">
											<TableCell>
												<div className="flex items-center space-x-3">
													<Avatar className="h-8 w-8">
														<AvatarImage src={patient.avatar || "/placeholder.svg"} />
														<AvatarFallback className="bg-primary/10 text-primary text-xs">
															{patient.name
																.split(" ")
																.map((n) => n[0])
																.join("")}
														</AvatarFallback>
													</Avatar>
													<span className="font-medium ">{patient.name}</span>
												</div>
											</TableCell>
											<TableCell className="text-muted-foreground">{patient.lastVisit}</TableCell>
											<TableCell className="text-muted-foreground">{patient.age}</TableCell>
											<TableCell className="text-muted-foreground">{patient.treatment}</TableCell>
											<TableCell>
												<Badge
													variant={
														patient.status === "Activo"
															? "default"
															: patient.status === "En tratamiento"
																? "secondary"
																: "outline"
													}
													className={
														patient.status === "Activo"
															? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
															: patient.status === "En tratamiento"
																? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
																: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
													}
												>
													{patient.status}
												</Badge>
											</TableCell>
											<TableCell>
												<Button variant="ghost" size="sm">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>


			</div>
		</div>
	)
}
