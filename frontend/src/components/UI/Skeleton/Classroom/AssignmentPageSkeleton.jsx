import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// AssignmentPage Skeleton (SCSS-based)
export function AssignmentPageSkeleton() {
  return (
    <SkeletonTheme baseColor="#FFFCF7" highlightColor="#F7F1E3">
      <div className="assignment-page" style={{ fontFamily: 'Inria Sans, sans-serif' }}>
        <div className="assignment-page__container" style={{ 
          display: 'flex',
          gap: '2em'
        }}>
          <div className="assignment-page__content" style={{ 
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
          }}>
            {/* Classroom Title */}
            <div style={{ marginBottom: '24px' }}>
              <Skeleton height={36} width="40%" style={{ marginBottom: '8px' }} />
              <Skeleton height={16} width="25%" />
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ 
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <Skeleton height={36} width={100} style={{ 
                borderRadius: '6px',
                backgroundColor: '#f3eacc'
              }} />
              <Skeleton height={36} width={120} style={{ 
                borderRadius: '6px',
                backgroundColor: '#fff4c2'
              }} />
              <Skeleton height={36} width={110} style={{ 
                borderRadius: '6px',
                backgroundColor: '#f3eacc'
              }} />
            </div>

            {/* Controls */}
            <div className="controls" style={{ 
              margin: '20px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Skeleton height={40} width={150} style={{ 
                borderRadius: '5px',
                backgroundColor: '#2e2e2e'
              }} />
              <Skeleton height={16} width={80} style={{ color: '#444' }} />
            </div>

            {/* Assignment Grid */}
            <div className="assignment-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: '1rem'
            }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="assignment-card" style={{
                  backgroundColor: '#F9F3E4',
                  border: '0.5px solid #666',
                  borderRadius: '10px',
                  padding: '1rem',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1em'
                }}>
                  <Skeleton height={20} width="80%" style={{ 
                    marginBottom: '0.5rem',
                    fontWeight: 'bold'
                  }} />
                  <div style={{ 
                    borderBottom: '0.5px solid #666',
                    paddingBottom: '1em'
                  }}>
                    <Skeleton height={14} width="60%" style={{ marginBottom: '0.2rem' }} />
                  </div>
                  <Skeleton height={14} width="40%" style={{ color: '#666' }} />
                </div>
              ))}
            </div>

            {/* See More */}
            <div className="see-more" style={{ 
              textAlign: 'center',
              margin: '2rem 0'
            }}>
              <Skeleton height={16} width={100} />
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}