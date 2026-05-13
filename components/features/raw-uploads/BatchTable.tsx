import React from "react";
import { Folder, MoreVertical } from "lucide-react";

export type FileItem = {
  id: string;
  name: string;
  icon: any;
};

export type BatchItem = {
  id: string;
  name: string;
  docsCount: number;
  sizeMB: number;
  uploader: string;
  date: string;
  files: FileItem[];
};

interface BatchTableProps {
  data: BatchItem[];
}

export default function BatchTable({ data }: BatchTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden mt-6 border border-gray-100">
      {/* Header */}
      <div className="flex py-4 px-6 bg-[#f9fafb] border-b border-gray-200 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
        <div className="flex-3 flex items-center">BATCH NAME & FILES</div>
        <div className="flex-[1.5] flex items-center">UPLOADER</div>
        <div className="flex-1 flex items-center">DATE</div>
        <div className="w-15 flex items-center justify-end">ACTION</div>
      </div>

      {/* Body */}
      <div className="flex flex-col divide-y divide-gray-200">
        {data.map((batch, idx) => (
          <div key={batch.id || idx} className="flex flex-col">
            {/* Main Row */}
            <div className="flex py-4 px-6 items-center">
              <div className="flex-3 flex items-center">
                <div className="w-10 h-10 bg-brand-blue-bg rounded-lg flex items-center justify-center mr-4 shrink-0">
                  <Folder size={20} className="text-brand-blue" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1 text-[14px]">
                    {batch.name}
                  </div>
                  <div className="text-[13px] text-gray-500">
                    {batch.docsCount} documents • {batch.sizeMB} MB
                  </div>
                </div>
              </div>
              <div className="flex-[1.5] flex items-center text-[14px] text-gray-500">
                {batch.uploader}
              </div>
              <div className="flex-1 flex items-center text-[14px] text-gray-500">
                {batch.date}
              </div>
              <div className="w-15 flex items-center justify-end">
                <button className="bg-transparent border-none cursor-pointer text-gray-400 flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 hover:text-gray-900 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
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
                      <div className="text-[14px] text-gray-500">
                        {file.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Trạng thái rỗng */}
        {data.length === 0 && (
          <div className="py-8 text-center text-gray-500 text-[14px]">
            No data available.
          </div>
        )}
      </div>
    </div>
  );
}
