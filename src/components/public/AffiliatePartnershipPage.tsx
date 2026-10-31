import React, { useState } from 'react';
import {
  Users,
  Building2,
  FileCheck,
  CheckCircle,
  ArrowRight,
  Shield,
  Award,
  Globe,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Search,
  Clock,
  Lock,
  DollarSign,
  TrendingUp,
  FileText,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { heroCoordinationImg } from '../../assets/images/index.ts';

interface AffiliatePartnershipPageProps {
  onApply: () => void;
  onOpenPortal: () => void;
}

export const AffiliatePartnershipPage: React.FC<AffiliatePartnershipPageProps> = ({
  onApply,
  onOpenPortal
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [statusRef, setStatusRef] = useState('');
  const [statusEmail, setStatusEmail] = useState('');
  const [statusResult, setStatusResult] = useState<any>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusRef.trim() || !statusEmail.trim()) {
      setStatusError('Both application reference and email address are required.');
      return;
    }

    setStatusLoading(true);
    setStatusError(null);
    setStatusResult(null);

    try {
      const res = await fetch(`/api/applications/${encodeURIComponent(statusRef.trim())}/status?email=${encodeURIComponent(statusEmail.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Application reference not found.');
      }
      setStatusResult(data.application);
    } catch (err: any) {
      setStatusError(err.message || 'Unable to retrieve application status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    {
      q: 'Who is eligible to apply for the R3 Associate Partner Programme?',
      a: 'The programme is open to qualified individuals, registered businesses, independent business development professionals, private wealth advisory firms, family office consultants, executive concierge desks, and accredited referral partners worldwide. All applications are subject to R3 compliance vetting.'
    },
    {
      q: 'How does an Associate Partner differ from an R3 Member?',
      a: 'R3 Members are private clients who contract for emergency contingency protection, medical evacuation, and sovereign crisis services. Associate Partners are commercial representatives and advisors who introduce new prospective clients to R3 and receive approved commissions on verified business referrals.'
    },
    {
      q: 'How long does the application review process take?',
      a: 'R3 Compliance conducts thorough due diligence on all applicant dossiers. Reviews are typically completed within 2 business days. If additional documentation is required, our partner desk will reach out directly to your nominated contact.'
    },
    {
      q: 'How are client referrals tracked and attributed?',
      a: 'Approved Associate Partners receive a unique Associate ID and custom tracking link. When prospective clients visit R3 Contingencies via your tracking link, a secure 60-day attribution session is established on our server. Referrals are tracked and linked to your partner dossier.'
    },
    {
      q: 'How are sales verified and commissions approved?',
      a: 'To guarantee absolute financial integrity, every completed membership or retainer is manually audited and verified by authorized R3 administrators against treasury bank receipts before entering the commission ledger. Associates earn an approved percentage on eligible sales.'
    },
    {
      q: 'When and how are partner commission payouts distributed?',
      a: 'Verified commissions enter monthly payout settlement batches. Payouts are reconciled and distributed to your designated corporate bank account via international wire, SWIFT, or SEPA in major currencies (USD, EUR, GBP, CHF). Specific payout schedules and commercial terms are confirmed upon accreditation.'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Submit Associate Application',
      description: 'Complete the comprehensive online credential application detailing your professional background and client network.'
    },
    {
      step: '02',
      title: 'R3 Compliance Review',
      description: 'Authorized R3 compliance officers review your credentials, verify organizational background, and conduct due diligence.'
    },
    {
      step: '03',
      title: 'Receive Official Approval',
      description: 'Upon successful vetting, your Associate Partner accreditation is granted and an activation dossier is prepared.'
    },
    {
      step: '04',
      title: 'Access Associate Portal',
      description: 'Log in to your private, protected Associate Partner Dashboard with multi-tier access and cryptographic session management.'
    },
    {
      step: '05',
      title: 'Receive Referral Code',
      description: 'Receive your unique Associate ID (e.g., R3-XXXXX) and encrypted referral tracking link with a 60-day attribution window.'
    },
    {
      step: '06',
      title: 'Refer Potential Customers',
      description: 'Introduce high-net-worth principals, corporate mobility directors, and family offices using approved executive briefing materials.'
    },
    {
      step: '07',
      title: 'R3 Administrative Verification',
      description: 'R3 administrators independently audit completed client retainers against confirmed treasury receipts before commission entry.'
    },
    {
      step: '08',
      title: 'Monthly Payout Settlements',
      description: 'Receive approved commission distributions settled directly to your institutional banking account on regular monthly cycles.'
    }
  ];

  return (
    <div className="bg-[#FAF9F6] text-slate-900">
      {/* SECTION A: HERO SECTION */}
      <section className="relative overflow-hidden bg-[#0A192F] text-white border-b border-slate-800">
        <div className="absolute inset-0 z-0 opacity-20 mix-blend-luminosity">
          <img
            src={heroCoordinationImg}
            alt="R3 Global Command Console"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:py-36">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Institutional Representative Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
              Become an R3 Associate Partner
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Partner with R3 Contingencies, introduce new opportunities and earn commissions on eligible, verified business referrals.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onApply}
                className="px-6 py-3 text-sm font-semibold text-[#0A192F] bg-[#D4AF37] hover:bg-[#e5bf45] rounded-md transition-colors shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>Become an Associate</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={scrollToHowItWorks}
                className="px-5 py-3 text-sm font-medium text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-md transition-colors cursor-pointer"
              >
                How It Works
              </button>

              <button
                onClick={onOpenPortal}
                className="px-5 py-3 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer ml-auto sm:ml-0"
              >
                Existing Associate Login →
              </button>
            </div>

            <div className="pt-2 text-xs text-slate-400">
              * Commercial agreements and eligible sale calculations are administered strictly in accordance with approved R3 terms and governance. No unapproved income guarantees.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: ABOUT THE PARTNERSHIP */}
      <section className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                Strategic Alliance Model
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A192F]">
                About the Associate Partner Programme
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                R3 Contingencies welcomes qualified individuals and corporate enterprises interested in promoting our executive contingency, crisis response, and emergency coordination services to their principal clientele.
              </p>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Our Associate Partner Programme is fundamentally distinct from our private client membership. While members retain R3 for direct contingency protection, associates act as respected intermediaries, wealth managers, and business developers who introduce accredited opportunities to our advisory desk.
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md border border-slate-200 bg-[#FAF9F6]">
                  <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-1">
                    Pathway One: Membership
                  </h4>
                  <p className="text-xs text-slate-600">
                    For private individuals, family offices, and multinational corporations requiring contingency coverage.
                  </p>
                </div>
                <div className="p-4 rounded-md border border-[#D4AF37]/40 bg-amber-50/50">
                  <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-1">
                    Pathway Two: Associate Partner
                  </h4>
                  <p className="text-xs text-slate-600">
                    For professionals and organizations introducing verified referrals and earning eligible commissions.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-lg bg-[#0A192F] text-white border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Discretion & Operational Sanctity</h3>
                  <p className="text-xs text-slate-400">Institutional Governance & Regulatory Adherence</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every client referral is managed under non-disclosure protocols. Associates never have visibility into sensitive client medical dossiers, evacuation manifests, or personal communications. All commission determinations are independently audited and backed by verifiable treasury documentation.
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>International Application Support</span>
                <span className="text-[#D4AF37] font-semibold">Subject to Compliance Vetting</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION C: WHO CAN APPLY */}
      <section className="py-20 border-b border-slate-200 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-14">
            <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
              Candidate Accreditation
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A192F]">
              Who Can Apply?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              The programme is intended to support accredited international applicants across specialized professional sectors, subject to R3’s approved eligibility criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 rounded bg-[#0A192F] text-[#D4AF37] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0A192F]">Qualified Individuals</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Independent corporate advisors, private wealth consultants, family office liaisons, and trusted personal representatives with established high-net-worth relationships.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 rounded bg-[#0A192F] text-[#D4AF37] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0A192F]">Registered Businesses</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Incorporated advisory practices, luxury lifestyle management companies, private aviation and maritime brokerages, and corporate travel risk management consultancies.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 rounded bg-[#0A192F] text-[#D4AF37] flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0A192F]">Independent Business Development</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Commercial intermediaries, international contract originators, and deal facilitators operating across global financial hubs and sovereign jurisdictions.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 rounded bg-[#0A192F] text-[#D4AF37] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0A192F]">Marketing & Referral Partners</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Institutional marketing partners and strategic syndicates representing executive publications, private investor networks, and selective member clubs.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 rounded bg-[#0A192F] text-[#D4AF37] flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0A192F]">Other Eligible Organisations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                International legal counsel, sovereign trust administrators, and security logistics firms wishing to expand their emergency capabilities through R3 Contingencies.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-[#0A192F] to-[#112240] text-white border border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">International Scope</span>
                <h3 className="text-base font-bold text-white">Global Accreditation</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Applications are accepted from over 60 approved jurisdictions. All associates undergo AML and sanctions screening.
                </p>
              </div>
              <button
                onClick={onApply}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] hover:text-white cursor-pointer"
              >
                <span>Submit Candidate Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION D: HOW THE PROGRAMME WORKS */}
      <section id="how-it-works" className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
              Structured Operations
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A192F]">
              How the Associate Programme Works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              From application submission to monthly payout settlements, every stage is clearly defined, transparently tracked, and administratively supervised.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, i) => (
              <div key={i} className="p-6 rounded-lg border border-slate-200 bg-[#FAF9F6] relative space-y-3">
                <div className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase">
                  Step {st.step}
                </div>
                <h3 className="text-sm font-bold text-[#0A192F] leading-snug">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {st.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION E: PARTNERSHIP BENEFITS */}
      <section className="py-20 border-b border-slate-200 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-14">
            <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
              Institutional Advantages
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A192F]">
              Partnership Benefits
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              We empower our Associate Partners with robust operational infrastructure, absolute attribution accuracy, and professional administrative support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 rounded bg-amber-50 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0A192F]">Tamper-Proof Audit Ledger</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every referral event, qualified inquiry, and verified conversion is permanently logged in an auditable ledger. You receive transparent accounting on all activity.
              </p>
            </div>

            <div className="p-7 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 rounded bg-amber-50 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0A192F]">60-Day Referral Attribution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When a prospective client enters via your referral link, our server locks in a 60-day attribution window, protecting your commercial introductions.
              </p>
            </div>

            <div className="p-7 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 rounded bg-amber-50 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0A192F]">Multi-Currency Monthly Payouts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Commissions are grouped into monthly reconciliation batches and remitted to your corporate banking account in USD, EUR, GBP, or CHF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRACKING & APPLICATION STATUS LOOKUP WIDGET */}
      <section className="py-16 border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="p-8 rounded-lg bg-[#FAF9F6] border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-base font-bold text-[#0A192F]">
                Track Existing Application Status
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Have you already submitted an associate partner application? Enter your application reference ID and email address below to review current review progress.
            </p>

            <form onSubmit={handleCheckStatus} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Application Reference (UUID)"
                value={statusRef}
                onChange={(e) => setStatusRef(e.target.value)}
                className="text-xs px-3 py-2.5 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden bg-white"
              />
              <input
                type="email"
                required
                placeholder="Applicant Email Address"
                value={statusEmail}
                onChange={(e) => setStatusEmail(e.target.value)}
                className="text-xs px-3 py-2.5 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden bg-white"
              />
              <button
                type="submit"
                disabled={statusLoading}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                {statusLoading ? 'Checking...' : 'Check Status'}
              </button>
            </form>

            {statusError && (
              <div className="mt-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
                {statusError}
              </div>
            )}

            {statusResult && (
              <div className="mt-6 p-4 rounded bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0A192F]">{statusResult.full_name}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                    statusResult.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : statusResult.status === 'pending_review' || statusResult.status === 'under_review' || statusResult.status === 'submitted'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {statusResult.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Application Reference: <span className="font-mono text-[#0A192F]">{statusResult.id}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Logged on {new Date(statusResult.created_at).toLocaleDateString()} — R3 Compliance Review in progress.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION F: FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 border-b border-slate-200 bg-[#FAF9F6]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
              Programme Clarifications
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A192F]">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Clear answers regarding applications, eligibility, attribution tracking, and commission approval.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((f, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
                >
                  <span className="text-xs sm:text-sm font-bold text-[#0A192F]">
                    {f.q}
                  </span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION G: CALL TO ACTION */}
      <section className="py-20 bg-[#0A192F] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Ready to partner with R3?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Submit your associate application online. Our compliance and partner advisory desk will review your submission and initiate your partner accreditation.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onApply}
              className="px-6 py-3 text-xs sm:text-sm font-semibold text-[#0A192F] bg-[#D4AF37] hover:bg-[#e5bf45] rounded-md transition-colors shadow-md cursor-pointer flex items-center gap-2"
            >
              <span>Apply to Become an Associate</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenPortal}
              className="px-5 py-3 text-xs sm:text-sm font-medium text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-md transition-colors cursor-pointer"
            >
              Access Associate Portal
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
