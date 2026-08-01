import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import api from "./Axios.jsx";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("accessToken"));
  
  const [role, setRole] = useState(() => {
    const savedToken = localStorage.getItem("accessToken");
    if (savedToken && savedToken.split(".").length === 3) {
      try {
        const decoded = jwtDecode(savedToken);
        return decoded.role || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  /* ---------------- HELPERS ---------------- */

  const clearAuth = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");
    localStorage.setItem("isLoggedIn", "false");
    setToken(null);
    setUser(null);
    setRole(null);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    window.location.href = "/login";
  }, [clearAuth]);

  const login = useCallback((accessToken) => {
    if (!accessToken || typeof accessToken !== "string") return;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("isLoggedIn", "true");
    setToken(accessToken);

    try {
      const decoded = jwtDecode(accessToken);
      setRole(decoded.role || null);
    } catch (err) {
      console.error("Failed to decode token on login:", err);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get("/api/userdetail/me");
      setUser(res.data);
      localStorage.setItem("currentUser", JSON.stringify(res.data));
    } catch (err) {
      console.error("Error fetching current user details:", err);
    }
  }, [token]);

  /* ---------------- TOKEN VALIDATION EFFECT ---------------- */
  useEffect(() => {
    if (!token) {
      setRole(null);
      setUser(null);
      return;
    }

    if (token.split(".").length !== 3) {
      clearAuth();
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        clearAuth();
        return;
      }
      setRole(decoded.role || null);
    } catch (err) {
      console.error("Invalid JWT:", err);
      clearAuth();
    }
  }, [token, clearAuth]);

  useEffect(() => {
    if (token && role) {
      fetchUser();
    }
  }, [token, role, fetchUser]);

  const value = {
    token,
    user,
    role,
    loading,
    login,
    fetchUser,
    logout,
    clearAuth,
    isAdmin: role === "ADMIN",
    isHR: role === "HR",
    isCandidate: role === "CANDIDATE",
    isAuthenticated: !!token && !!role,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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
