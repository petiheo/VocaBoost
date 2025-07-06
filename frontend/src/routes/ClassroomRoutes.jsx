import { Children } from "react";
import{
    CreateClassroom,
    JoinClassroomStatus,
    JoinClassroomPage,
} from "../pages/Classroom"

const classroomRoutes = [
    {
        path: "/create-classroom",
        element: <CreateClassroom/>
    },
    {
        path: "/join-classroom-status",
        element: <JoinClassroomStatus/>
    },
    {
        path: "/join-classroom-page",
        element: <JoinClassroomPage/>,
    },
];
export default classroomRoutes;