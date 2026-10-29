import React from 'react';
import { Shield, Globe, Award, Lock, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onContact: () => void;
  onPartner: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onContact, onPartner }) => {
  return (
    <div className="bg-[#FAF9F6] text-slate-900 pb-20">
      {/* Hero header */}
      <div className="bg-[#0A192F] text-white py-16 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            Operational Philosophy & Governance
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            About R3 Contingencies
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Founded to provide elite international principals, family offices, and executive corporations with dependable crisis coordination, aeromedical extraction, and rapid liquidity reserves.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-lg border border-slate-200 bg-white shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-[#0A192F]">Our Mission</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To eliminate vulnerability for international travelers through meticulous advance preparation, trusted global networks, and decisive coordination when unpredictable disruptions occur.
            </p>
          </div>

          <div className="p-8 rounded-lg border border-slate-200 bg-white shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-[#0A192F]">Our Operational Vision</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To remain the gold standard in contingency coordination and emergency concierge services, combining discreet Swiss governance with instantaneous worldwide execution.
            </p>
          </div>
        </div>

        {/* Core Operational Values */}
        <div>
          <h2 className="text-xl font-bold text-[#0A192F] mb-6 text-center">
            Foundational Operational Pillars
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="w-8 h-8 rounded bg-[#0A192F] text-[#D4AF37] flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0A192F]">Absolute Discretion</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All principal identities, medical briefs, itineraries, and family contacts are encrypted and held in compliance with strict international confidentiality laws.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="w-8 h-8 rounded bg-[#0A192F] text-[#D4AF37] flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0A192F]">Sovereign Network Access</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We maintain direct operational agreements with verified charter operators, diplomatic fixers, private aeromedical services, and local security convoys across 60+ nations.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="w-8 h-8 rounded bg-[#0A192F] text-[#D4AF37] flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0A192F]">Integrity & Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We do not make unsupported claims or false guarantees. Every service level, response time, and partner relationship is governed by verifiable operational criteria.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-lg bg-[#0A192F] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-bold">Have specific operational questions?</h3>
            <p className="text-xs text-slate-300 mt-1">Our advisory desk is available for confidential discovery calls.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onContact}
              className="px-4 py-2 text-xs font-semibold text-[#0A192F] bg-[#D4AF37] hover:bg-[#e6c151] rounded cursor-pointer"
            >
              Contact Advisory Desk
            </button>
            <button
              onClick={onPartner}
              className="px-4 py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/15 rounded cursor-pointer"
            >
              Partner with R3
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
