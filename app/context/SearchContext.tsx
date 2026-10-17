'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { matchesSearch } from '@/app/lib/search-utils';

export type SearchScope = 'all' | 'files' | 'paths' | 'submissions';

export type SearchableCategory = 'raw-uploads' | 'pending-approval' | 'approved-files';

export interface SearchableItem {
  id: string;
  title: string;
  subtitle?: string;
  path?: string;
  url?: string;
  destinationFolderLink?: string;
  category: SearchableCategory;
  categoryLabel: string;
  route: string;
  isSubmissionGroup?: boolean;
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  scope: SearchScope;
  setScope: (scope: SearchScope) => void;
  registerItems: (sourceKey: string, items: SearchableItem[]) => void;
  unregisterItems: (sourceKey: string) => void;
  allSearchItems: SearchableItem[];
  matchingItems: SearchableItem[];
}

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');
  const [itemsBySource, setItemsBySource] = useState<Record<string, SearchableItem[]>>({});

  const registerItems = useCallback((sourceKey: string, items: SearchableItem[]) => {
    setItemsBySource(prev => {
      // Check if unchanged to avoid infinite re-render cycles
      const current = prev[sourceKey];
      if (current && current.length === items.length) {
        let isSame = true;
        for (let i = 0; i < items.length; i++) {
          if (current[i].id !== items[i].id || current[i].path !== items[i].path || current[i].title !== items[i].title) {
            isSame = false;
            break;
          }
        }
        if (isSame) return prev;
      }
      return { ...prev, [sourceKey]: items };
    });
  }, []);

  const unregisterItems = useCallback((sourceKey: string) => {
    setItemsBySource(prev => {
      if (!prev[sourceKey]) return prev;
      const copy = { ...prev };
      delete copy[sourceKey];
      return copy;
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const allSearchItems = useMemo(() => {
    return Object.values(itemsBySource).flat();
  }, [itemsBySource]);

  const matchingItems = useMemo(() => {
    if (!searchQuery.trim()) return [];

    return allSearchItems.filter(item => {
      if (scope === 'files') {
        if (item.isSubmissionGroup) return false;
        return matchesSearch(item.title, searchQuery);
      }
      if (scope === 'submissions') {
        return matchesSearch(item.subtitle, searchQuery) || (item.isSubmissionGroup && matchesSearch(item.title, searchQuery));
      }
      if (scope === 'paths') {
        return matchesSearch(item.path, searchQuery);
      }
      // 'all'
      return (
        matchesSearch(item.title, searchQuery) ||
        matchesSearch(item.subtitle, searchQuery) ||
        matchesSearch(item.path, searchQuery)
      );
    });
  }, [allSearchItems, searchQuery, scope]);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        clearSearch,
        scope,
        setScope,
        registerItems,
        unregisterItems,
        allSearchItems,
        matchingItems,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
