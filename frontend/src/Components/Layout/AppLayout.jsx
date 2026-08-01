import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";

const AppLayout = () => {
  const location = useLocation();

  const isInterviewRoom = location.pathname.startsWith("/interview/");
  const isPrejoinRoom = location.pathname.startsWith("/prejoin/");
  const isLogin = location.pathname === "/login";

  const hideHeaderFooter = isInterviewRoom || isPrejoinRoom || isLogin;

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fb] text-[#191c1e] font-sans antialiased">
      {!hideHeaderFooter && <Navbar />}

      <main className="flex-1">
        <Outlet />
      </main>

      {!hideHeaderFooter && <Footer />}
    </div>
  );
};

export default AppLayout;
