import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Building2, User, Shield } from 'lucide-react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    applicantType: 'business' as 'individual' | 'business',
    businessName: '',
    email: '',
    phone: '',
    country: '',
    partnershipType: 'Private Wealth Advisory',
    industryBackground: '',
    audienceDescription: '',
    partnershipObjectives: '',
    additionalNotes: '',
    termsAccepted: false,
    privacyAccepted: false
  });

  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccessId(data.application_id);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#0A192F] text-white">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/Screenshot_20261029_112009_Gallery_b65df3d1.jpg"
              alt="R3 Contingencies"
              className="h-7 w-auto object-contain rounded bg-black px-1 border border-slate-700"
            />
            <h3 className="text-sm font-bold tracking-tight">
              R3 Affiliate Partner Credential Application
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {successId ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#0A192F]">
                Application Successfully Logged
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Your partnership dossier has been received by R3 Compliance under reference{' '}
                <span className="font-mono font-semibold text-[#0A192F]">{successId}</span>. Authorized staff will review your background and transmit an encrypted account activation invitation upon approval.
              </p>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#0A192F] rounded hover:bg-[#112240] transition-colors cursor-pointer"
                >
                  Return to Platform
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 text-xs rounded bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Applicant Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#0A192F] mb-1.5">
                  Applicant Structure *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, applicantType: 'business' })}
                    className={`flex items-center justify-center gap-2 py-2 px-3 text-xs rounded border transition-colors cursor-pointer ${
                      formData.applicantType === 'business'
                        ? 'border-[#0A192F] bg-slate-100 font-semibold text-[#0A192F]'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Corporate Entity / Advisory Practice
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, applicantType: 'individual' })}
                    className={`flex items-center justify-center gap-2 py-2 px-3 text-xs rounded border transition-colors cursor-pointer ${
                      formData.applicantType === 'individual'
                        ? 'border-[#0A192F] bg-slate-100 font-semibold text-[#0A192F]'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Individual Advisor / Consultant
                  </button>
                </div>
              </div>

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
                    placeholder="e.g. Alexander Vance"
                    className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                  />
                </div>

                {formData.applicantType === 'business' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                      Registered Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="Crestview Executive Concierge AG"
                      className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

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
                    placeholder="partner@firm.ch"
                    className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                    Phone (with country code) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+41 79 123 4567"
                    className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                  />
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
                    className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                  Partnership Category / Sector *
                </label>
                <select
                  value={formData.partnershipType}
                  onChange={(e) => setFormData({ ...formData, partnershipType: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                >
                  <option value="Private Wealth Advisory">Private Wealth & Family Office Advisory</option>
                  <option value="Executive Concierge">Executive Concierge & Lifestyle Management</option>
                  <option value="Aviation & Maritime Brokerage">Aviation, Superyacht & Maritime Brokerage</option>
                  <option value="Corporate Mobility & Risk">Corporate Mobility & Security Risk Consulting</option>
                  <option value="International Legal Counsel">International Legal Counsel & Trust Advisory</option>
                  <option value="Other Commercial Partner">Other Commercial Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                  Professional Background & Experience *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.industryBackground}
                  onChange={(e) => setFormData({ ...formData, industryBackground: e.target.value })}
                  placeholder="Summarize your firm's advisory tenure and principal clientele..."
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                  Existing Network & Audience Reach *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.audienceDescription}
                  onChange={(e) => setFormData({ ...formData, audienceDescription: e.target.value })}
                  placeholder="Detail your network scope (e.g. 50+ UHNW principals, corporate flight departments)..."
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                  Partnership Objectives *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.partnershipObjectives}
                  onChange={(e) => setFormData({ ...formData, partnershipObjectives: e.target.value })}
                  placeholder="What is your projected referral strategy and client interest?"
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className="mt-0.5 rounded text-[#0A192F]"
                  />
                  <span>
                    I accept the R3 Contingencies Affiliate Terms, acknowledging that commissions are percentage-based upon verified sales and manually approved by R3 administrators.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.privacyAccepted}
                    onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                    className="mt-0.5 rounded text-[#0A192F]"
                  />
                  <span>
                    I confirm acceptance of the R3 Privacy Notice and consent to professional background verification.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
