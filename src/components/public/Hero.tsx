import React from 'react';
import { ArrowRight, ShieldCheck, Globe, Clock, CreditCard } from 'lucide-react';
import { heroCoordinationImg } from '../../assets/images/index.ts';

interface HeroProps {
  onExplore: () => void;
  onPartner: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onPartner }) => {
  return (
    <section className="relative overflow-hidden bg-[#FAF9F6] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
        {/* Split Grid: Left Headline & Proposition, Right Marquee Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0A192F]">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              Executive Contingency Concierge & Crisis Logistics
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0A192F] leading-[1.12]" style={{ textWrap: 'balance' }}>
              Uncompromising Contingency Coordination for Global Principals.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              When international travel disruptions, acute medical incidents, or security complexities occur, R3 Contingencies mobilizes verified crisis logistics, executive medical transport, and emergency liquidity reserves across 60+ countries.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExplore}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded-md transition-colors shadow-xs border border-[#D4AF37]/30 cursor-pointer whitespace-nowrap shrink-0"
              >
                Explore Contingency Cover
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onPartner}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Affiliate Partnership
              </button>
            </div>

            <div className="pt-4 border-t border-slate-200/80 flex items-center gap-6 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Strictly Confidential</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-700">Manual Sales Verification</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-700">Global Coverage</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-lg overflow-hidden border border-slate-300 shadow-md bg-slate-900 group">
              <img
                src={heroCoordinationImg}
                alt="R3 Contingencies Executive Coordination Operations Room"
                className="w-full h-80 sm:h-96 lg:h-[420px] object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                  Global Coordination Command
                </p>
                <p className="text-sm font-medium mt-0.5 text-slate-200">
                  Continuous operational readiness across international time zones.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Structured Metric Row below hero */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-10 border-t border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>24/7 Response Desk</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Always-on coordination desk for immediate principal assistance.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
              <Globe className="w-4 h-4 text-[#D4AF37]" />
              <span>Global Reach</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vetted logistical partners and medical extraction assets worldwide.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
              <CreditCard className="w-4 h-4 text-[#D4AF37]" />
              <span>Flex Funds Protocol</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dedicated liquidity escrow for rapid deployment during emergency halts.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Manual Verification</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Rigorous compliance and administrative verification on all referrals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
