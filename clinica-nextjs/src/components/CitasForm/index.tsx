"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


export const CitasForm = () => {
	const [formData, setFormData] = useState({
		nombre: "",
		email: "",
		telefono: "",
		fecha: "",
		hora: "",
		servicio: "",
		mensaje: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		
		// Si es el campo de teléfono, solo permitir números y máximo 8 dígitos
		if (name === "telefono") {
			// Remover todo lo que no sea número
			const soloNumeros = value.replace(/\D/g, "");
			// Limitar a 8 dígitos
			const telefonoLimitado = soloNumeros.slice(0, 8);
			setFormData(prev => ({
				...prev,
				[name]: telefonoLimitado
			}));
			return;
		} 
		if (name === "fecha") {
			const dia = new Date(value).getDay(); // 5 = sabado, 6 = domingo

			if (dia !== 6 && dia !== 5) {
				alert("Solo puedes seleccionar días hábiles dentro del horario de anteción.");
				return; // Impide actualizar el formData
			}
		}
		if (name === "hora") {
			const disponibles = getHorasDisponibles();
			if (!disponibles.includes(value)) {
				alert("La hora seleccionada no está disponible según el horario del día.");
				return;
			}
		}
		//else {
			setFormData(prev => ({
				...prev,
				[name]: value
			}));
		//}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
			
			// Preparar datos para enviar
			const datosEnvio = {
				nombre: formData.nombre.trim(),
				email: formData.email.trim(),
				telefono: formData.telefono.trim(),
				fecha: formData.fecha,
				hora: formData.hora,
				servicio: formData.servicio || null,
				mensaje: formData.mensaje.trim() || null
			};

			// Enviar solicitud al API
			const response = await fetch(`${baseUrl}/citas/solicitar`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(datosEnvio)
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Error al procesar la solicitud');
			}

			// Éxito - resetear formulario
			setFormData({
				nombre: "",
				email: "",
				telefono: "",
				fecha: "",
				hora: "",
				servicio: "",
				mensaje: "",
			});

			// Mostrar mensaje de éxito
			alert("¡Solicitud de cita recibida exitosamente! Recibirá una notificación por correo electrónico. Nuestro equipo se pondrá en contacto con usted para confirmar su cita.");

		} catch (error) {
			console.error("Error al enviar solicitud de cita:", error);
			alert(error instanceof Error 
				? `Error: ${error.message}` 
				: "Hubo un error al procesar su solicitud. Por favor, intente nuevamente o contáctenos directamente.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Obtener servicios reales del API
	const { data: serviciosData, isLoading: isLoadingServicios, error: serviciosError, refetch: refetchServicios } = useQuery({
		queryKey: ['servicios-public'],
		queryFn: async () => {
			try {
				// Usar el proxy de Next.js (/api) para evitar problemas de CORS en móvil
				// El proxy está configurado en next.config.ts y redirige a NEXT_PUBLIC_API_BASE_URL
				const url = '/api/servicios/public';
				
				console.log('🔧 [CitasForm] Cargando servicios usando proxy:', url);
				
				// Usar un enfoque más simple y robusto para móvil
				const response = await Promise.race([
					fetch(url, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							'Accept': 'application/json',
						},
						// No usar cache en móvil para evitar problemas
						cache: 'no-cache',
						// No usar credentials ya que es un endpoint público
						credentials: 'omit',
					}),
					// Timeout de 20 segundos
					new Promise<Response>((_, reject) => {
						setTimeout(() => reject(new Error('Timeout: La solicitud tardó demasiado')), 20000);
					})
				]);
				
				if (!response.ok) {
					const errorText = await response.text().catch(() => response.statusText);
					throw new Error(`Error ${response.status}: ${errorText || 'Error desconocido'}`);
				}
				
				const data = await response.json();
				
				// Validar estructura de respuesta
				if (!data || typeof data !== 'object') {
					throw new Error('Respuesta inválida del servidor');
				}
				
				if (!Array.isArray(data.servicios)) {
					// Si no viene en el formato esperado, intentar otros formatos
					if (Array.isArray(data)) {
						return { servicios: data };
					}
					throw new Error('Formato de respuesta inválido: se esperaba un array de servicios');
				}
				
				return data;
			} catch (error: any) {
				// Manejar diferentes tipos de errores
				if (error.message?.includes('Timeout')) {
					throw new Error('La conexión tardó demasiado. Verifica tu internet.');
				}
				if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
					throw new Error('Error de conexión. Verifica tu conexión a internet y vuelve a intentar.');
				}
				if (error.message?.includes('CORS') || error.message?.includes('CORS')) {
					throw new Error('Error de configuración del servidor. Contacta al administrador.');
				}
				// Re-lanzar el error con un mensaje más amigable
				throw new Error(error.message || 'Error desconocido al cargar servicios');
			}
		},
		staleTime: 5 * 60 * 1000, // Cache por 5 minutos
		retry: (failureCount, error: any) => {
			// Solo reintentar si no es un error de formato o configuración
			if (error?.message?.includes('formato') || error?.message?.includes('configurada')) {
				return false;
			}
			return failureCount < 2; // Máximo 2 reintentos
		},
		retryDelay: 2000, // 2 segundos entre reintentos
		refetchOnWindowFocus: false, // Desactivar para evitar problemas en móvil
		refetchOnMount: true,
		refetchOnReconnect: true, // Reintentar cuando se reconecta
	});

	const servicios = serviciosData?.servicios || [];

	// Debug: Log para verificar el estado en móvil
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
				`${window.location.protocol}//${window.location.hostname}:3001/api`;
			
			console.log('🔍 Estado de servicios en CitasForm:', {
				isLoading: isLoadingServicios,
				hasData: !!serviciosData,
				serviciosCount: servicios.length,
				error: serviciosError?.message || serviciosError,
				baseUrl: baseUrl,
				isMobile: isMobile,
				userAgent: navigator.userAgent,
				timestamp: new Date().toISOString()
			});
			
			// Si hay error, log más detallado
			if (serviciosError) {
				console.error('❌ Error al cargar servicios:', {
					error: serviciosError,
					message: serviciosError instanceof Error ? serviciosError.message : String(serviciosError),
					stack: serviciosError instanceof Error ? serviciosError.stack : undefined,
					baseUrl: baseUrl,
					isMobile: isMobile
				});
			}
		}
	}, [isLoadingServicios, serviciosData, servicios.length, serviciosError]);

	const todayCR = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Costa_Rica"
	}).format(new Date());

	// const horas = [
	// 	"09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
	// 	"14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
	// ];

	const horasSabado = [
	"15:00", "15:30",
	"16:00", "16:30",
	"17:00", "17:30",
	"18:00"
	];

	const horasDomingo = [
	"08:00", "08:30",
	"09:00", "09:30",
	"10:00", "10:30",
	"11:00", "11:30",
	"12:00"
	];

	const getHorasDisponibles = () => {
		if (!formData.fecha) return [];

		const dia = new Date(formData.fecha).getDay(); 
		// 5 = sabado, 6 = domingo

		if (dia === 6) return horasDomingo;   // domingo
		if (dia === 5) return horasSabado;  // sabado
		return []; // de lunes a viernes no se debe permitir reservar
	};

	const format12h = (hora24: string): string => {
		if (!hora24 || !/^\d{2}:\d{2}$/.test(hora24)) {
			throw new Error(`Hora inválida: ${hora24}`);
		}

		const [hh, mm] = hora24.split(":").map(Number);

		const period = hh >= 12 ? "PM" : "AM";
		const hora12 = hh % 12 === 0 ? 12 : hh % 12;

		return `${hora12}:${mm.toString().padStart(2, "0")} ${period}`;
	};


	const inputStyles = "w-full px-4 py-3 border-2 border-card-foreground/20 bg-background/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 hover:border-primary/30 placeholder:/50";
	const selectStyles = "w-full px-4 py-3 border-2 border-card-foreground/20 bg-background/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 hover:border-primary/30 cursor-pointer";
	const textareaStyles = "w-full px-4 py-3 border-2 border-card-foreground/20 bg-background/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 hover:border-primary/30 placeholder:/50 min-h-[120px] resize-none";

	return (
		<section id="citas" className="py-24 bg-gradient-to-br from-background to-card/30 relative overflow-hidden">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
				{/* Header */}
				<div className="text-center mb-16">
					<span className="inline-block px-4 py-2 bg-primary/10  rounded-full text-sm font-medium mb-4">
						Agendar Cita Médica
					</span>
					<h2 className="text-4xl lg:text-5xl font-bold  mb-6">
						Reserva tu
						<span className="text-transparent bg-accent bg-clip-text">
							{" "}
							Cita de Fisioterapia
						</span>
					</h2>
					<p className="text-lg  max-w-3xl mx-auto leading-relaxed">
						Agenda tu cita de fisioterapia de manera fácil y rápida. Nuestro equipo se pondrá en contacto contigo para confirmar tu consulta médica.
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
					{/* Información de contacto */}
					<div className="space-y-8">
						<div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-card-foreground/10">
							<h3 className="text-2xl font-bold  mb-6">
								Información de Contacto
							</h3>

							<div className="space-y-6">
								<div className="flex items-start gap-4">
									<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
										<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
										</svg>
									</div>
									<div>
										<h4 className="font-semibold  mb-1">Teléfono</h4>
										<p className="/70">+506 8978-5444</p>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
										<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
										</svg>
									</div>
									<div>
										<h4 className="font-semibold  mb-1">Email</h4>
										<p className="/70">clinicasalena@gmail.com</p>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
										<svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
											<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
										</svg>
									</div>
									<div>
										<h4 className="font-semibold  mb-1">WhatsApp</h4>
										<p className="/70">+506 8978-5444</p>
										<a
											href="https://wa.me/+506897854444?text=Hola,%20me%20gustaría%20agendar%20una%20cita%20en%20la%20Clínica%20Esteban%20Porras"
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
										>
											<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
												<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
											</svg>
											Contactar por WhatsApp
										</a>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
										<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
										</svg>
									</div>
									<div>
										<h4 className="font-semibold  mb-1">Horarios</h4>
										<p className="/70">Sabados: 3:00 PM - 6:00 PM</p>
										<p className="/70">Domingos: 8:00 AM - 12:00 MD</p>
									</div>
								</div>
							</div>
						</div>

						<div className="bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 shadow-xl">
							<h3 className="text-xl font-bold  mb-4">
								¿Por qué elegir nuestra clínica de fisioterapia?
							</h3>
							<ul className="space-y-3 /80">
								<li className="flex items-center gap-2">
									<div className="w-2 h-2 bg-primary rounded-full"></div>
									Fisioterapeutas certificados y con experiencia
								</li>
								<li className="flex items-center gap-2">
									<div className="w-2 h-2 bg-primary rounded-full"></div>
									Tratamientos personalizados para cada paciente
								</li>
								<li className="flex items-center gap-2">
									<div className="w-2 h-2 bg-primary rounded-full"></div>
									Equipamiento moderno para rehabilitación
								</li>
								<li className="flex items-center gap-2">
									<div className="w-2 h-2 bg-primary rounded-full"></div>
									Seguimiento completo de tu recuperación
								</li>
							</ul>
						</div>
					</div>

					{/* Formulario */}
					<div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-card-foreground/10">
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-3">
									<Label htmlFor="nombre" className=" font-semibold text-sm">
										Nombre Completo *
									</Label>
									<Input
										id="nombre"
										name="nombre"
										type="text"
										required
										value={formData.nombre}
										onChange={handleInputChange}
										className={inputStyles}
										placeholder="Tu nombre completo"
									/>
								</div>

								<div className="space-y-3">
									<Label htmlFor="email" className=" font-semibold text-sm">
										Email *
									</Label>
									<Input
										id="email"
										name="email"
										type="email"
										required
										value={formData.email}
										onChange={handleInputChange}
										className={inputStyles}
										placeholder="tu@email.com"
									/>
								</div>
							</div>

							<div className="space-y-3">
								<Label htmlFor="telefono" className=" font-semibold text-sm">
									Teléfono *
								</Label>
								<Input
									id="telefono"
									name="telefono"
									type="tel"
									required
									value={formData.telefono}
									onChange={handleInputChange}
									className={inputStyles}
									placeholder="8888-8888"
									maxLength={8}
									inputMode="numeric"
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-3">
									<Label htmlFor="fecha" className=" font-semibold text-sm">
										Fecha Preferida *
									</Label>
									<input
										type="date"
										id="fecha"
										name="fecha"
										value={formData.fecha}
										placeholder="Selecciona una fecha"
										onChange={handleInputChange}
										className="w-full px-4 py-3 border-2 border-card-foreground/20 bg-background/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 hover:border-primary/30"
										required
										title="Selecciona una fecha para tu cita"
										min={todayCR}
									/>
								</div>

								<div className="space-y-3">
									<Label htmlFor="hora" className=" font-semibold text-sm">
										Hora Preferida *
									</Label>
									<select
										id="hora"
										name="hora"
										required
										value={formData.hora}
										onChange={handleInputChange}
										className={selectStyles}
										aria-label="Selecciona una hora para tu cita"
									>
										<option value="">Selecciona una hora</option>
										{getHorasDisponibles().map((hora) => (
											<option key={hora} value={hora}>
												{format12h(hora)}
											</option>
										))}
									</select>
								</div>
							</div>

							<div className="space-y-3">
								<Label htmlFor="servicio" className=" font-semibold text-sm">
									Servicio de Interés *
								</Label>
								<div className="relative">
									<select
										id="servicio"
										name="servicio"
										required
										value={formData.servicio}
										onChange={handleInputChange}
										className={inputStyles}
										aria-label="Selecciona un servicio de interés"
										disabled={isLoadingServicios || !!serviciosError}
									>
										<option value="">
											{isLoadingServicios 
												? 'Cargando servicios...' 
												: serviciosError 
													? 'Error al cargar servicios' 
													: servicios.length === 0
														? 'No hay servicios disponibles'
														: 'Selecciona un servicio'}
										</option>
										{servicios.map((servicio: { idServicio: number; nombreServicio: string }) => (
											<option key={servicio.idServicio} value={servicio.idServicio}>
												{servicio.nombreServicio}
											</option>
										))}
									</select>
									{isLoadingServicios && (
										<div className="absolute right-4 top-1/2 -translate-y-1/2">
											<div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
										</div>
									)}
								</div>
								{serviciosError && (
									<div className="space-y-2">
										<p className="text-sm text-red-500">
											{serviciosError instanceof Error ? serviciosError.message : 'Error al cargar los servicios'}
										</p>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => refetchServicios()}
											className="text-xs"
										>
											Reintentar
										</Button>
									</div>
								)}
								{!isLoadingServicios && !serviciosError && servicios.length === 0 && (
									<p className="text-sm text-amber-500">
										No hay servicios disponibles en este momento.
									</p>
								)}
							</div>

							<div className="space-y-3">
								<Label htmlFor="mensaje" className=" font-semibold text-sm">
									Mensaje Adicional
								</Label>
								<Textarea
									id="mensaje"
									name="mensaje"
									value={formData.mensaje}
									onChange={handleInputChange}
									className={textareaStyles}
									placeholder="Describe brevemente tu condición o motivo de consulta..."
								/>
							</div>

							<Button
								type="submit"
								disabled={isSubmitting}
								className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 font-semibold py-4 text-lg rounded-md transition-all duration-300 hover:-translate-y-1  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
							>
								{isSubmitting ? (
									<div className="flex items-center gap-2">
										<div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
										Agendando...
									</div>
								) : (
									"Agendar Cita"
								)}
							</Button>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
}; 
