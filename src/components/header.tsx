'use client';

import { SettingsDialog } from './settings-dialog';
import Link from 'next/link';
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6 z-50">
      <nav className="flex items-center gap-4">
        <Link href="/" className="text-xl font-bold hover:text-primary transition-colors">
          Dashboard
        </Link>
        <Button variant="link" asChild>
          <Link href="/projection">Projeção</Link>
        </Button>
        <Button variant="link" asChild>
          <Link href="/calendar">Calendário</Link>
        </Button>
      </nav>
      <div className="ml-auto">
        <SettingsDialog />
      </div>
    </header>
  );
}
