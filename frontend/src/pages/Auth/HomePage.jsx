import { Header, SideBar, Footer } from '../../components';
import CarouselVocabSection from '../../components/Vocabulary/CarouselVocabSection';
import { useState, useEffect } from 'react';
import  LoadingCursor from '../../components/UI/LoadingCursor';
import { useDebounce } from '../../hooks/useDebounce'; 
import { VocabularyListCard } from '../../components';

// Import các hàm fetch từ service của bạn
// import { getReviewLists, getRecentLists, getPopularLists } from '../../service/user/user';

// mock data
const allMockLists = [
  { listId: '1234', title: 'Thế Hoàng', description: 'A helpful list of commonly used English words to boost your reading and speaking skills', username: 'Username', role: 'Teacher'},
  { listId: '1234', title: 'Phi Hùng', description: 'A helpful list of commonly used English words to boost your reading and speaking skills', username: 'Username', role: 'Teacher'},
  { listId: '1234', title: 'Trúc Mai', description: 'A helpful list of commonly used English words to boost your reading and speaking skills', username: 'Username', role: 'Teacher'},
  { listId: '1234', title: 'Quang Nghị', description: 'A helpful list of commonly used English words to boost your reading and speaking skills', username: 'Username', role: 'Teacher'},
  { listId: '1234', title: 'Hiệp Thắng', description: 'A helpful list of commonly used English words to boost your reading and speaking skills', username: 'Username', role: 'Teacher'},
];


// Component cho các Tab
const ReviewTabs = ({ activeTab, onTabChange }) => (
  <div className="review-tabs">
    <button
      className={`tab-button ${activeTab === 'today' ? 'active' : ''}`}
      onClick={() => onTabChange('today')}
    >
      Today
    </button>
    <button
      className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
      onClick={() => onTabChange('upcoming')}
    >
      Upcoming
    </button>
  </div>
);

const HomePage = () => {
  const [reviewLists, setReviewLists] = useState({ data: [], isLoading: true, error: null });
  const [recentLists, setRecentLists] = useState({ data: [], isLoading: true, error: null });
  const [popularLists, setPopularLists] = useState({ data: [], isLoading: true, error: null });

  const [activeReviewTab, setActiveReviewTab] = useState('today');

  const [searchQuery, setSearchQuery] = useState(''); 
  const [searchResults, setSearchResults] = useState({ data: [], isLoading: false, error: null });
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (searchQuery) return; 

    const fetchStaticLists = async () => {
      try {
        const [recentData, popularData] = await Promise.all([
          getRecentLists(),
          getPopularLists()
        ]);
        setRecentLists({ data: recentData, isLoading: false, error: null });
        setPopularLists({ data: popularData, isLoading: false, error: null });
      } catch (err) {
        console.error("Failed to fetch homepage lists:", err);
        const errorState = { data: [], isLoading: false, error: err };
        setRecentLists(errorState);
        setPopularLists(errorState);
      }
    };
    fetchStaticLists();
  }, [searchQuery]); // Chạy 1 lần

  useEffect(() => {
    // Nếu query đã debounce là rỗng, không làm gì cả, xóa kết quả cũ
    if (debouncedSearchQuery === '') {
      setSearchResults({ data: [], isLoading: false, error: null });
      return;
    }

    const fetchSearchResults = async () => {
      setSearchResults({ data: [], isLoading: true, error: null });
      try {
        // const results = await searchAllLists(debouncedSearchQuery);
        const results = allMockLists.filter(list => 
          list.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
        setSearchResults({ data: results, isLoading: false, error: null });

      } catch (err) {
        setSearchResults({ data: [], isLoading: false, error: err });
      }
    };

    fetchSearchResults();
  }, [debouncedSearchQuery]);

  const handleSearchChange = (event) => {
    const newQuery = event.target.value;
    setSearchQuery(newQuery);

    if (newQuery) {
      setSearchResults(prevState => ({ ...prevState, isLoading: true }));
    }
  };
  
  // Theo dõi sự thay đổi của `activeReviewTab` để fetch lại dữ liệu
  useEffect(() => {
    const fetchReviewData = async () => {
      setReviewLists({ data: [], isLoading: true, error: null });

      try {
        let data;
        // Dựa vào tab đang active để gọi API tương ứng, tùy chỉnh theo API chung hay riêng
        if (activeReviewTab === 'today') {
          data = await getReviewListsToday();
        } else if (activeReviewTab === 'upcoming') {
          data = await getReviewListsUpcoming();
        }
        
        // Cập nhật state với dữ liệu mới
        setReviewLists({ data: data, isLoading: false, error: null });
      } catch (err) {
        console.error(`Failed to fetch ${activeReviewTab} review lists:`, err);
        setReviewLists({ data: [], isLoading: false, error: err });
      }
    };

    fetchReviewData();
  }, [activeReviewTab]); 

  const handleTabChange = (tabIdentifier) => {
    if (tabIdentifier !== activeReviewTab) {
      setActiveReviewTab(tabIdentifier);
    }
  };

  const renderCarouselSection = (sectionState, title, children = null) => {
    if (sectionState.isLoading) {
      return <LoadingCursor />;
    }

    if (sectionState.error) {
      return <p>Could not load this section. Please try again later.</p>;
    }

    return (
      <CarouselVocabSection title={title} vocabLists={sectionState.data}>
        {children}
      </CarouselVocabSection>
    );
  };

  return (
    <div className="homepage__wrapper">
      <Header 
        searchQuery={searchQuery} 
        onSearchChange={handleSearchChange} 
      />

      <div className="homepage__body">
        <SideBar />
        <main className="homepage__main">
          <section className="homepage__content">
            
            {searchQuery ? (
              <section className="search-results-section">
                <h2>Search Results for "{searchQuery}"</h2>
                
                <div className="search-results-content">
                  {(() => {
                    if (searchResults.isLoading) {
                      return <p className="search-status-message loading">Searching...</p>;
                    }

                    if (searchResults.error) {
                      return <p className="search-status-message error">Error finding lists. Please try again.</p>;
                    }

                    if (searchResults.data.length === 0) {
                      return <p className="search-status-message empty">No lists found matching your search.</p>;
                    }

                    return (
                      <div className="search-results-grid">
                        {searchResults.data.map(list => (
                          <VocabularyListCard key={list.id} {...list} buttonContent='Overview' />
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </section>
            ) : (
              <>
              <CarouselVocabSection title="REVIEW LISTS" vocabLists={allMockLists}>
                <ReviewTabs 
                  activeTab={activeReviewTab} 
                  onTabChange={handleTabChange} 
                />
              </CarouselVocabSection>

              <CarouselVocabSection title="RECENTLY LISTS" vocabLists={allMockLists} />

              <CarouselVocabSection title="POPULAR LISTS" vocabLists={allMockLists} />
              
              {/* {reviewLists.isLoading ? (
                <LoadingCursor />
              ) : reviewLists.error ? (
                <p>Could not load review section.</p>
              ) : (
                <CarouselVocabSection title="REVIEW LISTS" vocabLists={reviewLists.data}>
                  <ReviewTabs 
                    activeTab={activeReviewTab} 
                    onTabChange={handleTabChange} 
                  />
                </CarouselVocabSection>
              )}
              {renderCarouselSection(recentLists, 'RECENTLY LISTS')}
              {renderCarouselSection(popularLists, 'POPULAR LISTS')}  */}
              </>
            )}

          </section>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default HomePage;