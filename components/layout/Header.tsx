'use client';

import { Search, User, LogOut, Menu, X, ExternalLink, FileText, Folder, CheckCircle2, Clock, FileUp } from "lucide-react";
import { useAuth } from "../../app/context/AuthContext";
import { useSearch, SearchScope, SearchableItem } from "../../app/context/SearchContext";
import HighlightText from "../common/HighlightText";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery, clearSearch, scope, setScope, matchingItems } = useSearch();
  const router = useRouter();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    router.replace('/login');
  };

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        inputRef.current?.blur();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResultClick = (item: SearchableItem) => {
    setIsSearchFocused(false);
    router.push(item.route);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'raw-uploads':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            <FileUp size={10} />
            Raw
          </span>
        );
      case 'pending-approval':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            <Clock size={10} />
            Pending
          </span>
        );
      case 'approved-files':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            <CheckCircle2 size={10} />
            Approved
          </span>
        );
      default:
        return null;
    }
  };

  const scopes: { id: SearchScope; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'files', label: 'Tên file' },
    { id: 'paths', label: 'Đường dẫn' },
    { id: 'submissions', label: 'Submission' },
  ];

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

        {/* Global Search Bar */}
        <div className="relative w-full max-w-[240px] xs:max-w-[300px] sm:max-w-[420px] md:max-w-[520px]" ref={searchContainerRef}>
          <div
            className={`flex items-center bg-gray-200/80 rounded-lg py-2 px-3.5 w-full gap-2.5 transition-all duration-200 border ${
              isSearchFocused
                ? 'bg-white border-blue-500 ring-2 ring-blue-100 shadow-sm'
                : 'border-transparent hover:bg-gray-200'
            }`}
          >
            <Search className="text-gray-500 shrink-0" size={18} />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!isSearchFocused) setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Tìm kiếm file, submission, đường dẫn..."
              className="border-none bg-transparent outline-none text-[14px] w-full text-gray-900 placeholder:text-gray-500 font-sans"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  clearSearch();
                  inputRef.current?.focus();
                }}
                className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200/60 cursor-pointer transition-colors"
                title="Xóa tìm kiếm"
              >
                <X size={15} />
              </button>
            )}

            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold text-gray-400 bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 select-none shrink-0">
              Ctrl K
            </kbd>
          </div>

          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Scopes Filter Bar */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 bg-gray-50/70 text-xs">
                <span className="font-semibold text-gray-600">Phạm vi:</span>
                <div className="flex items-center gap-1">
                  {scopes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setScope(s.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        scope === s.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-200/70'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100">
                {matchingItems.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <p className="text-sm font-medium text-gray-700">Không tìm thấy kết quả phù hợp</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Thử đổi phạm vi tìm kiếm hoặc nhập từ khóa khác
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="px-3.5 py-1.5 bg-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex justify-between items-center">
                      <span>Kết quả tìm kiếm ({matchingItems.length})</span>
                      <span className="text-[10px] lowercase font-normal text-gray-400">chọn để đi tới trang</span>
                    </div>
                    {matchingItems.slice(0, 10).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleResultClick(item)}
                        className="px-3.5 py-2.5 hover:bg-blue-50/50 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div className="p-1.5 rounded-md bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 shrink-0 mt-0.5">
                            {item.isSubmissionGroup ? <Folder size={15} /> : <FileText size={15} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-medium text-gray-900 truncate">
                              <HighlightText text={item.title} query={searchQuery} />
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                              {item.subtitle && (
                                <span className="truncate">
                                  <HighlightText text={item.subtitle} query={searchQuery} />
                                </span>
                              )}
                              {item.path && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="font-mono text-gray-500 truncate max-w-[200px]" title={item.path}>
                                    <HighlightText text={item.path} query={searchQuery} />
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {getCategoryBadge(item.category)}
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Mở trên Google Drive"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                    {matchingItems.length > 10 && (
                      <div className="px-3.5 py-2 text-center text-xs text-gray-500 bg-gray-50">
                        Còn {matchingItems.length - 10} kết quả khác. Xem chi tiết trên trang tương ứng.
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="px-3.5 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>Nhấn <kbd className="font-sans px-1 py-0.5 bg-white border border-gray-200 rounded">Esc</kbd> để đóng</span>
                <span>Tự động lọc nội dung trên trang</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-center shrink-0">
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
