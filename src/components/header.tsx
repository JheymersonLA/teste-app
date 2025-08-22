'use client';

import { SettingsDialog } from './settings-dialog';
import { TrendingUp } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 z-50">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">TradeFlow</h1>
      </div>
      <div className="ml-auto">
        <SettingsDialog />
      </div>
    </header>
  );
}
