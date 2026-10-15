'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  searchQuery?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onClearSearch?: () => void;
  className?: string;
}

export default function EmptyState({
  searchQuery,
  emptyTitle = 'Chưa có dữ liệu.',
  emptyDescription,
  onClearSearch,
  className = 'py-12 px-4',
}: EmptyStateProps) {
  if (searchQuery) {
    return (
      <div className={`text-center flex flex-col items-center justify-center ${className}`}>
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
          <Search size={20} />
        </div>
        <p className="text-gray-800 font-medium text-[15px] mb-1">
          Không tìm thấy kết quả phù hợp
        </p>
        <p className="text-gray-500 text-[13px] max-w-sm mb-3">
          Không có kết quả nào khớp với &ldquo;{searchQuery}&rdquo;. Thử tìm kiếm với tên tệp hoặc đường dẫn khác.
        </p>
        {onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`text-center text-gray-500 text-[14px] ${className}`}>
      <p>{emptyTitle}</p>
      {emptyDescription && <p className="text-xs text-gray-400 mt-1">{emptyDescription}</p>}
    </div>
  );
}
