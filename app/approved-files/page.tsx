'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  File,
  Archive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Folder,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

// --- Khớp cấu trúc JSON API trả về ---
type ApiSubmittedFile = {
  gdrive_file_id: string;
  name: string;
  web_view_link: string;
  new_file_path: string | null;
  destination_folder_link: string | null;
};

type ApiSubmission = {
  form_submissions_id: number;
  submitted_files: ApiSubmittedFile[];
};

type ApiResponse = {
  data: ApiSubmission[] | null;
  error: string | null;
};

type GroupedSubmission = {
  submissionId: number;
  submissionName: string;
  files: ApiSubmittedFile[];
};

function getIcon(name: string) {
  const ext = name?.split('.').pop()?.toLowerCase();
  if (ext === 'zip' || ext === 'rar') return Archive;
  if (ext === 'xlsx' || ext === 'xls') return FileSpreadsheet;
  if (ext === 'pdf' || ext === 'docx' || ext === 'doc' || ext === 'pptx' || ext === 'ppt') return FileText;
  return File;
}

function PageContent() {
  const [groups, setGroups] = useState<GroupedSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchApprovedFiles() {
      try {
        const response = await fetch('/api/appwrite-func', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
            const parsedGroups = result.data
              .map((item: any) => {
                const files = item.submitted_files || item.files || [];
                return {
                  submissionId: item.form_submissions_id || item.id,
                  submissionName: item.name || `Submission #${item.form_submissions_id || item.id}`,
                  files: files.map((f: any) => ({
                    gdrive_file_id: f.gdrive_file_id,
                    name: f.name,
                    web_view_link: f.web_view_link || f.web_link_view || '',
                    new_file_path: f.new_file_path || null,
                    destination_folder_link: f.destination_folder_link || null,
                  })),
                };
              })
              .filter((group: any) => group.files.length > 0);

            setGroups(parsedGroups);
          } else {
            setGroups([]);
          }
        }
      } catch (err: unknown) {
        console.error('Fetch error:', err);
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

    fetchApprovedFiles();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight">
            Approved Files
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách các biểu mẫu và tệp đã được phê duyệt lưu vào Google Drive
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-200 pb-2">
        {/* Header */}
        <div className="flex py-3.5 px-6 bg-[#f9fafb] border-b border-gray-200 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
          <div className="flex-[4] flex items-center">Submission / Tên File</div>
          <div className="flex-[4] flex items-center">Đường dẫn thư mục Drive</div>
          <div className="flex-[2] flex items-center justify-end">Trạng thái</div>
        </div>

        <div className="flex flex-col divide-y divide-gray-200">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-[14px]">
              Đang tải danh sách file đã duyệt...
            </div>
          ) : groups.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-[14px]">
              Chưa có tệp nào được phê duyệt.
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.submissionId} className="flex flex-col">
                <div className="flex py-3.5 px-6 items-center bg-[#fafafa]">
                  <div className="flex-[4] flex items-center pr-4">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mr-3.5 shrink-0">
                      <File size={18} className="text-blue-600" />
                    </div>
                    <span className="font-bold text-[14px] text-gray-900 truncate">
                      {group.submissionName}
                    </span>
                  </div>
                  <div className="flex-[4] text-[12px] text-gray-400">
                    {group.files.length} tệp
                  </div>
                  <div className="flex-[2]" />
                </div>

                <div className="px-6 pb-4 pl-16 flex flex-col gap-2 relative">
                  <div className="absolute left-10 top-[-14px] bottom-6 w-px bg-gray-200" />

                  {group.files.map((file) => {
                    const FileIcon = getIcon(file.name);
                    return (
                      <div
                        key={file.gdrive_file_id}
                        className="flex items-center relative py-1.5 hover:bg-gray-50/50 rounded-md transition-colors"
                      >
                        <div className="absolute left-[-24px] top-1/2 w-3.5 h-px bg-gray-200" />

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
                              <span className="truncate">{file.name}</span>
                              <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-blue-500" />
                            </a>
                          ) : (
                            <span className="text-[13px] font-medium text-gray-700 truncate" title={file.name}>
                              {file.name}
                            </span>
                          )}
                        </div>

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
                              <span className="truncate">{file.new_file_path || 'Mở thư mục đích'}</span>
                              <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </a>
                          ) : file.new_file_path ? (
                            <span className="truncate text-gray-400" title={file.new_file_path}>
                              {file.new_file_path}
                            </span>
                          ) : (
                            <span className="text-gray-300 italic">Chưa chỉ định thư mục đích</span>
                          )}
                        </div>

                        <div className="flex-[2] flex items-center justify-end">
                          <div className="flex items-center gap-1.5 bg-[#e6fcf5] px-2.5 py-0.5 rounded-full border border-[#c3fae8]">
                            <CheckCircle2 size={12} className="text-[#0ca678]" fill="#0ca678" color="white" />
                            <span className="uppercase text-[#0ca678] text-[10px] font-bold tracking-wide">
                              Approved
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ApprovedFilesPage() {
  return (
    <ProtectedRoute>
      <PageContent />
    </ProtectedRoute>
  );
}