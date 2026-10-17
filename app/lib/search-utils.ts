// Utilities for search matching and diacritics removal for Vietnamese

/**
 * Remove Vietnamese accents/tones from a string for diacritics-insensitive matching.
 * Preserves exact string length by substituting 1-to-1 characters.
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[ÌÍỊỈĨ]/g, 'I')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/[ỲÝỴỶỸ]/g, 'Y')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Checks whether `text` matches `query`, case-insensitively and diacritics-insensitively.
 */
export function matchesSearch(text: string | null | undefined, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (!text) return false;

  const cleanQuery = query.trim().toLowerCase();
  const cleanText = text.toLowerCase();

  // Direct case-insensitive match
  if (cleanText.includes(cleanQuery)) return true;

  // Tone-removed match (e.g. "toan" matches "Toán")
  return removeVietnameseTones(cleanText).includes(removeVietnameseTones(cleanQuery));
}

export type HighlightPart = {
  text: string;
  isMatch: boolean;
};

/**
 * Splits `text` into matched and non-matched chunks for highlighting.
 */
export function getHighlightParts(text: string | null | undefined, query: string): HighlightPart[] {
  if (!text) return [];
  if (!query || !query.trim()) return [{ text, isMatch: false }];

  const cleanQuery = removeVietnameseTones(query.trim().toLowerCase());
  const cleanText = removeVietnameseTones(text.toLowerCase());

  if (!cleanQuery) return [{ text, isMatch: false }];

  const parts: HighlightPart[] = [];
  let lastIndex = 0;
  let index = cleanText.indexOf(cleanQuery);

  while (index !== -1) {
    if (index > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, index),
        isMatch: false,
      });
    }

    parts.push({
      text: text.slice(index, index + cleanQuery.length),
      isMatch: true,
    });

    lastIndex = index + cleanQuery.length;
    index = cleanText.indexOf(cleanQuery, lastIndex);
  }

  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      isMatch: false,
    });
  }

  return parts;
}
