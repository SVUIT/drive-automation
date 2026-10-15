'use client';

import { useState, useEffect, useCallback } from 'react';
import { BatchItem, FileItem } from '@/components/features/raw-uploads/types';
import { getReturnedFiles } from '@/app/approved-files/returned-files';
import { getFileIcon } from '@/app/lib/file-icons';

type ApiFile = {
  file_id?: string;
  id?: string;
  $id?: string;
  gdrive_file_id?: string;
  name: string;
  web_view_link?: string;
  new_file_path?: string | null;
  destination_folder_link?: string | null;
  is_approved?: boolean | number | string;
  return_reason?: string;
};

type ApiSubmission = {
  form_submissions_id: string | number;
  submitted_files?: ApiFile[];
};

type UploadsResponse = {
  data?: ApiSubmission[];
  error?: string | null;
};

export function useRawUploads() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const response = await fetch('/api/appwrite-func', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'fetch unapproved submissions' }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result: UploadsResponse = await response.json();
        if (result.error) {
          throw new Error(result.error);
        }

        const apiBatches: BatchItem[] = (result.data ?? [])
          .map((item) => {
            const files = (item.submitted_files || []).filter(
              (file) =>
                file.is_approved !== true &&
                file.is_approved !== 1 &&
                file.is_approved !== 'true'
            );
            const submissionId = String(item.form_submissions_id);
            const mappedFiles = files.flatMap((file): FileItem[] => {
              const id = file.file_id || file.id || file.$id || file.gdrive_file_id;
              if (!id) return [];

              return [
                {
                  id,
                  name: file.name,
                  url: file.web_view_link,
                  icon: getFileIcon(file.name),
                  submissionId,
                  new_file_path: file.new_file_path ?? undefined,
                  return_reason: file.return_reason,
                },
              ];
            });

            return {
              form_submissions_id: submissionId,
              name: `Submission #${submissionId}`,
              docsCount: mappedFiles.length,
              files: mappedFiles,
            };
          })
          .filter((batch) => batch.files.length > 0);

        const mergedBatches = new Map(
          apiBatches.map((batch) => [batch.form_submissions_id, batch])
        );

        for (const returned of getReturnedFiles()) {
          const batch = mergedBatches.get(returned.submissionId) ?? {
            form_submissions_id: returned.submissionId,
            name: returned.submissionName,
            docsCount: 0,
            files: [],
          };
          const returnedFile: FileItem = {
            id: returned.fileId,
            name: returned.name,
            url: returned.url,
            icon: getFileIcon(returned.name),
            submissionId: returned.submissionId,
            new_file_path: returned.new_file_path,
            return_reason: returned.return_reason,
          };
          const files = batch.files.some((file) => file.id === returned.fileId)
            ? batch.files.map((file) =>
                file.id === returned.fileId ? returnedFile : file
              )
            : [...batch.files, returnedFile];

          mergedBatches.set(returned.submissionId, {
            ...batch,
            files,
            docsCount: files.length,
          });
        }

        if (isMounted) {
          setBatches(Array.from(mergedBatches.values()));
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Lỗi không xác định');
          setBatches([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const handlePathSaved = useCallback((savedFile: FileItem, path: string) => {
    setBatches((current) =>
      current.map((batch) => ({
        ...batch,
        files: batch.files.map((file) =>
          file.id === savedFile.id ? { ...file, new_file_path: path } : file
        ),
      }))
    );
  }, []);

  return {
    batches,
    setBatches,
    loading,
    error,
    refetch,
    handlePathSaved,
  };
}
