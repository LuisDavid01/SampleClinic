"use client"

import { useState, useEffect, useMemo, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useApiClient, apiEndpoints } from "@/utils/apiClient";
import { LogoImage } from "@/components/LogoImage";
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


export default function AdminDashboard() {
  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();
  const apiClient = useApiClient();
  const [stats, setStats] = useState({
    pacientesHoy: 0,
    cambioPacientes: 0,
    citasProgramadas: 0,
    cambioCitas: 0,
    tiempoPromedio: 45,
    citasHoy: [] as any[],
    pacientesRecientes: [] as any[],
    monthlyData: [] as any[],
    treatmentData: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  // Cargar estadísticas del dashboard
  useEffect(() => {
    // Prevenir múltiples llamadas simultáneas
    if (loadingRef.current || !isSignedIn) {
      return;
    }

    const cargarEstadisticas = async () => {
      if (loadingRef.current) return;
      
      loadingRef.current = true;
      try {
        setLoading(true);
        // Agregar timeout usando Promise.race para evitar que la página se quede colgada
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: La solicitud tardó más de 10 segundos')), 10000)
        );
        
        const fetchPromise = apiClient.get("/citas/dashboard/estadisticas");
        
        const response = await Promise.race([fetchPromise, timeoutPromise]) as any;
        setStats(response);
      } catch (error: any) {
        console.error("Error cargando estadísticas:", error);
        // Usar valores por defecto en caso de error o timeout
        setStats({
          pacientesHoy: 0,
          cambioPacientes: 0,
          citasProgramadas: 0,
          cambioCitas: 0,
          tiempoPromedio: 45,
          citasHoy: [],
          pacientesRecientes: [],
          monthlyData: [],
          treatmentData: []
        });
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };

    cargarEstadisticas();
  }, [isSignedIn]); // Removido apiClient de las dependencias
	return (
		<div className="w-full bg-gradient-to-br from-[#E8CF9C]/5 via-background to-[#2B8181]/5">
			<div className="max-w-7xl mx-auto p-6 space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div className="flex items-center gap-3 sm:gap-4">
						<div className="flex items-center gap-2 sm:gap-3">
							<LogoImage 
								width={48}
								height={48}
								className="h-10 w-auto sm:h-12 object-contain"
							/>
							<div>
								<h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#2B8181] to-[#EE7132] bg-clip-text text-transparent">Clínica Salena</h1>
								<p className="text-xs sm:text-sm text-foreground/80 mt-1 font-medium hidden sm:block">Dashboard de Administración</p>
							</div>
						</div>
					</div>
					<div className="text-left sm:text-right">
						<p className="text-xs sm:text-sm text-foreground/70 font-medium">Hoy</p>
						<p className="text-base sm:text-lg font-bold text-[#2B8181]">{new Date().toLocaleDateString("es-ES", { timeZone: "UTC" })}</p>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<Card className="bg-card border-2 border-[#2B8181]/30 shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
						<CardContent className="p-6 flex-1 flex flex-col">
							<div className="flex items-start justify-between flex-1">
								<div className="flex-1 min-w-0">
									<div className="h-5 mb-3 flex items-center">
										<p className="text-sm font-medium text-foreground">Pacientes Hoy</p>
									</div>
									<div className="h-10 flex items-end mb-2">
										<p className="text-3xl font-bold leading-none text-[#2B8181]">{loading ? "..." : stats.pacientesHoy}</p>
									</div>
									<div className="flex items-center flex-wrap gap-1 mt-auto">
										{stats.cambioPacientes >= 0 ? (
											<TrendingUp className="h-4 w-4 text-[#2B8181] flex-shrink-0" />
										) : (
											<TrendingDown className="h-4 w-4 text-[#EE7132] flex-shrink-0" />
										)}
										<span className={`text-sm font-semibold ${stats.cambioPacientes >= 0 ? 'text-[#2B8181]' : 'text-[#EE7132]'}`}>
											{stats.cambioPacientes >= 0 ? '+' : ''}{stats.cambioPacientes}%
										</span>
										<span className="text-sm text-foreground/70">vs Ayer</span>
									</div>
								</div>
								<div className="h-12 w-12 bg-[#2B8181]/10 rounded-lg flex items-center justify-center flex-shrink-0 ml-4">
									<Users className="h-6 w-6 text-[#2B8181]" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-2 border-[#EE7132]/30 shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
						<CardContent className="p-6 flex-1 flex flex-col">
							<div className="flex items-start justify-between flex-1">
								<div className="flex-1 min-w-0">
									<div className="h-5 mb-3 flex items-center">
										<p className="text-sm font-medium text-foreground">Citas Programadas</p>
									</div>
									<div className="h-10 flex items-end mb-2">
										<p className="text-3xl font-bold leading-none text-[#EE7132]">{loading ? "..." : stats.citasProgramadas}</p>
									</div>
									<div className="flex items-center flex-wrap gap-1 mt-auto">
										{stats.cambioCitas >= 0 ? (
											<TrendingUp className="h-4 w-4 text-[#2B8181] flex-shrink-0" />
										) : (
											<TrendingDown className="h-4 w-4 text-[#EE7132] flex-shrink-0" />
										)}
										<span className={`text-sm font-semibold ${stats.cambioCitas >= 0 ? 'text-[#2B8181]' : 'text-[#EE7132]'}`}>
											{stats.cambioCitas >= 0 ? '+' : ''}{stats.cambioCitas}%
										</span>
										<span className="text-sm text-foreground/70">Esta semana</span>
									</div>
								</div>
								<div className="h-12 w-12 bg-[#EE7132]/10 rounded-lg flex items-center justify-center flex-shrink-0 ml-4">
									<Calendar className="h-6 w-6 text-[#EE7132]" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-2 border-[#EE7132]/30 shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
						<CardContent className="p-6 flex-1 flex flex-col">
							<div className="flex items-start justify-between flex-1">
								<div className="flex-1 min-w-0">
									<div className="h-5 mb-3 flex items-center">
										<p className="text-sm font-medium text-foreground">Citas de Hoy</p>
									</div>
									<div className="h-10 flex items-end mb-2">
										<p className="text-3xl font-bold leading-none text-[#EE7132]">{loading ? "..." : stats.citasHoy.length}</p>
									</div>
									<div className="flex items-center flex-wrap gap-1 mt-auto">
										<Calendar className="h-4 w-4 text-[#EE7132] flex-shrink-0" />
										<span className="text-sm text-[#EE7132] font-semibold">Total</span>
										<span className="text-sm text-foreground/70">Citas programadas</span>
									</div>
								</div>
								<div className="h-12 w-12 bg-[#EE7132]/10 rounded-lg flex items-center justify-center flex-shrink-0 ml-4">
									<Activity className="h-6 w-6 text-[#EE7132]" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-2 border-[#1a5f5f]/30 shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
						<CardContent className="p-6 flex-1 flex flex-col">
							<div className="flex items-start justify-between flex-1">
								<div className="flex-1 min-w-0">
									<div className="h-5 mb-3 flex items-center">
										<p className="text-sm font-medium text-foreground">Tiempo Promedio</p>
									</div>
									<div className="h-10 flex items-end mb-2">
										<p className="text-3xl font-bold leading-none text-[#1a5f5f]">
											{loading ? "..." : stats.tiempoPromedio}<span className="text-lg text-foreground/70 ml-1">min</span>
										</p>
									</div>
									<div className="flex items-center flex-wrap gap-1 mt-auto">
										<Clock className="h-4 w-4 text-[#1a5f5f] mr-1 flex-shrink-0" />
										<span className="text-sm font-semibold text-[#1a5f5f]">Óptimo</span>
										<span className="text-sm text-foreground/70">Por sesión</span>
									</div>
								</div>
								<div className="h-12 w-12 bg-[#1a5f5f]/10 rounded-lg flex items-center justify-center flex-shrink-0 ml-4">
									<Clock className="h-6 w-6 text-[#1a5f5f]" />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Charts Section */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Monthly Trends */}
					<Card className="lg:col-span-2 bg-card border-2 border-[#2B8181]/20 shadow-md hover:shadow-lg transition-shadow">
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg font-semibold ">Tendencias Mensuales</CardTitle>
								<Button variant="outline" size="sm" className="text-xs bg-card border-2 border-[#2B8181]/20 hover:bg-[#2B8181]/10 hover:text-[#2B8181]">
									Este Año
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={stats.monthlyData.length > 0 ? stats.monthlyData : []}>
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
									<div className="w-3 h-3 bg-[#2B8181] rounded-full mr-2 border border-[#2B8181]/50"></div>
									<span className="text-sm font-medium text-foreground">Consultas</span>
								</div>
								<div className="flex items-center">
									<div className="w-3 h-3 bg-[#EE7132] rounded-full mr-2 border border-[#EE7132]/50"></div>
									<span className="text-sm font-medium text-foreground">Terapias</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Treatment Distribution */}
					<Card className="bg-card border-2 border-[#EE7132]/20 shadow-md hover:shadow-lg transition-shadow">
						<CardHeader className="pb-4">
							<CardTitle className="text-lg font-semibold ">Distribución de Tratamientos</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<RadarChart data={stats.treatmentData.length > 0 ? stats.treatmentData : []}>
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
					<Card className="bg-card border-2 border-[#EE7132]/20 shadow-md hover:shadow-lg transition-shadow">
						<CardHeader className="pb-4">
							<CardTitle className="text-lg font-semibold ">Citas de Hoy</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{loading ? (
								<div className="text-center py-4 text-foreground/70 font-medium">Cargando...</div>
							) : stats.citasHoy.length === 0 ? (
								<div className="text-center py-4 text-foreground/70 font-medium">No hay citas programadas para hoy</div>
							) : (
								stats.citasHoy.map((appointment) => (
								<div key={appointment.id} className="flex items-center space-x-3">
									<Avatar className="h-10 w-10">
										<AvatarImage src={appointment.avatar || "/placeholder.svg"} />
										<AvatarFallback className="bg-[#2B8181]/10 text-[#2B8181]">
											{appointment.name
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-foreground truncate">{appointment.name}</p>
										<p className="text-xs text-foreground/70">{appointment.treatment}</p>
									</div>
									<div className="text-right">
										<p className="text-sm font-semibold text-[#2B8181]">{appointment.time}</p>
									</div>
								</div>
								))
							)}
						</CardContent>
					</Card>

					{/* Recent Patients */}
					<Card className="lg:col-span-2 bg-card border-2 border-[#2B8181]/20 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
						<CardHeader className="pb-4">
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 w-full">
								<CardTitle className="text-lg font-semibold">Pacientes Recientes</CardTitle>
								<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 w-full sm:w-auto min-w-0">
									<div className="relative w-full sm:w-auto min-w-0 flex-1 sm:flex-initial">
										<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
										<Input 
											placeholder="Buscar paciente..." 
											className="pl-8 w-full sm:w-64 bg-card border-2 border-[#2B8181]/20 focus:border-[#2B8181] min-w-0" 
										/>
									</div>
									<Button 
										variant="outline" 
										size="sm" 
										className="border-2 border-[#2B8181]/20 hover:bg-[#2B8181]/10 hover:text-[#2B8181] w-full sm:w-auto flex-shrink-0"
									>
										<Filter className="h-4 w-4 mr-2" />
										Filtrar
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow className="border-[#2B8181]/20 bg-[#2B8181]/5">
										<TableHead className="text-foreground font-semibold">Paciente</TableHead>
										<TableHead className="text-foreground font-semibold">Última Visita</TableHead>
										<TableHead className="text-foreground font-semibold">Edad</TableHead>
										<TableHead className="text-foreground font-semibold">Tratamiento</TableHead>
										<TableHead className="text-foreground font-semibold">Estado</TableHead>
										<TableHead className="text-foreground font-semibold w-12"></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{loading ? (
										<TableRow>
											<TableCell colSpan={6} className="text-center py-4 text-foreground/70 font-medium">
												Cargando...
											</TableCell>
										</TableRow>
									) : stats.pacientesRecientes.length === 0 ? (
										<TableRow>
											<TableCell colSpan={6} className="text-center py-4 text-foreground/70 font-medium">
												No hay pacientes recientes
											</TableCell>
										</TableRow>
									) : (
										stats.pacientesRecientes.map((patient) => (
										<TableRow key={patient.id} className="border-[#2B8181]/10 hover:bg-[#2B8181]/5">
											<TableCell>
												<div className="flex items-center space-x-3">
													<Avatar className="h-8 w-8">
														<AvatarImage src={patient.avatar || "/placeholder.svg"} />
														<AvatarFallback className="bg-[#2B8181]/10 text-[#2B8181] text-xs">
															{patient.name
																.split(" ")
																.map((n) => n[0])
																.join("")}
														</AvatarFallback>
													</Avatar>
													<span className="font-semibold text-foreground">{patient.name}</span>
												</div>
											</TableCell>
											<TableCell className="text-foreground/80">{patient.lastVisit}</TableCell>
											<TableCell className="text-foreground/80">{patient.age}</TableCell>
											<TableCell className="text-foreground/80">{patient.treatment}</TableCell>
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
										))
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>


			</div>
		</div>
	)
}
