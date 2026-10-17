import { LucideIcon } from 'lucide-react';

export type PendingFileItem = {
  gdrive_file_id: string;
  name: string;
  icon: LucideIcon | React.ElementType;
  web_view_link?: string;
  new_file_path?: string;
  destination_folder_link?: string;
  is_approved?: boolean | number | string | null;
  return_reason?: string;
  move_status?: string;
  url?: string;
  new_path?: string;
};

export type PendingItem = {
  id: string;
  name: string;
  totalFiles: number;
  icon: LucideIcon | React.ElementType;
  files?: PendingFileItem[];
};
