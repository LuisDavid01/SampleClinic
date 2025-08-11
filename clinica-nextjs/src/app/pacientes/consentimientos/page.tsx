"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Shield,
  UserCheck,
  FileCheck
} from "lucide-react";
import { Consentimiento } from "@/types/paciente";
import Link from "next/link";

// Datos de ejemplo - en producción vendrían de una API
const consentimientosEjemplo: Consentimiento[] = [
  {
    id: "1",
    pacienteId: "paciente1",
    tipo: "tratamiento",
    titulo: "Consentimiento Informado para Tratamiento de Fisioterapia",
    contenido: "Consiento en recibir tratamiento de fisioterapia para mi condición médica. Entiendo los riesgos y beneficios asociados con este tratamiento.",
    fechaFirma: new Date("2024-01-10"),
    estado: "firmado",
    archivoUrl: "/consentimientos/consentimiento-tratamiento-2024-01-10.pdf",
    version: "1.0"
  },
  {
    id: "2",
    pacienteId: "paciente1",
    tipo: "confidencialidad",
    titulo: "Acuerdo de Confidencialidad y Privacidad",
    contenido: "Autorizo el uso de mi información médica para fines de tratamiento, manteniendo la confidencialidad según las leyes vigentes.",
    fechaFirma: new Date("2024-01-10"),
    estado: "firmado",
    archivoUrl: "/consentimientos/acuerdo-confidencialidad-2024-01-10.pdf",
    version: "2.1"
  },
  {
    id: "3",
    pacienteId: "paciente1",
    tipo: "procedimiento",
    titulo: "Consentimiento para Terapia Manual",
    contenido: "Consiento en recibir terapia manual como parte de mi tratamiento de fisioterapia, comprendiendo las técnicas que se utilizarán.",
    fechaFirma: new Date("2024-01-15"),
    estado: "firmado",
    archivoUrl: "/consentimientos/consentimiento-terapia-manual-2024-01-15.pdf",
    version: "1.2"
  },
  {
    id: "4",
    pacienteId: "paciente1",
    tipo: "tratamiento",
    titulo: "Consentimiento para Ejercicios de Rehabilitación",
    contenido: "Autorizo la realización de ejercicios de rehabilitación bajo supervisión profesional, comprometiéndome a seguir las instrucciones.",
    fechaFirma: new Date("2024-01-22"),
    estado: "firmado",
    archivoUrl: "/consentimientos/consentimiento-ejercicios-2024-01-22.pdf",
    version: "1.0"
  }
];

const getTipoColor = (tipo: Consentimiento['tipo']) => {
  switch (tipo) {
    case 'tratamiento':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'procedimiento':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'confidencialidad':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'otros':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTipoText = (tipo: Consentimiento['tipo']) => {
  switch (tipo) {
    case 'tratamiento':
      return 'Tratamiento';
    case 'procedimiento':
      return 'Procedimiento';
    case 'confidencialidad':
      return 'Confidencialidad';
    case 'otros':
      return 'Otros';
    default:
      return tipo;
  }
};

const getTipoIcon = (tipo: Consentimiento['tipo']) => {
  switch (tipo) {
    case 'tratamiento':
      return <FileCheck className="w-5 h-5" />;
    case 'procedimiento':
      return <Shield className="w-5 h-5" />;
    case 'confidencialidad':
      return <UserCheck className="w-5 h-5" />;
    case 'otros':
      return <FileText className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

const getEstadoColor = (estado: Consentimiento['estado']) => {
  switch (estado) {
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'firmado':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'expirado':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getEstadoIcon = (estado: Consentimiento['estado']) => {
  switch (estado) {
    case 'pendiente':
      return <Clock className="w-4 h-4" />;
    case 'firmado':
      return <CheckCircle className="w-4 h-4" />;
    case 'expirado':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getEstadoText = (estado: Consentimiento['estado']) => {
  switch (estado) {
    case 'pendiente':
      return 'Pendiente';
    case 'firmado':
      return 'Firmado';
    case 'expirado':
      return 'Expirado';
    default:
      return estado;
  }
};

export default function ConsentimientosPage() {
  const { user } = useUser();
  const [consentimientos, setConsentimientos] = useState<Consentimiento[]>(consentimientosEjemplo);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  // Filtrar consentimientos
  const consentimientosFiltrados = consentimientos.filter(consentimiento => {
    const cumpleTipo = filtroTipo === 'todos' || consentimiento.tipo === filtroTipo;
    const cumpleEstado = filtroEstado === 'todos' || consentimiento.estado === filtroEstado;
    const cumpleBusqueda = busqueda === '' || 
      consentimiento.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      consentimiento.contenido.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleTipo && cumpleEstado && cumpleBusqueda;
  });

  // Ordenar por fecha (más reciente primero)
  const consentimientosOrdenados = [...consentimientosFiltrados].sort((a, b) => 
    new Date(b.fechaFirma).getTime() - new Date(a.fechaFirma).getTime()
  );

  const formatFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(fecha);
  };

  const handleDownload = (consentimiento: Consentimiento) => {
    console.log('Descargando consentimiento:', consentimiento.titulo);
    if (consentimiento.archivoUrl) {
      window.open(consentimiento.archivoUrl, '_blank');
    }
  };

  const handleView = (consentimiento: Consentimiento) => {
    console.log('Viendo consentimiento:', consentimiento.titulo);
    if (consentimiento.archivoUrl) {
      window.open(consentimiento.archivoUrl, '_blank');
    }
  };

  // Estadísticas
  const totalConsentimientos = consentimientos.length;
  const consentimientosFirmados = consentimientos.filter(c => c.estado === 'firmado').length;
  const consentimientosPendientes = consentimientos.filter(c => c.estado === 'pendiente').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con diseño médico */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Mis Consentimientos Informados
                </h1>
                <p className="text-muted-foreground mt-1">
                  Historial de todos los consentimientos médicos que has firmado
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="border-primary/20 text-primary hover:bg-primary/5"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Todos
              </Button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Consentimientos</p>
                  <p className="text-2xl font-bold text-foreground">{totalConsentimientos}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Firmados</p>
                  <p className="text-2xl font-bold text-green-600">{consentimientosFirmados}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{consentimientosPendientes}</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-card border-0 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por título o contenido..."
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground placeholder:text-muted-foreground"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="todos">Todos los tipos</option>
                <option value="tratamiento">Tratamiento</option>
                <option value="procedimiento">Procedimiento</option>
                <option value="confidencialidad">Confidencialidad</option>
                <option value="otros">Otros</option>
              </select>
              <select
                className="px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="firmado">Firmado</option>
                <option value="expirado">Expirado</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Consentimientos */}
        <div className="space-y-4">
          {consentimientosOrdenados.length === 0 ? (
            <Card className="bg-card border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  No hay consentimientos encontrados
                </h3>
                <p className="text-muted-foreground">
                  No se encontraron consentimientos con los filtros aplicados.
                </p>
              </CardContent>
            </Card>
          ) : (
            consentimientosOrdenados.map((consentimiento) => (
              <Card key={consentimiento.id} className="bg-card border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        {getTipoIcon(consentimiento.tipo)}
                      </div>
                      <div>
                        <CardTitle className="text-xl text-foreground">
                          {consentimiento.titulo}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Firmado el {formatFecha(consentimiento.fechaFirma)}
                          </div>
                          <div className="flex items-center gap-1">
                            Versión {consentimiento.version}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTipoColor(consentimiento.tipo)}>
                        {getTipoText(consentimiento.tipo)}
                      </Badge>
                      <Badge className={getEstadoColor(consentimiento.estado)}>
                        <div className="flex items-center gap-1">
                          {getEstadoIcon(consentimiento.estado)}
                          {getEstadoText(consentimiento.estado)}
                        </div>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Contenido del Consentimiento:
                      </h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg line-clamp-3">
                        {consentimiento.contenido}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(consentimiento)}
                        className="border-primary/20 text-primary hover:bg-primary/5"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(consentimiento)}
                        className="border-primary/20 text-primary hover:bg-primary/5"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Información Adicional */}
        <Card className="bg-card border-0 shadow-sm mt-8">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Información Importante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>Los consentimientos informados son documentos legales que autorizan los tratamientos médicos.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>Es importante conservar copias de todos los consentimientos firmados.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>Si necesitas una copia física, puedes descargar el PDF e imprimirlo.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>Los consentimientos tienen versiones que pueden actualizarse según las regulaciones vigentes.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 