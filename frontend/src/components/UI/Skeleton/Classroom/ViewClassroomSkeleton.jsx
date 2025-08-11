import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ViewClassroomCardSkeleton } from "../Cards";

// ViewClassroom Page Skeleton (SCSS-based)
export function ViewClassroomSkeleton() {
  return (
    <SkeletonTheme baseColor="#FFFCF7" highlightColor="#F7F1E3">
      <div className="manage-classroom-learner__content">
        {/* Classroom Title Skeleton */}
        <div style={{ marginBottom: "24px" }}>
          <Skeleton height={36} width="40%" style={{ marginBottom: "8px" }} />
          <Skeleton height={16} width="25%" />
        </div>

        {/* Menu Tabs Skeleton */}
        <div className="sub-menu-tabs" style={{ marginTop: "2em" }}>
          <div
            className="tab-list"
            style={{
              display: "flex",
              justifyContent: "space-around",
              borderBottom: "2px solid #ddd",
              paddingBottom: "4px",
              fontFamily: "Lalezar, sans-serif",
            }}
          >
            <Skeleton
              height={50}
              width="20%"
              style={{
                borderRadius: "6px 6px 0 0",
                backgroundColor: "#fcf3d6",
              }}
            />
            <Skeleton
              height={50}
              width="20%"
              style={{
                borderRadius: "6px 6px 0 0",
                backgroundColor: "#FFFCF7",
              }}
            />
            <Skeleton
              height={50}
              width="20%"
              style={{
                borderRadius: "6px 6px 0 0",
                backgroundColor: "#FFFCF7",
              }}
            />
          </div>
        </div>

        {/* Top Bar Skeleton */}
        <div
          className="list-topbar"
          style={{
            display: "flex",
            alignItems: "center",
            margin: "1em",
            justifyContent: "end",
            gap: "2em",
          }}
        >
          <Skeleton height={16} width={120} style={{ color: "#777" }} />
          <Skeleton height={16} width={80} />
        </div>

        {/* Assignment Cards Grid Skeleton */}
        <div
          className="list-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "28px",
          }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <ViewClassroomCardSkeleton key={index} />
          ))}
        </div>

        {/* See More Button */}
        <div
          className="see-more"
          style={{
            marginTop: "2rem",
            textAlign: "center",
          }}
        >
          <Skeleton height={16} width={100} style={{ color: "#555" }} />
        </div>
      </div>
    </SkeletonTheme>
  );
}
