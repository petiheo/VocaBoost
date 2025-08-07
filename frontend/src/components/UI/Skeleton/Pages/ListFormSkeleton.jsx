import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { SKELETON_THEMES } from "../themes";
import { WordFormSkeleton } from "./WordFormSkeleton";

// Edit/Create List Form Skeleton
export function ListFormSkeleton({ isEditMode = false, theme = "default" }) {
  const colors = SKELETON_THEMES[theme];
  return (
    <SkeletonTheme
      baseColor={colors.baseColor}
      highlightColor={colors.highlightColor}
    >
      <form className={`${isEditMode ? "edit-list" : "create-list"}__form`}>
        <Skeleton height={40} width="20%" style={{ marginBottom: "32px" }} />

        {/* Metadata Form Section */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ marginBottom: "20px" }}>
            <Skeleton height={16} width="10%" style={{ marginBottom: "8px" }} />
            <Skeleton height={40} />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <Skeleton height={16} width="15%" style={{ marginBottom: "8px" }} />
            <Skeleton height={80} />
          </div>

          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}>
              <Skeleton
                height={16}
                width="12%"
                style={{ marginBottom: "8px" }}
              />
              <Skeleton height={40} />
            </div>
            <div style={{ flex: 1 }}>
              <Skeleton
                height={16}
                width="10%"
                style={{ marginBottom: "8px" }}
              />
              <Skeleton height={40} />
            </div>
          </div>
        </div>

        {/* Words Section */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <Skeleton height={24} width="15%" />
            <Skeleton height={36} width={120} />
          </div>

          <WordFormSkeleton count={3} theme={theme} />
        </div>

        {/* Action Buttons */}
        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
        >
          <Skeleton height={40} width={80} />
          <Skeleton height={40} width={120} />
        </div>
      </form>
    </SkeletonTheme>
  );
}
