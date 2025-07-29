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
    AssignmentDetail,
    Statistic,
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
        path: "/assign-exercise",
        element: <AssignExercise />
    },


    {
        path: "/classroom",
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
            {
                path: "assignment-page",
                element: <AssignmentPage />
            },
            {
                path: "assignment-detail",
                element: <AssignmentDetail />
            },
            {
                path: "statistics",
                element: <Statistic/>
            },
        ]
    },
];
export default classroomRoutes;