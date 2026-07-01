'use client';

import React, { useState } from "react";
import { Check, X, File } from "lucide-react";

export type PendingFileItem = {
  gdrive_file_id: string;
  name: string;
  icon: any;
  is_approved?: boolean;
  move_status?: string;
};

export type PendingItem = {
  id: string;
  name: string;
  generatedPath: string;
  totalFiles: number;
  icon: any;
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
          new_path: (item.generatedPath ?? '') + file.name,
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
              new_path: (item.generatedPath ?? '') + file.name,
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
      <div className="flex py-4 px-6 bg-[#f9fafb] border-b border-gray-200 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
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
              <div className="flex py-4 px-6 items-center bg-[#fafafa]">
                <div className="flex-[3] flex items-center pr-4">
                  <div className="w-10 h-10 bg-brand-blue-bg rounded-lg flex items-center justify-center mr-4 shrink-0">
                    <IconComponent size={20} className="text-brand-blue" />
                  </div>
                  <span className="font-bold text-[14px] text-gray-900 truncate">{item.name}</span>
                </div>
                <div className="flex-[2] flex items-center pr-4">
                  <span className="bg-gray-100 text-gray-500 text-[12px] px-2 py-1 rounded font-mono truncate">
                    {item.generatedPath || '—'}
                  </span>
                </div>
                <div className="flex-[1] flex items-center text-[14px] font-medium text-gray-600 pl-4">
                  {item.totalFiles}
                </div>
                <div className="flex-[1.5]" />
                <div className="flex-[1] flex items-center justify-end">
                  <button
                    disabled={loadingSubmissionIds.has(item.id)}
                    onClick={() => handleApproveAllFiles(item)}
                    className="flex items-center justify-center w-7 h-7 rounded bg-[#183a64] text-white hover:bg-blue-900 transition-colors disabled:opacity-60"
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
              </div>

              {/* File rows */}
              {item.files && item.files.length > 0 && (
                <div className="px-6 pb-5 pl-20 flex flex-col gap-2 relative">
                  <div className="absolute left-11 top-[-16px] bottom-7 w-px bg-gray-200" />
                  {item.files.map((file, nestedIdx) => {
                    const FileIcon = file.icon || File;
                    const isLoading = loadingFileIds.has(file.gdrive_file_id);
                    const isApproved = approvedFileIds.has(file.gdrive_file_id);
                    const isSkipped = skippedFileIds.has(file.gdrive_file_id);
                    const isDone = isApproved || isSkipped;

                    return (
                      <div key={file.gdrive_file_id || nestedIdx} className="flex items-center relative">
                        <div className="absolute left-[-36px] top-1/2 w-4 h-px bg-gray-200" />

                        {/* File name */}
                        <div className="flex-[3] flex items-center gap-3 pr-4">
                          <div className="flex items-center justify-center shrink-0 bg-white z-10 py-1">
                            <FileIcon size={18} className={isDone ? "text-gray-300" : "text-brand-blue"} />
                          </div>
                          <div className={`text-[14px] font-medium truncate ${isDone ? 'text-gray-300 line-through' : 'text-gray-600'}`}>
                            {file.name}
                          </div>
                        </div>

                        {/* Path (inherited from submission) */}
                        <div className="flex-[2] pr-4" />

                        {/* — */}
                        <div className="flex-[1] pl-4" />

                        {/* Approver */}
                        <div className="flex-[1.5] pr-4">
                          {isApproved && (
                            <span className="text-[12px] text-gray-400 truncate">{approverEmail}</span>
                          )}
                          {errors[file.gdrive_file_id] && (
                            <span className="text-[11px] text-red-500">{errors[file.gdrive_file_id]}</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex-[1] flex items-center justify-end gap-2">
                          {isDone ? (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              isApproved
                                ? 'bg-[#e6fcf5] text-[#0ca678]'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {isApproved ? 'Approved' : 'Skipped'}
                            </span>
                          ) : (
                            <>
                              <button
                                disabled={isLoading}
                                onClick={() => handleSkipFile(item, file)}
                                className="flex items-center justify-center w-7 h-7 rounded bg-[#ffe6e6] text-[#e03131] hover:bg-[#ffcccc] transition-colors disabled:opacity-40"
                                title="Skip"
                              >
                                <X size={16} />
                              </button>
                              <button
                                disabled={isLoading}
                                onClick={() => handleApproveFile(item, file)}
                                className="flex items-center justify-center w-7 h-7 rounded bg-[#183a64] text-white hover:bg-blue-900 transition-colors disabled:opacity-60"
                                title="Approve"
                              >
                                {isLoading ? (
                                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
                                  </svg>
                                ) : (
                                  <Check size={16} />
                                )}
                              </button>
                            </>
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