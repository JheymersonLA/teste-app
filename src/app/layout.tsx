import type {Metadata} from 'next';
import './globals.css';
import { TradeDataProvider } from '@/context/trade-data-provider';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/context/theme-provider';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
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
