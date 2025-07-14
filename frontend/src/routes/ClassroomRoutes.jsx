import {
    AssignExercise,
    AssignmentPage,
    CreateClassroom,
    JoinClassroomPage,
    JoinClassroomStatus,
    MyClassroom,
    ViewClassroom,
    // Manage classroom
    AddLearners, ApproveJoinClassroomRequest, ManageClassroomLayout, LearnersList, PendingRequest,
} from "../pages/Classroom"

const classroomRoutes = [
    {
        path: "/create-classroom",
        element: <CreateClassroom />
    },
    {
        path: "/join-classroom-status",
        element: <JoinClassroomStatus />
    },
    {
        path: "/join-classroom-page",
        element: <JoinClassroomPage />,
    },
    {
        path: "/my-classroom",
        element: <MyClassroom />
    },
    {
        path: "/view-classroom",
        element: <ViewClassroom />
    },
    {
        path: "/assignment-page",
        element: <AssignmentPage />
    },
    {
        path: "assign-exercise",
        element: <AssignExercise />
    },
    {
        path: "/learners",
        element: <ManageClassroomLayout />,
        children: [
            {
                path: "approve-join-classroom-request",
                element: <ApproveJoinClassroomRequest />
            },
            {
                path: "add-students",
                element: <AddLearners />
            },
            {
                path: "learners-list",
                element: <LearnersList />
            },
            {
                path: "pending-request",
                element: <PendingRequest />
            },

        ]
    },
];
export default classroomRoutes;