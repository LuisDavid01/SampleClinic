'use client'

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  PlusIcon,  
  User,
  RefreshCw,
   Filter,
   Search,
   ChevronRight,
   ChevronLeft,
   ChevronsLeft,
   ChevronsRight,
   Star,
   Users
} from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import { useApiClient, apiEndpoints } from "@/utils/apiClient"
import { inactivarUsuario } from "@/actions/usuarios"
import { useNotification } from "@/components/UseNotification"
import NewFisioterapeutaDialog from "@/components/NewFisioterapeutaDialog"

const statusConfig = {
  activo: {
    label: "Activo",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  },
  inactivo: {
    label: "Inactivo",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  }
}

interface TeamMember {
  idUsuario: number
  nombre: string
  apellido1: string
  apellido2: string | null
  correoElectronico: string
  activo: boolean
  fechaRegistro: Date | string
  rol?: {
    idRol: number
    nombreRol: string
  }
}

export default function TeamPage() {
  const apiClient = useApiClient()
  const { showNotification } = useNotification?.() ?? { showNotification: () => {} }
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const [processingUserId, setProcessingUserId] = useState<number | null>(null)
  const [isNewFisioterapeutaDialogOpen, setIsNewFisioterapeutaDialogOpen] = useState(false)

  const { isLoading, data: teamData, refetch } = useQuery<{
    usuarios: TeamMember[]
    total: number
    totalPaginas: number
  }>({
    queryKey: ['team-members', page, search, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        rol: 'fisioterapeuta',
        ...(search && { search }),
      })
      const res = await apiClient.get(`${apiEndpoints.getUsuarios()}?${params}`)
      return {
        usuarios: res.usuarios || [],
        total: res.total || 0,
        totalPaginas: res.totalPaginas || 1
      }
    },
    staleTime: 60 * 1000,
  })

  const teamMembers = teamData?.usuarios || []
  const total = teamData?.total || 0
  const totalPaginas = teamData?.totalPaginas || 1

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
              <Users className="h-6 w-6  text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Equipo</h1>
              <p className="text-muted-foreground">
                Gestiona el personal de la clinica
              </p>
            </div>
          </div>
          
          {/* <Button 
            className="cursor-pointer"
            onClick={() => setIsNewFisioterapeutaDialogOpen(true)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Nuevo miembro del equipo
          </Button> */}
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
                            className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-background border border-muted rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <Select defaultValue="all" >
                        <SelectTrigger>
                          <SelectValue placeholder="Roles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas los Roles</SelectItem>
                          
                        </SelectContent>
                      </Select>
        
                      <div className="flex gap-2">
                        <Select defaultValue="all">
                          <SelectTrigger>
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="exitoso">Activo</SelectItem>
                            <SelectItem value="fallido">Inactivo</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button variant="outline" size="icon" onClick={() => refetch()}>
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
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Cargando...</TableCell>
                    </TableRow>
                  ) : teamMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No hay miembros del equipo</TableCell>
                    </TableRow>
                  ) : (
                    teamMembers.map((member) => {
                      const statusConfig_ = statusConfig[member.activo ? 'activo' : 'inactivo']
                      const fullName = `${member.nombre} ${member.apellido1}${member.apellido2 ? ' ' + member.apellido2 : ''}`
                      
                      return (
                        <TableRow key={member.idUsuario} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {fullName}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            <div className="flex items-center gap-2">
                              {member.rol?.nombreRol || 'Fisioterapeuta'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusConfig_?.color}>
                              {statusConfig_?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {formatRelativeTime(member.fechaRegistro)}
                          </TableCell>
                          <TableCell className="max-w-xs overflow-hidden truncate">
                            {member.correoElectronico}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              disabled={processingUserId === member.idUsuario || !member.activo}
                              onClick={async () => {
                                setProcessingUserId(member.idUsuario)
                                try {
                                  const result = await inactivarUsuario(member.idUsuario)
                                  if (result.success) {
                                    showNotification({
                                      title: "Usuario inactivado",
                                      message: result.message || `Se inactivó "${fullName}"`,
                                      type: "success",
                                    })
                                    await refetch()
                                  } else {
                                    showNotification({
                                      title: "Error",
                                      message: result.message || `Error al inactivar "${fullName}"`,
                                      type: "error",
                                    })
                                  }
                                } finally {
                                  setProcessingUserId(null)
                                }
                              }}
                            >
                              {processingUserId === member.idUsuario ? (
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              ) : (
                                'Inactivar'
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {isLoading ? (
            <div className="text-center">Cargando...</div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center">No hay miembros del equipo</div>
          ) : (
            teamMembers.map((member) => {
              const statusConfig_ = statusConfig[member.activo ? 'activo' : 'inactivo']
              const fullName = `${member.nombre} ${member.apellido1}${member.apellido2 ? ' ' + member.apellido2 : ''}`
              
              return (
                <Card key={member.idUsuario}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{fullName}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span className="font-mono text-sm whitespace-nowrap">
                              {member.rol?.nombreRol || 'Fisioterapeuta'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={statusConfig_?.color}>
                        {statusConfig_?.label}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-sm font-medium truncate">{member.correoElectronico}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Registrado</p>
                        <p className="text-sm font-medium">{formatRelativeTime(member.fechaRegistro)}</p>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="destructive" 
                          className="w-full mb-3"
                          disabled={processingUserId === member.idUsuario || !member.activo}
                          onClick={async () => {
                            setProcessingUserId(member.idUsuario)
                            try {
                              const result = await inactivarUsuario(member.idUsuario)
                              if (result.success) {
                                showNotification({
                                  title: "Usuario inactivado",
                                  message: result.message || `Se inactivó "${fullName}"`,
                                  type: "success",
                                })
                                await refetch()
                              } else {
                                showNotification({
                                  title: "Error",
                                  message: result.message || `Error al inactivar "${fullName}"`,
                                  type: "error",
                                })
                              }
                            } finally {
                              setProcessingUserId(null)
                            }
                          }}
                        >
                          {processingUserId === member.idUsuario ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              <span>Procesando...</span>
                            </div>
                          ) : (
                            'Inactivar'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Pagination */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mostrar</span>
                <Select value={String(limit)} onValueChange={(v) => setLimit(parseInt(v))}>
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
                  de {total} registros
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-sm px-4">
                  Página {page} de {totalPaginas}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.min(totalPaginas, prev + 1))}
                  disabled={page >= totalPaginas}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPaginas)}
                  disabled={page >= totalPaginas}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal para crear nuevo fisioterapeuta */}
        <NewFisioterapeutaDialog
          open={isNewFisioterapeutaDialogOpen}
          onOpenChange={(open) => {
            setIsNewFisioterapeutaDialogOpen(open)
            if (!open) {
              // Refrescar datos cuando se cierre el modal
              refetch()
            }
          }}
        />
    </div>
  )
}
