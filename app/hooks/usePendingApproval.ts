'use client';

import { useState } from 'react';
import { PendingItem, PendingFileItem } from '@/components/features/pending-approval/types';
import { removeReturnedFile } from '@/app/approved-files/returned-files';

const APPWRITE_URL = '/api/appwrite';
const MOVE_URL = '/api/appwrite-move';

const isFileApproved = (file: PendingFileItem) =>
  file.is_approved === true || file.is_approved === 1 || file.is_approved === 'true';

const postJson = async (url: string, body: unknown) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();

  if (!response.ok || result.error) {
    const detail =
      typeof result.detail === 'string'
        ? result.detail
        : result.detail
          ? JSON.stringify(result.detail)
          : undefined;
    throw new Error(detail || result.error || `HTTP ${response.status}`);
  }
};

export function usePendingApproval() {
  const [loadingFileIds, setLoadingFileIds] = useState<Set<string>>(new Set());
  const [loadingSubmissionIds, setLoadingSubmissionIds] = useState<Set<string>>(new Set());
  const [approvedFileIds, setApprovedFileIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setFileLoading = (id: string, val: boolean) =>
    setLoadingFileIds((prev) => {
      const next = new Set(prev);
      if (val) next.add(id);
      else next.delete(id);
      return next;
    });

  const setSubmissionLoading = (id: string, val: boolean) =>
    setLoadingSubmissionIds((prev) => {
      const next = new Set(prev);
      if (val) next.add(id);
      else next.delete(id);
      return next;
    });

  const setFileApproved = async (file: PendingFileItem, approverEmail: string) => {
    if (!file.new_file_path?.trim()) {
      throw new Error('Chưa có path. Vui lòng lưu path trước khi duyệt.');
    }

    await postJson(APPWRITE_URL, {
      action: 'insert file path',
      new_path: file.new_file_path,
      approver: approverEmail,
      is_approved: true,
      file_id: file.gdrive_file_id,
    });
  };

  const queueMove = async () => {
    await postJson(MOVE_URL, {});
  };

  const approveSubmission = async (submissionId: string) => {
    await postJson(APPWRITE_URL, {
      action: 'approve submission',
      submission_id: submissionId,
    });
  };

  const handleApproveFile = async (
    item: PendingItem,
    file: PendingFileItem,
    approverEmail: string,
    onSubmissionDone: (id: string) => void
  ) => {
    if (!approverEmail) {
      setErrors((prev) => ({ ...prev, [file.gdrive_file_id]: 'Chưa đăng nhập.' }));
      return;
    }
    if (!file.new_file_path?.trim()) {
      setErrors((prev) => ({
        ...prev,
        [file.gdrive_file_id]: 'Chưa có path. Vui lòng lưu path trước khi duyệt.',
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, [file.gdrive_file_id]: '' }));
    setFileLoading(file.gdrive_file_id, true);

    try {
      await setFileApproved(file, approverEmail);
      removeReturnedFile(file.gdrive_file_id);
      setApprovedFileIds((prev) => new Set(prev).add(file.gdrive_file_id));

      const files = item.files ?? [];
      const allDone = files.every(
        (candidate) =>
          Boolean(candidate.new_file_path?.trim()) &&
          (candidate.gdrive_file_id === file.gdrive_file_id ||
            isFileApproved(candidate) ||
            approvedFileIds.has(candidate.gdrive_file_id))
      );
      if (allDone) {
        await approveSubmission(item.id);
      }
      await queueMove();
      if (allDone) onSubmissionDone(item.id);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [file.gdrive_file_id]: err instanceof Error ? err.message : 'Lỗi. Thử lại.',
      }));
    } finally {
      setFileLoading(file.gdrive_file_id, false);
    }
  };

  const handleApproveAllFiles = async (
    item: PendingItem,
    approverEmail: string,
    onSubmissionDone: (id: string) => void
  ) => {
    if (!approverEmail) {
      setErrors((prev) => ({ ...prev, [item.id]: 'Chưa đăng nhập.' }));
      return;
    }

    setErrors((prev) => ({ ...prev, [item.id]: '' }));
    setSubmissionLoading(item.id, true);

    try {
      const files = item.files ?? [];
      if (files.some((file) => !file.new_file_path?.trim())) {
        throw new Error('Cần lưu path cho tất cả file trước khi duyệt.');
      }

      const filesToApprove = files.filter(
        (file) => !isFileApproved(file) && !approvedFileIds.has(file.gdrive_file_id)
      );

      await Promise.all(
        filesToApprove.map(async (file) => {
          await setFileApproved(file, approverEmail);
          removeReturnedFile(file.gdrive_file_id);
          setApprovedFileIds((prev) => new Set(prev).add(file.gdrive_file_id));
        })
      );

      const allFilesApproved = files.every(
        (file) =>
          Boolean(file.new_file_path?.trim()) &&
          (isFileApproved(file) ||
            approvedFileIds.has(file.gdrive_file_id) ||
            filesToApprove.some((approved) => approved.gdrive_file_id === file.gdrive_file_id))
      );
      if (allFilesApproved) {
        await approveSubmission(item.id);
      }
      await queueMove();
      if (allFilesApproved) onSubmissionDone(item.id);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [item.id]: err instanceof Error ? err.message : 'Lỗi. Thử lại.',
      }));
    } finally {
      setSubmissionLoading(item.id, false);
    }
  };

  return {
    loadingFileIds,
    loadingSubmissionIds,
    approvedFileIds,
    errors,
    isFileApproved,
    handleApproveFile,
    handleApproveAllFiles,
  };
}
