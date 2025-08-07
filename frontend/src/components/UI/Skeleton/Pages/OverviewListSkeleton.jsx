import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// OverviewList Page Skeleton (SCSS-based)
export function OverviewListSkeleton() {
  return (
    <SkeletonTheme baseColor="#fff6e9" highlightColor="#ffe8d1">
      <main className="overview-list__main">
        {/* Header Section */}
        <div className="overview-list__header">
          <Skeleton
            height={48}
            width="45%"
            className="overview-list__title"
            style={{ marginBottom: "1rem" }}
          />

          {/* Tags */}
          <div
            className="overview-list__tags"
            style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
          >
            <Skeleton
              height={32}
              width={80}
              style={{ borderRadius: "999px" }}
            />
            <Skeleton
              height={32}
              width={100}
              style={{ borderRadius: "999px" }}
            />
            <Skeleton
              height={32}
              width={90}
              style={{ borderRadius: "999px" }}
            />
          </div>

          <Skeleton
            height={16}
            width="25%"
            className="overview-list__creator"
            style={{ marginLeft: "0.5rem" }}
          />
        </div>

        <div className="overview-list__line" />

        {/* Description Section */}
        <section
          className="overview-list__description"
          style={{ marginBottom: "3rem" }}
        >
          <Skeleton height={24} width="15%" style={{ marginBottom: "1rem" }} />
          <Skeleton height={16} count={3} style={{ marginBottom: "0.5rem" }} />
        </section>

        {/* Sample Section */}
        <section
          className="overview-list__sample"
          style={{ marginTop: "2rem", marginBottom: "3rem" }}
        >
          <Skeleton height={24} width="15%" style={{ marginBottom: "1rem" }} />

          {/* Sample Table */}
          <div
            className="sample-table"
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="sample-row"
                style={{
                  display: "flex",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                {/* Term cell */}
                <div
                  className="sample-cell sample-term"
                  style={{
                    backgroundColor: "#F9DDB2",
                    width: "25%",
                    padding: "0.75rem 1rem",
                    borderRight: "1px solid #D5962C",
                  }}
                >
                  <Skeleton height={16} />
                </div>

                {/* Phonetics cell */}
                <div
                  className="sample-cell sample-phonetics"
                  style={{
                    backgroundColor: "#F9DDB2",
                    width: "25%",
                    padding: "0.75rem 1rem",
                    borderRight: "1px solid #D5962C",
                  }}
                >
                  <Skeleton height={16} />
                </div>

                {/* Definition cell */}
                <div
                  className="sample-cell sample-definition"
                  style={{
                    backgroundColor: "#fff1df",
                    width: "50%",
                    padding: "0.75rem 1rem",
                  }}
                >
                  <Skeleton height={16} />
                </div>
              </div>
            ))}
          </div>

          {/* View Button */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "1.5rem",
            }}
          >
            <Skeleton
              height={44}
              width={180}
              style={{ borderRadius: "999px" }}
            />
          </div>
        </section>

        {/* Statistics Section */}
        <section
          className="overview-list__statistic"
          style={{ marginBottom: "3rem" }}
        >
          <Skeleton height={24} width="15%" style={{ marginBottom: "1rem" }} />

          {/* Stat Box */}
          <div
            className="overview-list__stat-box"
            style={{
              backgroundColor: "#fff6e9",
              padding: "1.5rem",
              borderRadius: "8px",
            }}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="overview-list__stat-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: index < 3 ? "1rem" : 0,
                }}
              >
                <Skeleton circle height={20} width={20} />
                <Skeleton height={18} width="60%" />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <Skeleton
              height={44}
              width={120}
              style={{ borderRadius: "999px" }}
            />
            <Skeleton
              height={44}
              width={150}
              style={{ borderRadius: "999px" }}
            />
          </div>
        </section>
      </main>
    </SkeletonTheme>
  );
}
