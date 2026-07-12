import React, { useState } from "react";
import { Folder, MoreVertical } from "lucide-react";
import SelectPathDrawer from "./SelectPathDrawer";

export type FileItem = {
  id: string;
  name: string;
  icon: any;
  url?: string;
};

export type BatchItem = {
  form_submissions_id: string;
  name: string;
  docsCount: number;
  files: FileItem[];
};

interface BatchTableProps {
  data: BatchItem[];
}

export default function BatchTable({ data }: BatchTableProps) {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  return (
    <>
      <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-x-auto mt-6 border border-gray-100">
        <div className="min-w-[600px] flex flex-col">
          <div className="flex py-4 px-6 bg-[#f9fafb] border-b border-gray-200 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
            <div className="flex-[3] flex items-center">BATCH NAME & FILES</div>
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
                  <div className="flex-[3] flex items-center">
                    <div className="w-10 h-10 bg-brand-blue-bg rounded-lg flex items-center justify-center mr-4 shrink-0">
                      <Folder size={20} className="text-brand-blue" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1 text-[14px]">
                        {batch.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex-[2.5] flex items-center text-[14px] text-gray-500">
                    {batch.docsCount}
                  </div>
                  <div className="w-15 flex items-center justify-end"></div>
                </div>

                {batch.files && batch.files.length > 0 && (
                  <div className="px-6 pb-4 pl-20 flex flex-col gap-3 relative">
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
                          <div className="flex-1 text-[14px] text-gray-500 truncate">
                            {file.url ? (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 hover:underline transition-colors"
                              >
                                {file.name}
                              </a>
                            ) : (
                              file.name
                            )}
                          </div>
                          <button
                            onClick={() => setSelectedFile(file)}
                            className="bg-transparent border-none cursor-pointer text-gray-400 flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            title="Edit path for this file"
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

            {data.length === 0 && (
              <div className="py-8 text-center text-gray-500 text-[14px]">
                No data available.
              </div>
            )}
          </div>
        </div>
      </div>

      <SelectPathDrawer
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        file={selectedFile}
      />
    </>
  );
}
