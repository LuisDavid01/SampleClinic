import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, EB_Garamond } from "next/font/google";
import localFont from 'next/font/local'
import { esES } from "@clerk/localizations";
import "./globals.css";
import ChatSelect from "@/components/ChatSelect";
import { ClerkErrorBoundary } from "@/components/ClerkErrorBoundary";
import { NotificationProvider } from "@/components/NotificationProvider";
import {
	QueryClient,
	QueryClientProvider,
} from '@tanstack/react-query'
import { ClientProviders } from "@/components/ClientProviders";
const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter-sans",
});

const garamod = EB_Garamond({
	subsets: ["latin"],
	variable: "--font-garamond",
	weight: ["400", "500", "600", "700"],
});

const kiona = localFont({
	src: [
		{
			path: "../../public/fonts/Kiona-Regular.ttf",
			weight: '400',
			style: 'normal',
		},
		{
			path: '../../public/fonts/Kiona-Itallic.ttf',
			weight: '400',
			style: 'italic',
		},
	],
	fallback: ['Inter', 'system-ui'],
	variable: '--font-kiona',
	display: 'swap',

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
		<ClientProviders>
			<html lang="en" className="hide-scroll" suppressHydrationWarning>
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
				<body className={`${inter.className}  font-sans antialiased hide-scroll`}>
					<ClerkErrorBoundary>
						<NotificationProvider>
							{children}
							<ChatSelect />
						</NotificationProvider>
					</ClerkErrorBoundary>
				</body>
			</html>
		</ClientProviders>
	);
}
