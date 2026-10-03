'use client';

import { useEffect, useState } from 'react';
import { FileText, FileSpreadsheet, File, Archive } from 'lucide-react';
import PendingTable, { PendingItem, PendingFileItem } from '@/components/features/pending-approval/PendingTable';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { getReturnedFiles } from '@/app/approved-files/returned-files';

const APPWRITE_URL = '/api/appwrite';

type ApiPendingFile = {
  gdrive_file_id?: string;
  file_id?: string;
  id?: string;
  $id?: string;
  name?: string;
  mime_type?: string;
  web_view_link?: string;
  web_link_view?: string;
  new_file_path?: string;
  destination_folder_link?: string;
  is_approved?: boolean | number | string;
  return_reason?: string;
};

type ApiPendingSubmission = {
  form_submissions_id?: string | number;
  id?: string | number;
  name?: string;
  mime_type?: string;
  total_file?: number;
  submitted_files?: ApiPendingFile[];
  files?: ApiPendingFile[];
};

type PendingResponse = {
  data?: ApiPendingSubmission[];
  submissions?: ApiPendingSubmission[];
  error?: string;
};

function getIcon(name: string, mimeType?: string) {
  const ext = name?.split('.').pop()?.toLowerCase();
  if (ext === 'zip' || ext === 'rar') return Archive;
  if (mimeType?.includes('spreadsheet') || ext === 'xlsx' || ext === 'xls') return FileSpreadsheet;
  if (ext === 'pdf' || mimeType?.includes('pdf')) return FileText;
  if (ext === 'docx' || ext === 'doc' || ext === 'pptx' || ext === 'ppt') return FileText;
  return File;
}

function PageContent() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSubmissions = async () => {
      try {
        const res = await fetch(APPWRITE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'fetch unapproved submissions' }),
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json() as PendingResponse | ApiPendingSubmission[];
        if (!Array.isArray(json) && json.error) throw new Error(json.error);
        const rawList = Array.isArray(json)
          ? json
          : json.data ?? json.submissions ?? [];

        const items: PendingItem[] = rawList.flatMap((sub) => {
          const files = sub.submitted_files ?? sub.files ?? [];
          const id = String(sub.form_submissions_id ?? sub.id ?? "");
          if (!id) return [];
          const mappedFiles: PendingFileItem[] = files.flatMap((f) => {
            const fileId = f.gdrive_file_id || f.file_id || f.id || f.$id;
            if (!fileId) return [];
            return [{
              gdrive_file_id: fileId,
              name: f.name ?? fileId,
              icon: getIcon(f.name ?? '', f.mime_type),
              web_view_link: f.web_view_link ?? f.web_link_view ?? '',
              url: f.web_view_link ?? f.web_link_view ?? '',
              new_file_path: f.new_file_path ?? '',
              destination_folder_link: f.destination_folder_link ?? '',
              is_approved: f.is_approved === true || f.is_approved === 1 || f.is_approved === 'true',
              return_reason: f.return_reason ?? '',
            }];
          });

          return [{
            id,
            name: sub.name ?? `Submission #${id}`,
            totalFiles: sub.total_file ?? mappedFiles.length,
            icon: getIcon(sub.name ?? '', sub.mime_type),
            files: mappedFiles,
          }];
        }).filter((item) => item.files.length > 0);

        const mergedSubmissions = new Map(items.map(item => [item.id, item]));
        for (const returned of getReturnedFiles()) {
          const submission = mergedSubmissions.get(returned.submissionId) ?? {
            id: returned.submissionId,
            name: returned.submissionName,
            totalFiles: 0,
            icon: getIcon(returned.name),
            files: [],
          };
          const returnedFile: PendingFileItem = {
            gdrive_file_id: returned.fileId,
            name: returned.name,
            icon: getIcon(returned.name),
            web_view_link: returned.url,
            url: returned.url,
            new_file_path: returned.new_file_path ?? '',
            is_approved: null,
            return_reason: returned.return_reason,
          };
          const files = (submission.files ?? []).some(file => file.gdrive_file_id === returned.fileId)
            ? (submission.files ?? []).map(file => file.gdrive_file_id === returned.fileId ? returnedFile : file)
            : [...(submission.files ?? []), returnedFile];
          mergedSubmissions.set(returned.submissionId, {
            ...submission,
            files,
            totalFiles: files.length,
          });
        }

        if (isMounted) setSubmissions(Array.from(mergedSubmissions.values()));
      } catch (e: unknown) {
        if (isMounted) {
          setError(`Không thể tải danh sách: ${e instanceof Error ? e.message : String(e)}`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchSubmissions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Called when all files in a submission are done → remove submission from pending
  const handleSubmissionDone = (submissionId: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== submissionId));
  };

  return (
    <div>
      <div className="mt-8 mb-6">
        <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight">
          Pending approval
        </h1>
      </div>

      {loading && <div className="text-gray-400 text-[14px] py-8 text-center">Loading submissions...</div>}
      {error && <div className="text-red-500 text-[13px] py-4">{error}</div>}
      {!loading && !error && (
        <PendingTable
          data={submissions}
          approverEmail={user?.email ?? ''}
          onSubmissionDone={handleSubmissionDone}
        />
      )}
    </div>
  );
}

export default function PendingApprovalPage() {
  return (
    <ProtectedRoute>
      <PageContent />
    </ProtectedRoute>
  );
}
