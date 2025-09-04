import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/providers";
import NavbarServer from "@/components/layout/NavbarServer"; 


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: " NITDIAN - NIT Durgapur International Alumni Network",
  description: "Connect. Collaborate. Contribute.",
};

export const revalidate = 0;           // (optional) avoid caching
export const dynamic = "force-dynamic" // (optional) ensure per-request rendering

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" suppressHydrationWarning>
    
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
        <ThemeProvider>
          
          <NavbarServer />
          
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
