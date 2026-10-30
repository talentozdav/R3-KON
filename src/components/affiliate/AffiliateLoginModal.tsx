import React, { useState } from 'react';
import { X, UserCheck, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import type { Profile } from '../../types/database.ts';

interface AffiliateLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, affiliateData: any) => void;
  onOpenApplication: () => void;
}

export const AffiliateLoginModal: React.FC<AffiliateLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenApplication
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/affiliate/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Affiliate authentication failed');
      }

      onLoginSuccess(data.token, data.affiliate);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#0A192F] text-white">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/Screenshot_20261029_112009_Gallery_b65df3d1.jpg"
              alt="R3 Contingencies"
              className="h-7 w-auto object-contain rounded bg-black px-1.5 py-0.5 border border-slate-700"
            />
            <div>
              <h3 className="text-sm font-bold text-white">Affiliate Partner Portal</h3>
              <p className="text-[11px] text-slate-300">Authorized Representation & Commission Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Partner Account Email
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="partner@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-[#0A192F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password / Access Key
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-[#0A192F]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs border border-[#D4AF37]/30"
            >
              {loading ? 'Authenticating...' : (
                <>
                  <UserCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Access Partner Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500 mb-2">Not yet an accredited R3 Affiliate Partner?</p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenApplication();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A192F] hover:underline cursor-pointer"
            >
              <span>Submit Partner Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
