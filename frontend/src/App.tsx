import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, Briefcase, Filter, Users, Settings, History } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import JobSelection from './pages/JobSelection';
import CandidateRanking from './pages/CandidateRanking';
import CandidateDetail from './pages/CandidateDetail';
import DecisionHistory from './pages/DecisionHistory';

function App() {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white">
          <div className="h-16 flex items-center px-6 border-b border-slate-200">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Recruit AI<span className="text-blue-600">.</span></h1>
          </div>
          <nav className="p-4 space-y-1">
            <Link to="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <Home className="w-4 h-4 text-slate-400" />
              Executive Dashboard
            </Link>
            <Link to="/jobs" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <Briefcase className="w-4 h-4 text-slate-400" />
              Job Selection
            </Link>
            <Link to="/ranking" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <Filter className="w-4 h-4 text-slate-400" />
              Candidate Ranking
            </Link>
            <Link to="/decisions" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <History className="w-4 h-4 text-slate-400" />
              Decision History
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm">
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>Recruitment Decision Support System</span>
            </div>
          </header>
          
          <div className="p-8">
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
    </Router>
  );
}

export default App;