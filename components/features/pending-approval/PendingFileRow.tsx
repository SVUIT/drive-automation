'use client';

import React from 'react';
import { Check, File } from 'lucide-react';
import { PendingItem, PendingFileItem } from './types';
import HighlightText from '@/components/common/HighlightText';

interface PendingFileRowProps {
  item: PendingItem;
  file: PendingFileItem;
  approverEmail: string;
  searchQuery?: string;
  isLoading: boolean;
  isApproved: boolean;
  error?: string;
  onApprove: () => void;
}

export default function PendingFileRow({
  file,
  approverEmail,
  searchQuery = '',
  isLoading,
  isApproved,
  error,
  onApprove,
}: PendingFileRowProps) {
  const FileIcon = file.icon || File;

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center relative gap-2 lg:gap-0 border-b border-dashed border-gray-100 lg:border-none pb-2 lg:pb-0 pt-2 lg:pt-0">
      {/* Horizontal connecting stub */}
      <div className="absolute left-[-15px] sm:left-[-25px] lg:left-[-36px] top-[18px] lg:top-1/2 w-2.5 sm:w-3 lg:w-4 h-px bg-gray-200" />

      {/* File name & Icon */}
      <div className="flex-1 lg:flex-[3] flex items-start gap-3 min-w-0 pr-0 lg:pr-4">
        <div className="flex items-center justify-center shrink-0 bg-white z-10 py-1">
          <FileIcon size={18} className={isApproved ? 'text-gray-300' : 'text-brand-blue'} />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`text-[14px] font-medium leading-tight ${
              isApproved ? 'text-gray-300 line-through' : 'text-gray-700'
            }`}
          >
            {file.url ? (
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 hover:underline transition-colors cursor-pointer break-all"
              >
                <HighlightText text={file.name} query={searchQuery} />
              </a>
            ) : (
              <span className="break-all">
                <HighlightText text={file.name} query={searchQuery} />
              </span>
            )}
          </div>
          {file.return_reason && (
            <div className="mt-1 text-[12px] text-amber-700">
              Lý do trả về: <HighlightText text={file.return_reason} query={searchQuery} />
            </div>
          )}
          {/* Approver email/error (Mobile only) */}
          {isApproved && (
            <span className="lg:hidden mt-0.5 text-[11px] text-gray-400 block truncate">
              Người duyệt: {approverEmail}
            </span>
          )}
          {error && <span className="lg:hidden mt-0.5 text-[11px] text-red-500 block">{error}</span>}
        </div>
      </div>

      {/* Generated path */}
      <div className="lg:flex-[2] pr-0 lg:pr-4 min-w-0 pl-7 lg:pl-0">
        {file.new_file_path ? (
          file.destination_folder_link ? (
            <a
              href={file.destination_folder_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate rounded bg-blue-50 px-2 py-1 font-mono text-[11px] text-blue-600 hover:underline"
              title={file.new_file_path}
            >
              <HighlightText text={file.new_file_path} query={searchQuery} />
            </a>
          ) : (
            <span
              className="block truncate rounded bg-gray-100 px-2 py-1 font-mono text-[11px] text-gray-600"
              title={file.new_file_path}
            >
              <HighlightText text={file.new_file_path} query={searchQuery} />
            </span>
          )
        ) : (
          <span className="block rounded bg-amber-50 px-2 py-1 font-mono text-[11px] text-amber-600">
            Chưa có path
          </span>
        )}
      </div>

      {/* Spacer - Desktop only */}
      <div className="hidden lg:block lg:flex-[1] pl-4" />

      {/* Approver - Desktop only */}
      <div className="hidden lg:flex lg:flex-[1.5] pr-4 items-center">
        {isApproved && <span className="text-[12px] text-gray-400 truncate">{approverEmail}</span>}
        {error && <span className="text-[11px] text-red-500">{error}</span>}
      </div>

      {/* Actions */}
      <div className="w-full lg:w-auto lg:flex-[1] flex items-center justify-end gap-2 mt-1 lg:mt-0">
        {isApproved ? (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#e6fcf5] text-[#0ca678]">
            Approved
          </span>
        ) : (
          <div className="flex gap-2 w-full lg:w-auto justify-end">
            <button
              disabled={isLoading || isApproved || !file.new_file_path?.trim()}
              onClick={onApprove}
              className="flex-1 lg:flex-none flex items-center justify-center w-auto lg:w-7 h-8 lg:h-7 rounded bg-[#183a64] text-white hover:bg-blue-900 transition-colors disabled:opacity-60 px-3 lg:px-0 text-xs font-semibold lg:font-normal cursor-pointer"
              title="Approve"
            >
              {isLoading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <>
                  <Check size={16} className="mr-1 lg:mr-0" />
                  <span className="lg:hidden">{file.new_file_path ? 'Duyệt' : 'Cần path'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
