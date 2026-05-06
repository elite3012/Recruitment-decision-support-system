import React, { useState } from "react";
import { LockKeyhole, LogIn } from "lucide-react";
import { login } from "../api/client";

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
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
      setError(err?.response?.data?.detail || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neu-secondary flex items-center justify-center p-6 text-neu-text">
      <div className="w-full max-w-md rounded-[30px] bg-neu-surface p-8 shadow-neu sm:p-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg">
            <LockKeyhole className="w-7 h-7" />
          </div>
          <div>
            <p className="eyebrow mb-1">Welcome back</p>
            <h1 className="text-3xl font-black tracking-tight">RecruitAI</h1>
            <p className="text-sm text-neu-text/45">Secure hiring workspace</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neu-text/50">
              Username
            </span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-2xl bg-neu-surface px-5 py-4 text-sm font-medium outline-none shadow-neu-inner"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neu-text/50">
              Password
            </span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl bg-neu-surface px-5 py-4 text-sm font-medium outline-none shadow-neu-inner"
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
            className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-teal-600 px-5 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-teal-700 active:scale-95 disabled:opacity-60"
          >
            <LogIn className="w-4 h-4" />
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm leading-6 text-neu-text/45">
          Default local account: admin / admin123. Change it after first login.
        </p>
      </div>
    </div>
  );
};

export default Login;
