import type {Metadata} from 'next';
import './globals.css';
import { TradeDataProvider } from '@/context/trade-data-provider';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/context/theme-provider';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'TradeFlow',
  description: 'Sistema para gestão de banca de Day Trade',
};

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
            {children}
            <Toaster />
          </TradeDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
