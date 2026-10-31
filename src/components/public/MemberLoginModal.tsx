import React, { useState } from 'react';
import { X, Lock, Mail, AlertCircle, ArrowRight, Shield, UserCheck } from 'lucide-react';
import { r3Logo } from '../../assets/images/index.ts';

interface MemberLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, memberData: any) => void;
  onOpenRegistration: () => void;
}

export const MemberLoginModal: React.FC<MemberLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenRegistration
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
      const res = await fetch('/api/member/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify your membership credentials.');
      }

      onLoginSuccess(data.token, data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected connection error occurred.');
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
              src={r3Logo}
              alt="R3 Contingencies"
              className="h-8 w-auto object-contain rounded bg-black px-1.5 py-0.5 border border-slate-700"
            />
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">Member Portal Sign In</h3>
              <p className="text-[11px] text-slate-300">Private Client Emergency & Contingency Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs rounded bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 rounded-md bg-amber-50/70 border border-amber-200/60 text-xs text-slate-700 space-y-1">
              <span className="font-semibold text-[#0A192F]">R3 Member Pathway:</span>
              <p className="text-slate-600">
                Sign in with the email address associated with your R3 client registration or annual contingency retainer.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                Registered Member Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="principal@familyoffice.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                Security Password / Passcode (Optional for registered intake)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Intake clients may enter their email address to review active dossier records.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded transition-colors disabled:opacity-50 cursor-pointer shadow-xs border border-[#D4AF37]/30 flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Authenticating Principal...' : 'Access Member Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-600">
              Not registered as an R3 Member yet?
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRegistration();
              }}
              className="text-xs font-semibold text-[#0A192F] hover:underline cursor-pointer"
            >
              Register for Client Membership →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
