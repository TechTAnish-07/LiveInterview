import { createContext, useContext, useEffect, useState } from "react";
import api from "../Axios.jsx";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) {
      setRole(null);
      setLoading(false);
      return;
    }

    if (token.split(".").length !== 3) {
      localStorage.removeItem("accessToken");
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setRole(decoded?.role);
    } catch (err) {
      console.error("Invalid JWT", err);
      localStorage.removeItem("accessToken");
      setRole(null);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/user-detail/me");
      setUser({ ...res.data });
      localStorage.setItem("currentUser", JSON.stringify(res.data));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && role) {
      fetchUser();
    }
  }, [token, role]);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");
    setUser(null);
    setRole(null);
    setLoading(false);
    window.location.href = "/signin";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        fetchUser,
        logout,
        isAdmin: role === "ROLE_ADMIN",
        isUser: role === "ROLE_USER",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
