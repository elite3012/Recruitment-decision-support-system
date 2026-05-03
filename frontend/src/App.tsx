import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Database, Filter, History, Home, LogOut, Settings } from 'lucide-react';
import { AUTH_TOKEN_KEY, getMe } from './api/client';
import Dashboard from './pages/Dashboard';
import JobSelection from './pages/JobSelection';
import CandidateRanking from './pages/CandidateRanking';
import CandidateDetail from './pages/CandidateDetail';
import DecisionHistory from './pages/DecisionHistory';
import AdminCrud from './pages/AdminCrud';
import Login from './pages/Login';
import AccountSettings from './pages/AccountSettings';

const NavLink = ({ to, icon: Icon, children }: { to: string, icon: any, children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 font-mono ${
        isActive 
          ? 'bg-teal-600 text-white shadow-inner scale-[0.98]' 
          : 'text-neu-text/40 hover:text-neu-text hover:bg-white/10'
      }`}
    >
      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neu-text/30'}`} />
      {children}
    </Link>
  );
};

function AppContent({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <div className="flex h-screen overflow-hidden bg-neu-surface font-primary text-neu-text">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-neu-surface shadow-neu z-20 m-4 rounded-3xl flex flex-col border-none">
        <div className="h-24 flex items-center px-8 mb-4 mt-2">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-500 rounded-xl shadow-lg flex items-center justify-center mr-3 transform rotate-12 transition-all hover:rotate-0 hover:scale-110 cursor-pointer">
             <span className="text-white font-black text-xl drop-shadow-md">R</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">RecruitAI</h1>
        </div>
        <nav className="px-4 space-y-2 flex-1">
          <NavLink to="/" icon={Home}>Dashboard</NavLink>
          <NavLink to="/jobs" icon={Briefcase}>Job Catalog</NavLink>
          <NavLink to="/ranking" icon={Filter}>Candidates</NavLink>
          <NavLink to="/decisions" icon={History}>History</NavLink>
          <NavLink to="/admin" icon={Database}>Master Data</NavLink>
          <NavLink to="/account" icon={Settings}>Account</NavLink>
        </nav>
        <div className="p-6 m-4 bg-teal-900/10 border border-teal-500/20 rounded-2xl text-[9px] uppercase font-black tracking-[0.3em] text-teal-600/60 text-center font-mono">
           Enterprise Edition v2
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-neu-secondary">
        <header className="h-16 bg-neu-surface shadow-neu-sm flex items-center justify-between px-8 z-10 m-4 mb-0 rounded-xl shrink-0">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-neu-primary font-mono">
             <span>Decision Support System</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white shadow-neu-sm rounded-full" />
             <span className="text-[10px] font-black font-mono text-neu-primary uppercase">{user?.username || 'ADMIN'}</span>
             <button
               onClick={onLogout}
               className="w-9 h-9 rounded-xl bg-neu-surface shadow-neu-sm text-neu-text/50 hover:text-neu-danger flex items-center justify-center transition"
               title="Logout"
             >
               <LogOut className="w-4 h-4" />
             </button>
          </div>
        </header>
        
        <div className="p-8 flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<JobSelection />} />
            <Route path="/ranking" element={<CandidateRanking />} />
            <Route path="/candidate/:id" element={<CandidateDetail />} />
            <Route path="/decisions" element={<DecisionHistory />} />
            <Route path="/admin" element={<AdminCrud />} />
            <Route path="/account" element={<AccountSettings user={user} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY));

  const authQuery = useQuery({
    queryKey: ['authMe', token],
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
    return <div className="min-h-screen bg-neu-secondary p-10 text-neu-text/50 font-bold animate-pulse">Restoring secure session...</div>;
  }

  return (
    <Router>
      <AppContent user={authQuery.data} onLogout={handleLogout} />
    </Router>
  );
}

export default App;
