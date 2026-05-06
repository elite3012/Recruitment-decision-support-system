import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Database,
  Filter,
  History,
  Home,
  LogOut,
  Settings,
} from "lucide-react";
import { AUTH_TOKEN_KEY, getMe } from "./api/client";
import Dashboard from "./pages/Dashboard";
import JobSelection from "./pages/JobSelection";
import CandidateRanking from "./pages/CandidateRanking";
import CandidateDetail from "./pages/CandidateDetail";
import DecisionHistory from "./pages/DecisionHistory";
import AdminCrud from "./pages/AdminCrud";
import Login from "./pages/Login";
import AccountSettings from "./pages/AccountSettings";

const NavLink = ({
  to,
  icon: Icon,
  children,
}: {
  to: string;
  icon: any;
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    (to !== "/" && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`group inline-flex min-w-max items-center justify-center gap-3 rounded-2xl px-4 py-3 text-xs font-semibold tracking-[0.14em] transition-all duration-300 xl:w-full xl:justify-start xl:px-5 xl:py-4 ${
        isActive
          ? "bg-teal-600 text-white shadow-neu-primary scale-[0.99]"
          : "bg-neu-surface text-neu-text/55 shadow-neu-sm hover:text-neu-text hover:shadow-neu"
      }`}
    >
      <Icon
        className={`h-4 w-4 transition-colors ${isActive ? "text-white" : "text-neu-primary/70 group-hover:text-neu-primary"}`}
      />
      {children}
    </Link>
  );
};

function AppContent({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-neu-surface px-3 py-3 text-neu-text sm:px-4 sm:py-4">
      <div className="flex flex-col gap-4 xl:flex-row">
        <aside className="w-full rounded-[30px] bg-neu-surface p-4 shadow-neu xl:sticky xl:top-4 xl:w-[280px] xl:self-start xl:p-5">
          <div className="flex flex-col gap-5 xl:min-h-[calc(100vh-2.25rem)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between xl:flex-col xl:items-stretch">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-500 shadow-lg transition-all hover:scale-105">
                  <span className="text-xl font-black text-white drop-shadow-md">
                    R
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="eyebrow mb-1">Recruitment workspace</p>
                  <h1 className="text-2xl font-black tracking-tight text-neu-text">
                    RecruitAI
                  </h1>
                </div>
              </div>
              <div className="rounded-2xl bg-teal-900/10 px-4 py-3 text-center text-[11px] font-semibold tracking-[0.12em] text-teal-700 sm:text-left xl:hidden">
                Enterprise Edition v2
              </div>
            </div>

            <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 xl:mx-0 xl:flex-1 xl:flex-col xl:overflow-visible xl:px-0 xl:pb-0">
              <NavLink to="/" icon={Home}>
                Dashboard
              </NavLink>
              <NavLink to="/jobs" icon={Briefcase}>
                Job catalog
              </NavLink>
              <NavLink to="/ranking" icon={Filter}>
                Candidates
              </NavLink>
              <NavLink to="/decisions" icon={History}>
                History
              </NavLink>
              <NavLink to="/admin" icon={Database}>
                Master data
              </NavLink>
              <NavLink to="/account" icon={Settings}>
                Account
              </NavLink>
            </nav>

            <div className="hidden rounded-2xl bg-teal-900/10 px-4 py-4 text-center text-[11px] font-semibold tracking-[0.12em] text-teal-700 xl:block">
              Enterprise Edition v2
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 rounded-[30px] bg-neu-secondary/90 p-3 shadow-neu sm:p-4 lg:p-5">
          <header className="mb-4 flex flex-col gap-4 rounded-[26px] bg-neu-surface px-4 py-4 shadow-neu-sm sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div>
              <p className="eyebrow mb-1">Decision support system</p>
              <h2 className="text-xl font-black tracking-tight text-neu-text sm:text-2xl">
                Hiring intelligence made readable
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <div className="flex items-center gap-3 rounded-2xl bg-neu-surface px-3 py-2 shadow-neu-inner">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-neu-sm text-sm font-black text-neu-primary">
                  {(user?.username || "A").slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-neu-text">
                    {user?.username || "Admin"}
                  </p>
                  <p className="text-xs text-neu-text/45">
                    Authenticated workspace
                  </p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-neu-surface px-4 text-sm font-semibold text-neu-text/60 shadow-neu-sm transition hover:text-neu-danger hover:shadow-neu"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </header>

          <div className="min-w-0 px-1 pb-1 sm:px-2">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/jobs" element={<JobSelection />} />
              <Route path="/ranking" element={<CandidateRanking />} />
              <Route path="/candidate/:id" element={<CandidateDetail />} />
              <Route path="/decisions" element={<DecisionHistory />} />
              <Route path="/admin" element={<AdminCrud />} />
              <Route
                path="/account"
                element={<AccountSettings user={user} />}
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() =>
    localStorage.getItem(AUTH_TOKEN_KEY),
  );

  const authQuery = useQuery({
    queryKey: ["authMe", token],
    queryFn: getMe,
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (authQuery.isError) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setToken(null);
    }
  }, [authQuery.isError]);

  const handleLogin = (newToken: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    queryClient.clear();
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  if (authQuery.isLoading) {
    return (
      <div className="min-h-screen bg-neu-secondary p-10 text-lg font-semibold text-neu-text/50 animate-pulse">
        Restoring secure session...
      </div>
    );
  }

  return (
    <Router>
      <AppContent user={authQuery.data} onLogout={handleLogout} />
    </Router>
  );
}

export default App;
