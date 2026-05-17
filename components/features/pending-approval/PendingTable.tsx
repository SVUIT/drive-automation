import React from "react";
import { Check, X, File } from "lucide-react";

export type PendingFileItem = {
  id: string;
  name: string;
  icon: any;
};

export type PendingItem = {
  id: string;
  name: string;
  generatedPath: string;
  totalFiles: number;
  icon: any;
  files?: PendingFileItem[];
};

interface PendingTableProps {
  data: PendingItem[];
}

export default function PendingTable({ data }: PendingTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden mt-6 border border-gray-100 pb-2">
      {/* Header */}
      <div className="flex py-4 px-6 bg-[#f9fafb] border-b border-gray-200 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
        <div className="flex-3 flex items-center">DOCUMENT NAME & FILES</div>
        <div className="flex-2 flex items-center">GENERATED PATH</div>
        <div className="flex-1 flex items-center">TOTAL FILES</div>
        <div className="flex-1.5 flex items-center">APPROVER</div>
        <div className="flex-1 flex items-center justify-end">ACTIONS</div>
      </div>

      {/* Body */}
      <div className="flex flex-col divide-y divide-gray-200">
        {data.map((item, idx) => {
          const IconComponent = item.icon || File;
          return (
            <div key={item.id || idx} className="flex flex-col">
              {/* Main Row */}
              <div className="flex py-4 px-6 items-center">
                {/* Document Name */}
                <div className="flex-3 flex items-center pr-4">
                  <div className="w-10 h-10 bg-brand-blue-bg rounded-lg flex items-center justify-center mr-4 shrink-0">
                    <IconComponent size={20} className="text-brand-blue" />
                  </div>
                  <span className="font-bold text-[14px] text-gray-900 truncate">
                    {item.name}
                  </span>
                </div>

                {/* Generated Path */}
                <div className="flex-2 flex items-center pr-4">
                  <span className="bg-gray-100 text-gray-500 text-[12px] px-2 py-1 rounded font-mono truncate">
                    {item.generatedPath}
                  </span>
                </div>

                {/* Total Files */}
                <div className="flex-1 flex items-center text-[14px] font-medium text-gray-600 pl-4">
                  {item.totalFiles}
                </div>

                {/* Approver */}
                <div className="flex-[1.5] flex items-center pr-4">
                  <input
                    type="text"
                    placeholder="Name..."
                    className="w-full text-[13px] px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue bg-[#f9fafb]"
                  />
                </div>

                {/* Actions */}
                <div className="flex-1 flex items-center justify-end gap-2">
                  <button className="flex items-center justify-center w-7 h-7 rounded bg-[#ffe6e6] text-[#e03131] hover:bg-[#ffcccc] transition-colors">
                    <X size={16} />
                  </button>
                  <button className="flex items-center justify-center w-7 h-7 rounded bg-[#183a64] text-white hover:bg-blue-900 transition-colors">
                    <Check size={16} />
                  </button>
                </div>
              </div>

              {/* Nested Items */}
              {item.files && item.files.length > 0 && (
                <div className="px-6 pb-5 pl-20 flex flex-col gap-4 relative">
                  {/* Vertical connecting line */}
                  <div className="absolute left-11 top-[-16px] bottom-7 w-px bg-gray-200"></div>

                  {item.files.map((file, nestedIdx) => {
                    const FileIcon = file.icon || File;
                    return (
                      <div
                        key={file.id || nestedIdx}
                        className="flex items-center relative"
                      >
                        {/* Connecting horizontal stub */}
                        <div className="absolute left-[-36px] top-1/2 w-4 h-px bg-gray-200"></div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center text-gray-400 shrink-0 bg-white z-10 py-1">
                            <FileIcon size={18} className="text-brand-blue" />
                          </div>
                          <div className="text-[14px] font-medium text-gray-500 truncate">
                            {file.name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty State */}
        {data.length === 0 && (
          <div className="py-8 text-center text-gray-500 text-[14px]">
            No pending documents available.
          </div>
        )}
      </div>
    </div>
  );
}
