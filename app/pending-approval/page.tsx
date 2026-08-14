'use client';

import { useEffect, useState } from 'react';
import { FileText, FileSpreadsheet, File, Archive } from 'lucide-react';
import PendingTable, { PendingItem, PendingFileItem } from '@/components/features/pending-approval/PendingTable';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

const APPWRITE_URL = '/api/appwrite';
const APPWRITE_ENV = process.env.NEXT_PUBLIC_APPWRITE_ENV ?? 'production';
const APPROVED_FILES_KEY = `approvedFiles:${APPWRITE_ENV}`;

function getIcon(name: string, mimeType?: string) {
  const ext = name?.split('.').pop()?.toLowerCase();
  if (ext === 'zip' || ext === 'rar') return Archive;
  if (mimeType?.includes('spreadsheet') || ext === 'xlsx' || ext === 'xls') return FileSpreadsheet;
  if (ext === 'pdf' || mimeType?.includes('pdf')) return FileText;
  if (ext === 'docx' || ext === 'doc' || ext === 'pptx' || ext === 'ppt') return FileText;
  return File;
}

export type ApprovedFileEntry = {
  submissionId: string;
  submissionName: string;
  file: PendingFileItem;
  approvedAt: string;
};

function PageContent() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(APPWRITE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch unapproved submissions' }),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      const rawList = json.data ?? json.submissions ?? (Array.isArray(json) ? json : []);

      const items: PendingItem[] = rawList.map((sub: any) => {
        const files = sub.submitted_files ?? sub.files ?? [];
        const firstFileWithPath = files.find(
          (file: any) => file.new_file_path || file.destination_folder_link
        );

        return {
          id: String(sub.form_submissions_id ?? sub.id),
          name: sub.name ?? `Submission #${sub.form_submissions_id}`,
          generatedPath:
            firstFileWithPath?.new_file_path ??
            firstFileWithPath?.destination_folder_link ??
            sub.gdrive_folder_link ??
            '',
          totalFiles: sub.total_file ?? files.length,
          icon: getIcon(sub.name ?? '', sub.mime_type),
          files: files.map((f: any) => ({
            gdrive_file_id: f.gdrive_file_id,
            name: f.name,
            icon: getIcon(f.name ?? '', f.mime_type),
            web_view_link: f.web_view_link ?? f.web_link_view ?? '',
            url: f.web_view_link ?? f.web_link_view ?? '',
            new_file_path: f.new_file_path ?? '',
            destination_folder_link: f.destination_folder_link ?? '',
          })),
        };
      });

      setSubmissions(items);
    } catch (e: any) {
      setError(`Không thể tải danh sách: ${e?.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  // Called when a single file is approved → move to approved list
  const handleFileApproved = (submissionId: string, submissionName: string, file: PendingFileItem) => {
    const entry: ApprovedFileEntry = {
      submissionId,
      submissionName,
      file,
      approvedAt: new Date().toISOString(),
    };

    const stored = localStorage.getItem(APPROVED_FILES_KEY);
    const current: ApprovedFileEntry[] = stored ? JSON.parse(stored) : [];
    const withoutDuplicate = current.filter(
      approved => approved.file.gdrive_file_id !== file.gdrive_file_id
    );
    localStorage.setItem(APPROVED_FILES_KEY, JSON.stringify([...withoutDuplicate, entry]));
  };

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
          onFileApproved={handleFileApproved}
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
