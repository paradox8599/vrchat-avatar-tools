import type { Metadata } from "next";
import "./globals.css";
import AppProvider from "@/app/providers";

export const metadata: Metadata = {
  title: "VRChat 模型公开检测",
  description: "自动定期批量检查 VRChat 模型公开状态",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
