'use client';

import { FileText, FileSpreadsheet, Monitor, TrendingUp } from 'lucide-react';
import ApprovedTable, { ApprovedGroup } from '@/components/features/approved-files/ApprovedTable';

const APPROVED_GROUPS: ApprovedGroup[] = [
  {
    id: 'g1',
    title: 'Computer Science',
    docsCount: 142,
    groupIcon: Monitor,
    items: [
      {
        id: '1',
        name: 'Algorithm_Complexity_Analysis_v2.pdf',
        semester: 'Fall Semester',
        year: 2023,
        archivePath: '/root/edu/cs/theory/2023_fall',
        icon: FileText
      },
      {
        id: '2',
        name: 'Distributed_Systems_Whitepaper.docx',
        semester: 'Spring Semester',
        year: 2023,
        archivePath: '/root/edu/cs/sys/2023_spring',
        icon: FileText
      }
    ]
  },
  {
    id: 'g2',
    title: 'Economics',
    docsCount: 87,
    groupIcon: TrendingUp,
    items: [
      {
        id: '3',
        name: 'Macro_Trends_Q4_Fiscal_Report.xlsx',
        semester: 'Winter Term',
        year: 2022,
        archivePath: '/root/edu/econ/finance/2022_q4',
        icon: FileSpreadsheet
      },
      {
        id: '4',
        name: 'Game_Theory_Equilibrium_Notes.pdf',
        semester: 'Fall Semester',
        year: 2023,
        archivePath: '/root/edu/econ/micro/2023_fall',
        icon: FileText
      }
    ]
  }
];

export default function ApprovedFilesPage() {
  return (
    <div>
      <h1 className="text-[28px] font-extrabold mt-8 mb-6 text-gray-900 tracking-tight">
        Approved files
      </h1>

      <ApprovedTable groups={APPROVED_GROUPS} />
    </div>
  );
}
