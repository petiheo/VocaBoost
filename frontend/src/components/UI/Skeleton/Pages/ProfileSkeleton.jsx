import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { SKELETON_THEMES } from "../themes";

// Profile Page Skeleton
export function ProfileSkeleton({ theme = "default" }) {
  const colors = SKELETON_THEMES[theme];
  return (
    <SkeletonTheme
      baseColor={colors.baseColor}
      highlightColor={colors.highlightColor}
    >
      <form className="profile__content">
        <Skeleton height={32} width="20%" style={{ marginBottom: "32px" }} />

        {/* Avatar Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "32px",
            justifyContent: "center",
          }}
        >
          <Skeleton circle height={200} width={200} />
        </div>

        {/* Form Fields */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} style={{ marginBottom: "24px" }}>
            <Skeleton height={16} width="25%" style={{ marginBottom: "8px" }} />
            <Skeleton height={40} />
          </div>
        ))}

        {/* Teacher Verification Section */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "24px",
            border: "1px solid #e0e0e0",
          }}
        >
          <Skeleton height={18} width="30%" style={{ marginBottom: "12px" }} />
          <Skeleton height={14} count={2} style={{ marginBottom: "16px" }} />
          <Skeleton height={36} width={150} />
        </div>

        {/* Action Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            borderRadius: "8px",
          }}
        >
          <Skeleton height={44} width={120} />
        </div>
      </form>
    </SkeletonTheme>
  );
}
