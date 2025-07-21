import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from 'next/font/google'
import { esES } from "@clerk/localizations";
import "./globals.css";
import FloatingChat from "@/components/Chat";
import SupportChat from "@/components/ChatSoporte";
import { checkRole } from "@/utils/roles"

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: "Clínica Esteban Porras - Fisioterapia y Rehabilitación",
  description: "Centro especializado en fisioterapia, rehabilitación y terapia manual en Costa Rica. Profesionales certificados para tu recuperación integral.",
};

export default async function  RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
    appearance={{
      variables: {
        colorPrimary: 'var(--complementario)',
        colorBackground: 'var(--card)',
        colorInputBackground: 'var(--card-secondary)',
        colorNeutral: 'var(--foreground)',
        colorText: 'var(--text-primary)',
        colorInputText:  'var(--foreground)',
        colorTextOnPrimaryBackground: 'var(--primary-foreground)',
        colorShimmer: 'var(--text-primary-foreground)'
        
      }
    }
    }
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      localization={esES}
    >
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased`}>
          {children}
          {(await checkRole("admin")) ? (
                <SupportChat/>
          ) : (
            <FloatingChat/>
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}
