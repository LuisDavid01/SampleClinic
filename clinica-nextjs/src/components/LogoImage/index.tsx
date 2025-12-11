"use client";
import Image from "next/image";
import { useTheme } from "@/hooks/useTheme";
import { useMemo } from "react";

interface LogoImageProps {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}

export function LogoImage({ 
  width = 80, 
  height = 80, 
  className = "",
  alt = "Clínica Salena Logo"
}: LogoImageProps) {
  const isDark = useTheme();
  
  // Logo para modo claro (siempre disponible)
  const lightLogo = "/selena-logo.webp";
  // Logo para modo oscuro - usar el nombre exacto del archivo
  const darkLogo = "/selena-logo-dark.webp.jpeg";

  // Determinar qué logo usar basado en el tema
  const logoSrc = useMemo(() => {
    return isDark ? darkLogo : lightLogo;
  }, [isDark, darkLogo, lightLogo]);

  return (
    <Image 
      src={logoSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      key={logoSrc} // Forzar re-render cuando cambia el src
      onError={(e) => {
        // Si hay error con el logo oscuro, usar el claro
        if (logoSrc === darkLogo) {
          e.currentTarget.src = lightLogo;
        }
      }}
    />
  );
}

