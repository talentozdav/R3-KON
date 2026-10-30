import React from 'react';

interface FooterProps {
  setCurrentView: (view: any) => void;
  onOpenAffiliateAuth: () => void;
  onOpenClientRegistration: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setCurrentView,
  onOpenAffiliateAuth,
  onOpenClientRegistration
}) => {
  return (
    <footer className="border-t border-slate-200 bg-[#0A192F] text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/aistudio/Screenshot_20261029_112009_Gallery_b65df3d1.jpg"
                alt="R3 Contingencies"
                className="h-10 w-auto max-w-[170px] object-contain rounded bg-black px-1.5 py-0.5 border border-slate-700 shadow-xs"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Specialized international emergency contingency coordination, executive concierge, and bespoke crisis logistics for high-profile principals.
            </p>
            <div className="text-xs text-slate-400 space-y-1.5 pt-1">
              <p className="flex items-center gap-1.5">
                <span className="text-slate-500">Email:</span>
                <a href="mailto:r3affiliate.network@gmail.com" className="text-slate-300 hover:text-white transition-colors">
                  r3affiliate.network@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-slate-500">Cell:</span>
                <a href="tel:+19313660615" className="text-slate-300 hover:text-white transition-colors font-mono">
                  +1 (931) 366-0615
                </a>
              </p>
              <p className="text-[11px] text-slate-500 pt-0.5">
                Operations Command: Geneva · London · Zurich
              </p>
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
                <button onClick={onOpenClientRegistration} className="hover:text-white transition-colors cursor-pointer text-[#D4AF37]">
                  Client Registration & Intake
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
                <button onClick={onOpenAffiliateAuth} className="hover:text-white transition-colors cursor-pointer">
                  Partner Portal Login
                </button>
              </li>
              <li>
                <a href="#compliance" className="hover:text-white transition-colors">
                  Compliance & Referral Standards
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  International Non-Disclosure Terms
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
              © {new Date().getFullYear()} R3 Contingencies. All worldwide rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
