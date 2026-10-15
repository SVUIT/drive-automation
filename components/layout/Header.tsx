'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import HeaderSearch from './HeaderSearch';
import UserMenu from './UserMenu';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-20 flex items-center justify-between px-4 sm:px-6 lg:px-10 bg-bg-light shrink-0 gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md shrink-0 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}
        <HeaderSearch />
      </div>

      <div className="flex gap-4 items-center shrink-0">
        <UserMenu />
      </div>
    </header>
  );
}
