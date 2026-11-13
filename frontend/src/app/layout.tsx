import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Agendu",
  description: "Tu carrera entera, organizada en un solo lugar.",
};

export const viewport: Viewport = {
  themeColor: "#F7F6F2",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={jakarta.variable}>
      <body className="min-h-dvh bg-fondo font-sans text-tinta antialiased">
        {children}
      </body>
    </html>
  );
}
