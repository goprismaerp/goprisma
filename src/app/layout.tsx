import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "./components/Sidebar";
import ThemeToggle from "./components/ThemeToggle";

export const metadata: Metadata = {
  title: "GoPrisma - Sistema ERP",
  description: "Sistema ERP para gestão de produtos 3D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col lg:flex-row bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased">
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-end px-4 lg:px-8 bg-white dark:bg-zinc-900 lg:pl-8 pl-16">
          <ThemeToggle />
        </header>
        <div className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8">{children}</div>
      </main>
    </>
  );
}
