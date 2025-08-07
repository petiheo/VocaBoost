import { lazy, Suspense } from "react";

const AdminTeacherVerification = lazy(
  () => import("../pages/Admin/AdminTeacherVerification")
);
const TeacherRequest = lazy(() => import("../pages/Admin/TeacherRequest"));
const AdminGeneral = lazy(() => import("../pages/Admin/AdminGeneral"));

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
    <Component />
  </Suspense>
);

const adminRoutes = [
  {
    path: "/admin-teacher-verification",
    element: withSuspense(AdminTeacherVerification),
  },
  { path: "/teacher-request", element: withSuspense(TeacherRequest) },
  { path: "/admin-general", element: withSuspense(AdminGeneral) },
];

export default adminRoutes;
