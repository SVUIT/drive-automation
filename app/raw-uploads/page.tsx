'use client';

import React, { useEffect, useMemo } from 'react';
import BatchTable from '@/components/features/raw-uploads/BatchTable';
import { BatchItem } from '@/components/features/raw-uploads/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSearch, SearchableItem } from '@/app/context/SearchContext';
import { matchesSearch } from '@/app/lib/search-utils';
import { useRawUploads } from '@/app/hooks/useRawUploads';
import SearchFilterBanner from '@/components/common/SearchFilterBanner';

function PageContent() {
  const { batches, loading, error, handlePathSaved } = useRawUploads();
  const { searchQuery, scope, clearSearch, registerItems, unregisterItems } = useSearch();

  // Register items for global search
  useEffect(() => {
    const items: SearchableItem[] = batches.flatMap((batch) => [
      {
        id: `raw-batch-${batch.form_submissions_id}`,
        title: batch.name,
        subtitle: `${batch.docsCount} file(s)`,
        category: 'raw-uploads' as const,
        categoryLabel: 'Raw uploads',
        route: '/raw-uploads',
        isSubmissionGroup: true,
      },
      ...batch.files.map((file) => ({
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

      <SearchFilterBanner
        query={searchQuery}
        fileCount={totalMatchingFiles}
        groupCount={filteredBatches.length}
        groupUnit="batch"
        onClear={clearSearch}
      />

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
          onPathSaved={handlePathSaved}
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
