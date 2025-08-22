
'use client';

import './globals.css';
import { TradeDataProvider, useTrade } from '@/context/trade-data-provider';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/context/theme-provider';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Setup } from '@/components/setup';
import { Spinner } from 'phosphor-react';
import { Header } from '@/components/header';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

function AppLayout({ children }: { children: React.ReactNode }) {
  const { settings, isLoading } = useTrade();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !settings) {
      router.replace('/');
    }
    // Redirect to dashboard if settings exist and user is on the root page
    if (!isLoading && settings && pathname === '/') {
        router.replace('/dashboard');
    }
  }, [isLoading, settings, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Spinner className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!settings) {
    // If there are no settings, show the Setup page on the root path
    if (pathname === '/') {
        return (
            <main className="min-h-screen bg-background">
                <Setup />
            </main>
        );
    }
    // On other paths, it will be redirected by the useEffect, show loading meanwhile
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <Spinner className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Redirecionando...</p>
        </div>
      );
  }
  
  // If settings are loaded and the path is the root, let useEffect handle redirection
  if (pathname === '/') {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <Spinner className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Carregando Dashboard...</p>
        </div>
    );
  }

  // If settings are present, and we are not on the root page, show the app layout
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="container mx-auto flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TradeDataProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster />
          </TradeDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
