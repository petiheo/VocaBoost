import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { SKELETON_THEMES } from '../themes';

// VocabularyListCard skeleton for HomePage
export function VocabularyListCardSkeleton({ theme = 'default' }) {
  const colors = SKELETON_THEMES[theme];
  return (
    <SkeletonTheme baseColor={colors.baseColor} highlightColor={colors.highlightColor}>
      <div className="vocab-card" style={{
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <Skeleton height={20} width="80%" style={{ marginBottom: '8px' }} />
        <Skeleton height={16} count={2} style={{ marginBottom: '8px' }} />
        
        <div className="vocab-footer" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '16px'
        }}>
          <div className="user-block" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Skeleton circle height={32} width={32} />
            <div>
              <Skeleton height={14} width={80} style={{ marginBottom: '4px' }} />
              <Skeleton height={12} width={60} />
            </div>
          </div>
          <Skeleton height={32} width={80} />
        </div>
      </div>
    </SkeletonTheme>
  );
}