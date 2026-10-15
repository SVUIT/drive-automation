'use client';

import React from 'react';
import { Folder, MoreVertical } from 'lucide-react';
import { BatchItem, FileItem } from './types';
import HighlightText from '@/components/common/HighlightText';

interface BatchRowProps {
  batch: BatchItem;
  searchQuery?: string;
  onSelectFile: (file: FileItem) => void;
}

export default function BatchRow({
  batch,
  searchQuery = '',
  onSelectFile,
}: BatchRowProps) {
  return (
    <div className="flex flex-col">
      {/* Batch Header Row */}
      <div className="flex py-4 px-6 items-center">
        <div className="flex-3 flex items-center min-w-0">
          <div className="w-10 h-10 bg-brand-blue-bg rounded-lg flex items-center justify-center mr-4 shrink-0">
            <Folder size={20} className="text-brand-blue" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 mb-1 text-[14px] truncate">
              <HighlightText text={batch.name} query={searchQuery} />
            </div>
          </div>
        </div>
        <div className="flex-[2.5] flex items-center text-[14px] text-gray-500">
          {batch.docsCount}
        </div>
        <div className="w-15 flex items-center justify-end" />
      </div>

      {/* Nested File Rows */}
      {batch.files && batch.files.length > 0 && (
        <div className="px-6 pb-4 pl-20 flex flex-col gap-3 relative">
          <div className="absolute left-11 top-4 bottom-6 w-px bg-gray-200" />

          {batch.files.map((file, nestedIdx) => {
            const IconComponent = file.icon;
            return (
              <div
                key={file.id || nestedIdx}
                className="flex items-center gap-3 relative"
              >
                <div className="flex items-center justify-center text-gray-400 shrink-0 bg-white z-10 py-1">
                  <IconComponent size={16} />
                </div>
                <div className="flex-1 min-w-0 text-[14px] text-gray-500">
                  {file.url ? (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 hover:underline transition-colors"
                    >
                      <HighlightText text={file.name} query={searchQuery} />
                    </a>
                  ) : (
                    <HighlightText text={file.name} query={searchQuery} />
                  )}
                  {file.new_file_path && (
                    <div
                      className="mt-1 truncate font-mono text-[11px] text-blue-600"
                      title={file.new_file_path}
                    >
                      <HighlightText text={file.new_file_path} query={searchQuery} />
                    </div>
                  )}
                  {file.return_reason && (
                    <div className="mt-1 text-[12px] text-amber-700">
                      Lý do trả về:{' '}
                      <HighlightText text={file.return_reason} query={searchQuery} />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onSelectFile(file)}
                  className="bg-transparent border-none cursor-pointer text-gray-400 flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  title={file.new_file_path ? 'Update path' : 'Set path'}
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
