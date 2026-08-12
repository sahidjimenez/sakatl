import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Archivo, Manrope, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import RegisterServiceWorker from "./register-sw";
import { clerkAppearance } from "@/lib/clerk-appearance";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Usadas solo por el home rediseñado (ver app/home.css, scope .home-page):
// el resto del sitio se queda con Geist para no cambiar su tipografía.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Sakatl",
  description: "Rutinas de ejercicio que se hacen juntos.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sakatl",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Sakatl",
    title: "Sakatl — rutinas que se hacen juntos",
    description: "Rutinas de ejercicio que se hacen juntos.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sakatl — rutinas que se hacen juntos",
    description: "Rutinas de ejercicio que se hacen juntos.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0f12",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider appearance={clerkAppearance}>
          {children}
          <RegisterServiceWorker />
        </ClerkProvider>
      </body>
    </html>
  );
}
