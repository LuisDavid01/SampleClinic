"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

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
        className="space-y-3 sm:space-y-4"
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
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Nombre, email o ID..."
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-background border border-muted rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            type="submit"
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors duration-200 focus:ring-2 focus:ring-accent/20 flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span>Buscar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const form = document.querySelector('form') as HTMLFormElement;
              if (form) {
                form.reset();
                router.push(pathname);
              }
            }}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-muted text-muted-foreground rounded-lg font-medium text-sm hover:bg-muted/80 transition-colors duration-200 focus:ring-2 focus:ring-muted/20 flex items-center justify-center gap-2"
          >
            <X className="h-4 w-4" />
            <span>Limpiar</span>
          </button>
        </div>
      </form>
    </div>
  );
};