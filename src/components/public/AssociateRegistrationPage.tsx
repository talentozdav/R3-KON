import React, { useState } from 'react';
import {
  Building2,
  User,
  CheckCircle2,
  AlertCircle,
  Shield,
  ArrowRight,
  Globe,
  Phone,
  Mail,
  FileText,
  Lock,
  X
} from 'lucide-react';
import { r3Logo } from '../../assets/images/index.ts';

interface AssociateRegistrationPageProps {
  onSuccessReturn?: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const AssociateRegistrationPage: React.FC<AssociateRegistrationPageProps> = ({
  onSuccessReturn,
  isModal = false,
  onClose
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    applicantType: 'business' as 'individual' | 'business',
    businessName: '',
    websiteOrSocial: '',
    promotionalMethod: 'Private Wealth Advisory & Direct Representation',
    relevantExperience: '',
    reasonForApplying: '',
    referralSponsorCode: '',
    termsAccepted: false,
    privacyAccepted: false
  });

  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errs.fullName = 'Full legal name is required (min 2 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Valid corporate or personal email address is required';
    }

    const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
    if (!formData.phone.trim() || cleanPhone.length < 7 || !formData.phone.includes('+')) {
      errs.phone = 'Valid international phone with country code is required (e.g., +41 22 819 4000)';
    }

    if (!formData.country.trim() || formData.country.trim().length < 2) {
      errs.country = 'Country of domicile is required';
    }

    if (formData.applicantType === 'business' && (!formData.businessName || formData.businessName.trim().length < 2)) {
      errs.businessName = 'Registered corporate entity name is required';
    }

    if (!formData.relevantExperience.trim() || formData.relevantExperience.trim().length < 10) {
      errs.relevantExperience = 'Please describe your relevant professional advisory background (min 10 characters)';
    }

    if (!formData.reasonForApplying.trim() || formData.reasonForApplying.trim().length < 10) {
      errs.reasonForApplying = 'Please provide your motivation and intended client introduction scope (min 10 characters)';
    }

    if (!formData.termsAccepted) {
      errs.termsAccepted = 'Agreement to R3 Associate Programme terms is required';
    }

    if (!formData.privacyAccepted) {
      errs.privacyAccepted = 'Consent to personal data processing under R3 compliance protocols is required';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit associate application.');
      }

      setSuccessId(data.application_id);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden my-6">
      {/* Header */}
      <div className="bg-[#0A192F] text-white px-8 py-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={r3Logo}
            alt="R3 Contingencies"
            className="h-9 w-auto object-contain rounded bg-black px-1.5 py-0.5 border border-slate-700"
          />
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
              R3 Associate Partner Credential Application
            </h2>
            <p className="text-xs text-slate-300">
              Institutional Representation & Business Referral Accreditation
            </p>
          </div>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-6 sm:p-8">
        {successId ? (
          <div className="py-12 text-center space-y-5 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-[#0A192F]">
              Associate Application Received
            </h3>

            <div className="p-4 rounded-md bg-[#FAF9F6] border border-slate-200 space-y-1">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Application Reference Dossier ID
              </div>
              <div className="font-mono text-sm font-bold text-[#0A192F] select-all">
                {successId}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your associate partner dossier has been securely logged to Supabase. R3 Compliance will review your background and credentials. 
              <strong> Associate privileges are not automatically granted.</strong> Upon administrative approval, you will receive activation credentials and your unique tracking code.
            </p>

            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={onSuccessReturn || onClose || (() => window.location.href = '/affiliate-partnership')}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded-md transition-colors cursor-pointer"
              >
                Return to Associate Programme
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-4 text-xs rounded bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Applicant Structure */}
            <div>
              <label className="block text-xs font-semibold text-[#0A192F] mb-1.5">
                Applicant Legal Structure *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, applicantType: 'business' })}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs rounded-md border transition-colors cursor-pointer ${
                    formData.applicantType === 'business'
                      ? 'border-[#0A192F] bg-slate-100 font-semibold text-[#0A192F]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Registered Corporate Entity
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, applicantType: 'individual' })}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs rounded-md border transition-colors cursor-pointer ${
                    formData.applicantType === 'individual'
                      ? 'border-[#0A192F] bg-slate-100 font-semibold text-[#0A192F]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Individual Advisor / Consultant
                </button>
              </div>
            </div>

            {/* Full Name & Business Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Lord Julian Sterling"
                  className={`w-full text-xs px-3 py-2.5 rounded border ${
                    validationErrors.fullName ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  } focus:border-[#0A192F] focus:outline-hidden`}
                />
                {validationErrors.fullName && (
                  <p className="mt-1 text-[11px] text-red-600">{validationErrors.fullName}</p>
                )}
              </div>

              {formData.applicantType === 'business' ? (
                <div>
                  <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                    Registered Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g. Sterling Family Office Advisory AG"
                    className={`w-full text-xs px-3 py-2.5 rounded border ${
                      validationErrors.businessName ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                    } focus:border-[#0A192F] focus:outline-hidden`}
                  />
                  {validationErrors.businessName && (
                    <p className="mt-1 text-[11px] text-red-600">{validationErrors.businessName}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                    Website or Social Profile (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.websiteOrSocial}
                    onChange={(e) => setFormData({ ...formData, websiteOrSocial: e.target.value })}
                    placeholder="https://linkedin.com/in/... or advisory firm site"
                    className="w-full text-xs px-3 py-2.5 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                  />
                </div>
              )}
            </div>

            {formData.applicantType === 'business' && (
              <div>
                <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                  Website or Social Media Profile (Optional)
                </label>
                <input
                  type="text"
                  value={formData.websiteOrSocial}
                  onChange={(e) => setFormData({ ...formData, websiteOrSocial: e.target.value })}
                  placeholder="https://sterlingadvisory.ch"
                  className="w-full text-xs px-3 py-2.5 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                />
              </div>
            )}

            {/* Email, Phone, Country */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="advisor@firm.com"
                  className={`w-full text-xs px-3 py-2.5 rounded border ${
                    validationErrors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  } focus:border-[#0A192F] focus:outline-hidden`}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-[11px] text-red-600">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                  Phone (with Country Code) *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+41 22 819 4000"
                  className={`w-full text-xs px-3 py-2.5 rounded border ${
                    validationErrors.phone ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  } focus:border-[#0A192F] focus:outline-hidden`}
                />
                {validationErrors.phone && (
                  <p className="mt-1 text-[11px] text-red-600">{validationErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                  Country of Domicile *
                </label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Switzerland"
                  className={`w-full text-xs px-3 py-2.5 rounded border ${
                    validationErrors.country ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  } focus:border-[#0A192F] focus:outline-hidden`}
                />
                {validationErrors.country && (
                  <p className="mt-1 text-[11px] text-red-600">{validationErrors.country}</p>
                )}
              </div>
            </div>

            {/* Preferred Promotional Method */}
            <div>
              <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                Preferred Promotional & Referral Method *
              </label>
              <select
                value={formData.promotionalMethod}
                onChange={(e) => setFormData({ ...formData, promotionalMethod: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden bg-white"
              >
                <option value="Private Wealth Advisory & Direct Representation">Private Wealth Advisory & Direct Client Representation</option>
                <option value="Family Office Liaison & Risk Consulting">Family Office Liaison & Risk Consulting</option>
                <option value="Executive Lifestyle & Concierge Desk">Executive Lifestyle & Concierge Desk</option>
                <option value="Aviation, Yachting & Maritime Brokerage">Aviation, Yachting & Maritime Brokerage</option>
                <option value="Institutional Corporate Advisory & Legal Counsel">Institutional Corporate Advisory & Legal Counsel</option>
                <option value="Digital Direct Referral & Private Syndication">Digital Direct Referral & Private Syndication</option>
                <option value="Other Commercial Referral Channel">Other Commercial Referral Channel</option>
              </select>
            </div>

            {/* Relevant Experience */}
            <div>
              <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                Relevant Advisory Experience & Network Scope *
              </label>
              <textarea
                required
                rows={3}
                value={formData.relevantExperience}
                onChange={(e) => setFormData({ ...formData, relevantExperience: e.target.value })}
                placeholder="Outline your professional advisory tenure, primary clientele profile, and geographical reach..."
                className={`w-full text-xs px-3 py-2 rounded border ${
                  validationErrors.relevantExperience ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                } focus:border-[#0A192F] focus:outline-hidden`}
              />
              {validationErrors.relevantExperience && (
                <p className="mt-1 text-[11px] text-red-600">{validationErrors.relevantExperience}</p>
              )}
            </div>

            {/* Reason for Applying */}
            <div>
              <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                Reason for Applying & Partnership Objectives *
              </label>
              <textarea
                required
                rows={3}
                value={formData.reasonForApplying}
                onChange={(e) => setFormData({ ...formData, reasonForApplying: e.target.value })}
                placeholder="Explain why you wish to represent R3 Contingencies and how you plan to introduce prospective clients..."
                className={`w-full text-xs px-3 py-2 rounded border ${
                  validationErrors.reasonForApplying ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                } focus:border-[#0A192F] focus:outline-hidden`}
              />
              {validationErrors.reasonForApplying && (
                <p className="mt-1 text-[11px] text-red-600">{validationErrors.reasonForApplying}</p>
              )}
            </div>

            {/* Referral / Sponsor Code */}
            <div>
              <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                Referral or Sponsor Code (Optional)
              </label>
              <input
                type="text"
                value={formData.referralSponsorCode}
                onChange={(e) => setFormData({ ...formData, referralSponsorCode: e.target.value })}
                placeholder="e.g. R3-48192 or sponsor advisory firm"
                className="w-full text-xs px-3 py-2.5 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
              />
            </div>

            {/* Terms and Consent Checkboxes */}
            <div className="pt-2 space-y-3 border-t border-slate-200">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="mt-0.5 rounded text-[#0A192F] focus:ring-[#0A192F]"
                />
                <span>
                  I confirm that all provided information is accurate and agree to the <strong>R3 Associate Partner Programme Terms</strong>, including strict confidentiality obligations and administrative commission verification.
                </span>
              </label>
              {validationErrors.termsAccepted && (
                <p className="text-[11px] text-red-600 ml-6">{validationErrors.termsAccepted}</p>
              )}

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.privacyAccepted}
                  onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                  className="mt-0.5 rounded text-[#0A192F] focus:ring-[#0A192F]"
                />
                <span>
                  I consent to the necessary processing of personal data by R3 Contingencies and authorized compliance officers for due diligence, accreditation, and administrative management.
                </span>
              </label>
              {validationErrors.privacyAccepted && (
                <p className="text-[11px] text-red-600 ml-6">{validationErrors.privacyAccepted}</p>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <div className="text-[11px] text-slate-500">
                🔒 Encrypted transmission under R3 Compliance governance.
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded-md transition-colors disabled:opacity-50 cursor-pointer shadow-xs border border-[#D4AF37]/30 flex items-center gap-2"
              >
                <span>{loading ? 'Submitting Dossier...' : 'Submit Associate Application'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12 px-4 sm:px-6">
      {content}
    </div>
  );
};
