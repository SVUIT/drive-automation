'use client';

import { useState, useEffect, useCallback } from 'react';
import { GroupedSubmission, ApiSubmittedFile, ApprovedFile } from '@/components/features/approved-files/types';
import { getReturnedFiles } from '@/app/approved-files/returned-files';

type ApiSubmission = {
  form_submissions_id: number;
  id?: number;
  name?: string;
  submitted_files?: ApiSubmittedFile[];
  files?: ApiSubmittedFile[];
};

type ApiResponse = {
  data: ApiSubmission[] | null;
  error: string | null;
};

export function useApprovedFiles() {
  const [groups, setGroups] = useState<GroupedSubmission[]>([]);
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
          body: JSON.stringify({ action: 'fetch approved submissions' }),
        });

        if (!response.ok) {
          throw new Error(`Lỗi kết nối máy chủ (HTTP ${response.status})`);
        }

        const result: ApiResponse = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        if (isMounted) {
          if (result.data && Array.isArray(result.data)) {
            const parsedGroups: GroupedSubmission[] = [];
            const returnedIds = new Set(getReturnedFiles().map((entry) => entry.fileId));

            for (const item of result.data) {
              const files: ApiSubmittedFile[] = item.submitted_files || item.files || [];
              const approvedFiles: ApprovedFile[] = files.flatMap((file) => {
                const fileId = file.gdrive_file_id || file.file_id || file.id || file.$id;
                if (!fileId || returnedIds.has(fileId)) return [];
                return [
                  {
                    ...file,
                    gdrive_file_id: fileId,
                    name: file.name || fileId,
                    web_view_link: file.web_view_link || file.web_link_view || '',
                    new_file_path: file.new_file_path || null,
                    destination_folder_link: file.destination_folder_link || null,
                  },
                ];
              });

              if (approvedFiles.length) {
                const submissionId = item.form_submissions_id || item.id || 0;
                parsedGroups.push({
                  submissionId,
                  submissionName: item.name || `Submission #${submissionId}`,
                  files: approvedFiles,
                });
              }
            }

            setGroups(parsedGroups);
            setError(null);
          } else {
            setGroups([]);
            setError(null);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách tệp');
          setGroups([]);
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

  return {
    groups,
    setGroups,
    loading,
    error,
    refetch,
  };
}
