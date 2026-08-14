'use client';

import React, { useState } from "react";
import { Check, X, File } from "lucide-react";

export type PendingFileItem = {
  gdrive_file_id: string;
  name: string;
  icon: React.ElementType;
  web_view_link?: string;
  new_file_path?: string;
  destination_folder_link?: string;
  is_approved?: boolean;
  move_status?: string;
  url?: string;
  new_path?: string;
};

export type PendingItem = {
  id: string;
  name: string;
  generatedPath: string;
  totalFiles: number;
  icon: React.ElementType;
  files?: PendingFileItem[];
};

interface PendingTableProps {
  data: PendingItem[];
  approverEmail: string;
  onFileApproved: (submissionId: string, submissionName: string, file: PendingFileItem) => void;
  onSubmissionDone: (submissionId: string) => void;
}

const APPWRITE_URL = '/api/appwrite';

export default function PendingTable({ data, approverEmail, onFileApproved, onSubmissionDone }: PendingTableProps) {
  const [loadingFileIds, setLoadingFileIds] = useState<Set<string>>(new Set());
  const [loadingSubmissionIds, setLoadingSubmissionIds] = useState<Set<string>>(new Set());
  const [skippedFileIds, setSkippedFileIds] = useState<Set<string>>(new Set());
  const [approvedFileIds, setApprovedFileIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setFileLoading = (id: string, val: boolean) =>
    setLoadingFileIds(prev => { const s = new Set(prev); val ? s.add(id) : s.delete(id); return s; });

  const setSubmissionLoading = (id: string, val: boolean) =>
    setLoadingSubmissionIds(prev => { const s = new Set(prev); val ? s.add(id) : s.delete(id); return s; });

  const handleApproveFile = async (item: PendingItem, file: PendingFileItem) => {
    if (!approverEmail) {
      setErrors(prev => ({ ...prev, [file.gdrive_file_id]: "Chưa đăng nhập." }));
      return;
    }

    setErrors(prev => ({ ...prev, [file.gdrive_file_id]: "" }));
    setFileLoading(file.gdrive_file_id, true);

    try {
      const res = await fetch(APPWRITE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "insert file path",
          new_path: file.new_file_path || item.generatedPath,
          approver: approverEmail,
          is_approved: true,
          file_id: file.gdrive_file_id,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setApprovedFileIds(prev => new Set(prev).add(file.gdrive_file_id));
      onFileApproved(item.id, item.name, file);

      // Check if all files in this submission are done (approved or skipped)
      const allFileIds = (item.files ?? []).map(f => f.gdrive_file_id);
      const newApproved = new Set(approvedFileIds).add(file.gdrive_file_id);
      const allDone = allFileIds.every(id => newApproved.has(id) || skippedFileIds.has(id));
      if (allDone) {
        // Approve the submission
        await fetch(APPWRITE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "approve submission", submission_id: item.id }),
        });
        onSubmissionDone(item.id);
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, [file.gdrive_file_id]: "Lỗi. Thử lại." }));
    } finally {
      setFileLoading(file.gdrive_file_id, false);
    }
  };

  const handleSkipFile = (item: PendingItem, file: PendingFileItem) => {
    setSkippedFileIds(prev => {
      const s = new Set(prev).add(file.gdrive_file_id);
      // Check if all done after skip
      const allFileIds = (item.files ?? []).map(f => f.gdrive_file_id);
      const allDone = allFileIds.every(id => approvedFileIds.has(id) || s.has(id));
      if (allDone) onSubmissionDone(item.id);
      return s;
    });
  };

  const handleApproveAllFiles = async (item: PendingItem) => {
    if (!approverEmail) {
      setErrors(prev => ({ ...prev, [item.id]: "Chưa đăng nhập." }));
      return;
    }

    setErrors(prev => ({ ...prev, [item.id]: "" }));
    setSubmissionLoading(item.id, true);

    try {
      const files = item.files ?? [];
      
      // Approve all files
      await Promise.all(
        files.map(async (file) => {
          // Skip already approved or skipped files
          if (approvedFileIds.has(file.gdrive_file_id) || skippedFileIds.has(file.gdrive_file_id)) {
            return;
          }

          const res = await fetch(APPWRITE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "insert file path",
              new_path: file.new_file_path || item.generatedPath,
              approver: approverEmail,
              is_approved: true,
              file_id: file.gdrive_file_id,
            }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          setApprovedFileIds(prev => new Set(prev).add(file.gdrive_file_id));
          onFileApproved(item.id, item.name, file);
        })
      );

      // Approve the submission
      await fetch(APPWRITE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve submission", submission_id: item.id }),
      });

      onSubmissionDone(item.id);
    } catch (err) {
      setErrors(prev => ({ ...prev, [item.id]: "Lỗi. Thử lại." }));
    } finally {
      setSubmissionLoading(item.id, false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden mt-6 border border-gray-100 pb-2">
      {/* Header */}
      <div className="hidden lg:flex py-4 px-6 bg-[#f9fafb] border-b border-gray-200 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
        <div className="flex-[3] flex items-center">Document name & files</div>
        <div className="flex-[2] flex items-center">Generated path</div>
        <div className="flex-[1] flex items-center">Total files</div>
        <div className="flex-[1.5] flex items-center">Approver</div>
        <div className="flex-[1] flex items-center justify-end">Actions</div>
      </div>

      <div className="flex flex-col divide-y divide-gray-200">
        {data.map((item, idx) => {
          const IconComponent = item.icon || File;
          return (
            <div key={item.id || idx} className="flex flex-col">
              {/* Submission row */}
              <div className="flex flex-col lg:flex-row py-4 px-4 sm:px-6 lg:items-center bg-[#fafafa] gap-3 lg:gap-0">
                {/* Name & Icon */}
                <div className="flex-1 lg:flex-[3] flex items-center pr-0 lg:pr-4 min-w-0">
                  <div className="w-10 h-10 bg-brand-blue-bg rounded-lg flex items-center justify-center mr-4 shrink-0">
                    <IconComponent size={20} className="text-brand-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-[14px] text-gray-900 block truncate">{item.name}</span>
                  </div>
                </div>

                {/* Generated path is displayed on each file row only. */}
                <div className="hidden lg:block lg:flex-[2] pr-4" />

                {/* Total files (Desktop only) */}
                <div className="hidden lg:flex lg:flex-[1] items-center text-[14px] font-medium text-gray-600 pl-4">
                  <span>{item.totalFiles} file{item.totalFiles !== 1 ? 's' : ''}</span>
                </div>

                {/* Approver space (desktop spacer) */}
                <div className="hidden lg:block lg:flex-[1.5]" />

                {/* Approve all button (Desktop only) */}
                <div className="hidden lg:flex lg:flex-[1] items-center justify-end">
                  <button
                    disabled={loadingSubmissionIds.has(item.id)}
                    onClick={() => handleApproveAllFiles(item)}
                    className="flex items-center justify-center w-7 h-7 rounded bg-[#183a64] text-white hover:bg-blue-900 transition-colors disabled:opacity-60 cursor-pointer"
                    title="Approve All"
                  >
                    {loadingSubmissionIds.has(item.id) ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
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
                    disabled={loadingSubmissionIds.has(item.id)}
                    onClick={() => handleApproveAllFiles(item)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#183a64] text-white hover:bg-blue-900 transition-colors disabled:opacity-60 text-xs font-semibold cursor-pointer"
                    title="Approve All"
                  >
                    {loadingSubmissionIds.has(item.id) ? (
                      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
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

              {/* File rows */}
              {item.files && item.files.length > 0 && (
                <div className="px-4 sm:px-6 pb-5 pl-6 sm:pl-8 lg:pl-20 flex flex-col gap-2 relative">
                  <div className="absolute left-[15px] sm:left-[20px] lg:left-11 top-[-16px] bottom-7 w-px bg-gray-200" />
                  {item.files.map((file, nestedIdx) => {
                    const FileIcon = file.icon || File;
                    const isLoading = loadingFileIds.has(file.gdrive_file_id);
                    const isApproved = approvedFileIds.has(file.gdrive_file_id);
                    const isSkipped = skippedFileIds.has(file.gdrive_file_id);
                    const isDone = isApproved || isSkipped;

                    return (
                      <div key={file.gdrive_file_id || nestedIdx} className="flex flex-col lg:flex-row items-stretch lg:items-center relative gap-2 lg:gap-0 border-b border-dashed border-gray-100 lg:border-none pb-2 lg:pb-0 pt-2 lg:pt-0">
                        <div className="absolute left-[-15px] sm:left-[-25px] lg:left-[-36px] top-[18px] lg:top-1/2 w-2.5 sm:w-3 lg:w-4 h-px bg-gray-200" />

                        {/* File name */}
                        <div className="flex-1 lg:flex-[3] flex items-start gap-3 min-w-0 pr-0 lg:pr-4">
                          <div className="flex items-center justify-center shrink-0 bg-white z-10 py-1">
                            <FileIcon size={18} className={isDone ? "text-gray-300" : "text-brand-blue"} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-[14px] font-medium leading-tight ${isDone ? 'text-gray-300 line-through' : 'text-gray-700'}`}>
                              {file.url ? (
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-blue-600 hover:underline transition-colors cursor-pointer break-all"
                                >
                                  {file.name}
                                </a>
                              ) : (
                                <span className="break-all">{file.name}</span>
                              )}
                            </div>
                            {/* Approver email/error (Mobile only) */}
                            {isApproved && (
                              <span className="lg:hidden mt-0.5 text-[11px] text-gray-400 block truncate">
                                Người duyệt: {approverEmail}
                              </span>
                            )}
                            {errors[file.gdrive_file_id] && (
                              <span className="lg:hidden mt-0.5 text-[11px] text-red-500 block">
                                {errors[file.gdrive_file_id]}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Generated path of this file from submitted_files.new_file_path */}
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
                                {file.new_file_path}
                              </a>
                            ) : (
                              <span
                                className="block truncate rounded bg-gray-100 px-2 py-1 font-mono text-[11px] text-gray-600"
                                title={file.new_file_path}
                              >
                                {file.new_file_path}
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
                          {isApproved && (
                            <span className="text-[12px] text-gray-400 truncate">{approverEmail}</span>
                          )}
                          {errors[file.gdrive_file_id] && (
                            <span className="text-[11px] text-red-500">{errors[file.gdrive_file_id]}</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="w-full lg:w-auto lg:flex-[1] flex items-center justify-end gap-2 mt-1 lg:mt-0">
                          {isDone ? (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              isApproved
                                ? 'bg-[#e6fcf5] text-[#0ca678]'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {isApproved ? 'Approved' : 'Skipped'}
                            </span>
                          ) : (
                            <div className="flex gap-2 w-full lg:w-auto justify-end">
                              <button
                                disabled={isLoading}
                                onClick={() => handleSkipFile(item, file)}
                                className="flex-1 lg:flex-none flex items-center justify-center w-auto lg:w-7 h-8 lg:h-7 rounded bg-[#ffe6e6] text-[#e03131] hover:bg-[#ffcccc] transition-colors disabled:opacity-40 px-3 lg:px-0 text-xs font-semibold lg:font-normal cursor-pointer"
                                title="Skip"
                              >
                                <X size={16} className="mr-1 lg:mr-0" />
                                <span className="lg:hidden">Bỏ qua</span>
                              </button>
                              <button
                                disabled={isLoading}
                                onClick={() => handleApproveFile(item, file)}
                                className="flex-1 lg:flex-none flex items-center justify-center w-auto lg:w-7 h-8 lg:h-7 rounded bg-[#183a64] text-white hover:bg-blue-900 transition-colors disabled:opacity-60 px-3 lg:px-0 text-xs font-semibold lg:font-normal cursor-pointer"
                                title="Approve"
                              >
                                {isLoading ? (
                                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
                                  </svg>
                                ) : (
                                  <>
                                    <Check size={16} className="mr-1 lg:mr-0" />
                                    <span className="lg:hidden">Duyệt</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="py-8 text-center text-gray-500 text-[14px]">
            No pending documents available.
          </div>
        )}
      </div>
    </div>
  );
}
