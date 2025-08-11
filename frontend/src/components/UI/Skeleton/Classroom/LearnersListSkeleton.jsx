import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// LearnersList Page Skeleton (SCSS-based)
export function LearnersListSkeleton() {
  return (
    <SkeletonTheme baseColor="#FFFCF7" highlightColor="#F7F1E3">
      <div
        className="student-list-page"
        style={{ fontFamily: "Inria Sans, sans-serif" }}
      >
        {/* Classroom Title */}
        <div style={{ marginBottom: "24px" }}>
          <Skeleton height={36} width="40%" style={{ marginBottom: "8px" }} />
          <Skeleton height={16} width="25%" />
        </div>

        {/* Menu Tabs */}
        <div className="sub-menu-tabs" style={{ marginBottom: "24px" }}>
          <div className="tab-list" style={{ display: "flex", gap: "16px" }}>
            <Skeleton height={36} width={100} style={{ borderRadius: "6px" }} />
            <Skeleton height={36} width={120} style={{ borderRadius: "6px" }} />
            <Skeleton height={36} width={110} style={{ borderRadius: "6px" }} />
          </div>
        </div>

        {/* Student Actions */}
        <div
          className="student-actions"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "16px",
            margin: "20px 0",
          }}
        >
          <Skeleton height={42} width={150} style={{ borderRadius: "6px" }} />
          <div
            style={{
              position: "relative",
              display: "grid",
              alignItems: "center",
              gridTemplateColumns: "50% 50%",
              width: "100%",
            }}
          >
            <Skeleton height={40} width="90%" />
            <div style={{ justifySelf: "end" }}>
              <Skeleton height={40} width={100} />
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="student-list" style={{ marginTop: "10px" }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="student-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "0.5px solid #000000",
              }}
            >
              <Skeleton height={16} width="50%" />
              <Skeleton
                height={26}
                width={60}
                style={{
                  borderRadius: "6px",
                  backgroundColor: "#f3eee4",
                }}
              />
            </div>
          ))}
        </div>

        {/* See More Button */}
        <div
          className="see-more"
          style={{
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          <Skeleton
            height={32}
            width={120}
            style={{
              borderRadius: "20px",
              backgroundColor: "#f5f0e3",
            }}
          />
        </div>
      </div>
    </SkeletonTheme>
  );
}
