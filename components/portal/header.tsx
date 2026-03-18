'use client';

import { NotificationDropdown } from './notifications';

type HeaderProps = {
  title: string;
  description?: string;
};

export function PortalHeader({ title, description }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}
