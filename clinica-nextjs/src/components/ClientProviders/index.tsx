"use client";


import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
export function ClientProviders({ children }: { children: React.ReactNode }) {
	// Crea el QueryClient en el cliente
	const queryClient = new QueryClient()
	return (
		<ClerkProvider
			appearance={{
				variables: {
					colorPrimary: "var(--primary)",
					colorBackground: "var(--background)",
					colorInputBackground: "var(--input)",
					colorNeutral: "var(--foreground)",
					colorShimmer: "var(--accent)",
					colorText: "var(--text-foreground)",
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
