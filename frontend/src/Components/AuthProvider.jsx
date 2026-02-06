import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "./Axios.jsx";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("accessToken");

  /* ---------------- TOKEN VALIDATION ---------------- */
const login = (accessToken) => {
  if (!accessToken || typeof accessToken !== "string") return;

  localStorage.setItem("accessToken", accessToken);

  const decoded = jwtDecode(accessToken);
  setRole(decoded.role);
};


  useEffect(() => {
    if (!token) {
      clearAuth();
      return;
    }

    // basic JWT format check
    if (token.split(".").length !== 3) {
      clearAuth();
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // expiry check
      if (decoded.exp * 1000 < Date.now()) {
        clearAuth();
        return;
      }

      setRole(decoded.role);
    } catch (err) {
      console.error("Invalid JWT:", err);
      clearAuth();
    }
  }, [token]);

  /* ---------------- FETCH USER ---------------- */

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/userdetail/me");
      setUser(res.data);
      localStorage.setItem("currentUser", JSON.stringify(res.data));
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && role) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token, role]);

  /* ---------------- HELPERS ---------------- */

  const clearAuth = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");
    setUser(null);
    setRole(null);
    setLoading(false);
  };

  const logout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  const value = {
    user,
    role,
    loading,
    login,
    fetchUser,
    logout,

    isAdmin: role === "ROLE_ADMIN",
    isHR: role === "ROLE_HR",
    isCandidate: role === "ROLE_CANDIDATE",

    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
