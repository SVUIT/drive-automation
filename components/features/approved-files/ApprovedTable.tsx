import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export type ApprovedItem = {
  id: string;
  name: string;
  semester: string;
  year: number;
  archivePath: string;
  icon: any;
};

export type ApprovedGroup = {
  id: string;
  title: string;
  docsCount: number;
  groupIcon: any;
  items: ApprovedItem[];
};

interface ApprovedTableProps {
  groups: ApprovedGroup[];
}

export default function ApprovedTable({ groups }: ApprovedTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-x-auto mt-6 border border-gray-100 pb-2">
      <div className="min-w-[800px] flex flex-col">
        <div className="flex py-4 px-6 bg-[#f9fafb] border-b border-gray-200 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
          <div className="flex-[3] flex items-center">DOCUMENT CATEGORY & FILES</div>
          <div className="flex-[1.5] flex items-center">SEMESTER</div>
          <div className="flex-[1] flex items-center">YEAR</div>
          <div className="flex-[2] flex items-center">ARCHIVE PATH</div>
          <div className="flex-[1] flex items-center justify-end">STATUS</div>
        </div>

      <div className="flex flex-col divide-y divide-gray-200">
        {groups.map((group, idx) => {
          const GroupIcon = group.groupIcon;
          return (
            <div key={group.id || idx} className="flex flex-col">
              <div className="flex py-4 px-6 items-center">
                <div className="flex-[3] flex items-center">
                  <div className="w-10 h-10 bg-brand-blue-bg rounded-lg flex items-center justify-center mr-4 shrink-0">
                    <GroupIcon size={20} className="text-brand-blue" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-0.5 text-[15px]">{group.title}</div>
                    <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                      {group.docsCount} DOCUMENTED FILES
                    </div>
                  </div>
                </div>
                <div className="flex-[1.5]"></div>
                <div className="flex-[1]"></div>
                <div className="flex-[2]"></div>
                <div className="flex-[1]"></div>
              </div>

              {group.items && group.items.length > 0 && (
                <div className="px-6 pb-5 pl-20 flex flex-col gap-4 relative">
                  <div className="absolute left-11 top-[-16px] bottom-7 w-px bg-gray-200"></div>

                  {group.items.map((item, nestedIdx) => {
                    const ItemIcon = item.icon;
                    return (
                      <div key={item.id || nestedIdx} className="flex items-center relative">
                        <div className="absolute left-[-36px] top-1/2 w-4 h-px bg-gray-200"></div>
                        
                        <div className="flex-[3] flex items-center gap-3 pr-4">
                          <div className="flex items-center justify-center text-gray-400 shrink-0 bg-white z-10 py-1">
                            <ItemIcon size={18} className="text-brand-blue" />
                          </div>
                          <div className="text-[14px] font-medium text-gray-900 truncate">{item.name}</div>
                        </div>
                        
                        <div className="flex-[1.5] flex items-center text-[13px] text-gray-600">
                          {item.semester}
                        </div>
                        
                        <div className="flex-[1] flex items-center text-[13px] text-gray-600">
                          {item.year}
                        </div>
                        
                        <div className="flex-[2] flex items-center pr-4">
                          <span className="text-[#3b82f6] text-[13px] font-mono hover:underline cursor-pointer truncate">
                            {item.archivePath}
                          </span>
                        </div>
                        
                        <div className="flex-[1] flex items-center justify-end">
                          <div className="flex items-center gap-1.5 bg-[#e6fcf5] px-2.5 py-1 rounded-full border border-[#c3fae8]">
                            <CheckCircle2 size={12} className="text-[#0ca678]" fill="#0ca678" color="white" />
                            <span className="uppercase text-[#0ca678] text-[11px] font-bold tracking-wide">APPROVED</span>
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

        {groups.length === 0 && (
          <div className="py-8 text-center text-gray-500 text-[14px]">
            No approved files available.
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
