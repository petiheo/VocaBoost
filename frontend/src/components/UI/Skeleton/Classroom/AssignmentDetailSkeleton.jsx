import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// AssignmentDetail Page Skeleton (SCSS-based)
export function AssignmentDetailSkeleton() {
  return (
    <SkeletonTheme baseColor="#FFFCF7" highlightColor="#F7F1E3">
      <div className="assignment-detail-page" style={{ 
        display: 'flex',
        background: '#FFFCF7'
      }}>
        <div className="content" style={{ width: '100%' }}>
          <div className="assignment-detail__container" style={{ 
            background: '#FFFCF7',
            borderRadius: '8px'
          }}>
            {/* Page Title */}
            <Skeleton height={29} width="40%" style={{ 
              marginBottom: '1.5rem',
              fontFamily: 'Lalezar, sans-serif'
            }} />

            {/* Assignment Box */}
            <div className="assignment-box" style={{
              padding: '20px',
              borderRadius: '20px',
              backgroundColor: '#FFFAEF',
              fontFamily: 'Inria Sans, sans-serif',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              marginBottom: '24px'
            }}>
              <div className="assignment-header" style={{ 
                fontFamily: 'Inria Sans, sans-serif',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <Skeleton height={24} width="60%" />
                <Skeleton height={24} width={30} style={{ 
                  backgroundColor: '#ccc',
                  borderRadius: '5px'
                }} />
              </div>
              
              <div className="assignment-meta" style={{ 
                fontFamily: 'Inter, sans-serif',
                marginTop: '1rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: '0.6rem'
              }}>
                <Skeleton height={16} width="90%" />
                <Skeleton height={16} width="85%" />
                <Skeleton height={16} width="95%" />
                <Skeleton height={16} width="80%" />
              </div>
            </div>

            {/* Sub Menu Tabs */}
            <div className="sub-menu-tabs" style={{ marginBottom: '24px' }}>
              <div className="tab-list" style={{ display: 'flex', gap: '16px' }}>
                <Skeleton height={36} width={80} style={{ borderRadius: '6px' }} />
                <Skeleton height={36} width={90} style={{ borderRadius: '6px' }} />
                <Skeleton height={36} width={100} style={{ borderRadius: '6px' }} />
              </div>
            </div>

            {/* Word List */}
            <div className="word-list" style={{ 
              marginTop: '2em',
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem' 
            }}>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="word-card" style={{
                  backgroundColor: '#FFF7DD',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontFamily: 'Inria Sans, sans-serif'
                }}>
                  <Skeleton height={18} width="25%" style={{ 
                    marginBottom: '8px',
                    display: 'block',
                    fontSize: '1.1rem'
                  }} />
                  <Skeleton height={16} width="85%" />
                </div>
              ))}
            </div>

            {/* See More Button */}
            <div className="see-more" style={{ 
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Skeleton height={32} width={140} style={{ 
                fontFamily: 'Inria Sans, sans-serif',
                backgroundColor: '#FBF4E7',
                borderRadius: '6px'
              }} />
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}