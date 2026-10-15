'use client';

import React from 'react';
import { Check, File } from 'lucide-react';
import { PendingItem, PendingFileItem } from './types';
import PendingFileRow from './PendingFileRow';
import HighlightText from '@/components/common/HighlightText';

interface PendingSubmissionRowProps {
  item: PendingItem;
  approverEmail: string;
  searchQuery?: string;
  loadingSubmissionIds: Set<string>;
  loadingFileIds: Set<string>;
  approvedFileIds: Set<string>;
  errors: Record<string, string>;
  isFileApproved: (file: PendingFileItem) => boolean;
  onApproveFile: (item: PendingItem, file: PendingFileItem) => void;
  onApproveAllFiles: (item: PendingItem) => void;
}

export default function PendingSubmissionRow({
  item,
  approverEmail,
  searchQuery = '',
  loadingSubmissionIds,
  loadingFileIds,
  approvedFileIds,
  errors,
  isFileApproved,
  onApproveFile,
  onApproveAllFiles,
}: PendingSubmissionRowProps) {
  const IconComponent = item.icon || File;
  const isSubmissionLoading = loadingSubmissionIds.has(item.id);
  const cannotApproveAll =
    isSubmissionLoading || (item.files ?? []).some((file) => !file.new_file_path?.trim());

  return (
    <div className="flex flex-col">
      {/* Submission row */}
      <div className="flex flex-col lg:flex-row py-4 px-4 sm:px-6 lg:items-center bg-[#fafafa] gap-3 lg:gap-0">
        {/* Name & Icon */}
        <div className="flex-1 lg:flex-[3] flex items-center pr-0 lg:pr-4 min-w-0">
          <div className="w-10 h-10 bg-brand-blue-bg rounded-lg flex items-center justify-center mr-4 shrink-0">
            <IconComponent size={20} className="text-brand-blue" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-[14px] text-gray-900 block truncate">
              <HighlightText text={item.name} query={searchQuery} />
            </span>
            {errors[item.id] && (
              <span className="mt-1 block text-[11px] text-red-600">{errors[item.id]}</span>
            )}
          </div>
        </div>

        {/* Spacer for generated path */}
        <div className="hidden lg:block lg:flex-[2] pr-4" />

        {/* Total files (Desktop only) */}
        <div className="hidden lg:flex lg:flex-[1] items-center text-[14px] font-medium text-gray-600 pl-4">
          <span>
            {item.totalFiles} file{item.totalFiles !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Spacer for approver */}
        <div className="hidden lg:block lg:flex-[1.5]" />

        {/* Approve all button (Desktop only) */}
        <div className="hidden lg:flex lg:flex-[1] items-center justify-end">
          <button
            disabled={cannotApproveAll}
            onClick={() => onApproveAllFiles(item)}
            className="flex items-center justify-center w-7 h-7 rounded bg-[#183a64] text-white hover:bg-blue-900 transition-colors disabled:opacity-60 cursor-pointer"
            title="Duyệt tất cả"
          >
            {isSubmissionLoading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <Check size={16} />
            )}
          </button>
        </div>

        {/* Mobile metadata line: total files & approve all button */}
        <div className="flex lg:hidden items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="text-[13px] text-gray-500 font-medium">
            Tổng số file: <span className="text-gray-800 font-bold">{item.totalFiles}</span>
          </div>
          <button
            disabled={cannotApproveAll}
            onClick={() => onApproveAllFiles(item)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#183a64] text-white hover:bg-blue-900 transition-colors disabled:opacity-60 text-xs font-semibold cursor-pointer"
            title="Duyệt tất cả"
          >
            {isSubmissionLoading ? (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <>
                <Check size={14} />
                <span>Duyệt tất cả</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Nested File Rows */}
      {item.files && item.files.length > 0 && (
        <div className="px-4 sm:px-6 pb-5 pl-6 sm:pl-8 lg:pl-20 flex flex-col gap-2 relative">
          <div className="absolute left-[15px] sm:left-[20px] lg:left-11 top-[-16px] bottom-7 w-px bg-gray-200" />
          {item.files.map((file, nestedIdx) => (
            <PendingFileRow
              key={file.gdrive_file_id || nestedIdx}
              item={item}
              file={file}
              approverEmail={approverEmail}
              searchQuery={searchQuery}
              isLoading={loadingFileIds.has(file.gdrive_file_id)}
              isApproved={isFileApproved(file) || approvedFileIds.has(file.gdrive_file_id)}
              error={errors[file.gdrive_file_id]}
              onApprove={() => onApproveFile(item, file)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
