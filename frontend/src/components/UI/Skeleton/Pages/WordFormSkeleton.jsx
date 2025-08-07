import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { SKELETON_THEMES } from "../themes";

// Word Form Skeleton for Edit/Create
export function WordFormSkeleton({ count = 3, theme = "default" }) {
  const colors = SKELETON_THEMES[theme];
  return (
    <SkeletonTheme
      baseColor={colors.baseColor}
      highlightColor={colors.highlightColor}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
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
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Skeleton height={16} width={16} />
              <Skeleton height={16} width={80} />
            </div>
            <Skeleton height={24} width={24} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <Skeleton
                height={16}
                width="40%"
                style={{ marginBottom: "8px" }}
              />
              <Skeleton height={36} />
            </div>
            <div>
              <Skeleton
                height={16}
                width="50%"
                style={{ marginBottom: "8px" }}
              />
              <Skeleton height={36} />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div>
              <Skeleton
                height={16}
                width="45%"
                style={{ marginBottom: "8px" }}
              />
              <Skeleton height={36} />
            </div>
            <div>
              <Skeleton
                height={16}
                width="35%"
                style={{ marginBottom: "8px" }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <Skeleton height={36} style={{ flex: 1 }} />
                <Skeleton height={36} width={80} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </SkeletonTheme>
  );
}
