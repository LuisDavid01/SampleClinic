"use client";


import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
const queryClient = new QueryClient()

export function ClientProviders({ children }: { children: React.ReactNode }) {
	// Crea el QueryClient en el cliente
	return (
		<ClerkProvider
			appearance={{
				variables: {
					colorPrimary: "var(--primary)",
					colorBackground: "var(--background)",
					colorInputForeground: "var(--foreground)",
					colorInput: "var(--input)",
					colorNeutral: "var(--foreground)",
					colorShimmer: "var(--accent)",
					colorText: "var(--foreground)",
				},
			}}
			localization={esES}
		>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</ClerkProvider>
	);
}
