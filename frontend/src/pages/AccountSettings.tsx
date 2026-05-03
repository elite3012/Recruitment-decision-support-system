import React, { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { changePassword } from '../api/client';

interface AccountSettingsProps {
  user: any;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ user }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Password changed successfully');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-neu-text uppercase">Account Security</h2>
        <p className="text-xs font-bold font-mono text-neu-text/40 uppercase tracking-widest mt-1">
          PASSWORD_AND_SESSION_CONTROL
        </p>
      </div>

      <div className="bg-neu-surface shadow-neu rounded-2xl p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-lg flex items-center justify-center">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <p className="text-lg font-black text-neu-text">{user?.full_name || user?.username}</p>
          <p className="text-[10px] font-black text-neu-text/40 font-mono uppercase tracking-widest">
            {user?.username} / {user?.role || 'admin'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-neu-surface shadow-neu rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <KeyRound className="w-5 h-5 text-neu-primary" />
          <h3 className="text-sm font-black uppercase tracking-widest text-neu-text">Change Password</h3>
        </div>

        <label className="block space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-neu-text/50 font-mono">Current Password</span>
          <input
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            type="password"
            className="w-full bg-neu-surface shadow-neu-inner rounded-2xl px-5 py-4 text-sm font-bold outline-none"
            required
          />
        </label>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neu-text/50 font-mono">New Password</span>
            <input
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              type="password"
              className="w-full bg-neu-surface shadow-neu-inner rounded-2xl px-5 py-4 text-sm font-bold outline-none"
              minLength={6}
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neu-text/50 font-mono">Confirm Password</span>
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              className="w-full bg-neu-surface shadow-neu-inner rounded-2xl px-5 py-4 text-sm font-bold outline-none"
              minLength={6}
              required
            />
          </label>
        </div>

        {message && <div className="text-neu-success text-xs font-black uppercase tracking-widest">{message}</div>}
        {error && <div className="text-neu-danger text-xs font-black uppercase tracking-widest">{error}</div>}

        <button
          type="submit"
          disabled={isSaving}
          className="bg-teal-600 text-white shadow-lg hover:bg-teal-700 disabled:opacity-60 active:scale-95 transition-all rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em]"
        >
          {isSaving ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default AccountSettings;
