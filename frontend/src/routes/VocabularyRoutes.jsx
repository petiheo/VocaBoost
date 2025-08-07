import { lazy, Suspense } from "react";

const CreateList = lazy(() => import("../pages/Vocabulary/CreateList"));
const Dashboard = lazy(() => import("../pages/Vocabulary/Dashboard"));
const EditList = lazy(() => import("../pages/Vocabulary/EditList"));
const ViewList = lazy(() => import("../pages/Vocabulary/ViewList"));
const OverviewList = lazy(() => import("../pages/Vocabulary/OverviewList"));

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '200px',
    fontSize: '1rem',
    color: '#666'
  }}>
    Loading vocabulary...
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const vocabularyRoutes = [
  {
    path: "/vocabulary/create/:listId",
    element: withSuspense(CreateList)
  },
  {
    path: "/vocabulary/create/new",
    element: withSuspense(CreateList)
  },
  {
    path: "/vocabulary",
    element: withSuspense(Dashboard)
  },
  {
    path: "/vocabulary/edit/:listId",
    element: withSuspense(EditList)
  },
  {
    path: "/vocabulary/view/:listId",
    element: withSuspense(ViewList)
  },
  {
    path: "/vocabulary/overview/:listId",
    element: withSuspense(OverviewList)
  }
];

export default vocabularyRoutes;