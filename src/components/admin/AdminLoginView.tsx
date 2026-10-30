import React, { useState } from 'react';
import { Shield, Lock, AlertCircle, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react';
import type { UserRole, Profile } from '../../types/database.ts';

interface AdminLoginViewProps {
  onLoginSuccess: (token: string, user: Profile) => void;
  onReturnHome: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onReturnHome
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Administrative authentication failed');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070F1E] flex flex-col items-center justify-center p-6 relative">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#070F1E] to-[#050A14] pointer-events-none" />

      {/* Return Home Button */}
      <div className="w-full max-w-md mb-6 z-10 flex items-center justify-between">
        <button
          onClick={onReturnHome}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Portal</span>
        </button>
        <span className="text-[11px] font-mono text-slate-500">SEC-ZONE-01</span>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md bg-[#0A192F] border border-slate-800 rounded-lg shadow-2xl p-8 z-10 text-slate-200">
        {/* Header with Official Logo */}
        <div className="text-center mb-8">
          <div className="inline-block p-2 bg-black rounded border border-slate-800 shadow-inner mb-4">
            <img
              src="/assets/aistudio/Screenshot_20261029_112009_Gallery_b65df3d1.jpg"
              alt="R3 Contingencies"
              className="h-10 w-auto object-contain mx-auto"
            />
          </div>
          <h1 className="text-base font-bold text-white tracking-wide uppercase">
            Operations Command & Administration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Restricted Infrastructure · Authorized R3 Personnel Only
          </p>
        </div>

        {/* Security Warning Banner */}
        <div className="mb-6 p-3 bg-amber-950/40 border border-amber-800/60 rounded text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">Classified Area:</span> Access attempts are cryptographically signed, timestamped, and audited. Unauthorized access is strictly prohibited under international cyber legislation.
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/60 border border-red-800 rounded text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <p className="font-semibold text-red-300">Access Denied</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Authorized Staff Email
            </label>
            <input
              type="email"
              required
              autoFocus
              placeholder="director@r3contingencies.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#0F2444] border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Command Password / Key
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#0F2444] border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 text-xs font-semibold text-[#0A192F] bg-[#D4AF37] hover:bg-[#E5C158] rounded transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Verify Credentials & Enter Console</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-[11px] text-slate-400 space-y-1">
          <p>Geneva · Zurich · London Operations Dispatch</p>
          <p className="text-[10px] text-slate-500">Contact Network: r3affiliate.network@gmail.com</p>
        </div>
      </div>
    </div>
  );
};
