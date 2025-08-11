import { lazy, Suspense } from "react";

const SkeletonDemo = lazy(() => import("../pages/Dev/SkeletonDemo"));

const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
      fontSize: "1rem",
      color: "#666",
    }}
  >
    Loading dev tools...
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const devRoutes = [
  { path: "/dev/skeleton", element: withSuspense(SkeletonDemo) },
];

export default devRoutes;
