import type { Metadata } from "next";
import "./globals.css";
import AppProvider from "@/app/providers";
import NavBar from "@/components/navigation/nav-bar";

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
        <AppProvider>
          <div className="h-full flex flex-row">
            <NavBar />
            <div className="flex-1 h-full">{children}</div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
