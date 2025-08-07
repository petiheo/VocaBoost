import { element } from "prop-types"
import { AdminTeacherVerification, TeacherRequest, AdminGeneral } from "../pages/Admin"

const adminRoutes = [
    { path: "/admin-teacher-verification", element: <AdminTeacherVerification /> },
    { path: "/teacher-request", element: <TeacherRequest /> },
    { path: "/admin-general", element: <AdminGeneral /> },

]
export default adminRoutes