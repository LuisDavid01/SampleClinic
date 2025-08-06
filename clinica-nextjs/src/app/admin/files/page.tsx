import Link from "next/link"
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
  Folder, 
  User,
  RefreshCw,
   Filter,
   Search
} from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

// Mock data
const files = [
  {id: 1, nombre: "Luis Vargas", status: "activo", updatedAt: new Date(2025, 0, 3), doctor: "Dra. María García"},
  {id: 2, nombre: "Diego Vargas", status: "activo", updatedAt: new Date(2025, 2, 5), doctor: "Dr. Carlos Rodríguez"},
]

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

export default function FilesPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
              <Folder className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Expedientes</h1>
              <p className="text-muted-foreground">
                Gestiona los expedientes de los pacientes
              </p>
            </div>
          </div>
          
          <Link href="files/new">
            <Button className="cursor-pointer">
              <PlusIcon className="w-4 h-4 mr-2" />
              Nuevo expediente
            </Button>
          </Link>
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
                    placeholder="Buscar por nombre, id...."
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-background border border-muted rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Select >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="exitoso">Exitoso</SelectItem>
                    <SelectItem value="fallido">Fallido</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon">
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
                    <TableHead>Paciente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Actualizado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => {
                    const statusConfig_ = statusConfig[file.status as keyof typeof statusConfig]
                    
                    return (
                      <TableRow key={file.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {file.nombre}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig_?.color}>
                            {statusConfig_?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{file.doctor}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatRelativeTime(file.updatedAt)}
                        </TableCell>
                        <TableCell>
                          <Link href={`files/${file.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Ver
                            </Button>
                          </Link>
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
          {files.map((file) => {
            const statusConfig_ = statusConfig[file.status as keyof typeof statusConfig]
            
            return (
              <Card key={file.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{file.nombre}</h3>
                        <p className="text-sm text-muted-foreground">{file.doctor}</p>
                      </div>
                    </div>
                    <Badge className={statusConfig_?.color}>
                      {statusConfig_?.label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Actualizado</p>
                      <p className="text-sm font-medium">{formatRelativeTime(file.updatedAt)}</p>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Link href={`files/${file.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          Ver expediente
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
