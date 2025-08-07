import { lazy, Suspense } from "react";

const Profile = lazy(() => import("../pages/User/Profile"));

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '200px',
    fontSize: '1rem',
    color: '#666'
  }}>
    Loading user profile...
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const userRoutes = [
    { path: "profile", element: withSuspense(Profile) },
];

export default userRoutes;