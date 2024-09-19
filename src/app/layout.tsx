import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AuthProvider from "@/providers/auth-provider";
import InitProvider from "@/providers/init-provider";
import ThemeProvider from "@/providers/theme-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "模型公开检测",
  description: "批量检查 VRChat 模型公开状态",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark `}
      >
        <ThemeProvider>
          <InitProvider>
            <AuthProvider>
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster />
            </AuthProvider>
          </InitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
