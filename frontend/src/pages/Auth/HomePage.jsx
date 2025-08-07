import {
  Header,
  SideBar,
  Footer,
  SearchResultsGridSkeleton,
  CarouselSectionSkeleton,
} from "../../components";
import CarouselVocabSection from "../../components/Vocabulary/CarouselVocabSection";
import { useState, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { VocabularyListCard } from "../../components";
import vocabularyService from "../../services/Vocabulary/vocabularyService";
import { useSkeletonToggle } from "../../hooks/useSkeletonToggle";

// Component cho các Tab
const ReviewTabs = ({ activeTab, onTabChange }) => (
  <div className="review-tabs">
    <button
      className={`tab-button ${activeTab === "today" ? "active" : ""}`}
      onClick={() => onTabChange("today")}
    >
      Today
    </button>
    <button
      className={`tab-button ${activeTab === "upcoming" ? "active" : ""}`}
      onClick={() => onTabChange("upcoming")}
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
    error: null,
  });
  const [recentLists, setRecentLists] = useState({
    data: [],
    isLoading: true,
    error: null,
  });
  const [popularLists, setPopularLists] = useState({
    data: [],
    isLoading: true,
    error: null,
  });

  const [activeReviewTab, setActiveReviewTab] = useState("today");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    data: [],
    pagination: null, // Thêm state để lưu thông tin phân trang
    isLoading: false,
    error: null,
  });
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [isOpen, setIsOpen] = useState(false);

  // Development skeleton toggle hook
  const { isLoading: isSkeletonLoading } = useSkeletonToggle();

  useEffect(() => {
    if (searchQuery) return;

    const fetchStaticLists = async () => {
      try {
        const [historyResponse, popularResponse] = await Promise.all([
          vocabularyService.getHistoryLists({ limit: 12 }),
          vocabularyService.getPopularLists({ limit: 12 }),
        ]);

        const transformedRecent = (historyResponse.lists || []).map((list) => ({
          listId: list.id,
          title: list.title,
          description: list.description,
          username: list.creator?.display_name,
          role: list.creator?.role,
          avatarUrl: list.creator?.avatar_url,
        }));
        setRecentLists({
          data: transformedRecent,
          isLoading: false,
          error: null,
        });

        const transformedPopular = (popularResponse.lists || []).map(
          (list) => ({
            listId: list.id,
            title: list.title,
            description: list.description,
            username: list.creator?.display_name,
            role: list.creator?.role,
            avatarUrl: list.creator?.avatar_url,
          })
        );
        setPopularLists({
          data: transformedPopular,
          isLoading: false,
          error: null,
        });
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
    if (debouncedSearchQuery === "") {
      setSearchResults({
        data: [],
        pagination: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    const fetchSearchResults = async () => {
      setSearchResults({ data: [], isLoading: true, error: null });
      try {
        const { lists: apiLists, pagination } =
          await vocabularyService.searchPublicLists({
            q: debouncedSearchQuery,
          });

        // Dịch dữ liệu từ API sang định dạng mà VocabularyListCard cần
        const transformedLists = apiLists.map((list) => ({
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
          error: null,
        });
      } catch (err) {
        setSearchResults({
          data: [],
          pagination: null,
          isLoading: false,
          error: err,
        });
      }
    };

    fetchSearchResults();
  }, [debouncedSearchQuery]);

  const handleSearchChange = (event) => {
    const newQuery = event.target.value;
    setSearchQuery(newQuery);

    if (newQuery) {
      setSearchResults((prevState) => ({ ...prevState, isLoading: true }));
    }
  };

  // 2. useEffect để fetch REVIEW LISTS dựa vào tab đang active
  useEffect(() => {
    const fetchReviewData = async () => {
      setReviewLists({
        data: [],
        pagination: null,
        isLoading: true,
        error: null,
      });
      try {
        let response;

        if (activeReviewTab === "today") {
          response = await vocabularyService.getDueLists();
        } else {
          response = await vocabularyService.getUpcomingLists({ limit: 12 });
        }

        const transformedReview = (response.lists || []).map((list) => ({
          listId: list.id || list.listId,
          title: list.title,
          description: list.description,
          username: list.creator?.display_name,
          role: list.creator?.role,
          avatarUrl: list.creator?.avatar_url,
          nextReview: list.next_review_in_days,
        }));
        setReviewLists({
          data: transformedReview,
          pagination: response.pagination || null,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error(`Failed to fetch ${activeReviewTab} review lists:`, err);
        setReviewLists({
          data: [],
          pagination: null,
          isLoading: false,
          error: err,
        });
      }
    };

    if (!searchQuery) {
      fetchReviewData();
    }
  }, [activeReviewTab, searchQuery]);

  const handleTabChange = (tabIdentifier) => {
    if (tabIdentifier !== activeReviewTab) {
      setActiveReviewTab(tabIdentifier);
    }
  };

  return (
    <div className="homepage__wrapper">
      <Header searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      <div className="homepage__body">
        <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
        <main className="homepage__main">
          <section className="homepage__content">
            {searchQuery ? (
              <section className="search-results-section">
                <h2>Search Results for "{searchQuery}"</h2>

                <div className="search-results-content">
                  {(() => {
                    if (isSkeletonLoading(searchResults.isLoading)) {
                      return <SearchResultsGridSkeleton count={8} />;
                    }

                    if (searchResults.error) {
                      return (
                        <p className="search-status-message error">
                          Error finding lists. Please try again.{" "}
                          {searchQuery.error}
                        </p>
                      );
                    }

                    if (searchResults.data.length === 0) {
                      return (
                        <p className="search-status-message empty">
                          No lists found matching your search.
                        </p>
                      );
                    }

                    return (
                      <div className="search-results-grid">
                        {searchResults.data.map((list) => (
                          <VocabularyListCard
                            key={list.id}
                            {...list}
                            buttonContent="Overview"
                          />
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </section>
            ) : (
              <>
                <CarouselVocabSection
                  title="REVIEW LISTS"
                  vocabLists={reviewLists.data}
                  isLoading={isSkeletonLoading(reviewLists.isLoading)}
                  error={reviewLists.error}
                  isReviewDisabled={activeReviewTab === "upcoming"}
                >
                  <ReviewTabs
                    activeTab={activeReviewTab}
                    onTabChange={handleTabChange}
                  />
                </CarouselVocabSection>

                <CarouselVocabSection
                  title="RECENTLY LISTS"
                  vocabLists={recentLists.data}
                  isLoading={isSkeletonLoading(recentLists.isLoading)}
                  error={recentLists.error}
                />

                <CarouselVocabSection
                  title="POPULAR LISTS"
                  vocabLists={popularLists.data}
                  isLoading={isSkeletonLoading(popularLists.isLoading)}
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
