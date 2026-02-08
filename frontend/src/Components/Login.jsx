// pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "./Axios.jsx";
import { jwtDecode } from "jwt-decode";
import "./Login.css";
import { tr } from "framer-motion/client";
import { useAuth } from "./AuthProvider.jsx";

const Login = () => {
  const navigate = useNavigate();
 const { login } = useAuth();
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();

  const toggleForm = () => {
    setIsSignIn(!isSignIn);
    setError("");
  };
  const handleLoginSuccess = () => {
    const redirectTo = searchParams.get('redirect');

    if (redirectTo) {
      navigate(redirectTo, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };
  const handleSubmitButton = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignIn) {
        const res = await api.post("/auth/login", { email, password });
        const { token: accessToken, refreshToken, user } = res.data;
        console.log(accessToken);
        login(accessToken);
        handleLoginSuccess();
      } else {
        const res = await fetch("http://localhost:8080/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username, password }),
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || "Registration failed");
        }

        setError("Please check your email to verify your account.");
        setIsSignIn(true);
        setPassword("");
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid email or password");
        } else if (err.response.status === 403) {
          setError("Please verify your email before logging in");
        } else {
          setError(err.response.data?.message || "Something went wrong");
        }
      } else {
        setError(err.message || "Network error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            {isSignIn ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="auth-subtitle">
            {isSignIn
              ? "Sign in to continue to LiveInterview"
              : "Join LiveInterview today"}
          </p>
        </div>

        <form onSubmit={handleSubmitButton} className="auth-form">
          {error && (
            <div className={`auth-message ${error.includes("email") ? "success" : "error"}`}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {!isSignIn && (
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="form-input"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : isSignIn ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="toggle-text">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}
            <button onClick={toggleForm} className="toggle-button">
              {isSignIn ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;