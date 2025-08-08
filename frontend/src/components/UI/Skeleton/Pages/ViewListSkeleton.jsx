import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { SKELETON_THEMES } from "../themes";

// Word List Skeleton for ViewList - Matching actual SCSS styles
export function WordListSkeleton({ count = 5, theme = "default" }) {
  const colors = SKELETON_THEMES[theme];
  return (
    <SkeletonTheme
      baseColor={colors.baseColor}
      highlightColor={colors.highlightColor}
    >
      <div className="view-list__word-list">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="view-list__word-box">
            {/* Index number */}
            <div className="view-list__word-box--index">
              <Skeleton height={24} width={30} />
            </div>
            
            {/* Divider */}
            <hr className="view-list__word-box--divider" />

            {/* First row with 3 fields */}
            <div className="view-list__word-box--row">
              {/* Terminology field */}
              <div className="view-list__word-box--field">
                <Skeleton 
                  height={44} 
                  style={{ 
                    borderRadius: "8px",
                    backgroundColor: "#f9ddb3"
                  }} 
                />
                <small className="input-note">
                  <Skeleton height={14} width={90} />
                </small>
              </div>

              {/* Definition field */}
              <div className="view-list__word-box--field">
                <Skeleton 
                  height={44} 
                  style={{ 
                    borderRadius: "8px",
                    backgroundColor: "#f9ddb3"
                  }} 
                />
                <small className="input-note">
                  <Skeleton height={14} width={70} />
                </small>
              </div>

              {/* Phonetics field */}
              <div className="view-list__word-box--field">
                <Skeleton 
                  height={44} 
                  style={{ 
                    borderRadius: "8px",
                    backgroundColor: "#f9ddb3"
                  }} 
                />
                <small className="input-note">
                  <Skeleton height={14} width={75} />
                </small>
              </div>
            </div>

            {/* Second row - Example field */}
            <div className="view-list__word-box--row">
              <div className="view-list__word-box--field">
                <Skeleton 
                  height={44} 
                  style={{ 
                    borderRadius: "8px",
                    backgroundColor: "#f9ddb3"
                  }} 
                />
                <small className="input-note">
                  <Skeleton height={14} width={60} />
                </small>
              </div>
            </div>

            {/* Statistics section */}
            <div className="view-list__word-box--stat">
              <div className="stat-label" style={{ backgroundColor: "#f5ebd8" }}>
                <Skeleton height={16} width={70} />
              </div>
              <div className="stat-detail">
                <div className="column">
                  <div>
                    <Skeleton height={14} width={120} style={{ marginBottom: "8px" }} />
                  </div>
                  <div>
                    <Skeleton height={14} width={100} />
                  </div>
                </div>
                <div className="column">
                  <div>
                    <Skeleton height={14} width={110} style={{ marginBottom: "8px" }} />
                  </div>
                  <div>
                    <Skeleton height={14} width={95} />
                  </div>
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
