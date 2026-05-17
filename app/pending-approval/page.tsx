'use client';

import { FileText, FileSpreadsheet, File } from 'lucide-react';
import PendingTable, { PendingItem } from '@/components/features/pending-approval/PendingTable';

const PENDING_DOCS: PendingItem[] = [
  {
    id: '1',
    name: 'structural_analysis_rev_C.pdf',
    generatedPath: '/vault/engineering/2024/Q3/',
    totalFiles: 3,
    icon: FileText,
    files: [
      { id: '1-1', name: 'draft_v1.pdf', icon: FileText },
      { id: '1-2', name: 'calculations.xlsx', icon: FileSpreadsheet },
      { id: '1-3', name: 'final_report.pdf', icon: FileText },
    ]
  },
  {
    id: '2',
    name: 'site_survey_north_wing.pdf',
    generatedPath: '/vault/survey/projects/alpha/',
    totalFiles: 2,
    icon: FileText,
    files: [
      { id: '2-1', name: 'survey_data.xlsx', icon: FileSpreadsheet },
      { id: '2-2', name: 'site_images.pdf', icon: FileText },
    ]
  },
  {
    id: '3',
    name: 'foundation_matrix_grid.xlsx',
    generatedPath: '/vault/specifications/drafts/',
    totalFiles: 2,
    icon: FileSpreadsheet,
    files: [
      { id: '3-1', name: 'matrix_draft.xlsx', icon: FileSpreadsheet },
      { id: '3-2', name: 'grid_layout.dwg', icon: File },
    ]
  },
  {
    id: '4',
    name: 'hvac_layout_main_terminal.dwg',
    generatedPath: '/vault/engineering/mechanical/',
    totalFiles: 1,
    icon: File,
    files: [
      { id: '4-1', name: 'hvac_layout_main_terminal.dwg', icon: File },
    ]
  },
  {
    id: '5',
    name: 'vendor_compliance_v2.docx',
    generatedPath: '/vault/legal/compliance/',
    totalFiles: 1,
    icon: FileText,
    files: [
      { id: '5-1', name: 'vendor_compliance_v2.docx', icon: FileText },
    ]
  }
];

export default function PendingApprovalPage() {
  return (
    <div>
      <h1 className="text-[28px] font-extrabold mt-8 mb-6 text-gray-900 tracking-tight">
        Pending approval
      </h1>

      <PendingTable data={PENDING_DOCS} />
    </div>
  );
}
