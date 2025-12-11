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
		admin: 'bg-[#2B8181] text-white border-[#2B8181]',
		administrador: 'bg-[#2B8181] text-white border-[#2B8181]',
		fisioterapeuta: 'bg-[#EE7132] text-white border-[#EE7132]',
		recepcionista: 'bg-[#FECD5C] text-foreground border-[#FECD5C]',
		paciente: 'bg-[#E8CF9C] text-foreground border-[#E8CF9C]',
	};

	const normalizedRole = role.toLowerCase();
	const displayRole = roleLabels[normalizedRole] || role;
	const colorClass = roleColors[normalizedRole] || 'bg-muted text-foreground border-muted';

	return (
		<Badge 
			variant="outline" 
			className={`${colorClass} font-semibold text-xs px-2 py-1 border-2`}
		>
			{displayRole}
		</Badge>
	);
}

