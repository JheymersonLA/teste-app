
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/context/theme-provider';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { loadData } from '@/lib/data-loader';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { settings } = await loadData();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {settings ? (
              <div className="flex min-h-screen w-full flex-col">
                <Header />
                <main className="container mx-auto flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                  {children}
                </main>
              </div>
            ) : (
                <main className="min-h-screen bg-background">
                  {children}
                </main>
            )}
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
