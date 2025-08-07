import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { SKELETON_THEMES } from "../themes";

// Avatar skeleton
export function AvatarSkeleton({ size = 32, theme = "default" }) {
  const colors = SKELETON_THEMES[theme];
  return (
    <SkeletonTheme
      baseColor={colors.baseColor}
      highlightColor={colors.highlightColor}
    >
      <Skeleton circle height={size} width={size} />
    </SkeletonTheme>
  );
}
