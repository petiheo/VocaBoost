import { useState } from 'react';
import VocabularyListCard from '../Classroom/VocabularyListCard'; 
import { LeftArrow, RightArrow } from '../../assets/User';
import { VocabularyListCardSkeleton } from '../UI/Skeleton';

export default function CarouselVocabSection({ title, children, vocabLists = [], isLoading, error, isReviewDisabled }) {
  const [startIndex, setStartIndex] = useState(0);

// Hiển thị 4 card mỗi lần
  const itemsPerPage = 4;
  const handlePrev = () => {
    setStartIndex((prev) => Math.max(prev - itemsPerPage, 0));
  };

  const handleNext = () => {
    // Chỉ cho phép next khi còn ít nhất 1 card chưa hiển thị ở trang tiếp theo
    if (startIndex + itemsPerPage < vocabLists.length) {
      setStartIndex((prev) => prev + itemsPerPage);
    }
  };

  const sliderStyle = {
    transform: `translateX(-${(startIndex / itemsPerPage) * 100}%)`,
  };

  const hasData = vocabLists && vocabLists.length > 0;

  return (
    <section className="carousel-vocab-section">
      <div className="section-header">
        <h2>{title}</h2>
        {children}
      </div>

      <div className="carousel-body">

        {isLoading ? (
          <div className="carousel-viewport">
            <div className="carousel-slider" style={{ display: 'flex' }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="carousel-item">
                  <VocabularyListCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <p className="error-message">Could not load this section.</p>
        ) : vocabLists.length > 0 ? (
          <>
            <button className="nav-arrow prev" onClick={handlePrev} disabled={startIndex === 0}>
                <img src={LeftArrow} alt="Previous" />
            </button>
            <div className="carousel-viewport">
                <div className="carousel-slider" style={sliderStyle}>
                    {vocabLists.map((list) => (
                      <div className="carousel-item" key={list.id}>
                          <VocabularyListCard
                            {...list}
                            buttonContent={title === 'REVIEW LISTS' ? 'Review' : 'Overview'}
                            isReviewDisabled={isReviewDisabled}
                          />
                      </div>
                    ))}
                </div>
            </div>
            <button className="nav-arrow next" onClick={handleNext} disabled={startIndex + itemsPerPage >= vocabLists.length}>
                <img src={RightArrow} alt="Next" />
            </button>
          </>
        ) : (
          <p className="no-data-message">No vocabulary lists available.</p>
        )}
      </div>
    </section>
  );
}