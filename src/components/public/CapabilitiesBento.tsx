import React from 'react';
import { Shield, Plane, Truck, Headphones, Briefcase, FileCheck } from 'lucide-react';

export const CapabilitiesBento: React.FC = () => {
  return (
    <section id="capabilities" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-14">
          <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
            Operational Capabilities
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A192F]" style={{ textWrap: 'balance' }}>
            Bespoke Contingency Coordination & Executive Concierge
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Every service is orchestrated through vetted international partners, strict operational protocols, and dedicated crisis managers. R3 does not guarantee automatic resolution in force majeure scenarios, but executes predetermined contingency plans with speed and precision.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Medical Air Evacuation (col-span-2) */}
          <div className="md:col-span-2 rounded-lg border border-slate-200 bg-[#FAF9F6] overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-colors">
            <div className="p-7">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span className="font-semibold text-[#0A192F]">01. Emergency Assistance & Medical Extraction</span>
                <span>Air & Ground Coordination</span>
              </div>
              <h3 className="text-xl font-bold text-[#0A192F] mb-2">
                Rapid Aeromedical Evacuation Protocols
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                When medical crises strike abroad, R3 coordinates private ICU-equipped aircraft, specialized flight physicians, and seamless hospital-to-hospital transfers across international borders.
              </p>
            </div>
            <div className="relative h-64 sm:h-72 w-full overflow-hidden border-t border-slate-200">
              <img
                src="/src/assets/images/service_medical_evacuation_1793266608168.jpg"
                alt="R3 Medical Evacuation Aircraft and Emergency Crew"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 text-xs font-medium text-white">
                Vetted worldwide aeromedical charter network
              </div>
            </div>
          </div>

          {/* Card 2: 24/7 Global Command */}
          <div className="rounded-lg border border-slate-200 bg-[#FAF9F6] overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-colors">
            <div className="p-7">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span className="font-semibold text-[#0A192F]">02. 24/7 Global Desk</span>
                <span>Command Center</span>
              </div>
              <h3 className="text-lg font-bold text-[#0A192F] mb-2">
                Executive Crisis Concierge Desk
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Direct access to seasoned contingency coordinators stationed in Geneva, London, and Singapore with comprehensive protocol tracking.
              </p>
            </div>
            <div className="relative h-56 w-full overflow-hidden border-t border-slate-200">
              <img
                src="/src/assets/images/service_concierge_hq_1793266608252.jpg"
                alt="24/7 Crisis Command Dispatch Room"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 text-xs font-medium text-white">
                Multilingual contingency operators
              </div>
            </div>
          </div>

          {/* Card 3: Secure Ground Logistics */}
          <div className="rounded-lg border border-slate-200 bg-[#FAF9F6] overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-colors">
            <div className="p-7">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span className="font-semibold text-[#0A192F]">03. Secure Transportation</span>
                <span>Armored & Diplomatic</span>
              </div>
              <h3 className="text-lg font-bold text-[#0A192F] mb-2">
                Armored Transit & Evacuation
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Coordination of discreet, armored executive transport convoys and professional drivers in volatile or unfamiliar regions.
              </p>
            </div>
            <div className="relative h-56 w-full overflow-hidden border-t border-slate-200">
              <img
                src="/src/assets/images/service_secure_logistics_1793266608773.jpg"
                alt="Discreet Armored Executive Transport Convoy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 text-xs font-medium text-white">
                Discreet embassy and principal mobility
              </div>
            </div>
          </div>

          {/* Card 4: Travel Disruption & Accommodation */}
          <div className="rounded-lg border border-slate-200 bg-[#FAF9F6] p-7 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="w-9 h-9 rounded bg-[#0A192F] text-[#D4AF37] flex items-center justify-center mb-5">
                <Plane className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-500 mb-1">04. Travel Disruption</div>
              <h3 className="text-base font-bold text-[#0A192F] mb-2">
                Priority Rerouting & Jet Charters
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Emergency private aviation reallocation during airline strikes, airspace closures, severe weather, or regional geopolitical unrest.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-200/80 mt-6 flex items-center justify-between text-xs text-slate-500">
              <span>Immediate Charter Routing</span>
              <span className="font-mono text-[11px] text-[#0A192F]">Tier-specific</span>
            </div>
          </div>

          {/* Card 5: Emergency Procurement & Flex Funds */}
          <div className="rounded-lg border border-slate-200 bg-[#FAF9F6] p-7 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="w-9 h-9 rounded bg-[#0A192F] text-[#D4AF37] flex items-center justify-center mb-5">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-500 mb-1">05. Procurement & Flex Funds</div>
              <h3 className="text-base font-bold text-[#0A192F] mb-2">
                Discreet Capital Liquidity Escrow
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Emergency disbursement of vital logistical capital and procurement assistance without delays from international banking cut-offs.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-200/80 mt-6 flex items-center justify-between text-xs text-slate-500">
              <span>Capital Readiness</span>
              <span className="font-mono text-[11px] text-[#0A192F]">Subject to approval</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
