import { FileText, FileSpreadsheet, File, Archive, LucideIcon } from 'lucide-react';

/**
 * Returns the appropriate Lucide icon component based on file extension and mime type.
 */
export function getFileIcon(name?: string, mimeType?: string): LucideIcon {
  if (!name) return File;
  const ext = name.split('.').pop()?.toLowerCase();

  if (ext === 'zip' || ext === 'rar' || ext === '7z' || ext === 'tar' || ext === 'gz') {
    return Archive;
  }
  if (
    mimeType?.includes('spreadsheet') ||
    ext === 'xlsx' ||
    ext === 'xls' ||
    ext === 'csv'
  ) {
    return FileSpreadsheet;
  }
  if (
    ext === 'pdf' ||
    mimeType?.includes('pdf') ||
    ext === 'docx' ||
    ext === 'doc' ||
    ext === 'pptx' ||
    ext === 'ppt' ||
    ext === 'txt'
  ) {
    return FileText;
  }
  return File;
}
