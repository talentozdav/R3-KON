import React from 'react';
import { Users, FileCheck, ArrowRight, Shield, Award, CheckCircle } from 'lucide-react';

interface AffiliateSectionProps {
  onApply: () => void;
  onOpenPortal: () => void;
}

export const AffiliateSection: React.FC<AffiliateSectionProps> = ({ onApply, onOpenPortal }) => {
  return (
    <section id="affiliates" className="py-20 bg-[#FAF9F6] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-14">
          <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
            Institutional Partnerships
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A192F]" style={{ textWrap: 'balance' }}>
            R3 Global Affiliate & Advisory Partner Network
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            We partner with wealth managers, private family offices, international concierge firms, aviation brokers, and corporate risk advisors to introduce verified clients to R3 Contingencies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="rounded-lg border border-slate-200 bg-white p-7 space-y-4 shadow-xs">
            <div className="w-9 h-9 rounded bg-[#0A192F] text-[#D4AF37] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#0A192F]">Worldwide Partner Eligibility</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Applications are open to qualified individuals and corporate entities worldwide. Every partner undergoes thorough compliance screening, ensuring brand alignment and principal discretion.
            </p>
            <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Individuals & Registered Corporate Entities</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-7 space-y-4 shadow-xs">
            <div className="w-9 h-9 rounded bg-[#0A192F] text-[#D4AF37] flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#0A192F]">Manual Administrative Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To ensure highest financial integrity, every client conversion is manually audited and verified by authorized R3 administrators against treasury receipts before entering the commission ledger.
            </p>
            <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Auditable, Tamper-Proof Ledger</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-7 space-y-4 shadow-xs">
            <div className="w-9 h-9 rounded bg-[#0A192F] text-[#D4AF37] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#0A192F]">Monthly Payout Settlements</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verified commissions are grouped into monthly payout batches, reconciled in major currencies (USD, EUR, GBP, CHF), and settled directly to your designated international corporate account.
            </p>
            <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Monthly Reconciled Bank Settlements</span>
            </div>
          </div>
        </div>

        {/* Action card */}
        <div className="mt-12 rounded-lg bg-[#0A192F] border border-slate-800 p-8 sm:p-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-xl font-bold tracking-tight text-white">
              Ready to introduce your clientele to R3 Contingencies?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Submit your credential application online. Approved partners receive a unique referral ID, custom tracking links, marketing briefs, and full portal reporting.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onApply}
              className="px-5 py-2.5 text-xs font-semibold text-[#0A192F] bg-[#D4AF37] hover:bg-[#e6c151] rounded transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              Submit Partner Application
            </button>
            <button
              onClick={onOpenPortal}
              className="px-4 py-2.5 text-xs font-medium text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded transition-colors cursor-pointer whitespace-nowrap"
            >
              Existing Partner Login
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
