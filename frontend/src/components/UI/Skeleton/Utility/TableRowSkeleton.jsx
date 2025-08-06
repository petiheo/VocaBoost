import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { SKELETON_THEMES } from '../themes';

// Table row skeleton for classroom data
export function TableRowSkeleton({ count = 5, columns = 4, theme = 'default' }) {
  const colors = SKELETON_THEMES[theme];
  return (
    <SkeletonTheme baseColor={colors.baseColor} highlightColor={colors.highlightColor}>
      {Array.from({ length: count }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex}>
              <Skeleton height={16} />
            </td>
          ))}
        </tr>
      ))}
    </SkeletonTheme>
  );
}