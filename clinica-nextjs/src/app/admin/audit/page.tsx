"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Shield, Eye, Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, RefreshCw } from 'lucide-react'

// Mock data
const mockAuditLogs = [
  {
    id: 1,
    timestamp: new Date('2025-08-06T10:30:00'),
    user: {
      name: "Dra. María García",
      role: "Doctor",
      id: "DOC001"
    },
    action: "expediente_consultado",
    category: "expedientes",
    entity: "Expediente #EXP-2025-001",
    description: "Expediente consultado para paciente Juan Pérez",
    details: {
      patientName: "Juan Pérez",
      patientId: "PAT-001",
      ipAddress: "192.168.1.100",
      sessionId: "sess_123456"
    },
    status: "exitoso"
  },
  {
    id: 2,
    timestamp: new Date('2025-08-06T09:15:00'),
    user: {
      name: "Admin Sistema",
      role: "Administrador",
      id: "ADM001"
    },
    action: "rol_asignado",
    category: "usuarios",
    entity: "Usuario: Ana López",
    description: "Rol 'Asistente' asignado a usuario Ana López",
    details: {
      targetUser: "Ana López",
      targetUserId: "USR-005",
      newRole: "Asistente",
      previousRole: "Sin rol"
    },
    status: "exitoso"
  },
  {
    id: 3,
    timestamp: new Date('2025-08-06T08:45:00'),
    user: {
      name: "Dr. Carlos Rodríguez",
      role: "Doctor",
      id: "DOC002"
    },
    action: "inicio_sesion_exitoso",
    category: "autenticacion",
    entity: "Sistema",
    description: "Inicio de sesión exitoso desde dispositivo móvil",
    details: {
      device: "Mobile",
      browser: "Chrome Mobile",
      ipAddress: "192.168.1.105"
    },
    status: "exitoso"
  },
  {
    id: 4,
    timestamp: new Date('2025-08-06T14:20:00'),
    user: {
      name: "Recepcionista María",
      role: "Asistente",
      id: "AST001"
    },
    action: "cita_cancelada",
    category: "citas",
    entity: "Cita #CIT-2025-150",
    description: "Cita cancelada por solicitud del paciente",
    details: {
      patientName: "Pedro Jiménez",
      doctorName: "Dra. Laura Vega",
      originalDate: "2025-08-08T15:00:00",
      reason: "Solicitud del paciente",
      cancellationTime: "2025-08-06T14:20:00"
    },
    status: "exitoso"
  },
  {
    id: 5,
    timestamp: new Date('2025-08-06T07:30:00'),
    user: {
      name: "Usuario Desconocido",
      role: "N/A",
      id: "UNKNOWN"
    },
    action: "inicio_sesion_fallido",
    category: "autenticacion",
    entity: "Sistema",
    description: "Intento fallido de inicio de sesión - credenciales incorrectas",
    details: {
      attemptedUser: "admin@clinic.com",
      ipAddress: "192.168.1.200",
      reason: "Credenciales incorrectas"
    },
    status: "fallido"
  },
  {
    id: 6,
    timestamp: new Date('2025-08-06T16:45:00'),
    user: {
      name: "Dra. Laura Vega",
      role: "Doctor",
      id: "DOC003"
    },
    action: "expediente_modificado",
    category: "expedientes",
    entity: "Expediente #EXP-2025-002",
    description: "Expediente actualizado - diagnóstico y tratamiento",
    details: {
      patientName: "Ana Martínez",
      patientId: "PAT-002",
      fieldsModified: ["diagnóstico", "tratamiento", "medicamentos"],
      ipAddress: "192.168.1.110"
    },
    status: "exitoso"
  },
  {
    id: 7,
    timestamp: new Date('2025-08-06T11:20:00'),
    user: {
      name: "Recepcionista Carlos",
      role: "Asistente",
      id: "AST002"
    },
    action: "cita_programada",
    category: "citas",
    entity: "Cita #CIT-2025-151",
    description: "Cita programada para paciente Luis González con Dr. Martín",
    details: {
      patientName: "Luis González",
      doctorName: "Dr. Martín Ruiz",
      appointmentDate: "2025-08-10T09:00:00",
      type: "Consulta general"
    },
    status: "exitoso"
  },
  {
    id: 8,
    timestamp: new Date('2025-08-06T13:10:00'),
    user: {
      name: "Admin Sistema",
      role: "Administrador",
      id: "ADM001"
    },
    action: "usuario_creado",
    category: "usuarios",
    entity: "Usuario: Dr. Roberto Silva",
    description: "Usuario creado: Dr. Roberto Silva - Rol: Doctor",
    details: {
      newUser: "Dr. Roberto Silva",
      newUserId: "DOC004",
      assignedRole: "Doctor",
      email: "roberto.silva@clinic.com"
    },
    status: "exitoso"
  }
]

const categoryConfig = {
  expedientes: {
    label: "Expedientes",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",

  },
  usuarios: {
    label: "Usuarios",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",

  },
  autenticacion: {
    label: "Autenticación",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",

  },
  citas: {
    label: "Citas",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",

  }
}

const statusConfig = {
  exitoso: {
    label: "Exitoso",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  },
  fallido: {
    label: "Fallido",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  }
}

export default function AuditDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = mockAuditLogs.map(log => ({
      id: log.user.id,
      name: log.user.name,
      role: log.user.role
    }))
    return Array.from(new Map(users.map(user => [user.id, user])).values())
  }, [])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = mockAuditLogs.filter(log => {
      const matchesSearch = searchTerm === "" || 
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = categoryFilter === "all" || log.category === categoryFilter
      const matchesUser = userFilter === "all" || log.user.id === userFilter
      const matchesStatus = statusFilter === "all" || log.status === statusFilter

      return matchesSearch && matchesCategory && matchesUser && matchesStatus
    })

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof typeof a]
      let bValue = b[sortField as keyof typeof b]

      if (sortField === "user") {
        aValue = a.user.name
        bValue = b.user.name
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return 0
    })

    return filtered
  }, [searchTerm, categoryFilter, userFilter, statusFilter, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setUserFilter("all")
    setStatusFilter("all")
    setCurrentPage(1)
  }

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }


  // Stats for header
  const todayLogs = mockAuditLogs.filter(log => {
    const today = new Date()
    return log.timestamp.toDateString() === today.toDateString()
  }).length

  const thisWeekLogs = mockAuditLogs.filter(log => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return log.timestamp >= weekAgo
  }).length

  const thisMonthLogs = mockAuditLogs.filter(log => {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return log.timestamp >= monthAgo
  }).length

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Auditoria</h1>
              <p className="text-muted-foreground">
                Registro de las actividades del sistema
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground w-4 h-4" />
                  <input
                    placeholder="Buscar en registros..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-background border border-muted rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
                  />
                </div>
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="exitoso">Exitoso</SelectItem>
                    <SelectItem value="fallido">Fallido</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={clearFilters} size="icon">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desktop Table */}
        <Card className="hidden lg:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("timestamp")}
                    >
                      <div className="flex items-center gap-2">
                        Fecha y Hora
                        {sortField === "timestamp" && (
                          <div className="text-xs">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </div>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("user")}
                    >
                      <div className="flex items-center gap-2">
                        Usuario
                        {sortField === "user" && (
                          <div className="text-xs">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </div>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((log) => {
                    const categoryConfig_ = categoryConfig[log.category as keyof typeof categoryConfig]
                    const statusConfig_ = statusConfig[log.status as keyof typeof statusConfig]
                    
                    return (
                      <TableRow key={log.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.user.name}</div>
                            <div className="text-sm text-muted-foreground">{log.user.role}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={categoryConfig_?.color}>
                              {categoryConfig_?.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{log.entity}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.description}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig_?.color}>
                            {statusConfig_?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalles del Registro de Auditoría</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Fecha y Hora</label>
                                    <p className="text-sm text-muted-foreground font-mono">
                                      {formatTimestamp(log.timestamp)}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Usuario</label>
                                    <p className="text-sm text-muted-foreground">
                                      {log.user.name} ({log.user.role})
                                    </p>
                                  </div>
                                </div>
                                <Separator />
                                <div>
                                  <label className="text-sm font-medium">Descripción</label>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {log.description}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Entidad Afectada</label>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {log.entity}
                                  </p>
                                </div>
                                <Separator />
                                <div>
                                  <label className="text-sm font-medium">Detalles Técnicos</label>
                                  <div className="mt-2 p-3 bg-muted rounded-lg">
                                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                                      {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {paginatedData.map((log) => {
            const categoryConfig_ = categoryConfig[log.category as keyof typeof categoryConfig]
            const statusConfig_ = statusConfig[log.status as keyof typeof statusConfig]
            
            return (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={categoryConfig_?.color}>
                        {categoryConfig_?.label}
                      </Badge>
                    </div>
                    <Badge className={statusConfig_?.color}>
                      {statusConfig_?.label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium text-sm">{log.user.name}</p>
                      <p className="text-xs text-muted-foreground">{log.user.role}</p>
                    </div>
                    
                    <p className="text-sm">{log.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground font-mono">
                        {formatTimestamp(log.timestamp)}
                      </p>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Ver más
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detalles del Registro</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Descripción</label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {log.description}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Entidad</label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {log.entity}
                              </p>
                            </div>
                            <Separator />
                            <div>
                              <label className="text-sm font-medium">Detalles</label>
                              <div className="mt-2 p-3 bg-muted rounded-lg">
                                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Pagination */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mostrar</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  de {filteredAndSortedData.length} registros
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-sm px-4">
                  Página {currentPage} de {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
