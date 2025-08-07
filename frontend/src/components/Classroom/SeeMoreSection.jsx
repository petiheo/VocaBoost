import { useState } from "react";
import PropTypes from "prop-types";
import { SeeMore } from "../../assets/Classroom";

const SeeMoreSection = ({
  items = [],
  renderItem,
  initialCount,
  step,
  wrapperClassName = "",
  itemWrapperTag: Tag = "div",
  className: _className = "see-more-section", // tránh lỗi no-unused-vars
}) => {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + step);
  };

  const hasMore = visibleCount < items.length;

  return (
    <div className="see-more-section">
      <Tag className={wrapperClassName}>
        {items
          .slice(0, visibleCount)
          .map((item, index) => renderItem(item, index))}
      </Tag>

      {hasMore && (
        <div className="see-more">
          <button onClick={handleSeeMore}>
            See more
            <img src={SeeMore} alt="see-more" />
          </button>
        </div>
      )}
    </div>
  );
};

SeeMoreSection.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  initialCount: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  wrapperClassName: PropTypes.string,
  itemWrapperTag: PropTypes.elementType,
  className: PropTypes.string,
};

export default SeeMoreSection;
