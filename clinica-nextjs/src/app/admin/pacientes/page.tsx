"use client";

import { useState, useEffect } from "react";
import { useApiClient, apiEndpoints } from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  UserPlus, 
  Search, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import NewPaciente from "@/components/NewPaciente";
import EditPaciente from "@/components/EditPaciente";
import { useNotification } from "@/components/UseNotification";
import { AdminPaciente, PacientesResponse } from "@/types/AdminPaciente";

export default function AdminPacientesPage() {
  const apiClient = useApiClient();
  const { showNotification } = useNotification();
  
  const [pacientes, setPacientes] = useState<AdminPaciente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isNewPacienteOpen, setIsNewPacienteOpen] = useState(false);
  const [isEditPacienteOpen, setIsEditPacienteOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<AdminPaciente | null>(null);
  const [editingPaciente, setEditingPaciente] = useState<AdminPaciente | null>(null);

  const loadPacientes = async (page = 1, search = "") => {
    try {
      setIsLoading(true);
      console.log(`📋 Cargando pacientes - Página: ${page}, Búsqueda: "${search}"`);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        rol: "paciente" // Filtrar solo pacientes
      });

      const response = await apiClient.get(`${apiEndpoints.getUsuarios()}?${params}`);
      console.log("✅ Pacientes cargados:", response);

      setPacientes(response.usuarios || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPaginas || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("❌ Error cargando pacientes:", error);
      showNotification({ 
        type: "error", 
        title: "Error", 
        message: "No se pudo cargar la lista de pacientes" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPacientes();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPacientes(1, searchTerm);
  };

  const handleNewPacienteSuccess = () => {
    setIsNewPacienteOpen(false);
    loadPacientes(currentPage, searchTerm);
    showNotification({ 
      type: "success", 
      title: "Éxito", 
      message: "Paciente creado exitosamente" 
    });
  };

  const handleEditPaciente = (paciente: AdminPaciente) => {
    setEditingPaciente(paciente);
    setIsEditPacienteOpen(true);
  };

  const handleEditPacienteSuccess = () => {
    setIsEditPacienteOpen(false);
    setEditingPaciente(null);
    loadPacientes(currentPage, searchTerm);
    showNotification({ 
      type: "success", 
      title: "Éxito", 
      message: "Paciente actualizado exitosamente" 
    });
  };

  const handleToggleActivo = async (paciente: AdminPaciente) => {
    try {
      const newStatus = !paciente.activo;
      console.log(`🔄 Cambiando estado del paciente ${paciente.idUsuario} a ${newStatus ? 'activo' : 'inactivo'}`);

      await apiClient.delete(apiEndpoints.updateUsuario(paciente.idUsuario.toString()), {
        activo: newStatus
      });

      // Actualizar la lista local
      setPacientes(prev => 
        prev.map(p => 
          p.idUsuario === paciente.idUsuario 
            ? { ...p, activo: newStatus }
            : p
        )
      );

      showNotification({ 
        type: "success", 
        title: "Éxito", 
        message: `Paciente ${newStatus ? 'activado' : 'desactivado'} exitosamente` 
      });
    } catch (error) {
      console.error("❌ Error cambiando estado del paciente:", error);
      showNotification({ 
        type: "error", 
        title: "Error", 
        message: "No se pudo cambiar el estado del paciente" 
      });
    }
  };

  const getNombreCompleto = (paciente: AdminPaciente) => {
    return `${paciente.nombre} ${paciente.apellido1}${paciente.apellido2 ? ` ${paciente.apellido2}` : ''}`;
  };

  const formatFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), "dd/MM/yyyy", { locale: es });
    } catch {
      return fecha;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Pacientes</h1>
          <p className="text-muted-foreground">
            Administra el registro de pacientes del sistema
          </p>
        </div>
        
        <Dialog open={isNewPacienteOpen} onOpenChange={setIsNewPacienteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registro de Nuevo Paciente</DialogTitle>
            </DialogHeader>
            <NewPaciente 
              onSuccess={handleNewPacienteSuccess}
              onCancel={() => setIsNewPacienteOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pacientes.filter(p => p.activo).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Inactivos</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pacientes.filter(p => !p.activo).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda y Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Búsqueda y Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre, apellido o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            {searchTerm && (
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  loadPacientes(1, "");
                }}
              >
                Limpiar
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Lista de Pacientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-2">Cargando pacientes...</span>
            </div>
          ) : pacientes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron pacientes</p>
              {searchTerm && (
                <p className="text-sm">Intenta con otros términos de búsqueda</p>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre Completo</TableHead>
                      <TableHead>Correo Electrónico</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Fecha Registro</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pacientes.map((paciente) => (
                      <TableRow key={paciente.idUsuario}>
                        <TableCell className="font-medium">
                          {getNombreCompleto(paciente)}
                        </TableCell>
                        <TableCell>{paciente.correoElectronico}</TableCell>
                        <TableCell>{paciente.telefonoPrincipal || "N/A"}</TableCell>
                        <TableCell>{formatFecha(paciente.fechaRegistro)}</TableCell>
                        <TableCell>
                          <Badge variant={paciente.activo ? "default" : "secondary"}>
                            {paciente.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPaciente(paciente)}
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPaciente(paciente)}
                              title="Editar paciente"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActivo(paciente)}
                              title={paciente.activo ? "Desactivar" : "Activar"}
                            >
                              {paciente.activo ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, total)} de {total} pacientes
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadPacientes(currentPage - 1, searchTerm)}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <span className="flex items-center px-3 py-2 text-sm">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadPacientes(currentPage + 1, searchTerm)}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edición del Paciente */}
      {editingPaciente && (
        <Dialog open={isEditPacienteOpen} onOpenChange={setIsEditPacienteOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Paciente</DialogTitle>
            </DialogHeader>
            <EditPaciente 
              paciente={editingPaciente}
              onSuccess={handleEditPacienteSuccess}
              onCancel={() => {
                setIsEditPacienteOpen(false);
                setEditingPaciente(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Detalles del Paciente */}
      {selectedPaciente && (
        <Dialog open={!!selectedPaciente} onOpenChange={() => setSelectedPaciente(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalles del Paciente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre Completo</label>
                  <p className="text-sm">{getNombreCompleto(selectedPaciente)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Correo Electrónico</label>
                  <p className="text-sm">{selectedPaciente.correoElectronico}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Teléfono Principal</label>
                  <p className="text-sm">{selectedPaciente.telefonoPrincipal || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Registro</label>
                  <p className="text-sm">{formatFecha(selectedPaciente.fechaRegistro)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <Badge variant={selectedPaciente.activo ? "default" : "secondary"}>
                    {selectedPaciente.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
