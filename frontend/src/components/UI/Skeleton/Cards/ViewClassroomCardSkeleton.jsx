import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// ViewClassroom Assignment Card Skeleton (SCSS-based)
export function ViewClassroomCardSkeleton() {
  return (
    <SkeletonTheme baseColor="#F9F3E4" highlightColor="#F1EBD8">
      <div className="vocab-card" style={{
        backgroundColor: '#F9F3E4',
        padding: '1.2rem',
        borderRadius: '20px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '220px',
        maxWidth: '300px',
        overflow: 'hidden'
      }}>
        {/* Title */}
        <Skeleton height={19} width="80%" style={{ 
          marginBottom: '0.5rem',
          fontFamily: 'Lalezar, sans-serif'
        }} />
        
        {/* Description */}
        <Skeleton height={14} count={2} style={{ 
          marginBottom: '0.5rem',
          fontFamily: 'Inria Sans, sans-serif',
          color: '#444'
        }} />
        
        {/* Meta Information */}
        <Skeleton height={10} width="60%" style={{ 
          marginBottom: '0.3rem',
          fontFamily: 'Inter, sans-serif',
          color: '#2932B1'
        }} />
        <Skeleton height={10} width="40%" style={{ 
          marginBottom: '0.5rem',
          fontFamily: 'Inter, sans-serif',
          color: '#2932B1'
        }} />
        <Skeleton height={10} width="50%" style={{ 
          marginBottom: '1rem',
          fontFamily: 'Inter, sans-serif',
          color: '#2932B1'
        }} />
        
        {/* Footer */}
        <div className="vocab-footer" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: 'auto',
          paddingTop: '1rem',
          fontFamily: 'Inria Sans, sans-serif'
        }}>
          <div className="user-block" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            minWidth: '150px',
            gap: '5%'
          }}>
            <Skeleton circle height={40} width={40} style={{
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }} />
            <div className="user-info" style={{ 
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Skeleton height={13} width={80} style={{ 
                marginBottom: '2px',
                fontWeight: 'bold',
                color: '#222'
              }} />
              <Skeleton height={11} width={60} style={{
                borderRadius: '7px',
                backgroundColor: '#d6e5ff',
                color: '#1b4da3'
              }} />
            </div>
          </div>
          <Skeleton height={32} width={80} style={{
            borderRadius: '20px',
            backgroundColor: '#2e2a25'
          }} />
        </div>
      </div>
    </SkeletonTheme>
  );
}