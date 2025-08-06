import {
    AuthSuccess,
    AuthVerify,
    CheckYourMail,
    CreateList,
    Fail,
    ForgotPassword,
    HomePage,
    ResetPassword,
    SelectUserType,
    Signin,
    SignUp,
    Successfully,
    TeacherVerification,
    MainPage
} from "../pages/Auth";

const authRoutes = [
    { path: "/", element: <MainPage /> },
    { path: "/auth/success", element: <AuthSuccess /> },
    { path: "/verify-email", element: <AuthVerify /> },
    { path: "checkYourMail", element: <CheckYourMail /> },
    { path: "createlist", element: <CreateList /> },
    { path: "fail", element: <Fail /> },
    { path: "forgot-password", element: <ForgotPassword /> },
    { path: "homepage", element: <HomePage /> },
    { path: "mainpage", element: <MainPage /> },
    { path: "reset-password", element: <ResetPassword /> },
    { path: "select-user-type", element: <SelectUserType /> },
    { path: "signin", element: <Signin /> },
    { path: "signup", element: <SignUp /> },
    { path: "successfully", element: <Successfully /> },
    { path: "teacher-verification", element: <TeacherVerification /> },
];

export default authRoutes;