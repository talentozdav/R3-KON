import React from 'react';
import { UserCheck, UserPlus, LogOut } from 'lucide-react';
import type { UserRole } from '../types/database.ts';
import { r3Logo } from '../assets/images/index.ts';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  activeRole: UserRole | null;
  onOpenAffiliateAuth: () => void;
  onOpenClientRegistration: () => void;
  onOpenApplication: () => void;
  onOpenMemberAuth?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  activeRole,
  onOpenAffiliateAuth,
  onOpenClientRegistration,
  onOpenApplication,
  onOpenMemberAuth,
  onLogout
}) => {
  const isPortalOrAdmin = currentView === 'affiliate-portal' || currentView === 'admin-dashboard' || currentView === 'member-portal';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-6 py-3.5">
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

        {/* Clean Public Navigation Links: Home, About R3, Services, Membership, Affiliate Partnership, Contact */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setCurrentView('home')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'home' ? 'text-[#0A192F] font-semibold' : 'hover:text-[#0A192F]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentView('about')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'about' ? 'text-[#0A192F] font-semibold' : 'hover:text-[#0A192F]'
            }`}
          >
            About R3
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
            onClick={() => setCurrentView('affiliate-partnership')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'affiliate-partnership' ? 'text-[#0A192F] font-semibold' : 'hover:text-[#0A192F]'
            }`}
          >
            Affiliate Partnership
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

        {/* Action Controls: Distinct Pathways (Membership & Affiliate) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* PATHWAY 1: MEMBERSHIP CONTROLS */}
          {!isPortalOrAdmin && (
            <>
              {activeRole === 'client' ? (
                <button
                  onClick={() => setCurrentView('member-portal')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Member Portal</span>
                </button>
              ) : (
                <>
                  {onOpenMemberAuth && (
                    <button
                      onClick={onOpenMemberAuth}
                      className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-[#0A192F] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      title="Member Portal Login"
                    >
                      <span>Member Login</span>
                    </button>
                  )}
                  <button
                    onClick={onOpenClientRegistration}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A192F] bg-amber-50 hover:bg-amber-100 border border-[#D4AF37]/50 rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Client Registration</span>
                  </button>
                </>
              )}
            </>
          )}

          {/* PATHWAY 2: AFFILIATE PARTNER CONTROLS */}
          {!isPortalOrAdmin && (
            <>
              {activeRole === 'affiliate' ? (
                <button
                  onClick={() => setCurrentView('affiliate-portal')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Associate Portal</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAffiliateAuth}
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                  title="Associate Partner Portal Login"
                >
                  <span>Associate Portal</span>
                </button>
              )}

              <button
                onClick={onOpenApplication}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-xs border border-[#D4AF37]/30"
              >
                Become an Associate
              </button>
            </>
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
