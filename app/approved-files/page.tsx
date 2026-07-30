'use client';

import { useEffect, useState } from 'react';
import { FileText, FileSpreadsheet, File, Archive, CheckCircle2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const APPWRITE_ENV = process.env.NEXT_PUBLIC_APPWRITE_ENV ?? 'production';
const APPROVED_FILES_KEY = `approvedFiles:${APPWRITE_ENV}`;

type ApprovedFileEntry = {
  submissionId: string;
  submissionName: string;
  file: {
    gdrive_file_id: string;
    name: string;
  };
  approvedAt: string;
};

type GroupedSubmission = {
  submissionId: string;
  submissionName: string;
  files: ApprovedFileEntry[];
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

  useEffect(() => {
    // Read approved files passed from pending page
    const raw = sessionStorage.getItem(APPROVED_FILES_KEY);
    if (!raw) return;
    const entries: ApprovedFileEntry[] = JSON.parse(raw);

    // Group by submission
    const map = new Map<string, GroupedSubmission>();
    entries.forEach(entry => {
      if (!map.has(entry.submissionId)) {
        map.set(entry.submissionId, {
          submissionId: entry.submissionId,
          submissionName: entry.submissionName,
          files: [],
        });
      }
      map.get(entry.submissionId)!.files.push(entry);
    });

    setGroups(Array.from(map.values()));
  }, []);

  return (
    <div>
      <h1 className="text-[28px] font-extrabold mt-8 mb-6 text-gray-900 tracking-tight">
        Approved files
      </h1>

      <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden mt-6 border border-gray-100 pb-2">
        {/* Header */}
        <div className="flex py-4 px-6 bg-[#f9fafb] border-b border-gray-200 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
          <div className="flex-[3] flex items-center">Submission & Files</div>
          <div className="flex-[2] flex items-center">File name</div>
          <div className="flex-[1] flex items-center justify-end">Status</div>
        </div>

        <div className="flex flex-col divide-y divide-gray-200">
          {groups.map((group) => {
            const GroupIcon = File;
            return (
              <div key={group.submissionId} className="flex flex-col">
                {/* Submission row */}
                <div className="flex py-4 px-6 items-center bg-[#fafafa]">
                  <div className="flex-[3] flex items-center pr-4">
                    <div className="w-10 h-10 bg-brand-blue-bg rounded-lg flex items-center justify-center mr-4 shrink-0">
                      <GroupIcon size={20} className="text-brand-blue" />
                    </div>
                    <span className="font-bold text-[14px] text-gray-900 truncate">
                      {group.submissionName}
                    </span>
                  </div>
                  <div className="flex-[2] text-[12px] text-gray-400">
                    {group.files.length} file{group.files.length > 1 ? 's' : ''} approved
                  </div>
                  <div className="flex-[1]" />
                </div>

                {/* File rows */}
                <div className="px-6 pb-5 pl-20 flex flex-col gap-2 relative">
                  <div className="absolute left-11 top-[-16px] bottom-7 w-px bg-gray-200" />
                  {group.files.map((entry) => {
                    const FileIcon = getIcon(entry.file.name);
                    return (
                      <div key={entry.file.gdrive_file_id} className="flex items-center relative">
                        <div className="absolute left-[-36px] top-1/2 w-4 h-px bg-gray-200" />

                        {/* File name */}
                        <div className="flex-[3] flex items-center gap-3 pr-4">
                          <FileIcon size={18} className="text-brand-blue shrink-0" />
                          <span className="text-[14px] font-medium text-gray-700 truncate">
                            {entry.file.name}
                          </span>
                        </div>

                        {/* Approved at */}
                        <div className="flex-[2] text-[12px] text-gray-400">
                          {new Date(entry.approvedAt).toLocaleString('vi-VN')}
                        </div>

                        {/* Status badge */}
                        <div className="flex-[1] flex items-center justify-end">
                          <div className="flex items-center gap-1.5 bg-[#e6fcf5] px-2.5 py-1 rounded-full border border-[#c3fae8]">
                            <CheckCircle2 size={12} className="text-[#0ca678]" fill="#0ca678" color="white" />
                            <span className="uppercase text-[#0ca678] text-[11px] font-bold tracking-wide">Approved</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {groups.length === 0 && (
            <div className="py-8 text-center text-gray-500 text-[14px]">
              No approved files yet.
            </div>
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
