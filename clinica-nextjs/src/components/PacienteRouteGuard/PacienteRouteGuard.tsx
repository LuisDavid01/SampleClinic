"use client";

import { ReactNode } from "react";
import { usePacienteAuth, usePacientePermissions } from "@/hooks/usePacienteAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, UserCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation'
interface PacienteRouteGuardProps {
	children: ReactNode;
	fallback?: ReactNode;
}

export function PacienteRouteGuard({ children, fallback }: PacienteRouteGuardProps) {
	const router = useRouter();
	const { isAuthenticated, isPaciente, isLoading, error } = usePacienteAuth();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
					<p className="text-gray-600">Verificando permisos...</p>
				</div>
			</div>
		);
	}


	if (!isAuthenticated) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
							<Shield className="w-8 h-8 text-red-600" />
						</div>
						<CardTitle className="text-xl">Acceso Restringido</CardTitle>
					</CardHeader>
					<CardContent className="text-center space-y-4">
						<p className="text-gray-600">
							Debes iniciar sesión para acceder al módulo de pacientes.
						</p>
						<Button asChild className="w-full">
							<Link href="/sign-in">
								Iniciar Sesión
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!isPaciente) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
							<UserCheck className="w-8 h-8 text-yellow-600" />
						</div>
						<CardTitle className="text-xl">Acceso Restringido </CardTitle>
					</CardHeader>
					<CardContent className="text-center space-y-4">
						<p className="text-gray-600">
							Tu cuenta tiene un rol específico que no permite acceder al módulo de pacientes.
						</p>
						<p className="text-sm text-gray-500">
							Los usuarios sin rol específico o con rol "paciente" pueden acceder a este módulo.
						</p>
						<div className="flex gap-1">
							<Button variant={'outline'} className="flex-1"
								onClick={() => {
									router.push('/')
								}}>

								Regresar al Inicio

							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (fallback) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}

// Componente específico para verificar permisos sobre datos de un paciente específico
interface PacienteDataGuardProps {
	children: ReactNode;
	pacienteId: string;
	fallback?: ReactNode;
}

export function PacienteDataGuard({ children, pacienteId, fallback }: PacienteDataGuardProps) {
	const { hasPermission, isLoading } = usePacientePermissions(pacienteId);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="w-6 h-6 animate-spin text-blue-600" />
			</div>
		);
	}

	if (!hasPermission) {
		return fallback ? (
			<>{fallback}</>
		) : (
			<div className="flex items-center justify-center p-8">
				<Card className="w-full max-w-md">
					<CardContent className="text-center space-y-4 pt-6">
						<div className="mx-auto p-3 bg-red-100 rounded-full w-fit">
							<Shield className="w-6 h-6 text-red-600" />
						</div>
						<h3 className="text-lg font-semibold">Acceso Denegado</h3>
						<p className="text-gray-600">
							No tienes permisos para ver esta información.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return <>{children}</>;
} 
