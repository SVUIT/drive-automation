'use client';

import React from 'react';
import { getHighlightParts } from '@/app/lib/search-utils';

interface HighlightTextProps {
  text: string | null | undefined;
  query: string;
  className?: string;
  highlightClassName?: string;
}

export default function HighlightText({
  text,
  query,
  className = '',
  highlightClassName = 'bg-yellow-200 text-gray-900 rounded-[2px] px-0.5 font-medium',
}: HighlightTextProps) {
  if (!text) return null;
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const parts = getHighlightParts(text, query);

  return (
    <span className={className}>
      {parts.map((part, idx) =>
        part.isMatch ? (
          <mark key={idx} className={highlightClassName}>
            {part.text}
          </mark>
        ) : (
          <React.Fragment key={idx}>{part.text}</React.Fragment>
        )
      )}
    </span>
  );
}
