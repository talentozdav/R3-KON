import React from 'react';
import { Shield, ChevronRight, UserCheck, Lock } from 'lucide-react';
import type { UserRole } from '../types/database.ts';

interface NavbarProps {
  currentView: 'home' | 'about' | 'services' | 'membership' | 'flex-funds' | 'affiliates' | 'contact' | 'affiliate-portal' | 'admin-dashboard';
  setCurrentView: (view: any) => void;
  activeRole: UserRole | null;
  onOpenAuth: () => void;
  onOpenApplication: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  activeRole,
  onOpenAuth,
  onOpenApplication
}) => {
  const isPortalOrAdmin = currentView === 'affiliate-portal' || currentView === 'admin-dashboard';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-90 cursor-pointer"
        >
          <div className="w-8 h-8 rounded bg-[#0A192F] flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/30 shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#0A192F] whitespace-nowrap shrink-0">
            R3 Contingencies
          </span>
        </button>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => setCurrentView('about')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'about' ? 'text-[#0A192F] font-semibold' : 'hover:text-[#0A192F]'
            }`}
          >
            About
          </button>
          <button
            onClick={() => setCurrentView('services')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'services' ? 'text-[#0A192F] font-semibold' : 'hover:text-[#0A192F]'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => setCurrentView('membership')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'membership' ? 'text-[#0A192F] font-semibold' : 'hover:text-[#0A192F]'
            }`}
          >
            Membership
          </button>
          <button
            onClick={() => setCurrentView('flex-funds')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'flex-funds' ? 'text-[#0A192F] font-semibold' : 'hover:text-[#0A192F]'
            }`}
          >
            Flex Funds
          </button>
          <button
            onClick={() => setCurrentView('affiliates')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'affiliates' ? 'text-[#0A192F] font-semibold' : 'hover:text-[#0A192F]'
            }`}
          >
            Affiliates
          </button>
          <button
            onClick={() => setCurrentView('contact')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'contact' ? 'text-[#0A192F] font-semibold' : 'hover:text-[#0A192F]'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: Primary Action & Portal Access */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer border border-slate-200/60"
            title="Switch portal perspective or sign in"
          >
            {activeRole === 'super_admin' ? (
              <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <Lock className="w-3.5 h-3.5" /> Staff Console
              </span>
            ) : activeRole === 'affiliate' ? (
              <span className="flex items-center gap-1.5 text-amber-800 font-semibold">
                <UserCheck className="w-3.5 h-3.5" /> Partner Portal
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" /> Executive Access
              </span>
            )}
          </button>

          {!isPortalOrAdmin && (
            <button
              onClick={onOpenApplication}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded-md transition-colors whitespace-nowrap shrink-0 shadow-xs border border-[#D4AF37]/30 cursor-pointer"
            >
              Apply as Partner
            </button>
          )}

          {isPortalOrAdmin && (
            <button
              onClick={() => setCurrentView('home')}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Public Website
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
