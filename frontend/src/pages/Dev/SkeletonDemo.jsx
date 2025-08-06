import { useState } from 'react';
import { 
  Header, 
  Footer, 
  SideBar,
  // Utility Skeletons
  ContentSkeleton,
  AvatarSkeleton,
  ButtonSkeleton,
  TableRowSkeleton,
  // Card Skeletons
  CardSkeleton,
  WordCardSkeleton,
  ClassroomCardSkeleton,
  VocabularyListCardSkeleton,
  ViewClassroomCardSkeleton,
  // Page Skeletons
  CarouselSectionSkeleton,
  SearchResultsGridSkeleton,
  WordFormSkeleton,
  ListFormSkeleton,
  ViewListSkeleton,
  ProfileSkeleton,
  OverviewListSkeleton,
  // Classroom Skeletons
  ViewClassroomSkeleton,
  LearnersListSkeleton,
  PendingRequestSkeleton,
  AssignmentPageSkeleton,
  AssignmentDetailSkeleton
} from '../../components';

// Only available in development
const SkeletonDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSkeleton, setSelectedSkeleton] = useState('ViewClassroomSkeleton');

  if (process.env.NODE_ENV !== 'development') {
    return <div>This page is only available in development mode.</div>;
  }

  const skeletonComponents = {
    // Utility Skeletons
    'ContentSkeleton': () => <ContentSkeleton lines={3} />,
    'AvatarSkeleton': () => <AvatarSkeleton size={64} />,
    'ButtonSkeleton': () => <ButtonSkeleton width={120} height={40} />,
    'TableRowSkeleton': () => <table><tbody><TableRowSkeleton count={3} columns={4} /></tbody></table>,
    
    // Card Skeletons
    'CardSkeleton': () => <CardSkeleton count={2} />,
    'WordCardSkeleton': () => <WordCardSkeleton count={3} />,
    'ClassroomCardSkeleton': () => <ClassroomCardSkeleton count={2} />,
    'VocabularyListCardSkeleton': () => <VocabularyListCardSkeleton />,
    'ViewClassroomCardSkeleton': () => <ViewClassroomCardSkeleton />,
    
    // Page Skeletons
    'CarouselSectionSkeleton': () => <CarouselSectionSkeleton title="TEST CAROUSEL" showTabs={true} />,
    'SearchResultsGridSkeleton': () => <SearchResultsGridSkeleton count={6} />,
    'WordFormSkeleton': () => <WordFormSkeleton count={2} />,
    'ListFormSkeleton': () => <ListFormSkeleton isEditMode={false} />,
    'ViewListSkeleton': () => <ViewListSkeleton />,
    'ProfileSkeleton': () => <ProfileSkeleton />,
    'OverviewListSkeleton': () => <OverviewListSkeleton />,
    
    // Classroom Skeletons
    'ViewClassroomSkeleton': () => <ViewClassroomSkeleton />,
    'LearnersListSkeleton': () => <LearnersListSkeleton />,
    'PendingRequestSkeleton': () => <PendingRequestSkeleton />,
    'AssignmentPageSkeleton': () => <AssignmentPageSkeleton />,
    'AssignmentDetailSkeleton': () => <AssignmentDetailSkeleton />
  };

  const SelectedComponent = skeletonComponents[selectedSkeleton];

  return (
    <div className="skeleton-demo">
      <Header />
      <div className="manage-classroom-learner">
        <div className="manage-classroom-learner__container">
          <div className="manage-classroom__sidebar">
            <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
          </div>
          
          <div className="manage-classroom-learner__content">
            <div style={{ padding: '20px' }}>
              <h1>🔧 Skeleton Loading Demo</h1>
              <p>Select a skeleton component to preview:</p>
              
              <div style={{ marginBottom: '20px' }}>
                <select 
                  value={selectedSkeleton} 
                  onChange={(e) => setSelectedSkeleton(e.target.value)}
                  style={{ 
                    padding: '8px 12px', 
                    fontSize: '14px', 
                    borderRadius: '4px', 
                    border: '1px solid #ddd',
                    minWidth: '200px'
                  }}
                >
                  {Object.keys(skeletonComponents).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div style={{ 
                border: '2px dashed #ddd', 
                padding: '20px', 
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <h3>Preview: {selectedSkeleton}</h3>
                <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px' }}>
                  <SelectedComponent />
                </div>
              </div>

              <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                <p><strong>Development Tips:</strong></p>
                <ul>
                  <li>Press <kbd>Ctrl + Shift + S</kbd> to toggle skeleton on any page</li>
                  <li>Press <kbd>Ctrl + Shift + L</kbd> for long skeleton test (10s)</li>
                  <li>Use browser network throttling for realistic testing</li>
                  <li>This demo page is only available in development mode</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SkeletonDemo;