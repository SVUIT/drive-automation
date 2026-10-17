'use client';

import React, { useEffect, useMemo } from 'react';
import PendingTable from '@/components/features/pending-approval/PendingTable';
import { PendingItem } from '@/components/features/pending-approval/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useSearch, SearchableItem } from '../context/SearchContext';
import { matchesSearch } from '../lib/search-utils';
import { usePendingSubmissions } from '../hooks/usePendingSubmissions';
import SearchFilterBanner from '@/components/common/SearchFilterBanner';

function PageContent() {
  const { user } = useAuth();
  const { submissions, loading, error, handleSubmissionDone } = usePendingSubmissions();
  const { searchQuery, scope, clearSearch, registerItems, unregisterItems } = useSearch();

  // Register items for global search
  useEffect(() => {
    const items: SearchableItem[] = submissions.flatMap((sub) => [
      {
        id: `pending-sub-${sub.id}`,
        title: sub.name,
        subtitle: `${sub.totalFiles} file(s)`,
        category: 'pending-approval' as const,
        categoryLabel: 'Pending approval',
        route: '/pending-approval',
        isSubmissionGroup: true,
      },
      ...(sub.files ?? []).map((file) => ({
        id: `pending-file-${file.gdrive_file_id}`,
        title: file.name,
        subtitle: sub.name,
        path: file.new_file_path,
        url: file.url || file.web_view_link,
        destinationFolderLink: file.destination_folder_link,
        category: 'pending-approval' as const,
        categoryLabel: 'Pending approval',
        route: '/pending-approval',
        isSubmissionGroup: false,
      })),
    ]);

    registerItems('pending-approval', items);
    return () => unregisterItems('pending-approval');
  }, [submissions, registerItems, unregisterItems]);

  // Filter submissions based on search
  const filteredSubmissions: PendingItem[] = useMemo(() => {
    if (!searchQuery.trim()) return submissions;

    return submissions
      .map((sub): PendingItem | null => {
        const subMatches =
          scope === 'submissions' || scope === 'all'
            ? matchesSearch(sub.name, searchQuery) || matchesSearch(sub.id, searchQuery)
            : false;

        const matchingFiles = (sub.files ?? []).filter((file) => {
          if (scope === 'files') {
            return matchesSearch(file.name, searchQuery);
          }
          if (scope === 'paths') {
            return matchesSearch(file.new_file_path, searchQuery);
          }
          if (scope === 'submissions') {
            return subMatches;
          }
          // scope === 'all'
          return (
            matchesSearch(file.name, searchQuery) ||
            matchesSearch(file.new_file_path, searchQuery) ||
            matchesSearch(file.return_reason, searchQuery) ||
            subMatches
          );
        });

        if (matchingFiles.length > 0) {
          return {
            ...sub,
            files: matchingFiles,
            totalFiles: matchingFiles.length,
          };
        }
        return null;
      })
      .filter((s): s is PendingItem => s !== null);
  }, [submissions, searchQuery, scope]);

  const totalMatchingFiles = useMemo(() => {
    return filteredSubmissions.reduce((acc, s) => acc + (s.files?.length ?? 0), 0);
  }, [filteredSubmissions]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 mb-6 gap-3">
        <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight">
          Pending approval
        </h1>
      </div>

      <SearchFilterBanner
        query={searchQuery}
        fileCount={totalMatchingFiles}
        groupCount={filteredSubmissions.length}
        groupUnit="submission"
        onClear={clearSearch}
      />

      {loading && (
        <div className="text-gray-400 text-[14px] py-8 text-center">Loading submissions...</div>
      )}
      {error && <div className="text-red-500 text-[13px] py-4">{error}</div>}

      {!loading && !error && (
        <PendingTable
          data={filteredSubmissions}
          approverEmail={user?.email ?? ''}
          searchQuery={searchQuery}
          onClearSearch={clearSearch}
          onSubmissionDone={handleSubmissionDone}
        />
      )}
    </div>
  );
}

export default function PendingApprovalPage() {
  return (
    <ProtectedRoute>
      <PageContent />
    </ProtectedRoute>
  );
}
