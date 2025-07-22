"use client";

import { usePathname, useRouter } from "next/navigation";

export const SearchUsers = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);
          const queryTerm = formData.get("search") as string;
          router.push(pathname + "?search=" + queryTerm);
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <label 
            htmlFor="search" 
            className="block text-sm font-medium text-foreground"
          >
            Buscar usuarios
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              
            </div>
            <input 
              id="search" 
              name="search" 
              type="text" 
              placeholder="Nombre, email o ID de usuario..."
              className="w-full pl-10 pr-4 py-3 bg-background border border-muted rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            type="submit"
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors duration-200 focus:ring-2 focus:ring-accent/20"
          >
            Buscar
          </button>
          
          <button 
            type="button"
            onClick={() => {
              const form = document.querySelector('form') as HTMLFormElement;
              form?.reset();
              router.push(pathname);
            }}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors duration-200 focus:ring-2 focus:ring-accent/20"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
};