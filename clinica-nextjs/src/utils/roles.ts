import { Roles } from "@/types/globals";
import { auth } from "@clerk/nextjs/server";
export const checkRole = async (role: Roles) => {
	const { sessionClaims } = await auth();
	const userRole = sessionClaims?.metadata?.role;

	// Si el usuario no tiene rol específico, se considera paciente por defecto
	if (!userRole && role === "paciente") {
		return true;
	}

	return userRole === role;
};

// busca roles en especifico
export const checkRoles = async (roles: string[]) => {
	const { sessionClaims } = await auth();
	const userRole = sessionClaims?.metadata?.role;
	if (userRole && roles.includes(userRole as any)) {
		return true;
	}

	return false;
};

// Función específica para verificar si un usuario es paciente (servidor)
export const checkIsPaciente = async () => {
	const { sessionClaims } = await auth();
	const userRole = sessionClaims?.metadata?.role;

	// Si el usuario no tiene rol específico, se considera paciente por defecto
	return !userRole || userRole === "paciente";
};
