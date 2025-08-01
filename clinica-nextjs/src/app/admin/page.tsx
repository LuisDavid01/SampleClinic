"use client"

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




export default  function AdminDashboard() {

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
            <h1 className="text-3xl font-bold text-text-primary">Clínica Esteban Porras</h1>
            <p className="text-muted-foreground mt-1">Dashboard de Administración</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Hoy</p>
            <p className="text-lg font-semibold text-text-primary">15 Enero, 2025</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pacientes Hoy</p>
                  <p className="text-3xl font-bold text-text-primary">12</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-primary mr-1" />
                    <span className="text-sm text-primary font-medium">+8%</span>
                    <span className="text-sm text-muted-foreground ml-1">vs ayer</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Citas Programadas</p>
                  <p className="text-3xl font-bold text-text-primary">28</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-text-accent mr-1" />
                    <span className="text-sm text-text-accent font-medium">+12%</span>
                    <span className="text-sm text-muted-foreground ml-1">esta semana</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-text-accent/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Salas Disponibles</p>
                  <p className="text-3xl font-bold text-text-primary">
                    3<span className="text-lg text-muted-foreground">/4</span>
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="h-4 w-4 text-complementario mr-1" />
                    <span className="text-sm text-complementario font-medium">-25%</span>
                    <span className="text-sm text-muted-foreground ml-1">ocupación</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-complementario/10 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-complementario" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
                  <p className="text-3xl font-bold text-text-primary">
                    45<span className="text-lg text-muted-foreground">min</span>
                  </p>
                  <div className="flex items-center mt-2">
                    <Clock className="h-4 w-4 text-secondary mr-1" />
                    <span className="text-sm text-secondary font-medium">Óptimo</span>
                    <span className="text-sm text-muted-foreground ml-1">por sesión</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-secondary" />
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
                <CardTitle className="text-lg font-semibold text-text-primary">Tendencias Mensuales</CardTitle>
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
                        <stop offset="5%" stopColor="var(--text-accent)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--text-accent)" stopOpacity={0} />
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
                      stroke="var(--text-accent)"
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
              <CardTitle className="text-lg font-semibold text-text-primary">Distribución de Tratamientos</CardTitle>
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

        
      </div>
    </div>
  )
}
