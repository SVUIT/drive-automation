const APPWRITE_ENV = process.env.NEXT_PUBLIC_APPWRITE_ENV ?? "production";
const RETURNED_FILES_KEY = `returnedFiles:${APPWRITE_ENV}`;

export type ReturnedFile = {
  fileId: string;
  submissionId: string;
  submissionName: string;
  name: string;
  url?: string;
  new_file_path?: string;
  return_reason: string;
  is_approved: null;
};

export const getReturnedFiles = (): ReturnedFile[] => {
  const stored = localStorage.getItem(RETURNED_FILES_KEY);
  if (!stored) return [];

  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed)) {
    throw new Error("Danh sách file trả về trong trình duyệt không hợp lệ.");
  }
  return parsed as ReturnedFile[];
};

export const saveReturnedFile = (file: ReturnedFile) => {
  const files = getReturnedFiles().filter(entry => entry.fileId !== file.fileId);
  localStorage.setItem(RETURNED_FILES_KEY, JSON.stringify([...files, file]));
};

export const removeReturnedFile = (fileId: string) => {
  const files = getReturnedFiles().filter(entry => entry.fileId !== fileId);
  localStorage.setItem(RETURNED_FILES_KEY, JSON.stringify(files));
};
