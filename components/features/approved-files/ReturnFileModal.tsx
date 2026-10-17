'use client';

import React, { useState } from 'react';
import { ApprovedFile } from './types';
import { saveReturnedFile } from '@/app/approved-files/returned-files';

interface ReturnFileModalProps {
  returningFile: {
    file: ApprovedFile;
    submissionId: string;
    submissionName: string;
  } | null;
  onClose: () => void;
  onSuccess: (fileId: string) => void;
}

export default function ReturnFileModal({
  returningFile,
  onClose,
  onSuccess,
}: ReturnFileModalProps) {
  const [returnReason, setReturnReason] = useState('');
  const [returnError, setReturnError] = useState<string | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  if (!returningFile) return null;

  const handleReturnFile = async () => {
    if (!returnReason.trim()) {
      setReturnError('Vui lòng nhập lý do trả file.');
      return;
    }

    setIsReturning(true);
    setReturnError(null);

    try {
      if (returningFile.file.new_file_path?.trim()) {
        const response = await fetch('/api/appwrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'insert file path',
            new_path: returningFile.file.new_file_path,
            approver: 'file-return',
            is_approved: null,
            file_id: returningFile.file.gdrive_file_id,
          }),
        });

        const result = await response.json();
        if (!response.ok || result.error) {
          const detail =
            typeof result.detail === 'string'
              ? result.detail
              : result.detail
                ? JSON.stringify(result.detail)
                : result.error;
          throw new Error(detail || `HTTP ${response.status}`);
        }
      }

      saveReturnedFile({
        fileId: returningFile.file.gdrive_file_id,
        submissionId: returningFile.submissionId,
        submissionName: returningFile.submissionName,
        name: returningFile.file.name,
        url: returningFile.file.web_view_link,
        new_file_path: returningFile.file.new_file_path ?? undefined,
        return_reason: returnReason.trim(),
        is_approved: null,
      });

      onSuccess(returningFile.file.gdrive_file_id);
      setReturnReason('');
      onClose();
    } catch (err: unknown) {
      setReturnError(err instanceof Error ? err.message : 'Không thể trả file.');
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="return-file-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150"
      >
        <h2 id="return-file-title" className="text-lg font-bold text-gray-900">
          Trả file về Pending Approval
        </h2>
        <p className="mt-1 text-sm text-gray-500 truncate">{returningFile.file.name}</p>

        <label htmlFor="return-reason" className="mt-4 block text-sm font-medium text-gray-700">
          Lý do trả file
        </label>
        <textarea
          id="return-reason"
          value={returnReason}
          onChange={(event) => setReturnReason(event.target.value)}
          rows={4}
          required
          disabled={isReturning}
          className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Nhập lý do cần chỉnh sửa..."
        />

        {returnError && <p className="mt-2 text-sm text-red-600">{returnError}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={isReturning}
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isReturning || !returnReason.trim()}
            onClick={handleReturnFile}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isReturning ? 'Đang trả file...' : 'Xác nhận trả file'}
          </button>
        </div>
      </div>
    </div>
  );
}
