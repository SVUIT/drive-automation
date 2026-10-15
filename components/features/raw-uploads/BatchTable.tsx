import React, { useState } from "react";
import { Folder, MoreVertical, Search, type LucideIcon } from "lucide-react";
import SelectPathDrawer from "./SelectPathDrawer";
import HighlightText from "@/components/common/HighlightText";

export type FileItem = {
  id: string;
  name: string;
  icon: LucideIcon;
  url?: string;
  submissionId: string;
  new_file_path?: string;
  return_reason?: string;
};

export type BatchItem = {
  form_submissions_id: string;
  name: string;
  docsCount: number;
  files: FileItem[];
};

interface BatchTableProps {
  data: BatchItem[];
  searchQuery?: string;
  onPathSaved?: (file: FileItem, path: string) => void;
  onClearSearch?: () => void;
}

export default function BatchTable({ data, searchQuery = '', onPathSaved, onClearSearch }: BatchTableProps) {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  return (
    <>
      <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden mt-6 border border-gray-100">
        <div className="flex py-4 px-6 bg-[#f9fafb] border-b border-gray-200 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
          <div className="flex-3 flex items-center">BATCH NAME & FILES</div>
          <div className="flex-[2.5] flex items-center">NUMBER OF FILES</div>
          <div className="w-15 flex items-center justify-end">ACTION</div>
        </div>

        <div className="flex flex-col divide-y divide-gray-200">
          {data.map((batch, idx) => (
            <div
              key={batch.form_submissions_id || idx}
              className="flex flex-col"
            >
              <div className="flex py-4 px-6 items-center">
                <div className="flex-3 flex items-center">
                  <div className="w-10 h-10 bg-brand-blue-bg rounded-lg flex items-center justify-center mr-4 shrink-0">
                    <Folder size={20} className="text-brand-blue" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1 text-[14px]">
                      <HighlightText text={batch.name} query={searchQuery} />
                    </div>
                  </div>
                </div>
                <div className="flex-[2.5] flex items-center text-[14px] text-gray-500">
                  {batch.docsCount}
                </div>
                <div className="w-15 flex items-center justify-end"></div>
              </div>

              {/* Nested Items */}
              {batch.files && batch.files.length > 0 && (
                <div className="px-6 pb-4 pl-20 flex flex-col gap-3 relative">
                  {/* Vertical connecting line */}
                  <div className="absolute left-11 top-4 bottom-6 w-px bg-gray-200"></div>

                  {batch.files.map((file, nestedIdx) => {
                    const IconComponent = file.icon;
                    return (
                      <div
                        key={file.id || nestedIdx}
                        className="flex items-center gap-3 relative"
                      >
                        <div className="flex items-center justify-center text-gray-400 shrink-0 bg-white z-10 py-1">
                          <IconComponent size={16} />
                        </div>
                        <div className="flex-1 min-w-0 text-[14px] text-gray-500">
                          {file.url ? (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 hover:underline transition-colors"
                            >
                              <HighlightText text={file.name} query={searchQuery} />
                            </a>
                          ) : (
                            <HighlightText text={file.name} query={searchQuery} />
                          )}
                          {file.new_file_path && (
                            <div className="mt-1 truncate font-mono text-[11px] text-blue-600" title={file.new_file_path}>
                              <HighlightText text={file.new_file_path} query={searchQuery} />
                            </div>
                          )}
                          {file.return_reason && (
                            <div className="mt-1 text-[12px] text-amber-700">
                              Lý do trả về: <HighlightText text={file.return_reason} query={searchQuery} />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedFile(file)}
                          className="bg-transparent border-none cursor-pointer text-gray-400 flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          title={file.new_file_path ? "Update path" : "Set path"}
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Trạng thái rỗng */}
          {data.length === 0 && (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
              {searchQuery ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
                    <Search size={20} />
                  </div>
                  <p className="text-gray-800 font-medium text-[15px] mb-1">
                    Không tìm thấy tệp hoặc batch phù hợp
                  </p>
                  <p className="text-gray-500 text-[13px] max-w-sm mb-3">
                    Không có kết quả nào khớp với &ldquo;{searchQuery}&rdquo;. Thử tìm kiếm với tên tệp hoặc đường dẫn khác.
                  </p>
                  {onClearSearch && (
                    <button
                      type="button"
                      onClick={onClearSearch}
                      className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                    >
                      Xóa bộ lọc tìm kiếm
                    </button>
                  )}
                </>
              ) : (
                <div className="text-gray-500 text-[14px]">
                  No data available.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SelectPathDrawer
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        file={selectedFile}
        onPathSaved={(savedFile, path) => {
          onPathSaved?.(savedFile, path);
          setSelectedFile(null);
        }}
      />
    </>
  );
}
