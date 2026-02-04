import { lazy, Suspense } from "react";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const Home = lazy(() => import("./Components/Home"));
const Login = lazy(() => import("./Components/Login"));
const ErrorPage = lazy(() => import("./Components/ErrorPage"));
const AppLayout = lazy(() => import("./Components/Layout/AppLayout"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
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
