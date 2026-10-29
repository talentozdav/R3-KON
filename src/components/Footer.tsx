import React from 'react';
import { Shield } from 'lucide-react';

interface FooterProps {
  setCurrentView: (view: any) => void;
  onOpenAuth: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView, onOpenAuth }) => {
  return (
    <footer className="border-t border-slate-200 bg-[#0A192F] text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/40">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-base font-bold tracking-tight text-white">
                R3 Contingencies
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Specialized international emergency contingency coordination, executive concierge, and bespoke crisis logistics for high-profile principals.
            </p>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Advisory Desk: ops@r3contingencies.com</p>
              <p>Operations Command: Geneva · London · Zurich</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-3">
              Organization
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setCurrentView('about')} className="hover:text-white transition-colors cursor-pointer">
                  About R3
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('services')} className="hover:text-white transition-colors cursor-pointer">
                  Contingency Capabilities
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('membership')} className="hover:text-white transition-colors cursor-pointer">
                  Membership Tiers
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('flex-funds')} className="hover:text-white transition-colors cursor-pointer">
                  Flex Funds Protocol
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-white transition-colors cursor-pointer">
                  Global Operations Desk
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-3">
              Partner Representation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setCurrentView('affiliates')} className="hover:text-white transition-colors cursor-pointer">
                  Affiliate Program Overview
                </button>
              </li>
              <li>
                <button onClick={onOpenAuth} className="hover:text-white transition-colors cursor-pointer">
                  Partner Portal Login
                </button>
              </li>
              <li>
                <button onClick={onOpenAuth} className="hover:text-white transition-colors cursor-pointer">
                  Staff Administrative Console
                </button>
              </li>
              <li>
                <a href="#compliance" className="hover:text-white transition-colors">
                  Compliance & Referral Standards
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-3">
              Governance & Disclaimers
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              R3 Contingencies is a private contingency coordination firm. R3 is neither an insurance underwriter nor a direct medical clinic. All deployments subject to operational agreements and local regulatory frameworks.
            </p>
            <p className="text-[11px] text-slate-500">
              © {new Date().getFullYear()} R3 Contingencies. All rights reserved worldwide.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>Confidentiality Notice</span>
            <span aria-hidden="true">·</span>
            <span>Privacy Notice</span>
            <span aria-hidden="true">·</span>
            <span>Terms of Engagement</span>
          </div>
          <div className="text-right">
            <span>Enterprise Contingency Infrastructure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
