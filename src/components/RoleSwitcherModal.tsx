import React, { useState } from 'react';
import { X, Shield, Lock, UserCheck, Key, Check } from 'lucide-react';
import type { UserRole } from '../types/database.ts';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: UserRole, token: string) => void;
  onSelectAffiliate: (token: string) => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
  onSelectAffiliate
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const demoAccounts = [
    {
      role: 'super_admin' as UserRole,
      title: 'Director & Super Admin',
      email: 'director@r3contingencies.com',
      token: 'sess-super-admin',
      type: 'admin',
      desc: 'Full administrative authority, commercial rules sign-off, system audit.'
    },
    {
      role: 'affiliate_manager' as UserRole,
      title: 'Affiliate Compliance Manager',
      email: 'r3affiliate.network@gmail.com',
      token: 'sess-aff-manager',
      type: 'admin',
      desc: 'Review partner applications, approve affiliates, manage onboarding.'
    },
    {
      role: 'finance_manager' as UserRole,
      title: 'Finance & Treasury Manager',
      email: 'finance@r3contingencies.com',
      token: 'sess-fin-manager',
      type: 'admin',
      desc: 'Verify client sales, audit commissions, approve monthly payout batches.'
    },
    {
      role: 'affiliate' as UserRole,
      title: 'Crestview Executive Partner (R3-10245)',
      email: 'partner.sterling@crestview-concierge.ch',
      token: 'sess-partner-sterling',
      type: 'affiliate',
      desc: 'Active partner portal, unique referral links, conversions, commissions.'
    }
  ];

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      if (data.user.role === 'affiliate') {
        onSelectAffiliate(data.token);
      } else {
        onSelectRole(data.user.role, data.token);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#0A192F] text-white">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/Screenshot_20261029_112009_Gallery_b65df3d1.jpg"
              alt="R3 Contingencies"
              className="h-7 w-auto object-contain rounded bg-black px-1 border border-slate-700"
            />
            <h3 className="text-sm font-bold">Executive & Partner Access</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Quick Demo Switcher */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              One-Click Executive & Partner Sign-in
            </h4>
            <div className="space-y-2.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => {
                    if (acc.type === 'affiliate') {
                      onSelectAffiliate(acc.token);
                    } else {
                      onSelectRole(acc.role, acc.token);
                    }
                    onClose();
                  }}
                  className="w-full p-3 text-left rounded border border-slate-200 hover:border-[#0A192F] hover:bg-slate-50 transition-colors flex items-start justify-between group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0A192F]">
                        {acc.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {acc.email}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      {acc.desc}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#0A192F] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
                    Enter <Check className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Or Sign In with Corporate Email
            </h4>

            {error && (
              <div className="mb-3 p-2 text-xs rounded bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleCustomLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="director@r3contingencies.com"
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded transition-colors cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
