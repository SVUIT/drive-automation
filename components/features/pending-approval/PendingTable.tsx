'use client';

import React from 'react';
import { PendingItem, PendingFileItem } from './types';
import { usePendingApproval } from '@/app/hooks/usePendingApproval';
import PendingSubmissionRow from './PendingSubmissionRow';
import EmptyState from '@/components/common/EmptyState';

// Re-export types for backward compatibility
export type { PendingItem, PendingFileItem };

interface PendingTableProps {
  data: PendingItem[];
  approverEmail: string;
  searchQuery?: string;
  onClearSearch?: () => void;
  onSubmissionDone: (submissionId: string) => void;
}

export default function PendingTable({
  data,
  approverEmail,
  searchQuery = '',
  onClearSearch,
  onSubmissionDone,
}: PendingTableProps) {
  const {
    loadingFileIds,
    loadingSubmissionIds,
    approvedFileIds,
    errors,
    isFileApproved,
    handleApproveFile,
    handleApproveAllFiles,
  } = usePendingApproval();

  return (
    <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden mt-6 border border-gray-100 pb-2">
      {/* Table Header */}
      <div className="hidden lg:flex py-4 px-6 bg-[#f9fafb] border-b border-gray-200 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
        <div className="flex-[3] flex items-center">Document name & files</div>
        <div className="flex-[2] flex items-center">Generated path</div>
        <div className="flex-[1] flex items-center">Total files</div>
        <div className="flex-[1.5] flex items-center">Approver</div>
        <div className="flex-[1] flex items-center justify-end">Actions</div>
      </div>

      {/* Table Body */}
      <div className="flex flex-col divide-y divide-gray-200">
        {data.map((item, idx) => (
          <PendingSubmissionRow
            key={item.id || idx}
            item={item}
            approverEmail={approverEmail}
            searchQuery={searchQuery}
            loadingSubmissionIds={loadingSubmissionIds}
            loadingFileIds={loadingFileIds}
            approvedFileIds={approvedFileIds}
            errors={errors}
            isFileApproved={isFileApproved}
            onApproveFile={(it, file) =>
              handleApproveFile(it, file, approverEmail, onSubmissionDone)
            }
            onApproveAllFiles={(it) =>
              handleApproveAllFiles(it, approverEmail, onSubmissionDone)
            }
          />
        ))}

        {/* Empty state */}
        {data.length === 0 && (
          <EmptyState
            searchQuery={searchQuery}
            emptyTitle="Không có tài liệu nào đang chờ duyệt."
            onClearSearch={onClearSearch}
          />
        )}
      </div>
    </div>
  );
}
