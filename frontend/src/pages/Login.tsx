import React, { useState } from 'react';
import { LockKeyhole, LogIn } from 'lucide-react';
import { login } from '../api/client';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await login(username, password);
      onLogin(response.access_token, response.user);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neu-secondary flex items-center justify-center p-6 text-neu-text">
      <div className="w-full max-w-md bg-neu-surface shadow-neu rounded-3xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-lg flex items-center justify-center">
            <LockKeyhole className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">RecruitAI</h1>
            <p className="text-[10px] font-black text-neu-text/40 font-mono uppercase tracking-widest">
              Secure HR workspace
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neu-text/50 font-mono">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full bg-neu-surface shadow-neu-inner rounded-2xl px-5 py-4 text-sm font-bold outline-none"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neu-text/50 font-mono">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-neu-surface shadow-neu-inner rounded-2xl px-5 py-4 text-sm font-bold outline-none"
              type="password"
              required
              autoFocus
            />
          </label>

          {error && (
            <div className="bg-neu-surface shadow-neu-inner rounded-xl px-4 py-3 text-xs font-bold text-neu-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-3 bg-teal-600 text-white shadow-lg hover:bg-teal-700 active:scale-95 disabled:opacity-60 transition-all rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-[0.25em]"
          >
            <LogIn className="w-4 h-4" />
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-[10px] leading-relaxed text-neu-text/40 font-bold font-mono">
          Default local account: admin / admin123. Change it after first login.
        </p>
      </div>
    </div>
  );
};

export default Login;
