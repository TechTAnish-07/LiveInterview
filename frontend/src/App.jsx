import { lazy, Suspense } from "react";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const Home = lazy(() => import("./Components/Home"));
const Login = lazy(() => import("./Components/Login"));
const ErrorPage = lazy(() => import("./Components/ErrorPage"));
const AppLayout = lazy(() => import("./Components/Layout/AppLayout"));
const Questions = lazy(() => import("./Components/Questions"));
const InterviewRoom = lazy(() => import("./Components/InterviewRoom/InterviewRoom.jsx"));

import TestEditor from "./Components/TestEditor.jsx";
const PreJoin = lazy(() => import("./Components/InterviewRoom/PreJoin.jsx"));
const JoinInterview = lazy(() => import("./Components/InterviewRoom/JoinInterview.jsx"));
const InterviewSchedule = lazy(() => import("./Components/HR/InterviewSchedule.jsx"));
const History = lazy(() => import("./Components/HR/History.jsx"));
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "questions", element: <Questions /> },
      { path: "interview/:id", element: <InterviewRoom /> },
      { path: "codeeditor", element: <TestEditor /> },
      { path: "interviewschedule", element: <InterviewSchedule /> },
      { path: "/join/:meetingLink", element: <JoinInterview/> },
      { path: "history/:role", element: <History /> },
      { path: "prejoin/:meetingLink", element: <PreJoin />}, 
    ],
  },
]);

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
