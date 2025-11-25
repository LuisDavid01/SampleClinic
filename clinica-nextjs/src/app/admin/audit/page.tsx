"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useApiClient, apiEndpoints } from "@/utils/apiClient";
import { Auditoria } from "@/types/auditoria";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNotification } from "@/components/UseNotification";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Eye,
  Copy,
  FileText,
  X
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AuditDashboard() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [userFilter, setUserFilter] = useState("all");

  const apiClient = useApiClient();
  const { showNotification } = useNotification();

  const formatFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return fecha;
    }
  };

  const loadAuditorias = async (page = 1) => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm ? { accion: searchTerm } : {}),
        ...(userFilter !== "all" ? { usuarioId: userFilter } : {})
      });

      const response = await apiClient.get(`${apiEndpoints.getAuditoria()}?${params}`);
      setAuditorias(response.auditorias || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(response.pagination?.pages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("❌ Error cargando auditorías:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: "No se pudo cargar la lista de auditorías"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditorias(1);
  }, [itemsPerPage]);

  const clearFilters = () => {
    setSearchTerm("");
    setUserFilter("all");
    loadAuditorias(1);
  };

  const handleSearch = () => {
  // Aquí puedes aplicar la lógica de búsqueda con searchTerm y userFilter
    loadAuditorias(1);
  };

  // Usuarios únicos para el filtro
  const uniqueUsers =
    auditorias
      ?.filter(a => a.usuario)
      ?.map(a => a.usuario!)
      ?.filter(
        (v, i, arr) =>
          arr.findIndex(u => u.idUsuario === v.idUsuario) === i
      ) || [];

  const [selectedAuditoria, setSelectedAuditoria] = useState<Auditoria | null>(null);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
              <Filter className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Auditoría</h1>
              <p className="text-muted-foreground">
                Registro de todas las acciones realizadas por los usuarios
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Filtros de búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Buscar acción */}
              <div className="relative col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground w-4 h-4" />
                <input
                  placeholder="Buscar por acción o recurso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-muted rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
                />
              </div>

              {/* Usuario */}
              <div className="flex gap-2">
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    {uniqueUsers.map((u) => (
                      <SelectItem key={u.idUsuario} value={u.idUsuario.toString()}>
                        {u.nombre} {u.apellido1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2 items-center">
                  <Button variant="default" onClick={handleSearch}>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    <RefreshCw className="w-4 h-4" />
                    
                  </Button>
                </div>

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="flex justify-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditorias.map((auditoria) => (
                  <TableRow key={auditoria.id}>
                    <TableCell className="font-medium">
                      {auditoria.usuario
                        ? `${auditoria.usuario.nombre} ${auditoria.usuario.apellido1 || ""} ${auditoria.usuario.apellido2 || ""}`
                        : "Usuario desconocido"}
                    </TableCell>

                    <TableCell>{auditoria.accion}</TableCell>
                    <TableCell>{auditoria.recurso}</TableCell>
                    <TableCell>{auditoria.metodo}</TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          auditoria.statusCode >= 200 && auditoria.statusCode < 300
                            ? "default"
                            : "destructive"
                        }
                      >
                        {auditoria.statusCode}
                      </Badge>
                    </TableCell>

                    <TableCell>{formatFecha(auditoria.timestamp)}</TableCell>

                    <TableCell>
                      <div className="flex justify-center gap-2">
                        {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAuditoria(auditoria)}
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(auditoria.url)}
                          title="Copiar URL"
                        >
                          <Copy className="w-4 h-4" />
                        </Button> */}

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" title="Ver JSON completo">
                              <FileText className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>
                                Detalles de la auditoría #{auditoria.id}
                              </DialogTitle>
                            </DialogHeader>
                            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-[70vh]">
                              {(() => {
                                try {
                                  const json = JSON.stringify(auditoria, null, 2);
                                  if (json.length > 1000000) return '⚠️ auditoria demasiado grande para mostrar';
                                  return json;
                                } catch (e) {
                                  return '⚠️ Error al serializar auditoria';
                                }
                              })()}
                            </pre>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Paginación */}
        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Mostrar</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(v) => {
                  setItemsPerPage(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                de {total} registros
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => loadAuditorias(1)} disabled={currentPage === 1}>
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadAuditorias(currentPage - 1)}
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
                onClick={() => loadAuditorias(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadAuditorias(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
