import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { SKELETON_THEMES } from "../themes";
import { VocabularyListCardSkeleton } from "../Cards";

// HomePage Carousel Section Skeleton
export function CarouselSectionSkeleton({
  title,
  showTabs = false,
  theme = "default",
}) {
  const colors = SKELETON_THEMES[theme];
  return (
    <SkeletonTheme
      baseColor={colors.baseColor}
      highlightColor={colors.highlightColor}
    >
      <section className="carousel-vocab-section">
        <div className="section-header">
          <h2 style={{ margin: "0 0 1rem 0" }}>
            <Skeleton height={40} width={title ? title.length * 15 : 200} />
          </h2>
          {showTabs && (
            <div
              className="review-tabs"
              style={{ display: "flex", gap: "1rem" }}
            >
              <Skeleton height={32} width={80} />
              <Skeleton height={32} width={100} />
            </div>
          )}
        </div>
        <div className="carousel-body">
          <div className="carousel-viewport">
            <div className="carousel-slider" style={{ display: "flex" }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="carousel-item"
                  style={{ padding: "0 14px" }}
                >
                  <VocabularyListCardSkeleton theme={theme} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SkeletonTheme>
  );
}
