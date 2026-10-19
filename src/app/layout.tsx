import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  metadataBase: new URL("https://roalcalafit.app"),
  title: "RO ALCALÁ FIT · Personal Trainer",
  description:
    "Entrená con Rocío Alcalá: rutinas personalizadas, planes de nutrición, feed de motivación y chat directo con tu entrenadora.",
  applicationName: "RO ALCALÁ FIT",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "RO ALCALÁ FIT",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "RO ALCALÁ FIT · Personal Trainer",
    description:
      "Rutinas, nutrición y seguimiento personalizado con Rocío Alcalá.",
    images: ["/icons/og.png"],
    type: "website",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#F2EFE7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-cream text-ink antialiased selection:bg-ink selection:text-cream">
        <div className="mx-auto min-h-dvh w-full max-w-[520px] bg-cream shadow-[0_0_80px_-30px_rgba(51,42,38,0.4)]">
          {children}
        </div>
        <PwaRegister />
      </body>
    </html>
  );
}
