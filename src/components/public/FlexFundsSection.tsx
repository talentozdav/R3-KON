import React from 'react';
import { CreditCard, Lock, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface FlexFundsProps {
  onInquire: () => void;
}

export const FlexFundsSection: React.FC<FlexFundsProps> = ({ onInquire }) => {
  return (
    <section id="flex-funds" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
              Emergency Liquidity Protocol
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A192F]" style={{ textWrap: 'balance' }}>
              Flex Funds: Instant Capital Deployment in Critical Situations.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              In international contingencies, liquidity delays represent the single greatest operational barrier. When private clinics demand immediate guarantee deposits, or emergency charter operators require cleared funds over a weekend, standard wire transfers can take 24–72 hours.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              R3 Flex Funds eliminates this bottleneck. By maintaining a pre-authorized escrow reserve or structured credit conduit, R3 coordinators can authorize and deploy critical capital within minutes on behalf of the principal.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#0A192F] text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#0A192F]">Instant Hospital & Evacuation Guarantees</h4>
                  <p className="text-xs text-slate-500">Direct guarantee of payment issued to foreign hospitals and aeromedical dispatchers.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#0A192F] text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#0A192F]">Dedicated Escrow Segregation</h4>
                  <p className="text-xs text-slate-500">Funds remain segregated in prime custodial banks until authorized by the principal.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#0A192F] text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#0A192F]">Strict Authorization Protocols</h4>
                  <p className="text-xs text-slate-500">Multi-party cryptographic verification prevents unauthorized disbursement.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onInquire}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded transition-colors shadow-xs cursor-pointer border border-[#D4AF37]/30"
              >
                Inquire About Flex Funds Activation
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-lg border border-slate-200 bg-[#FAF9F6] p-8 space-y-6">
              <h3 className="text-base font-bold text-[#0A192F] border-b border-slate-200 pb-3">
                Flex Funds Operational Parameters
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded border border-slate-200 bg-white space-y-1">
                  <span className="text-slate-400 block text-[11px]">Silver Allocation</span>
                  <span className="text-base font-bold text-[#0A192F] tabular-nums">Up to $25,000</span>
                  <p className="text-[11px] text-slate-500">Basic travel disruption & acute deposits</p>
                </div>

                <div className="p-4 rounded border border-slate-200 bg-white space-y-1">
                  <span className="text-slate-400 block text-[11px]">Gold Allocation</span>
                  <span className="text-base font-bold text-[#0A192F] tabular-nums">Up to $100,000</span>
                  <p className="text-[11px] text-slate-500">Aeromedical charter & family extraction</p>
                </div>

                <div className="p-4 rounded border border-slate-200 bg-white space-y-1">
                  <span className="text-slate-400 block text-[11px]">Excelsior Allocation</span>
                  <span className="text-base font-bold text-[#0A192F]">Custom Facility</span>
                  <p className="text-[11px] text-slate-500">Corporate crisis reserve & escrow</p>
                </div>

                <div className="p-4 rounded border border-slate-200 bg-white space-y-1">
                  <span className="text-slate-400 block text-[11px]">Disbursement Window</span>
                  <span className="text-base font-bold text-emerald-800 tabular-nums">&lt; 30 Minutes</span>
                  <p className="text-[11px] text-slate-500">Upon cryptographic authorization</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-200 pt-3">
                * Operational Notice: Flex Funds activation terms, currency conversions, transaction fees, and custody terms are subject to formal underwriting and administrative verification.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
