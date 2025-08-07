import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { SKELETON_THEMES } from "../themes";

// Generic content skeleton
export function ContentSkeleton({ lines = 3, height = 16, theme = "default" }) {
  const colors = SKELETON_THEMES[theme];
  return (
    <SkeletonTheme
      baseColor={colors.baseColor}
      highlightColor={colors.highlightColor}
    >
      <Skeleton height={height} count={lines} style={{ marginBottom: "8px" }} />
    </SkeletonTheme>
  );
}
