import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Axios";
import {
  Users,
  Code2,
  Video,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  UserPlus,
  ArrowUpRight,
  BookOpen,
  Sparkles,
  Search,
  Filter,
  X,
  Mail,
  Lock,
  User,
  Activity
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // Provision user modal state
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserData, setCreateUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "HR",
  });
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState("");
  const [createUserSuccess, setCreateUserSuccess] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/users"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createUserData.email.trim() || !createUserData.password.trim()) {
      setCreateUserError("Email and password are required.");
      return;
    }

    try {
      setCreateUserLoading(true);
      setCreateUserError("");
      setCreateUserSuccess("");
      await api.post("/api/admin/users", createUserData);
      setCreateUserSuccess(`User ${createUserData.email} created successfully as ${createUserData.role}!`);
      setCreateUserData({ name: "", email: "", password: "", role: "HR" });
      fetchDashboardData();
      setTimeout(() => {
        setShowCreateUserModal(false);
        setCreateUserSuccess("");
      }, 1500);
    } catch (err) {
      console.error("Failed to create user:", err);
      setCreateUserError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setCreateUserLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = !userRoleFilter || u.role === userRoleFilter;
    const matchesSearch =
      !userSearch.trim() ||
      (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-[#e3dfff] text-[#181445] border border-[#c4c1fb]";
      case "HR":
        return "bg-[#d8e2ff] text-[#0058be] border border-[#adc6ff]";
      case "CANDIDATE":
      default:
        return "bg-[#eceef0] text-[#47464f] border border-[#c8c5d0]";
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans pb-16">
      {/* Top Banner */}
      <div className="bg-white border-b border-[#e0e3e5] px-6 md:px-12 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#181445] bg-[#e3dfff] px-2.5 py-0.5 rounded-full">
                Super Admin Console
              </span>
              <span className="text-xs font-mono text-[#0058be] font-bold">
                Platform Intelligence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#070235] tracking-tight">
              Administrative Command Center
            </h1>
            <p className="text-xs text-[#47464f] mt-1">
              System-wide visibility across question bank libraries, user provisioning, and real-time interview operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="px-4 py-2.5 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Provision User</span>
            </button>

            <Link
              to="/admin/questions"
              className="px-4 py-2.5 bg-[#070235] hover:bg-[#1e1b4b] text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-[#89f5e7]" />
              <span>Manage Questions</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 space-y-8">
        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Question Bank */}
          <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#47464f]">
                Question Bank
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#d8e2ff] text-[#0058be] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-[#070235] tracking-tight">
                {stats?.totalQuestions ?? "—"}
              </span>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f2f4f6]">
                <span className="text-[11px] text-[#787680]">Active Challenges</span>
                <Link
                  to="/admin/questions"
                  className="text-[11px] font-semibold text-[#0058be] hover:underline inline-flex items-center gap-0.5"
                >
                  Manage <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Total Users */}
          <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#47464f]">
                Total Accounts
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#e3dfff] text-[#181445] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-[#070235] tracking-tight">
                {stats?.totalUsers ?? "—"}
              </span>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#f2f4f6] text-[11px] font-mono text-[#787680]">
                <span>{stats?.usersByRole?.CANDIDATE ?? 0} Cand.</span>
                <span>•</span>
                <span>{stats?.usersByRole?.HR ?? 0} HR</span>
                <span>•</span>
                <span>{stats?.usersByRole?.ADMIN ?? 0} Admin</span>
              </div>
            </div>
          </div>

          {/* Card 3: Interviews Conducted */}
          <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#47464f]">
                Total Interviews
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#89f5e7]/40 text-[#005049] flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-[#070235] tracking-tight">
                {stats?.totalInterviews ?? "—"}
              </span>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#f2f4f6] text-[11px] font-mono text-[#787680]">
                <span className="text-emerald-700 font-semibold">{stats?.interviewsByStatus?.LIVE ?? 0} Live</span>
                <span>•</span>
                <span>{stats?.interviewsByStatus?.COMPLETED ?? 0} Done</span>
                <span>•</span>
                <span>{stats?.interviewsByStatus?.SCHEDULED ?? 0} Sched</span>
              </div>
            </div>
          </div>

          {/* Card 4: Platform Security & Status */}
          <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#47464f]">
                Platform Health
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-lg font-bold text-[#070235]">Operational</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#f2f4f6] text-[11px] text-[#787680]">
                Role Gating & STOMP Active
              </div>
            </div>
          </div>
        </div>

        {/* User Provisioning & Management Section */}
        <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#e0e3e5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#070235]">
                Registered Platform Users
              </h2>
              <p className="text-xs text-[#47464f] mt-0.5">
                Inspect registered candidate, HR, and administrator accounts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#787680] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter users by name/email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] text-[#191c1e]"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none text-[#191c1e] cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="CANDIDATE">Candidate</option>
                <option value="HR">HR / Recruiter</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#787680] font-mono">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#787680]">
              No users matching the criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f7f9fb] border-b border-[#e0e3e5] text-[#47464f] font-mono uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-6 font-bold">User</th>
                    <th className="py-3 px-6 font-bold">Email Address</th>
                    <th className="py-3 px-6 font-bold">Assigned Role</th>
                    <th className="py-3 px-6 font-bold text-right">User ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e3e5]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#f7f9fb]/60 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-[#191c1e] flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1e1b4b] text-white flex items-center justify-center text-xs font-bold font-mono">
                          {u.name ? u.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
                        </div>
                        <span>{u.name || "—"}</span>
                      </td>

                      <td className="py-3.5 px-6 font-mono text-[11px] text-[#47464f]">
                        {u.email}
                      </td>

                      <td className="py-3.5 px-6">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${getRoleBadge(
                            u.role
                          )}`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 font-mono text-[11px] text-[#787680] text-right">
                        #{u.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Provision User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-[#070235]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#e0e3e5] rounded-2xl shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-[#070235] text-white flex items-center justify-between border-b border-[#1e1b4b]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2170e4] flex items-center justify-center text-white">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Provision Platform User</h3>
                  <span className="text-[10px] font-mono text-[#8683ba]">
                    Create verified HR or Administrator
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowCreateUserModal(false)}
                className="p-1 rounded-lg text-[#8683ba] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-left">
              {createUserError && (
                <div className="p-3 bg-[#ffdad6] text-[#93000a] text-xs font-medium rounded-lg border border-[#ba1a1a]/20">
                  {createUserError}
                </div>
              )}

              {createUserSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{createUserSuccess}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-[#191c1e] block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#787680] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Alex Henderson"
                    value={createUserData.name}
                    onChange={(e) =>
                      setCreateUserData({ ...createUserData, name: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] text-[#191c1e]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-[#191c1e] block">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#787680] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="hr.lead@company.com"
                    value={createUserData.email}
                    onChange={(e) =>
                      setCreateUserData({ ...createUserData, email: e.target.value })
                    }
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] text-[#191c1e]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-[#191c1e] block">
                  Initial Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#787680] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={createUserData.password}
                    onChange={(e) =>
                      setCreateUserData({ ...createUserData, password: e.target.value })
                    }
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] text-[#191c1e]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-[#191c1e] block">
                  Target Account Role
                </label>
                <select
                  value={createUserData.role}
                  onChange={(e) =>
                    setCreateUserData({ ...createUserData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] text-[#191c1e] cursor-pointer"
                >
                  <option value="HR">HR / Recruiter</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="CANDIDATE">Candidate</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#e0e3e5]">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="flex-1 py-2 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#191c1e] rounded-lg font-semibold text-xs transition-all border border-[#c8c5d0]/50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUserLoading}
                  className="flex-1 py-2 bg-[#070235] hover:bg-[#1e1b4b] text-white rounded-lg font-semibold text-xs transition-all shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {createUserLoading ? "Creating..." : "Provision Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
