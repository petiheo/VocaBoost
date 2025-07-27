import { useState } from "react";

const SeeMoreSection = ({ items = [], renderItem, initialCount, step, wrapperClassName = "", itemWrapperTag: Tag = "div" }) => {
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
                    <button onClick={handleSeeMore}>See more ▼</button>
                </div>
            )}
        </div>
    );
};

export default SeeMoreSection;
