'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface SearchFilterBannerProps {
  query: string;
  fileCount: number;
  groupCount: number;
  groupUnit?: string;
  onClear: () => void;
  className?: string;
}

export default function SearchFilterBanner({
  query,
  fileCount,
  groupCount,
  groupUnit = 'submission',
  onClear,
  className = 'mb-4',
}: SearchFilterBannerProps) {
  if (!query) return null;

  return (
    <div
      className={`flex items-center justify-between gap-3 bg-blue-50/80 border border-blue-200 text-blue-900 px-4 py-2.5 rounded-lg text-[13px] animate-in fade-in duration-150 ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Search size={15} className="text-blue-600 shrink-0" />
        <span className="truncate">
          Bộ lọc: <strong>&ldquo;{query}&rdquo;</strong> • Tìm thấy <strong>{fileCount}</strong> tệp trong <strong>{groupCount}</strong> {groupUnit}
        </span>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline shrink-0 cursor-pointer"
      >
        Xóa bộ lọc
      </button>
    </div>
  );
}
