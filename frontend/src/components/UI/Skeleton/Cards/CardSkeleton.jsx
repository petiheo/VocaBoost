import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { SKELETON_THEMES } from "../themes";

// Basic card skeleton for vocabulary/classroom lists
export function CardSkeleton({ count = 1, theme = "default" }) {
  const colors = SKELETON_THEMES[theme];
  return (
    <SkeletonTheme
      baseColor={colors.baseColor}
      highlightColor={colors.highlightColor}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="dashboard__list-card">
          <div className="dashboard__list-header">
            <Skeleton height={24} width="60%" />
            <Skeleton height={20} width={20} />
          </div>
          <Skeleton height={16} count={2} style={{ marginBottom: "8px" }} />
          <div className="dashboard__list-footer">
            <div className="dashboard__user">
              <Skeleton circle height={32} width={32} />
              <div>
                <Skeleton height={14} width={80} />
                <Skeleton height={12} width={60} />
              </div>
            </div>
            <Skeleton height={32} width={100} />
          </div>
        </div>
      ))}
    </SkeletonTheme>
  );
}
