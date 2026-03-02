import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./Components/ProtectedRoute";
import CandidateHistory from "./Components/Candidate/CandidateHistory";
import CandidateSchedule from "./Components/Candidate/CandidateSchedule";
import HRDashboard from "./Components/HR/HRDashboard";
import CandidateDashBoard from "./Components/Candidate/CandidateDashBoard";

const Home = lazy(() => import("./Components/Home"));
const Login = lazy(() => import("./Components/Login"));
const ErrorPage = lazy(() => import("./Components/ErrorPage"));
const AppLayout = lazy(() => import("./Components/Layout/AppLayout"));
const Questions = lazy(() => import("./Components/Questions"));
const InterviewRoom = lazy(() => import("./Components/InterviewRoom/InterviewRoom"));
const InterviewSchedule = lazy(() => import("./Components/HR/InterviewSchedule"));
const History = lazy(() => import("./Components/HR/History"));
const PreJoin = lazy(() => import("./Components/InterviewRoom/PreJoin"));
const JoinInterview = lazy(() => import("./Components/InterviewRoom/JoinInterview"));

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
      { path: "prejoin/:meetingLink", element: <PreJoin /> },
      { path: "join/:meetingLink", element: <JoinInterview /> },

      // HR
      {
        path: "schedule/hr",
        element: (
          <ProtectedRoute allowedRole="HR">
            <InterviewSchedule />
          </ProtectedRoute>
        ),
      },

      // Candidate
      {
        path: "schedule/candidate",
        element: (
          <ProtectedRoute allowedRole="CANDIDATE">
            <CandidateSchedule />
          </ProtectedRoute>
        ),
      },

      {
        path: "history/hr",
        element: (
          <ProtectedRoute allowedRole="HR">
            <History />
          </ProtectedRoute>
        ),
      },

      {
        path: "history/candidate",
        element: (
          <ProtectedRoute allowedRole="CANDIDATE">
            <CandidateHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/hr",
        element: (
          <ProtectedRoute allowedRole="HR">
          <HRDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/candidate",
        element: (
          <ProtectedRoute allowedRole="CANDIDATE">
            <CandidateDashBoard />
          </ProtectedRoute>
        ),
      },
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