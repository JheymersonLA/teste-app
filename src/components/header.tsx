'use client';

import { SettingsDialog } from './settings-dialog';
import Link from 'next/link';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/projection', label: 'Projeção' },
    { href: '/calendar', label: 'Calendário' },
  ];

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6 z-50">
      <nav className="hidden md:flex items-center gap-2">
        {links.map(link => (
          <Button variant="ghost" asChild key={link.href}>
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
      <div className="flex w-full items-center gap-4 md:ml-auto md:w-auto">
        <div className="ml-auto flex-1 sm:flex-initial">
         <ThemeToggle />
        </div>
        <SettingsDialog />
      </div>
    </header>
  );
}
