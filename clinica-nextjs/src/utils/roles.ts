import { Roles } from "@/types/globals";
import { auth } from "@clerk/nextjs/server";

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata.role === role;
};

// Función para verificar roles en el lado del cliente
export const useCheckRole = (role: Roles) => {
  const { user } = require("@clerk/nextjs").useUser();
  return user?.publicMetadata?.role === role;
};
