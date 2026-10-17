import { LucideIcon } from 'lucide-react';

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
