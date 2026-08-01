import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { Terminal, LogOut, User, Code, Calendar, LayoutDashboard, Shield } from "lucide-react";

const Navbar = () => {
  const { user, role, clearAuth } = useAuth();
  const navigate = useNavigate();

  const isLoggedIn = !!user;

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#c8c5d0]/40 px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 rounded-lg bg-[#070235] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-2xl">terminal</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-[#070235] tracking-tight leading-tight">LiveInterview</span>
            <span className="text-[10px] font-mono text-[#0058be] uppercase tracking-wider font-semibold">Precision Suite</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#f2f4f6] p-1.5 rounded-xl border border-[#e0e3e5]">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-lg text-xs font-medium font-sans transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-white text-[#070235] shadow-xs font-semibold"
                  : "text-[#47464f] hover:text-[#070235] hover:bg-white/50"
              }`
            }
          >
            Home
          </NavLink>

          {role !== "HR" && (
            <NavLink
              to="/practice"
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-lg text-xs font-medium font-sans transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-white text-[#070235] shadow-xs font-semibold"
                    : "text-[#47464f] hover:text-[#070235] hover:bg-white/50"
                }`
              }
            >
              <Code className="w-3.5 h-3.5" />
              Practice Studio
            </NavLink>
          )}

          {isLoggedIn && role === "HR" && (
            <>
              <NavLink
                to="/schedule/hr"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-lg text-xs font-medium font-sans transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-[#070235] shadow-xs font-semibold"
                      : "text-[#47464f] hover:text-[#070235] hover:bg-white/50"
                  }`
                }
              >
                <Calendar className="w-3.5 h-3.5" />
                Schedule
              </NavLink>

              <NavLink
                to="/dashboard/hr"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-lg text-xs font-medium font-sans transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-[#070235] shadow-xs font-semibold"
                      : "text-[#47464f] hover:text-[#070235] hover:bg-white/50"
                  }`
                }
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                HR Dashboard
              </NavLink>
            </>
          )}

          {isLoggedIn && role === "CANDIDATE" && (
            <>
              <NavLink
                to="/schedule/candidate"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-lg text-xs font-medium font-sans transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-[#070235] shadow-xs font-semibold"
                      : "text-[#47464f] hover:text-[#070235] hover:bg-white/50"
                  }`
                }
              >
                <Calendar className="w-3.5 h-3.5" />
                Interviews
              </NavLink>

              <NavLink
                to="/dashboard/candidate"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-lg text-xs font-medium font-sans transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-[#070235] shadow-xs font-semibold"
                      : "text-[#47464f] hover:text-[#070235] hover:bg-white/50"
                  }`
                }
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </NavLink>
            </>
          )}
        </nav>

        {/* User / Auth Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#f2f4f6] px-3 py-1.5 rounded-xl border border-[#e0e3e5]">
                <div className="w-7 h-7 rounded-full bg-[#1e1b4b] text-white flex items-center justify-center text-xs font-bold font-mono">
                  {user?.name ? user.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#191c1e] line-clamp-1">{user?.name || user?.email}</span>
                  <span className="text-[10px] font-mono text-[#0058be] font-bold tracking-wider">{role}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition-colors flex items-center gap-1 text-xs font-medium"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="px-5 py-2 rounded-lg bg-[#070235] hover:bg-[#1e1b4b] text-white text-xs font-semibold transition-all shadow-sm hover:shadow flex items-center gap-1.5"
            >
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;