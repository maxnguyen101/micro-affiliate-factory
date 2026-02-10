export const AMAZON_ASSOC_TAG = 'microaffiliat-20';

export const amazonSearchLink = (query: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_ASSOC_TAG}`;
