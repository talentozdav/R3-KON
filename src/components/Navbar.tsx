import React from 'react';
import { UserCheck, UserPlus, LogOut } from 'lucide-react';
import type { UserRole } from '../types/database.ts';
import { r3Logo } from '../assets/images/index.ts';

interface NavbarProps {
  currentView: 'home' | 'about' | 'services' | 'membership' | 'flex-funds' | 'affiliates' | 'contact' | 'affiliate-portal' | 'admin-dashboard';
  setCurrentView: (view: any) => void;
  activeRole: UserRole | null;
  onOpenAffiliateAuth: () => void;
  onOpenClientRegistration: () => void;
  onOpenApplication: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  activeRole,
  onOpenAffiliateAuth,
  onOpenClientRegistration,
  onOpenApplication,
  onLogout
}) => {
  const isPortalOrAdmin = currentView === 'affiliate-portal' || currentView === 'admin-dashboard';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Brand Logo Wordmark */}
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-3 text-left group transition-opacity hover:opacity-90 cursor-pointer"
        >
          <img
            src={r3Logo}
            alt="R3 Contingencies"
            className="h-10 w-auto max-w-[170px] object-contain rounded bg-black px-1.5 py-0.5 shadow-xs border border-slate-800"
          />
        </button>

        {/* Clean Public Navigation Links */}
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

        {/* Action Controls: Customer-facing + Partner Portal Only */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Client Registration Button */}
          {!isPortalOrAdmin && (
            <button
              onClick={onOpenClientRegistration}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A192F] bg-amber-50 hover:bg-amber-100 border border-[#D4AF37]/50 rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Client Registration</span>
            </button>
          )}

          {/* Partner Portal Login / Access */}
          {activeRole === 'affiliate' ? (
            <button
              onClick={() => setCurrentView('affiliate-portal')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Partner Portal</span>
            </button>
          ) : (
            <button
              onClick={onOpenAffiliateAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
              title="Affiliate Representative Portal Login"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Partner Portal</span>
            </button>
          )}

          {/* Apply as Partner */}
          {!isPortalOrAdmin && (
            <button
              onClick={onOpenApplication}
              className="hidden sm:inline-block px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-xs border border-[#D4AF37]/30"
            >
              Apply as Partner
            </button>
          )}

          {/* If inside portal or admin */}
          {isPortalOrAdmin && (
            <>
              <button
                onClick={() => setCurrentView('home')}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                Public Website
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
