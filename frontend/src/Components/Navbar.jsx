import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { Terminal, LogOut, User, Code, Calendar, LayoutDashboard, Menu, X, CheckSquare } from "lucide-react";

const Navbar = () => {
  const { user, role, clearAuth, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = isAuthenticated;

  const handleLogout = () => {
    clearAuth();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#c8c5d0]/40 px-4 md:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Brand Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => {
            setMobileMenuOpen(false);
            navigate("/");
          }}
        >
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-[#070235] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-xl md:text-2xl">terminal</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base md:text-lg text-[#070235] tracking-tight leading-tight">LiveInterview</span>
            <span className="text-[9px] md:text-[10px] font-mono text-[#0058be] uppercase tracking-wider font-semibold">Precision Suite</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#f2f4f6] p-1.5 rounded-xl border border-[#e0e3e5]">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-lg text-xs font-medium font-sans transition-all flex items-center gap-1.5 ${isActive
                ? "bg-white text-[#070235] shadow-xs font-semibold"
                : "text-[#47464f] hover:text-[#070235] hover:bg-white/50"
              }`
            }
          >
            Home
          </NavLink>

          {/* {role !== "HR" && (
            <NavLink
              to="/practice"
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-lg text-xs font-medium font-sans transition-all flex items-center gap-1.5 ${isActive
                  ? "bg-white text-[#070235] shadow-xs font-semibold"
                  : "text-[#47464f] hover:text-[#070235] hover:bg-white/50"
                }`
              }
            >
              <Code className="w-3.5 h-3.5" />
              Practice Studio
            </NavLink>
          )} */}

          <NavLink
            to="/dsa-tracker"
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-lg text-xs font-medium font-sans transition-all flex items-center gap-1.5 ${isActive
                ? "bg-white text-[#070235] shadow-xs font-semibold"
                : "text-[#47464f] hover:text-[#070235] hover:bg-white/50"
              }`
            }
          >
            <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
            DSA Tracker
          </NavLink>

          {isLoggedIn && role === "ADMIN" && (
            <>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-lg text-xs font-medium font-sans transition-all flex items-center gap-1.5 ${isActive
                    ? "bg-white text-[#070235] shadow-xs font-semibold"
                    : "text-[#47464f] hover:text-[#070235] hover:bg-white/50"
                  }`
                }
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#0058be]" />
                Admin Console
              </NavLink>

              <NavLink
                to="/admin/questions"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-lg text-xs font-medium font-sans transition-all flex items-center gap-1.5 ${isActive
                    ? "bg-white text-[#070235] shadow-xs font-semibold"
                    : "text-[#47464f] hover:text-[#070235] hover:bg-white/50"
                  }`
                }
              >
                <Code className="w-3.5 h-3.5 text-[#0058be]" />
                Question Bank
              </NavLink>
            </>
          )}

          {isLoggedIn && role === "HR" && (
            <>
              <NavLink
                to="/schedule/hr"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-lg text-xs font-medium font-sans transition-all flex items-center gap-1.5 ${isActive
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
                  `px-4 py-1.5 rounded-lg text-xs font-medium font-sans transition-all flex items-center gap-1.5 ${isActive
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
                  `px-4 py-1.5 rounded-lg text-xs font-medium font-sans transition-all flex items-center gap-1.5 ${isActive
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
                  `px-4 py-1.5 rounded-lg text-xs font-medium font-sans transition-all flex items-center gap-1.5 ${isActive
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

        {/* User / Auth Actions & Mobile Hamburger */}
        <div className="flex items-center gap-2 md:gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-2 bg-[#f2f4f6] px-2.5 py-1 md:px-3 md:py-1.5 rounded-xl border border-[#e0e3e5]">
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#1e1b4b] text-white flex items-center justify-center text-xs font-bold font-mono">
                  {user?.name ? user.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#191c1e] line-clamp-1 max-w-[100px] md:max-w-xs">{user?.name || user?.email}</span>
                  <span className="text-[9px] md:text-[10px] font-mono text-[#0058be] font-bold tracking-wider">{role}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 md:p-2 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="px-3.5 py-1.5 md:px-5 md:py-2 rounded-lg bg-[#070235] hover:bg-[#1e1b4b] text-white text-xs font-semibold transition-all shadow-sm hover:shadow flex items-center gap-1.5"
            >
              Sign In
            </NavLink>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#070235] hover:bg-slate-100 focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#e0e3e5] mt-3 pt-3 pb-4 px-2 space-y-2 flex flex-col font-sans text-xs">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg font-medium flex items-center gap-2 ${isActive ? "bg-[#070235] text-white font-semibold" : "text-[#47464f] hover:bg-slate-100"
              }`
            }
          >
            Home
          </NavLink>

          {/* {role !== "HR" && (
            <NavLink
              to="/practice"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  isActive ? "bg-[#070235] text-white font-semibold" : "text-[#47464f] hover:bg-slate-100"
                }`
              }
            >
              <Code className="w-4 h-4" />
              Practice Studio
            </NavLink>
          )} */}

          <NavLink
            to="/dsa-tracker"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg font-medium flex items-center gap-2 ${isActive ? "bg-[#070235] text-white font-semibold" : "text-[#47464f] hover:bg-slate-100"
              }`
            }
          >
            <CheckSquare className="w-4 h-4 text-indigo-500" />
            DSA Tracker
          </NavLink>

          {isLoggedIn && role === "ADMIN" && (
            <>
              <NavLink
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg font-medium flex items-center gap-2 ${isActive ? "bg-[#070235] text-white font-semibold" : "text-[#47464f] hover:bg-slate-100"
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4 text-[#0058be]" />
                Admin Console
              </NavLink>

              <NavLink
                to="/admin/questions"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg font-medium flex items-center gap-2 ${isActive ? "bg-[#070235] text-white font-semibold" : "text-[#47464f] hover:bg-slate-100"
                  }`
                }
              >
                <Code className="w-4 h-4 text-[#0058be]" />
                Question Bank
              </NavLink>
            </>
          )}

          {isLoggedIn && role === "HR" && (
            <>
              <NavLink
                to="/schedule/hr"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg font-medium flex items-center gap-2 ${isActive ? "bg-[#070235] text-white font-semibold" : "text-[#47464f] hover:bg-slate-100"
                  }`
                }
              >
                <Calendar className="w-4 h-4" />
                Schedule
              </NavLink>

              <NavLink
                to="/dashboard/hr"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg font-medium flex items-center gap-2 ${isActive ? "bg-[#070235] text-white font-semibold" : "text-[#47464f] hover:bg-slate-100"
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                HR Dashboard
              </NavLink>
            </>
          )}

          {isLoggedIn && role === "CANDIDATE" && (
            <>
              <NavLink
                to="/schedule/candidate"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg font-medium flex items-center gap-2 ${isActive ? "bg-[#070235] text-white font-semibold" : "text-[#47464f] hover:bg-slate-100"
                  }`
                }
              >
                <Calendar className="w-4 h-4" />
                Interviews
              </NavLink>

              <NavLink
                to="/dashboard/candidate"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg font-medium flex items-center gap-2 ${isActive ? "bg-[#070235] text-white font-semibold" : "text-[#47464f] hover:bg-slate-100"
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;