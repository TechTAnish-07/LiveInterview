import { lazy, Suspense } from "react";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const Home = lazy(() => import("./Components/Home"));
const Login = lazy(() => import("./Components/Login"));
const ErrorPage = lazy(() => import("./Components/ErrorPage"));
const AppLayout = lazy(() => import("./Components/Layout/AppLayout"));
const Questions = lazy(() => import("./Components/Questions"));
const InterviewRoom = lazy(() => import("./Components/InterviewRoom/InterviewRoom.jsx"));
const CodingPanel = lazy(() => import("./Components/InterviewRoom/CodePanel.jsx"));
import TestEditor from "./Components/TestEditor.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "questions", element: <Questions /> },
      { path: "interview", element: <InterviewRoom /> },
      { path: "coding", element: <CodingPanel /> },
      { path: "codeeditor", element: <TestEditor /> },
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
