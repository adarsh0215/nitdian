import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/providers";
import NavbarServer from "@/components/layout/NavbarServer";
import AuthWatcher from "@/components/auth/AuthWatcher";
import { Toaster } from "sonner";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NITDIAN - NIT Durgapur International Alumni Network",
  description: "Connect. Collaborate. Contribute.",
};

export const revalidate = 0;           
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          {/* ✅ Now fully client-safe */}
          <AuthWatcher />
          <NavbarServer />
          {children}
          <Toaster richColors position="top-right" /> {/* 👈 Needed */}
        </ThemeProvider>
      </body>
    </html>
  );
}
