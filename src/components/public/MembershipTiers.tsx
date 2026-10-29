import React from 'react';
import { Check, Shield, ArrowRight } from 'lucide-react';

interface MembershipTiersProps {
  onSelectTier: (tier: string) => void;
}

export const MembershipTiers: React.FC<MembershipTiersProps> = ({ onSelectTier }) => {
  return (
    <section id="membership" className="py-20 bg-[#FAF9F6] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-14">
          <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
            Annual Retainers
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A192F]" style={{ textWrap: 'balance' }}>
            Structured Preparedness & Contingency Protection
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Membership ensures that protocols, principal profiles, trusted emergency contacts, and rapid financial conduits are established before an incident unfolds.
          </p>
          <div className="mt-3 inline-block text-xs text-slate-500 bg-amber-50/70 border border-amber-200/60 rounded px-2.5 py-1">
            Notice: Membership fees and operational scope are managed through the administrative CMS and subject to formal agreement.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Silver Tier */}
          <div className="rounded-lg border border-slate-200 bg-white p-8 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Individual / Principal
              </div>
              <h3 className="text-xl font-bold text-[#0A192F] mb-2">Silver Tier</h3>
              <p className="text-xs text-slate-600 mb-6 min-h-[36px]">
                Foundational contingency readiness and priority advisory routing for active international travelers.
              </p>

              <div className="mb-6 pb-6 border-b border-slate-100">
                <span className="text-3xl font-extrabold text-[#0A192F] tabular-nums">$2,400</span>
                <span className="text-xs text-slate-500 font-medium ml-1.5">/ annually</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Individual principal registration and risk profile</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>24/7 priority emergency response coordination desk</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Travel disruption advisory & commercial rebooking</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Standard medical evacuation coordination dispatch</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Direct Flex Funds access up to $25,000 reserve</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => onSelectTier('silver')}
                className="w-full py-2.5 px-4 text-xs font-semibold text-[#0A192F] bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors cursor-pointer"
              >
                Inquire for Silver
              </button>
            </div>
          </div>

          {/* Gold Tier (Featured) */}
          <div className="rounded-lg border-2 border-[#D4AF37] bg-white p-8 flex flex-col justify-between shadow-sm relative">
            <div className="absolute -top-3 right-6 bg-[#0A192F] text-[#D4AF37] text-[11px] font-semibold px-2.5 py-0.5 rounded border border-[#D4AF37]/40 uppercase tracking-wider">
              Comprehensive
            </div>

            <div>
              <div className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-1">
                Executive & Family Office
              </div>
              <h3 className="text-xl font-bold text-[#0A192F] mb-2">Gold Tier</h3>
              <p className="text-xs text-slate-600 mb-6 min-h-[36px]">
                Comprehensive family and corporate mobility contingency protection with dedicated crisis dispatch readiness.
              </p>

              <div className="mb-6 pb-6 border-b border-slate-100">
                <span className="text-3xl font-extrabold text-[#0A192F] tabular-nums">$12,000</span>
                <span className="text-xs text-slate-500 font-medium ml-1.5">/ annually</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Coverage for principal, spouse, and immediate dependents</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Dedicated Senior Contingency Coordinator assignment</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Priority private jet charter routing & standby access</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Comprehensive aeromedical ICU aircraft orchestration</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Armored secure transport coordination in key metros</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Flex Funds standby capacity up to $100,000</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => onSelectTier('gold')}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded transition-colors shadow-xs cursor-pointer border border-[#D4AF37]/40"
              >
                Inquire for Gold
              </button>
            </div>
          </div>

          {/* Excelsior Tier */}
          <div className="rounded-lg border border-slate-200 bg-white p-8 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Sovereign & Multinational
              </div>
              <h3 className="text-xl font-bold text-[#0A192F] mb-2">Excelsior Tier</h3>
              <p className="text-xs text-slate-600 mb-6 min-h-[36px]">
                Fully tailored contingency architecture, bespoke operational standby, and institutional liquidity facilities.
              </p>

              <div className="mb-6 pb-6 border-b border-slate-100">
                <span className="text-2xl font-extrabold text-[#0A192F]">Confidential Discovery</span>
                <span className="block text-xs text-slate-500 mt-1">Custom scope upon consultation</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Multinational executive board or multi-family coverage</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Named crisis response commander & sovereign advisors</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Custom aviation retainers & guaranteed standby windows</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Diplomatic channel liaison & sovereign risk routing</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Multi-currency bespoke Flex Funds facility & escrow</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => onSelectTier('excelsior')}
                className="w-full py-2.5 px-4 text-xs font-semibold text-[#0A192F] bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors cursor-pointer"
              >
                Request Confidential Briefing
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
