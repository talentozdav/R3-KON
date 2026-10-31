import React from 'react';
import { ArrowRight, Plane, Shield, Truck, AlertCircle, PhoneCall, Headphones, FileText, CheckCircle } from 'lucide-react';
import {
  medicalEvacuationImg,
  secureLogisticsImg,
  heroCoordinationImg,
  conciergeHqImg
} from '../../assets/images/index.ts';

interface ServicesPageProps {
  onInquire: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onInquire }) => {
  const serviceList = [
    {
      id: 'medical-evacuation',
      number: '01',
      title: 'Emergency Assistance & Medical Evacuation Coordination',
      category: 'Crisis Response',
      image: medicalEvacuationImg,
      description: 'Orchestration of emergency aeromedical evacuation, private air ambulances with onboard intensive care units, and bilateral hospital transfer logistics.',
      involves: [
        'Vetted private aircraft selection and fast-track flight clearances',
        'Bedside-to-bedside medical escort by certified flight physicians',
        'Direct hospital admissions and international language coordination',
        'Cross-border customs and medical documentation clearance'
      ],
      howToRequest: 'Contact the 24/7 Operations Desk via encrypted channel or dedicated telephone protocol. Coordinators initiate protocol within 15 minutes of triage.',
      disclaimer: 'R3 Contingencies coordinates third-party certified medical air operators and does not provide direct medical treatment.'
    },
    {
      id: 'secure-logistics',
      number: '02',
      title: 'Armored Transportation & Secure Logistics',
      category: 'Mobility & Protection',
      image: secureLogisticsImg,
      description: 'Coordination of discreet, armored executive vehicles, vetted security chauffeurs, and tactical itinerary routing in metropolitan and remote environments.',
      involves: [
        'B6/B7 armored vehicle procurement and logistical positioning',
        'Vetted local security drivers with evasive driving certifications',
        'Pre-vetted route planning and safe-haven mapping',
        'Discreet embassy and private terminal arrivals'
      ],
      howToRequest: 'Advance notification of 24–48 hours recommended. Emergency extractions initiated immediately via contingency dispatch.',
      disclaimer: 'Armored vehicle operations are subject to regional jurisdiction laws and permit approvals.'
    },
    {
      id: 'travel-disruption',
      number: '03',
      title: 'Travel Disruption & Emergency Aviation Rerouting',
      category: 'Mobility Logistics',
      image: heroCoordinationImg,
      description: 'Immediate rechartering, airspace workaround planning, and priority commercial airline rebooking during strikes, geopolitical tensions, or severe weather.',
      involves: [
        'Rapid private jet charter routing through regional fixed-base operators (FBOs)',
        'Alternative border crossing logistics via maritime or high-speed rail',
        'Executive hotel suite reallocations during city-wide occupancy surges',
        'Immigration and visa clearance assistance for stranded principals'
      ],
      howToRequest: 'Direct dispatch via R3 app or dedicated coordinator hotline.',
      disclaimer: 'Private aviation charter availability is subject to aircraft positioning and air traffic control authorizations.'
    },
    {
      id: 'operations-desk',
      number: '04',
      title: 'Executive Concierge & 24/7 Global Dispatch Desk',
      category: 'Command & Advisory',
      image: conciergeHqImg,
      description: 'Centralized operational support for international principals, handling discreet personal logistics, urgent overseas procurement, and communications relay.',
      involves: [
        'Continuous monitoring of global geopolitical flashpoints and travel alerts',
        'Family and business associate contact relay during communications blackouts',
        'Urgent overseas procurement of rare medications, critical documents, or replacement equipment',
        'Direct interface with personal family office staff and private security details'
      ],
      howToRequest: 'Available 24/7/365 to all active Silver, Gold, and Excelsior members.',
      disclaimer: 'Concierge services do not supersede municipal emergency rescue services in active warzones or natural disasters.'
    }
  ];

  return (
    <div className="bg-[#FAF9F6] text-slate-900 pb-20">
      <div className="bg-[#0A192F] text-white py-16 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            Comprehensive Crisis & Concierge Matrix
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Contingency Capabilities
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Detailed breakdown of our international response capabilities, operational requirements, and assistance coordination protocols.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        <div className="space-y-12">
          {serviceList.map((svc) => (
            <div
              key={svc.id}
              className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-5 relative h-64 lg:h-auto min-h-[260px] bg-slate-900">
                  <img
                    src={svc.image}
                    alt={svc.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#0A192F]/80 backdrop-blur-xs text-[#D4AF37] text-xs font-mono font-bold px-2.5 py-1 rounded border border-[#D4AF37]/30">
                    {svc.number} // {svc.category}
                  </div>
                </div>

                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#0A192F] mb-2">{svc.title}</h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {svc.description}
                    </p>

                    <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-2">
                      What the Coordination Involves:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 mb-4">
                      {svc.involves.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                      <span className="font-semibold text-slate-800 block">How to request:</span>
                      <p className="text-slate-600 text-[11px]">{svc.howToRequest}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-[11px] text-slate-400 italic max-w-md">
                      * {svc.disclaimer}
                    </p>
                    <button
                      onClick={onInquire}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded transition-colors shadow-xs cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Inquire on Service
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
