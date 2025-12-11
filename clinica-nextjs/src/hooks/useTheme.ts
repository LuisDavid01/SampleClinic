"use client";
import { useState, useEffect } from "react";

export function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Función para determinar el tema actual
    const getTheme = () => {
      const hasDarkClass = document.documentElement.classList.contains("dark");
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      
      // Priorizar la clase dark del DOM, luego localStorage, luego preferencia del sistema
      if (hasDarkClass) return true;
      if (savedTheme === "dark") return true;
      if (savedTheme === "light") return false;
      return prefersDark;
    };

    // Establecer el tema inicial
    setIsDark(getTheme());

    // Escuchar cambios en el DOM (cuando se agrega/remueve la clase 'dark')
    const observer = new MutationObserver(() => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Escuchar cambios en localStorage (cuando otro componente cambia el tema)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme") {
        setIsDark(getTheme());
      }
    };

    // Escuchar cambios personalizados (para cuando el mismo componente cambia el tema)
    const handleThemeChanged = () => {
      setIsDark(getTheme());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("theme-changed", handleThemeChanged);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("theme-changed", handleThemeChanged);
    };
  }, []);

  // Retornar false durante el SSR para evitar hydration mismatch
  if (!mounted) {
    return false;
  }

  return isDark;
}

