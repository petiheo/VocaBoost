import { lazy, Suspense } from "react";

const AssignExercise = lazy(
  () => import("../pages/Classroom/TeacherManageClassroom/AssignExercise")
);
const AssignmentPage = lazy(
  () => import("../pages/Classroom/TeacherManageClassroom/AssignmentPage")
);
const CreateClassroom = lazy(
  () => import("../pages/Classroom/CreateClassroom")
);
const JoinClassroomPage = lazy(
  () => import("../pages/Classroom/JoinClassroomPage")
);
const JoinClassroomStatus = lazy(
  () => import("../pages/Classroom/JoinClassroomStatus")
);
const MyClassroom = lazy(() => import("../pages/Classroom/MyClassroom"));
const ViewClassroom = lazy(() => import("../pages/Classroom/ViewClassroom"));
const AddLearners = lazy(
  () => import("../pages/Classroom/TeacherManageClassroom/AddLearners")
);
const ApproveJoinClassroomRequest = lazy(
  () =>
    import(
      "../pages/Classroom/TeacherManageClassroom/ApproveJoinClassroomRequest"
    )
);
const ManageClassroomLayout = lazy(
  () =>
    import("../pages/Classroom/TeacherManageClassroom/ManangeClassroomLayout")
);
const LearnersList = lazy(
  () => import("../pages/Classroom/TeacherManageClassroom/LearnersList")
);
const PendingRequest = lazy(
  () => import("../pages/Classroom/TeacherManageClassroom/PendingRequest")
);
const AssignmentDetail = lazy(
  () => import("../pages/Classroom/TeacherManageClassroom/AssignmentDetail")
);
const Statistic = lazy(
  () => import("../pages/Classroom/TeacherManageClassroom/Statistics")
);
const JoiningVerify = lazy(() => import("../pages/Classroom/JoiningVerify"));

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
    Loading classroom...
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const classroomRoutes = [
  {
    path: "/create-classroom",
    element: withSuspense(CreateClassroom),
  },
  {
    path: "/join-classroom-status",
    element: withSuspense(JoinClassroomStatus),
  },
  {
    path: "/join-classroom-page",
    element: withSuspense(JoinClassroomPage),
  },
  {
    path: "/my-classroom",
    element: withSuspense(MyClassroom),
  },
  {
    path: "/view-classroom",
    element: withSuspense(ViewClassroom),
  },

  {
    path: "/assign-exercise",
    element: withSuspense(AssignExercise),
  },

  {
    path: "/classroom",
    element: withSuspense(ManageClassroomLayout),
    children: [
      {
        path: "approve-join-classroom-request",
        element: withSuspense(ApproveJoinClassroomRequest),
      },
      {
        path: "add-students",
        element: withSuspense(AddLearners),
      },
      {
        path: "learners-list",
        element: withSuspense(LearnersList),
      },
      {
        path: "pending-request",
        element: withSuspense(PendingRequest),
      },
      {
        path: "assignment-page",
        element: withSuspense(AssignmentPage),
      },
      {
        path: "assignment-detail",
        element: withSuspense(AssignmentDetail),
      },
      {
        path: "statistics",
        element: withSuspense(Statistic),
      },
    ],
  },

  {
    path: "/accept-invitation",
    element: withSuspense(JoiningVerify),
  },
];
export default classroomRoutes;
