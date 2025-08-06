import { useState } from "react";
import { SeeMore } from "../../assets/Classroom";

const SeeMoreSection = ({ items = [], renderItem, initialCount, step, wrapperClassName = "", itemWrapperTag: Tag = "div", className = "see-more-section"}) => {
    const [visibleCount, setVisibleCount] = useState(initialCount);

    const handleSeeMore = () => {
        setVisibleCount((prev) => prev + step);
    };

    const hasMore = visibleCount < items.length;

    return (
        <div className="see-more-section">
            <Tag className={wrapperClassName}>
                {items.slice(0, visibleCount).map((item, index) => renderItem(item, index))}
            </Tag>

            {hasMore && (
                <div className="see-more">
                    <button onClick={handleSeeMore}>See more 
                        <img src={SeeMore} alt="see-more"/>
                    </button>
                </div>
            )}
        </div>
    );
};

export default SeeMoreSection;
