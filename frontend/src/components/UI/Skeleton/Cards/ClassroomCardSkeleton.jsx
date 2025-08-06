import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Classroom card skeleton matching .classroom-card styles
export function ClassroomCardSkeleton({ count = 1 }) {
  return (
    <SkeletonTheme baseColor="#f1ede4" highlightColor="#e8ddc7">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="classroom-card"
          style={{
            backgroundColor: '#F9F3E4',
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            border: '1px solid #eee',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)'
          }}
        >
          <div className="info">
            <Skeleton height={14} width="40%" style={{ marginBottom: '0.3rem' }} />
            <Skeleton height={20} width="70%" />
          </div>
        </div>
      ))}
    </SkeletonTheme>
  );
}