'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    router.replace('/login');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="bg-transparent border-none cursor-pointer text-gray-500 flex items-center justify-center rounded-full w-10 h-10 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
        aria-label="User profile menu"
      >
        <User size={20} />
      </button>

      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {user && (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-[13px] font-semibold text-gray-900 truncate">
                  {user.name || user.email}
                </p>
                <p className="text-[12px] text-gray-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
