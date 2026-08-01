import React, { useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import api from "./Axios.jsx";
import { useAuth } from "./AuthProvider.jsx";
import { Briefcase, User, Lock, Mail, UserCheck, ArrowRight, AlertCircle, CheckCircle2, Terminal } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const initialRole = location.state?.initialRole || "HR";
  
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const toggleForm = () => {
    setIsSignIn(!isSignIn);
    setError("");
    setSuccessMsg("");
  };

  const handleLoginSuccess = () => {
    const redirectTo = searchParams.get("redirect");
    if (redirectTo) {
      navigate(redirectTo, { replace: true });
    } else {
      navigate(role === "HR" ? "/dashboard/hr" : "/dashboard/candidate", { replace: true });
    }
  };

  const handleSubmitButton = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (isSignIn) {
        const res = await api.post("/auth/login", { email, password });
        const accessToken = res.data.token || res.data.accessToken;
        const loggedInRole = res.data.user?.role || role;
        
        login(accessToken);
        
        const redirectTo = searchParams.get("redirect");
        if (redirectTo) {
          navigate(redirectTo, { replace: true });
        } else {
          navigate(loggedInRole === "HR" ? "/dashboard/hr" : "/dashboard/candidate", { replace: true });
        }
      } else {
        const payload = {
          name: username,
          email,
          password,
          role,
        };
        await api.post("/auth/register", payload);
        setSuccessMsg("Registration successful! Please check your email inbox to verify your account.");
        setIsSignIn(true);
        setPassword("");
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid email or password");
        } else if (err.response.status === 403) {
          setError("Please verify your email before logging in.");
        } else {
          setError(err.response.data?.message || "Authentication failed.");
        }
      } else {
        setError(err.message || "Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-[#d8e2ff]">
      
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#c8c5d0_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none"></div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md bg-white border border-[#e0e3e5] shadow-xl rounded-2xl overflow-hidden transition-all">
        
        {/* Top Header Banner */}
        <div className="p-6 bg-[#070235] text-white flex items-center justify-between border-b border-[#1e1b4b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2170e4] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">terminal</span>
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight leading-tight">LiveInterview</h2>
              <span className="text-[10px] font-mono text-[#8683ba] uppercase tracking-wider">Evaluation Portal</span>
            </div>
          </div>
          <span className="text-xs font-mono bg-[#1e1b4b] px-2.5 py-1 rounded text-[#89f5e7] border border-[#444173]">
            v2.4
          </span>
        </div>

        {/* Role Tab Switcher */}
        <div className="flex p-1.5 bg-[#f2f4f6] border-b border-[#e0e3e5]">
          <button
            type="button"
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
              role === "HR"
                ? "bg-[#070235] text-white shadow-xs"
                : "text-[#47464f] hover:bg-[#e0e3e5]/60"
            }`}
            onClick={() => setRole("HR")}
          >
            <Briefcase className="w-3.5 h-3.5" />
            HR / Recruiter
          </button>

          <button
            type="button"
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
              role === "CANDIDATE"
                ? "bg-[#0058be] text-white shadow-xs"
                : "text-[#47464f] hover:bg-[#e0e3e5]/60"
            }`}
            onClick={() => setRole("CANDIDATE")}
          >
            <User className="w-3.5 h-3.5" />
            Candidate
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div>
            <h2 className="text-2xl font-bold text-[#070235] tracking-tight">
              {isSignIn ? "Welcome Back" : "Create Workspace Account"}
            </h2>
            <p className="text-xs text-[#47464f] mt-1">
              {isSignIn
                ? `Sign in as ${role === "HR" ? "HR Recruiter" : "Candidate"} to access interviews.`
                : `Register as ${role === "HR" ? "HR Recruiter" : "Candidate"} to begin.`}
            </p>
          </div>

          {/* Feedback Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-[#ffdad6] text-[#93000a] text-xs font-medium border border-[#ba1a1a]/20 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-[#89f5e7]/30 text-[#00201d] text-xs font-medium border border-[#1a998d]/30 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#1a998d] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitButton} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="email" className="text-xs font-mono font-semibold text-[#191c1e] block">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#787680] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  id="email"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 text-[#191c1e] transition-all"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Register Username Field */}
            {!isSignIn && (
              <div className="space-y-1.5 text-left">
                <label htmlFor="username" className="text-xs font-mono font-semibold text-[#191c1e] block">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-[#787680] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="username"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 text-[#191c1e] transition-all"
                    placeholder="Enter your full name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-mono font-semibold text-[#191c1e] block">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#787680] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  id="password"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 text-[#191c1e] transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#070235] hover:bg-[#1e1b4b] text-white rounded-lg font-semibold text-xs transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isSignIn ? `Sign In as ${role}` : `Create Account`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Form Switch Footer */}
          <div className="pt-4 border-t border-[#e0e3e5] text-center">
            <p className="text-xs text-[#47464f]">
              {isSignIn ? "Don't have an account yet?" : "Already registered?"}
              <button
                type="button"
                onClick={toggleForm}
                className="ml-1.5 text-[#0058be] font-semibold hover:underline cursor-pointer"
              >
                {isSignIn ? "Create an Account" : "Sign In"}
              </button>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;