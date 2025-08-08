import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  User,
   Filter,
   Search,
   ChevronRight,
   ChevronLeft,
   ChevronsLeft,
   ChevronsRight,
   LucideBookUser
} from "lucide-react"

export default function DiagnosticoTable(){
    // Mock data
const diagnosticos = [
  {id: 1, expediente: "EXP-001", paciente: "Luis Miguel", fecha: new Date(2025, 5, 2), doctor: "Dra. María García", diagnostico: "Dislocación severa"},
  {id: 2, expediente: "EXP-001", paciente: "Luis Miguel", fecha: new Date(2025, 4, 6), doctor: "Dr. Carlos Rodríguez", diagnostico: "calambres irreguales"},
]
const doctores = [
  { nombre: "Dr. Carlos Mendoza", especialidad: "Cirujano General" },
  { nombre: "Dra. Ana Vargas", especialidad: "Odontología" },
  { nombre: "Dr. Luis Ramírez", especialidad: "Anestesiología" },
  { nombre: "Dra. Patricia Solís", especialidad: "Oncología" },
  { nombre: "Dr. Roberto Castro", especialidad: "Cardiología" }
]
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
        <LucideBookUser className="w-5 h-5 text-text-primary" />
        <h2 className="text-lg font-semibold text-text-primary">
          Diagnosticos & consultas
        </h2>
      </div>
        {/* Filters and Search */}
        <Card>
          <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Filtros y Búsqueda
                    </CardTitle>
                  </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por paciente, cédula o tratamiento..."
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-background border border-muted rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                
                <Select defaultValue="todos">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los doctores</SelectItem>
                     {doctores.map((doctor) => (
                            <SelectItem key={doctor.nombre} value={doctor.nombre}>
                            <div>
                            <p className="font-medium">{doctor.nombre}</p>
                             <p className="text-sm text-muted-foreground">{doctor.especialidad}</p>
                            </div>
                        </SelectItem>
                     ))}
                  </SelectContent>
                </Select>
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
                    <TableHead>Expediente</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Diagnostico</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diagnosticos.map((diagnostico) => {
                    
                    return (
                      <TableRow key={diagnostico.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {diagnostico.expediente}
                          </div>
                        </TableCell>
                         <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {diagnostico.paciente}
                          </div>
                        </TableCell>

                        <TableCell className="font-mono text-sm">
                          {diagnostico.fecha.toDateString()}
                        </TableCell>
                         
                        
                         <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {diagnostico.doctor}
                          </div>
                        </TableCell>
                         <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {diagnostico.diagnostico}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/diagnosis/edit/${diagnostico.id}`}>
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
        <div className="lg:hidden space-y-4 ">
          {diagnosticos.map((diagnostico) => {
            
            return (
              <Card key={diagnostico.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{diagnostico.expediente}</h3>
                        <p className="text-sm text-muted-foreground">{diagnostico.doctor}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Actualizado</p>
                      <p className="text-sm font-medium">{diagnostico.fecha.toDateString()}</p>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Link href={`diagnosticos/${diagnostico.id}/edit`} className="flex-1">
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

        {/* Pagination */}
        <Card >
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mostrar</span>
                <Select defaultValue="10">
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
                  de {2} registros
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
       
                  disabled
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"

                  disabled
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-sm px-4">
                  Página 1 de 2
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
    )
}