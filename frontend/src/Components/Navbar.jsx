import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "./AuthProvider";

const Navbar = () => {
  const { user, role, clearAuth } = useAuth();
  const navigate = useNavigate();

  const isLoggedIn = !!user;

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo-section">
        <div className="logo" onClick={() => navigate("/")}>
          LI
        </div>
        <span className="brand-name" onClick={() => navigate("/")}>
          LiveInterview
        </span>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Home
          </NavLink>
        </li>

        {/* Practice visible to everyone except HR */}
        {role !== "HR" && (
          <li>
            <NavLink
              to="/questions"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Practice
            </NavLink>
          </li>
        )}

        {!isLoggedIn && (
          <li>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Login
            </NavLink>
          </li>
        )}

        {/* HR Routes */}
        {isLoggedIn && role === "HR" && (
          <>
            <li>
              <NavLink
                to="/schedule/hr"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Schedule
              </NavLink>
            </li>
        
            <li>
              <NavLink
                to="/dashboard/hr"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Dashboard
              </NavLink>
            </li>
          </>
        )}

        {/* Candidate Routes */}
        {isLoggedIn && role === "CANDIDATE" && (
          <>
            <li>
              <NavLink
                to="/dashboard/candidate"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Dashboard
              </NavLink>
            </li>
          </>
        )}

        {/* Admin */}
        {isLoggedIn && role === "ADMIN" && (
          <li>
            <NavLink
              to="/dashboard/admin"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Dashboard
            </NavLink>
          </li>
        )}
      </ul>

      {isLoggedIn && (
        <div className="nav-actions">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;