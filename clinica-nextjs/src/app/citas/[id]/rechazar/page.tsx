"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Calendar, Clock, User, Stethoscope, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface CitaData {
	idCita: number;
	fechaCita: string;
	estadoCita: string;
	paciente: {
		nombre: string;
		apellido1: string;
	};
	medico: {
		nombre: string;
		apellido1: string;
	};
	servicio?: {
		nombreServicio: string;
	};
}

export default function RechazarCitaPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const idCita = params.id as string;
	const token = searchParams.get("token");

	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [citaData, setCitaData] = useState<CitaData | null>(null);
	const [showConfirm, setShowConfirm] = useState(false);

	useEffect(() => {
		if (!token) {
			setError("Token de confirmación no proporcionado");
			setLoading(false);
			return;
		}

		validarToken();
	}, [idCita, token]);

	const validarToken = async () => {
		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
			const response = await fetch(`${apiUrl}/citas/${idCita}/validar-token?token=${token}`);

			if (!response.ok) {
				throw new Error("Token inválido");
			}

			const data = await response.json();
			if (!data.valido) {
				setError("Token inválido o expirado. Por favor, contacte a la clínica.");
				setLoading(false);
				return;
			}

			await obtenerCita();
		} catch (err) {
			setError("Error al validar el token. Por favor, intente nuevamente.");
			setLoading(false);
		}
	};

	const obtenerCita = async () => {
		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
			const response = await fetch(`${apiUrl}/citas/${idCita}/info?token=${token}`);

			if (!response.ok) {
				throw new Error("No se pudo obtener la información de la cita");
			}

			const data = await response.json();
			if (data.success && data.cita) {
				setCitaData(data.cita);
			} else {
				throw new Error("No se pudo obtener la información de la cita");
			}
			setLoading(false);
		} catch (err) {
			setError("Error al obtener la información de la cita");
			setLoading(false);
		}
	};

	const handleRechazar = async () => {
		if (!token) return;

		setProcessing(true);
		setError(null);

		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
			const response = await fetch(`${apiUrl}/citas/${idCita}/rechazar?token=${token}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.error || "Error al rechazar la cita");
			}

			setSuccess(true);
		} catch (err: any) {
			setError(err.message || "Error al rechazar la cita. Por favor, intente nuevamente.");
		} finally {
			setProcessing(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
					<Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
					<p className="text-gray-600 dark:text-gray-300">Validando información...</p>
				</div>
			</div>
		);
	}

	if (error && !citaData) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
					<XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h1>
					<p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
					<Link href="/">
						<Button>Volver al inicio</Button>
					</Link>
				</div>
			</div>
		);
	}

	if (success) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
					<CheckCircle2 className="w-16 h-16 text-orange-500 mx-auto mb-4" />
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
						Cita Cancelada
					</h1>
					<p className="text-gray-600 dark:text-gray-300 mb-6">
						Su solicitud de cancelación ha sido procesada exitosamente. Si necesita reagendar su cita, por favor contáctenos.
					</p>
					<Link href="/">
						<Button>Volver al inicio</Button>
					</Link>
				</div>
			</div>
		);
	}

	if (!citaData) {
		return null;
	}

	const fechaFormateada = new Date(citaData.fechaCita).toLocaleDateString("es-ES", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const horaFormateada = new Date(citaData.fechaCita).toLocaleTimeString("es-ES", {
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
			<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl w-full">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
						<AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						Rechazar Cita
					</h1>
					<p className="text-gray-600 dark:text-gray-300">
						Clínica Esteban Porras - Fisioterapia y Rehabilitación
					</p>
				</div>

				{/* Información de la Cita */}
				<div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-6 mb-6 border border-orange-200 dark:border-gray-600">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
						Detalles de su cita
					</h2>
					<div className="space-y-3">
						<div className="flex items-start gap-3">
							<Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
							<div>
								<p className="text-sm text-gray-500 dark:text-gray-400">Fecha</p>
								<p className="text-base font-medium text-gray-900 dark:text-white">{fechaFormateada}</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
							<div>
								<p className="text-sm text-gray-500 dark:text-gray-400">Hora</p>
								<p className="text-base font-medium text-gray-900 dark:text-white">{horaFormateada}</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<Stethoscope className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
							<div>
								<p className="text-sm text-gray-500 dark:text-gray-400">Fisioterapeuta</p>
								<p className="text-base font-medium text-gray-900 dark:text-white">
									{citaData.medico.nombre} {citaData.medico.apellido1}
								</p>
							</div>
						</div>
						{citaData.servicio && (
							<div className="flex items-start gap-3">
								<User className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
								<div>
									<p className="text-sm text-gray-500 dark:text-gray-400">Servicio</p>
									<p className="text-base font-medium text-gray-900 dark:text-white">
										{citaData.servicio.nombreServicio}
									</p>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Warning Message */}
				{!showConfirm && (
					<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
						<div className="flex items-start gap-3">
							<AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
							<div>
								<p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
									¿Está seguro de rechazar esta cita?
								</p>
								<p className="text-sm text-yellow-700 dark:text-yellow-300">
									Si necesita reagendar, por favor contáctenos directamente. Esta acción cancelará su cita programada.
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Error Message */}
				{error && (
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
						<p className="text-sm text-red-800 dark:text-red-200">{error}</p>
					</div>
				)}

				{/* Actions */}
				{!showConfirm ? (
					<div className="flex flex-col sm:flex-row gap-4">
						<Button
							onClick={() => setShowConfirm(true)}
							className="flex-1 bg-red-600 hover:bg-red-700 text-white"
							size="lg"
						>
							<XCircle className="w-4 h-4 mr-2" />
							Sí, Rechazar Cita
						</Button>
						<Link href="/" className="flex-1">
							<Button variant="outline" className="w-full" size="lg">
								Cancelar
							</Button>
						</Link>
					</div>
				) : (
					<div className="flex flex-col sm:flex-row gap-4">
						<Button
							onClick={handleRechazar}
							disabled={processing}
							className="flex-1 bg-red-600 hover:bg-red-700 text-white"
							size="lg"
						>
							{processing ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Procesando...
								</>
							) : (
								<>
									<XCircle className="w-4 h-4 mr-2" />
									Confirmar Rechazo
								</>
							)}
						</Button>
						<Button
							onClick={() => setShowConfirm(false)}
							variant="outline"
							className="flex-1"
							size="lg"
							disabled={processing}
						>
							Volver
						</Button>
					</div>
				)}

				{/* Footer Note */}
				<p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
					Si tiene alguna pregunta, por favor contacte a la clínica.
				</p>
			</div>
		</div>
	);
}

