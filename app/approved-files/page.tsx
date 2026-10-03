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
  X,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getReturnedFiles, saveReturnedFile } from '@/app/approved-files/returned-files';

// --- Khớp cấu trúc JSON API trả về ---
type ApiSubmittedFile = {
  gdrive_file_id?: string;
  file_id?: string;
  id?: string;
  $id?: string;
  name?: string;
  web_view_link?: string;
  web_link_view?: string;
  new_file_path?: string | null;
  destination_folder_link?: string | null;
  is_approved?: boolean | number | string;
  return_reason?: string;
};

type ApprovedFile = ApiSubmittedFile & {
  gdrive_file_id: string;
  name: string;
};

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

type GroupedSubmission = {
  submissionId: number;
  submissionName: string;
  files: ApprovedFile[];
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
  const [returningFile, setReturningFile] = useState<{
    file: ApprovedFile;
    submissionId: string;
    submissionName: string;
  } | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnError, setReturnError] = useState<string | null>(null);
  const [isReturning, setIsReturning] = useState(false);

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
            const parsedGroups: GroupedSubmission[] = [];
            const returnedIds = new Set(getReturnedFiles().map(entry => entry.fileId));
            for (const item of result.data) {
              const files: ApiSubmittedFile[] = item.submitted_files || item.files || [];
              const approvedFiles: ApprovedFile[] = files.flatMap(file => {
                const fileId = file.gdrive_file_id || file.file_id || file.id || file.$id;
                if (!fileId || returnedIds.has(fileId)) return [];
                return [{
                  ...file,
                  gdrive_file_id: fileId,
                  name: file.name || fileId,
                  web_view_link: file.web_view_link || file.web_link_view || "",
                  new_file_path: file.new_file_path || null,
                  destination_folder_link: file.destination_folder_link || null,
                }];
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

  const handleReturnFile = async () => {
    if (!returningFile || !returnReason.trim()) {
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
          const detail = typeof result.detail === 'string'
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
      setGroups(current => current
        .map(group => ({
          ...group,
          files: group.files.filter(file => file.gdrive_file_id !== returningFile.file.gdrive_file_id),
        }))
        .filter(group => group.files.length > 0));
      setReturningFile(null);
      setReturnReason('');
    } catch (err: unknown) {
      setReturnError(err instanceof Error ? err.message : 'Không thể trả file.');
    } finally {
      setIsReturning(false);
    }
  };

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

                        <div className="flex-[2] flex items-center justify-end gap-3">
                          <div className="flex items-center gap-1.5 bg-[#e6fcf5] px-2.5 py-0.5 rounded-full border border-[#c3fae8]">
                            <CheckCircle2 size={12} className="text-[#0ca678]" fill="#0ca678" color="white" />
                            <span className="uppercase text-[#0ca678] text-[10px] font-bold tracking-wide">Approved</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setReturningFile({
                                file,
                                submissionId: String(group.submissionId),
                                submissionName: group.submissionName,
                              });
                              setReturnReason('');
                              setReturnError(null);
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100"
                            title="Trả file về Pending Approval"
                            aria-label={`Trả ${file.name} về Pending Approval`}
                          >
                            <X size={15} />
                          </button>
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

      {returningFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-file-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 id="return-file-title" className="text-lg font-bold text-gray-900">
              Trả file về Pending Approval
            </h2>
            <p className="mt-1 text-sm text-gray-500">{returningFile.file.name}</p>
            <label htmlFor="return-reason" className="mt-4 block text-sm font-medium text-gray-700">
              Lý do trả file
            </label>
            <textarea
              id="return-reason"
              value={returnReason}
              onChange={event => setReturnReason(event.target.value)}
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
                onClick={() => setReturningFile(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isReturning || !returnReason.trim()}
                onClick={handleReturnFile}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isReturning ? 'Đang trả file...' : 'Xác nhận trả file'}
              </button>
            </div>
          </div>
        </div>
      )}
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