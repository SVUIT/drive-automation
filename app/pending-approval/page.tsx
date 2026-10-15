'use client';

import { useEffect, useState, useMemo } from 'react';
import { FileText, FileSpreadsheet, File, Archive, Search } from 'lucide-react';
import PendingTable, { PendingItem, PendingFileItem } from '@/components/features/pending-approval/PendingTable';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { getReturnedFiles } from '@/app/approved-files/returned-files';
import { useSearch, SearchableItem } from '../context/SearchContext';
import { matchesSearch } from '../lib/search-utils';

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

  const { searchQuery, scope, clearSearch, registerItems, unregisterItems } = useSearch();

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

  // Register items for global search
  useEffect(() => {
    const items: SearchableItem[] = submissions.flatMap(sub => [
      {
        id: `pending-sub-${sub.id}`,
        title: sub.name,
        subtitle: `${sub.totalFiles} file(s)`,
        category: 'pending-approval' as const,
        categoryLabel: 'Pending approval',
        route: '/pending-approval',
        isSubmissionGroup: true,
      },
      ...(sub.files ?? []).map(file => ({
        id: `pending-file-${file.gdrive_file_id}`,
        title: file.name,
        subtitle: sub.name,
        path: file.new_file_path,
        url: file.url || file.web_view_link,
        destinationFolderLink: file.destination_folder_link,
        category: 'pending-approval' as const,
        categoryLabel: 'Pending approval',
        route: '/pending-approval',
        isSubmissionGroup: false,
      })),
    ]);

    registerItems('pending-approval', items);
    return () => unregisterItems('pending-approval');
  }, [submissions, registerItems, unregisterItems]);

  // Filter submissions based on search
  const filteredSubmissions: PendingItem[] = useMemo(() => {
    if (!searchQuery.trim()) return submissions;

    return submissions
      .map((sub): PendingItem | null => {
        const subMatches =
          scope === 'submissions' || scope === 'all'
            ? matchesSearch(sub.name, searchQuery) || matchesSearch(sub.id, searchQuery)
            : false;

        const matchingFiles = (sub.files ?? []).filter(file => {
          if (scope === 'files') {
            return matchesSearch(file.name, searchQuery);
          }
          if (scope === 'paths') {
            return matchesSearch(file.new_file_path, searchQuery);
          }
          if (scope === 'submissions') {
            return subMatches;
          }
          // scope === 'all'
          return (
            matchesSearch(file.name, searchQuery) ||
            matchesSearch(file.new_file_path, searchQuery) ||
            matchesSearch(file.return_reason, searchQuery) ||
            subMatches
          );
        });

        if (matchingFiles.length > 0) {
          return {
            ...sub,
            files: matchingFiles,
            totalFiles: matchingFiles.length,
          };
        }
        return null;
      })
      .filter((s): s is PendingItem => s !== null);
  }, [submissions, searchQuery, scope]);

  const totalMatchingFiles = useMemo(() => {
    return filteredSubmissions.reduce((acc, s) => acc + (s.files?.length ?? 0), 0);
  }, [filteredSubmissions]);

  // Called when all files in a submission are done → remove submission from pending
  const handleSubmissionDone = (submissionId: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== submissionId));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 mb-6 gap-3">
        <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight">
          Pending approval
        </h1>
      </div>

      {/* Active search filter banner */}
      {searchQuery && (
        <div className="flex items-center justify-between gap-3 bg-blue-50/80 border border-blue-200 text-blue-900 px-4 py-2.5 rounded-lg mb-4 text-[13px] animate-in fade-in duration-150">
          <div className="flex items-center gap-2 min-w-0">
            <Search size={15} className="text-blue-600 shrink-0" />
            <span className="truncate">
              Bộ lọc: <strong>&ldquo;{searchQuery}&rdquo;</strong> • Tìm thấy <strong>{totalMatchingFiles}</strong> tệp trong <strong>{filteredSubmissions.length}</strong> submission
            </span>
          </div>
          <button
            type="button"
            onClick={clearSearch}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline shrink-0 cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {loading && <div className="text-gray-400 text-[14px] py-8 text-center">Loading submissions...</div>}
      {error && <div className="text-red-500 text-[13px] py-4">{error}</div>}
      {!loading && !error && (
        <PendingTable
          data={filteredSubmissions}
          approverEmail={user?.email ?? ''}
          searchQuery={searchQuery}
          onClearSearch={clearSearch}
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
