import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, Filter, Users, Settings, History } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import JobSelection from './pages/JobSelection';
import CandidateRanking from './pages/CandidateRanking';
import CandidateDetail from './pages/CandidateDetail';
import DecisionHistory from './pages/DecisionHistory';

const NavLink = ({ to, icon: Icon, children }: { to: string, icon: any, children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
        isActive 
          ? 'shadow-neu-inner text-neu-primary' 
          : 'text-neu-text hover:shadow-neu hover:text-neu-primary'
      }`}
    >
      <Icon className={`w-4 h-4 ${isActive ? 'text-neu-primary' : 'text-slate-400'}`} />
      {children}
    </Link>
  );
};

function AppContent() {
  return (
    <div className="flex h-screen overflow-hidden bg-neu-surface font-primary text-neu-text">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-neu-surface shadow-neu z-20 m-4 rounded-xl flex flex-col">
        <div className="h-16 flex items-center px-6 mb-4 mt-2">
          <h1 className="text-xl font-bold tracking-tight">Recruit AI<span className="text-neu-primary">.</span></h1>
        </div>
        <nav className="px-4 space-y-3 flex-1">
          <NavLink to="/" icon={Home}>Executive Dashboard</NavLink>
          <NavLink to="/jobs" icon={Briefcase}>Job Selection</NavLink>
          <NavLink to="/ranking" icon={Filter}>Candidate Ranking</NavLink>
          <NavLink to="/decisions" icon={History}>Decision History</NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="h-16 bg-neu-surface shadow-neu-sm flex items-center px-8 z-10 m-4 mb-0 rounded-xl shrink-0">
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
            <span>Recruitment Decision Support System</span>
          </div>
        </header>
        
        <div className="p-8 flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<JobSelection />} />
            <Route path="/ranking" element={<CandidateRanking />} />
            <Route path="/candidate/:id" element={<CandidateDetail />} />
            <Route path="/decisions" element={<DecisionHistory />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;