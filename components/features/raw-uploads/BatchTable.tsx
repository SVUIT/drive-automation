'use client';

import React, { useState } from 'react';
import { BatchItem, FileItem } from './types';
import SelectPathDrawer from './SelectPathDrawer';
import BatchRow from './BatchRow';
import EmptyState from '@/components/common/EmptyState';

// Re-export types for backward compatibility
export type { FileItem, BatchItem };

interface BatchTableProps {
  data: BatchItem[];
  searchQuery?: string;
  onPathSaved?: (file: FileItem, path: string) => void;
  onClearSearch?: () => void;
}

export default function BatchTable({
  data,
  searchQuery = '',
  onPathSaved,
  onClearSearch,
}: BatchTableProps) {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  return (
    <>
      <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden mt-6 border border-gray-100">
        {/* Table Header */}
        <div className="flex py-4 px-6 bg-[#f9fafb] border-b border-gray-200 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
          <div className="flex-3 flex items-center">BATCH NAME & FILES</div>
          <div className="flex-[2.5] flex items-center">NUMBER OF FILES</div>
          <div className="w-15 flex items-center justify-end">ACTION</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col divide-y divide-gray-200">
          {data.map((batch, idx) => (
            <BatchRow
              key={batch.form_submissions_id || idx}
              batch={batch}
              searchQuery={searchQuery}
              onSelectFile={(file) => setSelectedFile(file)}
            />
          ))}

          {/* Empty state */}
          {data.length === 0 && (
            <EmptyState
              searchQuery={searchQuery}
              emptyTitle="No data available."
              onClearSearch={onClearSearch}
            />
          )}
        </div>
      </div>

      <SelectPathDrawer
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        file={selectedFile}
        onPathSaved={(savedFile, path) => {
          onPathSaved?.(savedFile, path);
          setSelectedFile(null);
        }}
      />
    </>
  );
}
