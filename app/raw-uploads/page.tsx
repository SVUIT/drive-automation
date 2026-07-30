"use client";

import { useState, useEffect } from "react";
import { File } from "lucide-react";
import BatchTable, {
  BatchItem,
  FileItem,
} from "@/components/features/raw-uploads/BatchTable";

const APPWRITE_ENV = process.env.NEXT_PUBLIC_APPWRITE_ENV ?? "production";
const APPROVED_RAW_UPLOADS_KEY = `approvedRawUploads:${APPWRITE_ENV}`;
const APPROVED_FILES_KEY = `approvedFiles:${APPWRITE_ENV}`;

type ApiFile = {
  file_id?: string;
  id?: string;
  $id?: string;
  gdrive_file_id?: string;
  name: string;
  web_view_link?: string;
};

type ApiSubmission = {
  form_submissions_id: string | number;
  submitted_files?: ApiFile[];
};

type UploadsResponse = {
  data?: ApiSubmission[];
  error?: string | null;
};

type StoredApprovedBatch = {
  form_submissions_id: string;
  name: string;
  files: Array<Pick<FileItem, "id" | "name" | "url" | "submissionId" | "submissionFileCount">>;
};

type SessionApprovedEntry = {
  submissionId: string;
  submissionName: string;
  file: {
    gdrive_file_id: string;
    name: string;
    web_view_link?: string;
  };
};

const readApprovedBatches = (): BatchItem[] => {
  try {
    const stored = localStorage.getItem(APPROVED_RAW_UPLOADS_KEY);
    if (!stored) return [];

    const parsed: StoredApprovedBatch[] = JSON.parse(stored);
    return parsed.map((batch) => ({
      form_submissions_id: batch.form_submissions_id,
      name: batch.name,
      docsCount: batch.files.length,
      files: batch.files.map((file) => ({
        ...file,
        icon: File,
        status: "approved",
      })),
    }));
  } catch {
    return [];
  }
};

const writeApprovedBatches = (batches: BatchItem[]) => {
  const approved: StoredApprovedBatch[] = batches
    .map((batch) => ({
      form_submissions_id: batch.form_submissions_id,
      name: batch.name,
      files: batch.files
        .filter((file) => file.status === "approved")
        .map(({ id, name, url, submissionId, submissionFileCount }) => ({
          id,
          name,
          url,
          submissionId,
          submissionFileCount,
        })),
    }))
    .filter((batch) => batch.files.length > 0);

  localStorage.setItem(APPROVED_RAW_UPLOADS_KEY, JSON.stringify(approved));
};

const readSessionApprovedBatches = (): BatchItem[] => {
  try {
    const stored = sessionStorage.getItem(APPROVED_FILES_KEY);
    if (!stored) return [];

    const entries: SessionApprovedEntry[] = JSON.parse(stored);
    const grouped = new Map<string, BatchItem>();

    entries.forEach((entry) => {
      const existing = grouped.get(entry.submissionId);
      const file: FileItem = {
        id: entry.file.gdrive_file_id,
        name: entry.file.name,
        url:
          entry.file.web_view_link ||
          `https://drive.google.com/file/d/${encodeURIComponent(entry.file.gdrive_file_id)}/view`,
        icon: File,
        submissionId: entry.submissionId,
        submissionFileCount: 1,
        status: "approved",
      };

      if (existing) {
        if (!existing.files.some((item) => item.id === file.id)) {
          existing.files.push(file);
          existing.docsCount = existing.files.length;
          existing.files.forEach((item) => {
            item.submissionFileCount = existing.files.length;
          });
        }
        return;
      }

      grouped.set(entry.submissionId, {
        form_submissions_id: entry.submissionId,
        name: entry.submissionName,
        docsCount: 1,
        files: [file],
      });
    });

    return Array.from(grouped.values());
  } catch {
    return [];
  }
};

const mergeBatches = (current: BatchItem[], approved: BatchItem[]) => {
  const merged = new Map(current.map((batch) => [batch.form_submissions_id, batch]));

  approved.forEach((approvedBatch) => {
    const existing = merged.get(approvedBatch.form_submissions_id);
    if (!existing) {
      merged.set(approvedBatch.form_submissions_id, approvedBatch);
      return;
    }

    const files = new Map(existing.files.map((file) => [file.id, file]));
    approvedBatch.files.forEach((file) => files.set(file.id, file));
    merged.set(existing.form_submissions_id, {
      ...existing,
      files: Array.from(files.values()),
      docsCount: files.size,
    });
  });

  return Array.from(merged.values());
};

export default function RawUploadsPage() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/appwrite-func", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "fetch unapproved submissions" }),
        });

        const result: UploadsResponse = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        if (result.data) {
          const apiBatches = result.data.map((item) => {
            const files = item.submitted_files || [];

            return {
              form_submissions_id: String(item.form_submissions_id),
              name: `Submission #${item.form_submissions_id}`,
              docsCount: files.length,
              files: files.flatMap((f) => {
                const id = f.file_id || f.id || f.$id || f.gdrive_file_id;
                if (!id) return [];

                return [{
                  id,
                  name: f.name,
                  url: f.web_view_link,
                  icon: File,
                  submissionId: String(item.form_submissions_id),
                  submissionFileCount: files.length,
                }];
              }),
            };
          });

          const retainedApproved = mergeBatches(
            readApprovedBatches(),
            readSessionApprovedBatches()
          );
          const merged = mergeBatches(apiBatches, retainedApproved);
          writeApprovedBatches(merged);
          setBatches(merged);
        } else {
          const approved = mergeBatches(
            readApprovedBatches(),
            readSessionApprovedBatches()
          );
          writeApprovedBatches(approved);
          setBatches(approved);
        }
      } catch (err: unknown) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
        setBatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, []);

  return (
    <div>
      <h1 className="text-[28px] font-extrabold mt-8 mb-6 text-gray-900 tracking-tight">
        Raw Uploads
      </h1>

      {error && (
        <div className="text-red-500 mb-4 bg-red-50 p-3 rounded text-[14px]">
          Lỗi API: {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 py-8 text-center text-[14px] animate-pulse">
          Đang tải dữ liệu từ API...
        </div>
      ) : (
        <BatchTable
          data={batches}
          onFileMoved={(movedFile) => {
            setBatches((current) => {
              const next = current.map((batch) => ({
                ...batch,
                files: batch.files.map((file) =>
                  file.id === movedFile.id
                    ? { ...file, status: "approved" as const }
                    : file
                ),
              }));
              writeApprovedBatches(next);
              return next;
            });
          }}
        />
      )}
    </div>
  );
}
