import { lazy, Suspense } from "react";

// Keep critical auth pages eager-loaded for better UX
import MainPage from "../pages/Auth/MainPage";
import Signin from "../pages/Auth/Signin";
import SignUp from "../pages/Auth/SignUp";

// Lazy load less frequently accessed auth pages
const AuthSuccess = lazy(() => import("../pages/Auth/AuthSuccess"));
const AuthVerify = lazy(() => import("../pages/Auth/AuthVerify"));
const CheckYourMail = lazy(() => import("../pages/Auth/CheckYourMail"));
const CreateList = lazy(() => import("../pages/Auth/CreateList"));
const Fail = lazy(() => import("../pages/Auth/Fail"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const HomePage = lazy(() => import("../pages/Auth/HomePage"));
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword"));
const SelectUserType = lazy(() => import("../pages/Auth/SelectUserType"));
const Successfully = lazy(() => import("../pages/Auth/Successfully"));
const TeacherVerification = lazy(
  () => import("../pages/Auth/TeacherVerification")
);

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
    Loading...
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const authRoutes = [
  { path: "/", element: <MainPage /> }, // Keep eager loaded - landing page
  { path: "/auth/success", element: withSuspense(AuthSuccess) },
  { path: "/verify-email", element: withSuspense(AuthVerify) },
  { path: "checkYourMail", element: withSuspense(CheckYourMail) },
  { path: "createlist", element: withSuspense(CreateList) },
  { path: "fail", element: withSuspense(Fail) },
  { path: "forgot-password", element: withSuspense(ForgotPassword) },
  { path: "homepage", element: withSuspense(HomePage) },
  { path: "mainpage", element: <MainPage /> }, // Keep eager loaded
  { path: "reset-password", element: withSuspense(ResetPassword) },
  { path: "select-user-type", element: withSuspense(SelectUserType) },
  { path: "signin", element: <Signin /> }, // Keep eager loaded - primary auth
  { path: "signup", element: <SignUp /> }, // Keep eager loaded - primary auth
  { path: "successfully", element: withSuspense(Successfully) },
  { path: "teacher-verification", element: withSuspense(TeacherVerification) },
];

export default authRoutes;
