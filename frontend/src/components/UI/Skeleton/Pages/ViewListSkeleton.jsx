import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { SKELETON_THEMES } from "../themes";

// Word List Skeleton for ViewList
export function WordListSkeleton({ count = 5, theme = "default" }) {
  const colors = SKELETON_THEMES[theme];
  return (
    <SkeletonTheme
      baseColor={colors.baseColor}
      highlightColor={colors.highlightColor}
    >
      <div className="view-list__word-list">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="view-list__word-box"
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
              backgroundColor: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <Skeleton
                height={20}
                width={30}
                style={{ marginRight: "16px" }}
              />
            </div>

            {/* First row of inputs */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <Skeleton height={36} />
                <Skeleton
                  height={12}
                  width="60%"
                  style={{ marginTop: "4px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Skeleton height={36} />
                <Skeleton
                  height={12}
                  width="50%"
                  style={{ marginTop: "4px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Skeleton height={36} />
                <Skeleton
                  height={12}
                  width="55%"
                  style={{ marginTop: "4px" }}
                />
              </div>
            </div>

            {/* Second row */}
            <div style={{ marginBottom: "16px" }}>
              <Skeleton height={36} />
              <Skeleton height={12} width="40%" style={{ marginTop: "4px" }} />
            </div>

            {/* Statistics */}
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "12px",
                borderRadius: "6px",
              }}
            >
              <Skeleton
                height={14}
                width="15%"
                style={{ marginBottom: "8px" }}
              />
              <div style={{ display: "flex", gap: "32px" }}>
                <div>
                  <Skeleton
                    height={12}
                    width={120}
                    style={{ marginBottom: "4px" }}
                  />
                  <Skeleton height={12} width={100} />
                </div>
                <div>
                  <Skeleton
                    height={12}
                    width={100}
                    style={{ marginBottom: "4px" }}
                  />
                  <Skeleton height={12} width={80} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}

// ViewList Page Skeleton
export function ViewListSkeleton({ theme = "default" }) {
  const colors = SKELETON_THEMES[theme];
  return (
    <SkeletonTheme
      baseColor={colors.baseColor}
      highlightColor={colors.highlightColor}
    >
      <main className="view-list__main">
        {/* Header Section */}
        <div className="view-list__header">
          <div
            className="view-list__title-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <Skeleton height={32} width="40%" />
            <div style={{ display: "flex", gap: "8px" }}>
              <Skeleton height={24} width={24} />
              <Skeleton height={24} width={24} />
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <Skeleton height={16} count={2} style={{ marginBottom: "8px" }} />
          </div>

          <Skeleton height={14} width="25%" style={{ marginBottom: "8px" }} />
          <Skeleton height={14} width="20%" />
        </div>

        {/* Privacy and Review Row */}
        <div
          className="view-list__privacy-row"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "20px 0",
          }}
        >
          <Skeleton height={18} width="15%" />
          <Skeleton height={36} width={120} />
        </div>

        {/* Description Section */}
        <section
          className="view-list__description"
          style={{ marginBottom: "24px" }}
        >
          <Skeleton height={24} width="15%" style={{ marginBottom: "12px" }} />
          <Skeleton height={16} count={2} />
        </section>

        {/* Search and Controls */}
        <section
          className="view-list__controls"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <Skeleton height={40} width="60%" />
          <Skeleton height={40} width="15%" />
        </section>

        {/* Words Section */}
        <section className="view-list__words">
          <Skeleton height={24} width="25%" style={{ marginBottom: "16px" }} />
          <WordListSkeleton count={5} theme={theme} />
        </section>
      </main>
    </SkeletonTheme>
  );
}
