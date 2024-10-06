import "./globals.css";
import AppProvider from "@/app/providers";
import NavBar from "@/components/navigation/nav-bar";

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
