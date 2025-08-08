import { lazy, Suspense } from "react";
import ProtectedAdminRoute from "../components/Auth/ProtectedAdminRoute";

const AdminTeacherVerification = lazy(
  () => import("../pages/Admin/AdminTeacherVerification")
);
const TeacherRequest = lazy(() => import("../pages/Admin/TeacherRequest"));
const AdminUsers = lazy(() => import("../pages/Admin/AdminUsers"));
const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const AdminContent = lazy(() => import("../pages/Admin/AdminContent"));

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
    Loading admin panel...
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <ProtectedAdminRoute>
      <Component />
    </ProtectedAdminRoute>
  </Suspense>
);

const adminRoutes = [
    { path: "/admin-teacher-verification", element: withSuspense(AdminTeacherVerification) },
    { path: "/teacher-request", element: withSuspense(TeacherRequest) },
    { path: "/admin-users", element: withSuspense(AdminUsers) },
    { path: "/admin-dashboard", element: withSuspense(AdminDashboard) },
    { path: "/admin-content", element: withSuspense(AdminContent) },
]
export default adminRoutes;
