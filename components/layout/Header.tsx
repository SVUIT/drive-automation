'use client';

import { Search, Bell, Settings, User, LogOut, Menu } from "lucide-react";
import { useAuth } from "../../app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    router.replace('/login');
  };

  // Close menu when clicking outside
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
        <div className="flex items-center bg-gray-200 rounded-md py-2 px-4 w-full max-w-[200px] xs:max-w-[280px] sm:max-w-[400px] md:max-w-[500px] gap-3">
          <Search className="text-gray-500 shrink-0" size={18} />
          <input
            type="text"
            placeholder="Nhập tìm kiếm ..."
            className="border-none bg-transparent outline-none text-[14px] w-full text-gray-900 placeholder:text-gray-500 font-sans"
          />
        </div>
      </div>
      <div className="flex gap-4 items-center shrink-0">
        <button className="bg-transparent border-none cursor-pointer text-gray-500 flex items-center justify-center rounded-full w-10 h-10 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900">
          <Bell size={20} />
        </button>
        <button className="bg-transparent border-none cursor-pointer text-gray-500 flex items-center justify-center rounded-full w-10 h-10 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900">
          <Settings size={20} />
        </button>
        
        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="bg-transparent border-none cursor-pointer text-gray-500 flex items-center justify-center rounded-full w-10 h-10 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
          >
            <User size={20} />
          </button>
          
          {/* Dropdown menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
              {user && (
                <>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-[13px] font-semibold text-gray-900">{user.name || user.email}</p>
                    <p className="text-[12px] text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
