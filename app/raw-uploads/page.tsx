'use client';

import { FileCode, Presentation } from 'lucide-react';
import BatchTable, { BatchItem } from '@/components/features/raw-uploads/BatchTable';

// Dữ liệu mẫu (Mock data)
const BATCHES: BatchItem[] = [
  {
    id: '1',
    name: 'Đề thi OOP',
    docsCount: 4,
    sizeMB: 182.4,
    uploader: 'David Sterling',
    date: 'Oct 12, 2023',
    files: [
      { id: '1-1', name: 'Đề thi hk1', icon: FileCode },
      { id: '1-2', name: 'Đề thi hk2', icon: FileCode },
      { id: '1-3', name: 'slide.ppt', icon: Presentation },
    ],
  },
  {
    id: '2',
    name: 'DSA',
    docsCount: 2,
    sizeMB: 45.1,
    uploader: 'Elena Rossi',
    date: 'Oct 11, 2023',
    files: [
      { id: '2-1', name: 'Slide1.ppt', icon: Presentation },
      { id: '2-2', name: 'Slide2.ppt', icon: Presentation },
    ],
  },
  {
    id: '3',
    name: 'Slidegt.ppt',
    docsCount: 1,
    sizeMB: 2.1,
    uploader: 'Marcus Thorne',
    date: 'Oct 10, 2023',
    files: [],
  },
];

export default function RawUploadsPage() {
  return (
    <div>
      <h1 className="text-[28px] font-extrabold mt-8 mb-6 text-gray-900 tracking-tight">
        Raw Uploads
      </h1>

      <BatchTable data={BATCHES} />
    </div>
  );
}
