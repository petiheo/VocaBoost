import { Children } from "react";

import {
    CreateList,
    Dashboard,
    EditList,
    ViewList,
    OverviewList
} from "../pages/Vocabulary";


const vocabularyRoutes = [
  {
    path: "/vocabulary/create",
    element: <CreateList />
  },
  {
    path: "/vocabulary",
    element: <Dashboard />
  },
];

export default vocabularyRoutes;