import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { SKELETON_THEMES } from '../themes';

// Word card skeleton for vocabulary details
export function WordCardSkeleton({ count = 1, theme = 'default' }) {
  const colors = SKELETON_THEMES[theme];
  return (
    <SkeletonTheme baseColor={colors.baseColor} highlightColor={colors.highlightColor}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="word-card">
          <Skeleton height={20} width="40%" style={{ marginBottom: '8px' }} />
          <Skeleton height={16} width="80%" style={{ marginBottom: '8px' }} />
          <Skeleton height={14} width="60%" />
        </div>
      ))}
    </SkeletonTheme>
  );
}