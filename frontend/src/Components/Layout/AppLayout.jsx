import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "./AppLayout.css";

const AppLayout = () => {
  const location = useLocation();

  // routes where layout should be hidden
  const authRoutes = ["/login", "/signup"];
  const hideLayout = authRoutes.includes(location.pathname);

  return (
    <div className="app-layout">
      {<Navbar />}

      <main className="main-content">
        <Outlet />
      </main>

      {<Footer />}
    </div>
  );
};

export default AppLayout;
