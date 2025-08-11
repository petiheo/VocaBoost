import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { SKELETON_THEMES } from "../themes";

// Button skeleton
export function ButtonSkeleton({
  width = 100,
  height = 32,
  theme = "default",
}) {
  const colors = SKELETON_THEMES[theme];
  return (
    <SkeletonTheme
      baseColor={colors.baseColor}
      highlightColor={colors.highlightColor}
    >
      <Skeleton height={height} width={width} style={{ borderRadius: "6px" }} />
    </SkeletonTheme>
  );
}
