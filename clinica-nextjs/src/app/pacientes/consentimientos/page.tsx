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
import { Consentimiento } from "@/types/PacienteTypes";
import { Archivo } from "@/types/Consent";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useApiClient, apiEndpoints, baseUrl } from "@/utils/apiClient";
import { getConsentimientosByExpediente } from "@/actions/consentimientos";
import { getExpedientes } from "@/actions/expedientes";
import { downloadConsentimiento } from "@/actions/consentimientos";

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
	const apiClient = useApiClient();
	const [filtroTipo, setFiltroTipo] = useState<string>('todos');
	const [filtroEstado, setFiltroEstado] = useState<string>('todos');
	const [busqueda, setBusqueda] = useState<string>('');

	// Obtener usuario actual
	const { data: currentUser, isLoading: isLoadingUser } = useQuery({
		queryKey: ['currentUser', user?.id],
		queryFn: async () => {
			const res = await apiClient.get(apiEndpoints.getUsuarios());
			return res.usuarios.find((u: any) => u.clerkId === user?.id);
		},
		enabled: !!user?.id,
		staleTime: 10 * 60 * 1000,
	});

	// Obtener expediente del paciente
	const { data: expedientesData, isLoading: isLoadingExpedientes } = useQuery({
		queryKey: ['expedientes', currentUser?.idUsuario],
		queryFn: async () => {
			const res = await getExpedientes(1, '', 100);
			// Filtrar expedientes del paciente actual
			return res.expedientes?.find((exp: any) => exp.idPaciente === currentUser?.idUsuario) || null;
		},
		enabled: !!currentUser?.idUsuario,
		staleTime: 5 * 60 * 1000,
	});

	// Obtener archivos de consentimiento del expediente
	const { data: consentimientosData, isLoading: isLoadingConsentimientos } = useQuery({
		queryKey: ['consentimientos', expedientesData?.idExpediente, currentUser?.idUsuario],
		queryFn: async () => {
			if (!expedientesData?.idExpediente || !currentUser?.idUsuario) {
				return { success: false, data: [], pagination: {} };
			}
			return await getConsentimientosByExpediente(
				currentUser.idUsuario,
				expedientesData.idExpediente,
				1,
				100
			);
		},
		enabled: !!expedientesData?.idExpediente && !!currentUser?.idUsuario,
		staleTime: 2 * 60 * 1000,
	});

	// Convertir archivos a formato Consentimiento
	const consentimientos: Consentimiento[] = (consentimientosData?.data || [])
		.filter((archivo: Archivo) => archivo.activo !== false)
		.map((archivo: Archivo) => {
			// Extraer tipo de las etiquetas o descripción
			const tipo = archivo.categoria?.toLowerCase().includes('tratamiento') ? 'tratamiento' :
				archivo.categoria?.toLowerCase().includes('procedimiento') ? 'procedimiento' :
				archivo.categoria?.toLowerCase().includes('consentimiento') ? 'confidencialidad' :
				'otros';
			return {
				id: archivo.idArchivo.toString(),
				pacienteId: archivo.idUsuario.toString(),
				tipo: tipo as Consentimiento['tipo'],
				titulo: archivo.descripcion || archivo.nombreOriginal || 'Consentimiento',
				contenido: archivo.descripcion || 'Consentimiento informado',
				fechaFirma: new Date(archivo.fechaSubida),
				estado: 'firmado' as Consentimiento['estado'],
				archivoUrl: `${baseUrl}/files/${archivo.idUsuario}/${archivo.idArchivo}/serve`,
				version: '1.0'
			};
		});

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

	const handleDownload = async (consentimiento: Consentimiento) => {
		try {
			const archivoId = parseInt(consentimiento.id);
			const usuarioId = parseInt(consentimiento.pacienteId);
			const result = await downloadConsentimiento(usuarioId, archivoId);
			
			if (result.success && result.data) {
				// Crear un enlace temporal para descargar
				const url = window.URL.createObjectURL(result.data);
				const a = document.createElement('a');
				a.href = url;
				a.download = consentimiento.titulo + '.pdf';
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
			}
		} catch (error) {
			console.error('Error al descargar:', error);
		}
	};

	const handleView = (consentimiento: Consentimiento) => {
		if (consentimiento.archivoUrl) {
			window.open(consentimiento.archivoUrl, '_blank');
		}
	};

	const isLoading = isLoadingUser || isLoadingExpedientes || isLoadingConsentimientos;

	// Estadísticas
	const totalConsentimientos = consentimientos.length;
	const consentimientosFirmados = consentimientos.filter(c => c.estado === 'firmado').length;
	const consentimientosPendientes = consentimientos.filter(c => c.estado === 'pendiente').length;

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Cargando consentimientos...</p>
				</div>
			</div>
		);
	}

	if (!expedientesData) {
		return (
			<div className="min-h-screen bg-background">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<Card className="bg-card border-0 shadow-sm">
						<CardContent className="p-12 text-center">
							<FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-xl font-semibold text-muted-foreground mb-2">
								No se encontró expediente
							</h3>
							<p className="text-muted-foreground">
								No tienes un expediente activo. Por favor contacta con tu médico.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header con diseño médico */}
				<div className="mb-8">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-primary/10 rounded-full">
								<FileText className="w-8 h-8 text-accent" />
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
						{/* <div className="flex gap-3">
							<Button
								variant="outline"
								size="sm"
								className="border-primary/20 text-accent hover:bg-primary/5 hover:text-accent"
							>
								<Download className="w-4 h-4 mr-2" />
								Exportar Todos
							</Button>
						</div> */}
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
									<FileText className="w-6 h-6 text-accent" />
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
								aria-label="Filtrar por tipo de consentimiento"
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
								aria-label="Filtrar por estado del consentimiento"
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
												className="border-primary/20 text-accent hover:bg-primary/5 hover:text-accent"
											>
												<Eye className="w-4 h-4 mr-2" />
												Ver
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleDownload(consentimiento)}
												className="border-primary/20 text-accent hover:bg-primary/5 hover:text-accent"
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
							<Shield className="w-5 h-5 text-accent" />
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
