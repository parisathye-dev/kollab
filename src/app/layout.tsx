import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeInitializer } from "@/components/kollab/shared/ThemeInitializer";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KOLLAB",
  description: "A two-sided gig marketplace for artists and local businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full font-sans antialiased", inter.variable)}>
      <body className="min-h-full flex flex-col">
        <ThemeInitializer />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
