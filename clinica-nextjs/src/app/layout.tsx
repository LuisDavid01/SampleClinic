import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, EB_Garamond } from "next/font/google";
import { esES } from "@clerk/localizations";
import "./globals.css";
import ChatSelect from "@/components/ChatSelect";
import { ClerkErrorBoundary } from "@/components/ClerkErrorBoundary";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter-sans",
});

const garamod = EB_Garamond({
	subsets: ["latin"],
	variable: "--font-garamond",
})

export const metadata: Metadata = {
	title: "Clínica Esteban Porras - Fisioterapia y Rehabilitación",
	description:
		"Centro especializado en fisioterapia, rehabilitación y terapia manual en Costa Rica. Profesionales certificados para tu recuperación integral.",
	icons: [{ rel: "icon", url: "/favicon.ico" }]
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider
			appearance={{
				variables: {
					colorPrimary: "var(--complementario)",
					colorBackground: "var(--card)",
					colorInputBackground: "var(--card-secondary)",
					colorNeutral: "var(--foreground)",
					colorText: "var(--text-primary)",
					colorInputText: "var(--foreground)",
					colorTextOnPrimaryBackground: "var(--primary-foreground)",
					colorShimmer: "var(--text-primary-foreground)",
				},
			}}
			localization={esES}
		>
			<html lang="en" suppressHydrationWarning>
				<head>
					<script
						dangerouslySetInnerHTML={{
							__html: `
                (function() {
                  try {
                    var theme = localStorage.getItem('theme');
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (theme === 'dark' || (!theme && prefersDark)) {
                      document.documentElement.classList.add('dark');
                    }
                  } catch (e) {}
                })();
              `,
						}}
					/>
				</head>
				<body className={`${inter.variable} ${garamod.variable} font-sans antialiased`}>
					<ClerkErrorBoundary>
						{children}
						<ChatSelect />
					</ClerkErrorBoundary>
				</body>
			</html>
		</ClerkProvider>
	);
}
