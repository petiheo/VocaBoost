import { Header, SideBar, Footer, Pagination } from '../../components';
import CarouselVocabSection from '../../components/Vocabulary/CarouselVocabSection';
import { useState, useEffect } from 'react';
import  LoadingCursor from '../../components/UI/LoadingCursor';
import { useDebounce } from '../../hooks/useDebounce'; 
import { VocabularyListCard } from '../../components';
import vocabularyService from '../../services/Vocabulary/vocabularyService';

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
  const [reviewLists, setReviewLists] = useState({ 
    data: [], 
    pagination: null, 
    isLoading: true, 
    error: null 
  });
  const [recentLists, setRecentLists] = useState({ data: [], isLoading: true, error: null });
  const [popularLists, setPopularLists] = useState({ data: [], isLoading: true, error: null });

  const [activeReviewTab, setActiveReviewTab] = useState('today');
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewLimit] = useState(10);

  const [searchQuery, setSearchQuery] = useState(''); 
  const [searchResults, setSearchResults] = useState({ 
    data: [], 
    pagination: null, // Thêm state để lưu thông tin phân trang
    isLoading: false, 
    error: null 
  });
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [isOpen, setIsOpen] = useState(false);


  useEffect(() => {
    if (searchQuery) return; 

    const fetchStaticLists = async () => {
      try {
        const [historyResponse, popularResponse] = await Promise.all([
            vocabularyService.getHistoryLists(),
            vocabularyService.getPopularLists()
        ]);

        const transformedRecent = (historyResponse.lists || []).map(list => ({
          id: list.listId,
          title: list.title,
          description: list.description,
          username: list.creator?.display_name,
          role: list.creator?.role,
          avatarUrl: list.creator?.avatar_url
        }));
        setRecentLists({ data: transformedRecent, isLoading: false, error: null });

        const transformedPopular = (popularResponse.lists || []).map(list => ({
          id: list.listId,
          title: list.title,
          description: list.description,
          username: list.creator?.display_name,
          role: list.creator?.role,
          avatarUrl: list.creator?.avatar_url
        }));
        setPopularLists({ data: transformedPopular, isLoading: false, error: null });

      } catch (err) {
        console.error("Failed to fetch homepage lists:", err);
        const errorState = { data: [], isLoading: false, error: err };
        setRecentLists(errorState);
        setPopularLists(errorState);
      }
    };
    if (!searchQuery) {
      fetchStaticLists();
    }
  }, [searchQuery]);

  useEffect(() => {
    // Nếu query đã debounce là rỗng, không làm gì cả, xóa kết quả cũ
    if (debouncedSearchQuery === '') {
      setSearchResults({ data: [], pagination: null, isLoading: false, error: null });
      return;
    }

    const fetchSearchResults = async () => {
      setSearchResults({ data: [], isLoading: true, error: null });
      try {
        const { lists: apiLists, pagination } = await vocabularyService.searchPublicLists({ q: debouncedSearchQuery });

        // Dịch dữ liệu từ API sang định dạng mà VocabularyListCard cần
        const transformedLists = apiLists.map(list => ({
          id: list.id,
          listId: list.id, // Giữ lại listId nếu component con cần
          title: list.title,
          description: list.description,
          username: list.creator.display_name, 
          role: list.creator.role,
          avatarUrl: list.creator.avatar_url,
        }));
        
        setSearchResults({ 
          data: transformedLists, 
          pagination: pagination, 
          isLoading: false, 
          error: null 
        });

      } catch (err) {
        setSearchResults({ data: [], pagination: null, isLoading: false, error: err });
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
  
  // 2. useEffect để fetch REVIEW LISTS dựa vào tab đang active
  useEffect(() => {
    const fetchReviewData = async () => {
      setReviewLists({ data: [], pagination: null, isLoading: true, error: null });
      try {
        let response;
        const params = { page: reviewPage, limit: reviewLimit };
        
        if (activeReviewTab === 'today') {
          response = await vocabularyService.getDueLists(params);
        } else {
          response = await vocabularyService.getUpcomingLists(params);
        }
        
        const transformedReview = (response.lists || []).map(list => ({
          id: list.id || list.listId,
          title: list.title,
          description: list.description,
          username: list.creator?.display_name,
          role: list.creator?.role,
          avatarUrl: list.creator?.avatar_url,
        }));
        setReviewLists({ 
          data: transformedReview, 
          pagination: response.pagination || null,
          isLoading: false, 
          error: null 
        });
      } catch (err) {
        console.error(`Failed to fetch ${activeReviewTab} review lists:`, err);
        setReviewLists({ data: [], pagination: null, isLoading: false, error: err });
      }
    };

    if (!searchQuery) {
        fetchReviewData();
    }
  }, [activeReviewTab, reviewPage, reviewLimit, searchQuery]); 

  const handleTabChange = (tabIdentifier) => {
    if (tabIdentifier !== activeReviewTab) {
      setActiveReviewTab(tabIdentifier);
      setReviewPage(1); // Reset to page 1 when changing tabs
    }
  };

  const handleReviewPageChange = (newPage) => {
    setReviewPage(newPage);
  };

  return (
    <div className="homepage__wrapper">
      <Header 
        searchQuery={searchQuery} 
        onSearchChange={handleSearchChange} 
      />

      <div className="homepage__body">
        <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
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
                      return <p className="search-status-message error">Error finding lists. Please try again. {searchQuery.error}</p>;
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
                <section className="review-lists-section">
                  <div className="section-header">
                    <h2>REVIEW LISTS</h2>
                    <ReviewTabs 
                      activeTab={activeReviewTab} 
                      onTabChange={handleTabChange} 
                    />
                  </div>

                  {reviewLists.isLoading ? (
                    <div className="loading-container">Loading...</div>
                  ) : reviewLists.error ? (
                    <div className="error-message">Could not load review lists.</div>
                  ) : reviewLists.data.length > 0 ? (
                    <>
                      <div className="review-lists-grid">
                        {reviewLists.data.map((list) => (
                          <VocabularyListCard
                            key={list.id}
                            {...list}
                          />
                        ))}
                      </div>
                      
                      {reviewLists.pagination && (
                        <Pagination
                          pagination={reviewLists.pagination}
                          onPageChange={handleReviewPageChange}
                          className="review-pagination"
                        />
                      )}
                    </>
                  ) : (
                    <div className="no-data-message">
                      No review lists available for {activeReviewTab === 'today' ? 'today' : 'upcoming'}.
                    </div>
                  )}
                </section>

                <CarouselVocabSection 
                  title="RECENTLY LISTS" 
                  vocabLists={recentLists.data}
                  isLoading={recentLists.isLoading} 
                  error={recentLists.error}         
                />

                <CarouselVocabSection 
                  title="POPULAR LISTS" 
                  vocabLists={popularLists.data}
                  isLoading={popularLists.isLoading} 
                  error={popularLists.error}         
                />
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