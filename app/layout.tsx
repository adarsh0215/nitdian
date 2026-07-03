import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/app/providers";
import Navbar from "@/components/layout/Navbar";
import NavbarUser from "@/components/layout/NavbarUser";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <Navbar
            userSlot={
              <Suspense fallback={<div className="h-8 w-8 rounded-full bg-muted animate-pulse" />}>
                <NavbarUser />
              </Suspense>
            }
          />
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
