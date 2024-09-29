import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AppProvider from "@/app/providers";
import { cn } from "@/lib/utils";

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
  title: "VRChat 模型公开检测",
  description: "自动定期批量检查 VRChat 模型公开状态",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable)}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
