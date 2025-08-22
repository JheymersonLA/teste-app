'use client';

import { SettingsDialog } from './settings-dialog';
import Link from 'next/link';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/projection', label: 'Projeção' },
    { href: '/calendar', label: 'Calendário' },
  ];

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6 z-50">
       <Link href="/dashboard" className="text-xl font-bold hover:text-primary transition-colors mr-4">
          TradeFlow
        </Link>
      <nav className="flex items-center gap-2">
        {links.map(link => (
          <Button variant="link" asChild key={link.href}>
            <Link 
              href={link.href} 
              className={cn(
                'text-muted-foreground hover:text-primary',
                pathname === link.href && 'text-primary font-semibold'
              )}
            >
              {link.label}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="ml-auto">
        <SettingsDialog />
      </div>
    </header>
  );
}
