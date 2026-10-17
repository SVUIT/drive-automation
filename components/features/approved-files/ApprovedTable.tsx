'use client';

import React from 'react';
import { File, CheckCircle2, ExternalLink, Folder, X } from 'lucide-react';
import { GroupedSubmission, ApprovedFile } from './types';
import { getFileIcon } from '@/app/lib/file-icons';
import HighlightText from '@/components/common/HighlightText';
import EmptyState from '@/components/common/EmptyState';

interface ApprovedTableProps {
  groups: GroupedSubmission[];
  searchQuery?: string;
  onClearSearch?: () => void;
  onRequestReturnFile: (file: ApprovedFile, submissionId: string, submissionName: string) => void;
}

export default function ApprovedTable({
  groups,
  searchQuery = '',
  onClearSearch,
  onRequestReturnFile,
}: ApprovedTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-200 pb-2">
      {/* Header */}
      <div className="flex py-3.5 px-6 bg-[#f9fafb] border-b border-gray-200 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
        <div className="flex-[4] flex items-center">Submission / Tên File</div>
        <div className="flex-[4] flex items-center">Đường dẫn thư mục Drive</div>
        <div className="flex-[2] flex items-center justify-end">Trạng thái</div>
      </div>

      <div className="flex flex-col divide-y divide-gray-200">
        {groups.map((group) => (
          <div key={group.submissionId} className="flex flex-col">
            {/* Group Header */}
            <div className="flex py-3.5 px-6 items-center bg-[#fafafa]">
              <div className="flex-[4] flex items-center pr-4 min-w-0">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mr-3.5 shrink-0">
                  <File size={18} className="text-blue-600" />
                </div>
                <span className="font-bold text-[14px] text-gray-900 truncate">
                  <HighlightText text={group.submissionName} query={searchQuery} />
                </span>
              </div>
              <div className="flex-[4] text-[12px] text-gray-400">
                {group.files.length} tệp
              </div>
              <div className="flex-[2]" />
            </div>

            {/* Nested File Rows */}
            <div className="px-6 pb-4 pl-16 flex flex-col gap-2 relative">
              <div className="absolute left-10 top-[-14px] bottom-6 w-px bg-gray-200" />

              {group.files.map((file) => {
                const FileIcon = getFileIcon(file.name);
                return (
                  <div
                    key={file.gdrive_file_id}
                    className="flex items-center relative py-1.5 hover:bg-gray-50/50 rounded-md transition-colors"
                  >
                    <div className="absolute left-[-24px] top-1/2 w-3.5 h-px bg-gray-200" />

                    {/* File Name & Icon */}
                    <div className="flex-[4] flex items-center gap-2.5 pr-4 min-w-0">
                      <FileIcon size={17} className="text-blue-600 shrink-0" />
                      {file.web_view_link ? (
                        <a
                          href={file.web_view_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] font-medium text-gray-800 hover:text-blue-600 truncate inline-flex items-center gap-1 group"
                          title={file.name}
                        >
                          <span className="truncate">
                            <HighlightText text={file.name} query={searchQuery} />
                          </span>
                          <ExternalLink
                            size={12}
                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-blue-500"
                          />
                        </a>
                      ) : (
                        <span className="text-[13px] font-medium text-gray-700 truncate" title={file.name}>
                          <HighlightText text={file.name} query={searchQuery} />
                        </span>
                      )}
                    </div>

                    {/* Drive Destination Path */}
                    <div className="flex-[4] text-[12px] text-gray-500 pr-4 min-w-0 flex items-center gap-1.5">
                      {file.destination_folder_link ? (
                        <a
                          href={file.destination_folder_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-gray-600 hover:text-blue-600 truncate group"
                          title={file.new_file_path || 'Mở thư mục trên Google Drive'}
                        >
                          <Folder size={13} className="shrink-0 text-amber-500" />
                          <span className="truncate">
                            <HighlightText
                              text={file.new_file_path || 'Mở thư mục đích'}
                              query={searchQuery}
                            />
                          </span>
                          <ExternalLink
                            size={11}
                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          />
                        </a>
                      ) : file.new_file_path ? (
                        <span className="truncate text-gray-400" title={file.new_file_path}>
                          <HighlightText text={file.new_file_path} query={searchQuery} />
                        </span>
                      ) : (
                        <span className="text-gray-300 italic">Chưa chỉ định thư mục đích</span>
                      )}
                    </div>

                    {/* Status & Return Button */}
                    <div className="flex-[2] flex items-center justify-end gap-3">
                      <div className="flex items-center gap-1.5 bg-[#e6fcf5] px-2.5 py-0.5 rounded-full border border-[#c3fae8]">
                        <CheckCircle2 size={12} className="text-[#0ca678]" fill="#0ca678" color="white" />
                        <span className="uppercase text-[#0ca678] text-[10px] font-bold tracking-wide">
                          Approved
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onRequestReturnFile(file, String(group.submissionId), group.submissionName)
                        }
                        className="inline-flex h-7 w-7 items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
                        title="Trả file về Pending Approval"
                        aria-label={`Trả ${file.name} về Pending Approval`}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {groups.length === 0 && (
          <EmptyState
            searchQuery={searchQuery}
            emptyTitle="Chưa có tệp nào được phê duyệt."
            onClearSearch={onClearSearch}
          />
        )}
      </div>
    </div>
  );
}
