import { ReactNode } from "react";
import { checkRoles } from "@/utils/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle } from "lucide-react";
import Link from "next/link";

interface PermissionGuardProps {
	children: ReactNode;
	allowedRoles: string[];
	fallback?: ReactNode;
}

export async function PermissionGuard({ 
	children, 
	allowedRoles,
	fallback 
}: PermissionGuardProps) {
	const hasPermission = await checkRoles(allowedRoles);

	if (!hasPermission) {
		if (fallback) {
			return <>{fallback}</>;
		}

		const roleNames: Record<string, string> = {
			admin: "Administrador",
			fisioterapeuta: "Fisioterapeuta",
			recepcionista: "Recepcionista",
			paciente: "Paciente"
		};

		const requiredRolesText = allowedRoles
			.map(role => roleNames[role] || role)
			.join(", ");

		return (
			<div className="flex items-center justify-center min-h-[60vh] p-6">
				<Card className="w-full max-w-md border-2 border-[#EE7132]/20 shadow-lg">
					<CardHeader className="text-center pb-4">
						<div className="mx-auto mb-4 p-4 bg-gradient-to-br from-[#EE7132]/10 to-[#FECD5C]/10 rounded-full w-fit">
							<Shield className="w-10 h-10 text-[#EE7132]" />
						</div>
						<CardTitle className="text-2xl font-bold text-foreground">
							Acceso Denegado
						</CardTitle>
					</CardHeader>
					<CardContent className="text-center space-y-4">
						<div className="space-y-2">
							<p className="text-muted-foreground text-base">
								No cuenta con los permisos necesarios para acceder a esta sección.
							</p>
							<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-[#2B8181]/5 rounded-lg p-3">
								<AlertCircle className="w-4 h-4 text-[#2B8181]" />
								<span>
									Se requieren permisos de: <strong className="text-[#2B8181]">{requiredRolesText}</strong>
								</span>
							</div>
						</div>
						<div className="flex flex-col sm:flex-row gap-3 pt-4">
							<Button 
								asChild 
								variant="outline" 
								className="flex-1 border-[#2B8181]/30 hover:bg-[#2B8181]/10 hover:text-[#2B8181] transition-colors"
							>
								<Link href="/admin">
									Volver al Dashboard
								</Link>
							</Button>
							<Button 
								asChild 
								className="flex-1 bg-gradient-to-r from-[#2B8181] to-[#2B8181]/80 hover:from-[#2B8181]/90 hover:to-[#2B8181]/70 text-white"
							>
								<Link href="/">
									Ir al Inicio
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return <>{children}</>;
}

