import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { esES } from "@clerk/localizations";
import "./globals.css";
import ChatWithSuspense from "@/components/ChatWithSuspense";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Clínica Esteban Porras - Fisioterapia y Rehabilitación",
  description:
    "Centro especializado en fisioterapia, rehabilitación y terapia manual en Costa Rica. Profesionales certificados para tu recuperación integral.",
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
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased`}>
          {children}
          <ChatWithSuspense />
        </body>
      </html>
    </ClerkProvider>
  );
}
