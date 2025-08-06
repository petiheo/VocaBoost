import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// PendingRequest Page Skeleton (SCSS-based)
export function PendingRequestSkeleton() {
  return (
    <SkeletonTheme baseColor="#FFFCF7" highlightColor="#F7F1E3">
      <div className="pending-request__page" style={{ fontFamily: 'Inria Sans, sans-serif' }}>
        {/* Classroom Title */}
        <div style={{ marginBottom: '24px' }}>
          <Skeleton height={36} width="40%" style={{ marginBottom: '8px' }} />
          <Skeleton height={16} width="25%" />
        </div>

        {/* Menu Tabs */}
        <div className="sub-menu-tabs" style={{ marginBottom: '24px' }}>
          <div className="tab-list" style={{ display: 'flex', gap: '16px' }}>
            <Skeleton height={36} width={100} style={{ borderRadius: '6px' }} />
            <Skeleton height={36} width={120} style={{ borderRadius: '6px' }} />
            <Skeleton height={36} width={110} style={{ borderRadius: '6px' }} />
          </div>
        </div>

        <div className="pending-request__container">
          {/* Student Actions */}
          <div className="pending-request__student-action" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '16px',
            margin: '20px 0'
          }}>
            <Skeleton height={42} width={150} style={{ 
              borderRadius: '6px',
              backgroundColor: '#1a1a1a'
            }} />
            
            <div className="pending-request__search-block" style={{ 
              position: 'relative',
              display: 'grid',
              alignItems: 'center',
              gridTemplateColumns: '50% 50%',
              width: '100%'
            }}>
              <Skeleton height={40} width="90%" />
              <div className="search-block--dropdown-menu" style={{ justifySelf: 'end' }}>
                <Skeleton height={40} width={100} />
              </div>
            </div>
          </div>

          {/* Request List */}
          <div className="pending-request__student-list" style={{ marginTop: '10px' }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="pending-request__student-row" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid #ddd'
              }}>
                <Skeleton height={16} width="50%" />
                <Skeleton height={26} width={60} style={{ 
                  borderRadius: '6px',
                  backgroundColor: '#f3eee4'
                }} />
              </div>
            ))}
          </div>

          {/* See More */}
          <div className="pending-request__see-more" style={{ 
            marginTop: '20px',
            textAlign: 'center'
          }}>
            <Skeleton height={32} width={120} style={{ 
              borderRadius: '20px',
              backgroundColor: '#f5f0e3'
            }} />
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}