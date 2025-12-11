'use client'

import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";

export default function UserRoleDisplay() {
	const { user } = useUser();
	const role = user?.publicMetadata?.role as string | undefined;

	if (!role) return null;

	const roleLabels: Record<string, string> = {
		admin: 'Administrador',
		administrador: 'Administrador',
		fisioterapeuta: 'Fisioterapeuta',
		recepcionista: 'Recepcionista',
		paciente: 'Paciente',
	};

	const roleColors: Record<string, string> = {
		admin: 'bg-[#2B8181] text-muted-foreground border-[#2B8181]',
		administrador: 'bg-[#2B8181] text-muted-foreground border-[#2B8181]',
		fisioterapeuta: 'bg-[#EE7132] text-muted-foreground border-[#EE7132]',
		recepcionista: 'bg-[#FECD5C] text-muted-foreground border-[#FECD5C]',
		paciente: 'bg-btn text-muted-foreground',
	};

	const normalizedRole = role.toLowerCase();
	const displayRole = roleLabels[normalizedRole] || role;
	const colorClass = roleColors[normalizedRole] || 'bg-muted text-muted-foreground border-muted';

	return (
		<Badge 
			variant="outline" 
			className={`${colorClass} font-semibold text-xs px-2 py-1 border-2`}
		>
			{displayRole}
		</Badge>
	);
}

