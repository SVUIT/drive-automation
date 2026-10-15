'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSearch, SearchableItem } from '@/app/context/SearchContext';
import { matchesSearch } from '@/app/lib/search-utils';
import { useApprovedFiles } from '@/app/hooks/useApprovedFiles';
import { ApprovedFile, GroupedSubmission } from '@/components/features/approved-files/types';
import ApprovedTable from '@/components/features/approved-files/ApprovedTable';
import ReturnFileModal from '@/components/features/approved-files/ReturnFileModal';
import SearchFilterBanner from '@/components/common/SearchFilterBanner';

function PageContent() {
  const { groups, setGroups, loading, error } = useApprovedFiles();
  const { searchQuery, scope, clearSearch, registerItems, unregisterItems } = useSearch();

  const [returningFile, setReturningFile] = useState<{
    file: ApprovedFile;
    submissionId: string;
    submissionName: string;
  } | null>(null);

  // Register items for global search
  useEffect(() => {
    const items: SearchableItem[] = groups.flatMap((group) => [
      {
        id: `approved-group-${group.submissionId}`,
        title: group.submissionName,
        subtitle: `${group.files.length} file(s)`,
        category: 'approved-files' as const,
        categoryLabel: 'Approved',
        route: '/approved-files',
        isSubmissionGroup: true,
      },
      ...group.files.map((file) => ({
        id: `approved-file-${file.gdrive_file_id}`,
        title: file.name,
        subtitle: group.submissionName,
        path: file.new_file_path || undefined,
        url: file.web_view_link,
        destinationFolderLink: file.destination_folder_link || undefined,
        category: 'approved-files' as const,
        categoryLabel: 'Approved',
        route: '/approved-files',
        isSubmissionGroup: false,
      })),
    ]);

    registerItems('approved-files', items);
    return () => unregisterItems('approved-files');
  }, [groups, registerItems, unregisterItems]);

  // Filter groups based on search
  const filteredGroups: GroupedSubmission[] = useMemo(() => {
    if (!searchQuery.trim()) return groups;

    return groups
      .map((group): GroupedSubmission | null => {
        const groupMatches =
          scope === 'submissions' || scope === 'all'
            ? matchesSearch(group.submissionName, searchQuery) ||
              matchesSearch(String(group.submissionId), searchQuery)
            : false;

        const matchingFiles = group.files.filter((file) => {
          if (scope === 'files') {
            return matchesSearch(file.name, searchQuery);
          }
          if (scope === 'paths') {
            return matchesSearch(file.new_file_path, searchQuery);
          }
          if (scope === 'submissions') {
            return groupMatches;
          }
          // scope === 'all'
          return (
            matchesSearch(file.name, searchQuery) ||
            matchesSearch(file.new_file_path, searchQuery) ||
            groupMatches
          );
        });

        if (matchingFiles.length > 0) {
          return {
            ...group,
            files: matchingFiles,
          };
        }
        return null;
      })
      .filter((g): g is GroupedSubmission => g !== null);
  }, [groups, searchQuery, scope]);

  const totalMatchingFiles = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.files.length, 0);
  }, [filteredGroups]);

  const handleFileReturned = (fileId: string) => {
    setGroups((current) =>
      current
        .map((group) => ({
          ...group,
          files: group.files.filter((file) => file.gdrive_file_id !== fileId),
        }))
        .filter((group) => group.files.length > 0)
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight">
            Approved Files
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách các biểu mẫu và tệp đã được phê duyệt lưu vào Google Drive
          </p>
        </div>
      </div>

      <SearchFilterBanner
        query={searchQuery}
        fileCount={totalMatchingFiles}
        groupCount={filteredGroups.length}
        groupUnit="submission"
        onClear={clearSearch}
        className="mb-6"
      />

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-[14px]">
          Đang tải danh sách file đã duyệt...
        </div>
      ) : (
        <ApprovedTable
          groups={filteredGroups}
          searchQuery={searchQuery}
          onClearSearch={clearSearch}
          onRequestReturnFile={(file, submissionId, submissionName) =>
            setReturningFile({ file, submissionId, submissionName })
          }
        />
      )}

      <ReturnFileModal
        returningFile={returningFile}
        onClose={() => setReturningFile(null)}
        onSuccess={handleFileReturned}
      />
    </div>
  );
}

export default function ApprovedFilesPage() {
  return (
    <ProtectedRoute>
      <PageContent />
    </ProtectedRoute>
  );
}