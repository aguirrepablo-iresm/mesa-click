import type { Metadata } from "next";
import { Inter, Geist_Mono, Anton } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mesa CLICK | Digital Workbench",
  description: "Administración gastronómica profesional y precisa.",
  metadataBase: new URL("https://mesa-click-web.onrender.com"),
  icons: {
    icon: "/mesa-click-logo-120.png",
    apple: "/mesa-click-logo-120.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-canvas-white text-ash-graphite">
        {children}
      </body>
    </html>
  );
}
