import { VocabularyListCardSkeleton } from '../Cards';

// Search Results Grid Skeleton
export function SearchResultsGridSkeleton({ count = 8, theme = 'default' }) {
  return (
    <div className="search-results-grid">
      {Array.from({ length: count }).map((_, index) => (
        <VocabularyListCardSkeleton key={index} theme={theme} />
      ))}
    </div>
  );
}