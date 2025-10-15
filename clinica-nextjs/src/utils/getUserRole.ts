import { auth } from "@clerk/nextjs/server";

export async function getUserRoleFromAPI() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    // Hacer una llamada a la API para obtener el rol desde la base de datos
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/me`, {
      headers: {
        'Authorization': `Bearer ${userId}`, // Esto necesitará ser ajustado según tu API
      },
    });

    if (!response.ok) {
      console.error('Error fetching user role from API');
      return null;
    }

    const userData = await response.json();
    return userData.rol?.idRol;
  } catch (error) {
    console.error('Error in getUserRoleFromAPI:', error);
    return null;
  }
}

export async function checkRoleFromDB(roleId: number) {
  // 1 = ADMINISTRADOR
  // 2 = FISIOTERAPEUTA  
  // 3 = RECEPCIONISTA
  // 4 = PACIENTE
  return roleId;
}
