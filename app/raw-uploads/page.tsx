"use client";

import { useState, useEffect, useMemo } from "react";
import { File, Search } from "lucide-react";
import BatchTable, {
  BatchItem,
  FileItem,
} from "@/components/features/raw-uploads/BatchTable";
import { getReturnedFiles } from "@/app/approved-files/returned-files";
import { useSearch, SearchableItem } from "@/app/context/SearchContext";
import { matchesSearch } from "@/app/lib/search-utils";
import ProtectedRoute from "@/components/ProtectedRoute";

type ApiFile = {
  file_id?: string;
  id?: string;
  $id?: string;
  gdrive_file_id?: string;
  name: string;
  web_view_link?: string;
  new_file_path?: string | null;
  destination_folder_link?: string | null;
  is_approved?: boolean | number | string;
  return_reason?: string;
};

type ApiSubmission = {
  form_submissions_id: string | number;
  submitted_files?: ApiFile[];
};

type UploadsResponse = {
  data?: ApiSubmission[];
  error?: string | null;
};

function PageContent() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { searchQuery, scope, clearSearch, registerItems, unregisterItems } = useSearch();

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

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result: UploadsResponse = await response.json();
        if (result.error) {
          throw new Error(result.error);
        }

        const apiBatches: BatchItem[] = (result.data ?? []).map((item) => {
          const files = (item.submitted_files || []).filter(
            (file) => file.is_approved !== true && file.is_approved !== 1 && file.is_approved !== "true"
          );
          const submissionId = String(item.form_submissions_id);
          const mappedFiles = files.flatMap((file): FileItem[] => {
            const id = file.file_id || file.id || file.$id || file.gdrive_file_id;
            if (!id) return [];

            return [{
              id,
              name: file.name,
              url: file.web_view_link,
              icon: File,
              submissionId,
              new_file_path: file.new_file_path ?? undefined,
              return_reason: file.return_reason,
            }];
          });

          return {
            form_submissions_id: submissionId,
            name: `Submission #${submissionId}`,
            docsCount: mappedFiles.length,
            files: mappedFiles,
          };
        }).filter((batch) => batch.files.length > 0);

        const mergedBatches = new Map(apiBatches.map(batch => [batch.form_submissions_id, batch]));
        for (const returned of getReturnedFiles()) {
          const batch = mergedBatches.get(returned.submissionId) ?? {
            form_submissions_id: returned.submissionId,
            name: returned.submissionName,
            docsCount: 0,
            files: [],
          };
          const returnedFile: FileItem = {
            id: returned.fileId,
            name: returned.name,
            url: returned.url,
            icon: File,
            submissionId: returned.submissionId,
            new_file_path: returned.new_file_path,
            return_reason: returned.return_reason,
          };
          const files = batch.files.some(file => file.id === returned.fileId)
            ? batch.files.map(file => file.id === returned.fileId ? returnedFile : file)
            : [...batch.files, returnedFile];
          mergedBatches.set(returned.submissionId, {
            ...batch,
            files,
            docsCount: files.length,
          });
        }

        setBatches(Array.from(mergedBatches.values()));
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

  // Register items for global search
  useEffect(() => {
    const items: SearchableItem[] = batches.flatMap(batch => [
      {
        id: `raw-batch-${batch.form_submissions_id}`,
        title: batch.name,
        subtitle: `${batch.docsCount} file(s)`,
        category: 'raw-uploads' as const,
        categoryLabel: 'Raw uploads',
        route: '/raw-uploads',
        isSubmissionGroup: true,
      },
      ...batch.files.map(file => ({
        id: `raw-file-${file.id}`,
        title: file.name,
        subtitle: batch.name,
        path: file.new_file_path,
        url: file.url,
        category: 'raw-uploads' as const,
        categoryLabel: 'Raw uploads',
        route: '/raw-uploads',
        isSubmissionGroup: false,
      })),
    ]);

    registerItems('raw-uploads', items);
    return () => unregisterItems('raw-uploads');
  }, [batches, registerItems, unregisterItems]);

  // Filter batches based on search
  const filteredBatches: BatchItem[] = useMemo(() => {
    if (!searchQuery.trim()) return batches;

    return batches
      .map((batch): BatchItem | null => {
        const batchMatches =
          scope === 'submissions' || scope === 'all'
            ? matchesSearch(batch.name, searchQuery) ||
              matchesSearch(batch.form_submissions_id, searchQuery)
            : false;

        const matchingFiles = batch.files.filter((file) => {
          if (scope === 'files') {
            return matchesSearch(file.name, searchQuery);
          }
          if (scope === 'paths') {
            return matchesSearch(file.new_file_path, searchQuery);
          }
          if (scope === 'submissions') {
            return batchMatches;
          }
          // scope === 'all'
          return (
            matchesSearch(file.name, searchQuery) ||
            matchesSearch(file.new_file_path, searchQuery) ||
            matchesSearch(file.return_reason, searchQuery) ||
            batchMatches
          );
        });

        if (matchingFiles.length > 0) {
          return {
            ...batch,
            files: matchingFiles,
            docsCount: matchingFiles.length,
          };
        }
        return null;
      })
      .filter((b): b is BatchItem => b !== null);
  }, [batches, searchQuery, scope]);

  const totalMatchingFiles = useMemo(() => {
    return filteredBatches.reduce((acc, b) => acc + b.files.length, 0);
  }, [filteredBatches]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 mb-6 gap-3">
        <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight">
          Raw Uploads
        </h1>
      </div>

      {/* Search active notification */}
      {searchQuery && (
        <div className="flex items-center justify-between gap-3 bg-blue-50/80 border border-blue-200 text-blue-900 px-4 py-2.5 rounded-lg mb-4 text-[13px] animate-in fade-in duration-150">
          <div className="flex items-center gap-2 min-w-0">
            <Search size={15} className="text-blue-600 shrink-0" />
            <span className="truncate">
              Bộ lọc: <strong>&ldquo;{searchQuery}&rdquo;</strong> • Tìm thấy <strong>{totalMatchingFiles}</strong> tệp trong <strong>{filteredBatches.length}</strong> batch
            </span>
          </div>
          <button
            type="button"
            onClick={clearSearch}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline shrink-0 cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

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
          data={filteredBatches}
          searchQuery={searchQuery}
          onClearSearch={clearSearch}
          onPathSaved={(savedFile, path) => {
            setBatches((current) => {
              return current.map((batch) => ({
                ...batch,
                files: batch.files.map((file) => file.id === savedFile.id
                  ? { ...file, new_file_path: path }
                  : file),
              }));
            });
          }}
        />
      )}
    </div>
  );
}

export default function RawUploadsPage() {
  return (
    <ProtectedRoute>
      <PageContent />
    </ProtectedRoute>
  );
}
