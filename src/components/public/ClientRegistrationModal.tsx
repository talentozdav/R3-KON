import React, { useState } from 'react';
import { X, Shield, CheckCircle, AlertCircle, Building2, User, Phone, Mail, Globe, MessageSquare } from 'lucide-react';
import { r3Logo } from '../../assets/images/index.ts';

interface ClientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string | null;
}

export const ClientRegistrationModal: React.FC<ClientRegistrationModalProps> = ({
  isOpen,
  onClose,
  referralCode
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    clientType: 'individual' as 'individual' | 'business',
    companyName: '',
    serviceOfInterest: 'Emergency Contingency & Evacuation Coordination',
    additionalMessage: '',
    preferredContactMethod: 'email' as 'email' | 'phone' | 'whatsapp',
    consentContacted: false
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name is required (minimum 2 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'A valid corporate or personal email address is required';
    }

    // Phone validation with international country code (+ sign and at least 7 digits)
    const phoneClean = formData.phone.replace(/[\s\-\(\)]/g, '');
    if (!formData.phone.trim() || phoneClean.length < 7 || !formData.phone.includes('+')) {
      errors.phone = 'Valid international phone with country code is required (e.g., +1 212 555 0199 or +41 22 819 4000)';
    }

    if (!formData.country.trim() || formData.country.trim().length < 2) {
      errors.country = 'Country or territory of residence is required';
    }

    if (formData.clientType === 'business' && (!formData.companyName || formData.companyName.trim().length < 2)) {
      errors.companyName = 'Company / Family Office name is required for corporate registration';
    }

    if (!formData.consentContacted) {
      errors.consentContacted = 'Your consent to be contacted by R3 Operations is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setServerMessage(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/client/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          referralCode: referralCode || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Registration failed. Please verify your details.');
      }

      setSubmitted(true);
      setServerMessage(data.message || 'Registration successfully recorded.');
    } catch (err: any) {
      setError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      country: '',
      clientType: 'individual',
      companyName: '',
      serviceOfInterest: 'Emergency Contingency & Evacuation Coordination',
      additionalMessage: '',
      preferredContactMethod: 'email',
      consentContacted: false
    });
    setSubmitted(false);
    setError(null);
    setServerMessage(null);
    setValidationErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#0A192F] text-white">
          <div className="flex items-center gap-3">
            <img
              src={r3Logo}
              alt="R3 Contingencies"
              className="h-8 w-auto object-contain rounded bg-black px-1.5 py-0.5 border border-slate-700"
            />
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">Client Registration & Advisory Intake</h3>
              <p className="text-[11px] text-slate-300">Confidential Contingency & Bespoke Protection Services</p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-[#0A192F]">Registration Received</h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {serverMessage || 'Your confidential client profile has been registered with R3 Contingencies. A Senior Operations Commander will review your inquiry and initiate contact via your preferred method.'}
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs text-slate-600 max-w-md mx-auto text-left space-y-1 font-mono">
              <div><span className="text-slate-400">Client:</span> {formData.fullName}</div>
              <div><span className="text-slate-400">Contact:</span> {formData.email} · {formData.phone}</div>
              <div><span className="text-slate-400">Preferred Channel:</span> {formData.preferredContactMethod.toUpperCase()}</div>
              <div><span className="text-slate-400">Service:</span> {formData.serviceOfInterest}</div>
            </div>
            <button
              onClick={resetForm}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded transition-colors cursor-pointer shadow-xs"
            >
              Return to Website
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1 leading-relaxed">
                  <p className="font-semibold">Registration Submission Error</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {referralCode && (
              <div className="bg-[#FAF9F6] border border-[#D4AF37]/30 px-3.5 py-2 rounded text-xs text-slate-700 flex items-center justify-between">
                <span className="text-slate-500">Partner Referral Attribution:</span>
                <span className="font-mono font-semibold text-[#0A192F]">{referralCode}</span>
              </div>
            )}

            {/* Client Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Registration Category *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, clientType: 'individual' })}
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded border cursor-pointer transition-colors ${
                    formData.clientType === 'individual'
                      ? 'bg-[#0A192F] text-white border-[#0A192F]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> Private Individual / Principal
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, clientType: 'business' })}
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded border cursor-pointer transition-colors ${
                    formData.clientType === 'business'
                      ? 'bg-[#0A192F] text-white border-[#0A192F]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Corporate / Family Office
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Vance or Lord Alistair"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full px-3 py-2 text-xs border rounded focus:outline-hidden focus:ring-1 focus:ring-[#0A192F] ${
                    validationErrors.fullName ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {validationErrors.fullName && (
                  <p className="text-[11px] text-red-600 mt-1">{validationErrors.fullName}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate / Principal Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="marcus.vance@crestview.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 text-xs border rounded focus:outline-hidden focus:ring-1 focus:ring-[#0A192F] ${
                    validationErrors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {validationErrors.email && (
                  <p className="text-[11px] text-red-600 mt-1">{validationErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone with Country Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone (with Country Code) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+41 22 819 4000 or +1 (931) 366-0615"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3 py-2 text-xs border rounded focus:outline-hidden focus:ring-1 focus:ring-[#0A192F] ${
                    validationErrors.phone ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {validationErrors.phone && (
                  <p className="text-[11px] text-red-600 mt-1">{validationErrors.phone}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Country / Primary Residence *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Switzerland, United Kingdom, United States"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className={`w-full px-3 py-2 text-xs border rounded focus:outline-hidden focus:ring-1 focus:ring-[#0A192F] ${
                    validationErrors.country ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {validationErrors.country && (
                  <p className="text-[11px] text-red-600 mt-1">{validationErrors.country}</p>
                )}
              </div>
            </div>

            {/* Company Name if business */}
            {formData.clientType === 'business' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization / Family Office Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crestview Holdings AG or Sterling Family Office"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className={`w-full px-3 py-2 text-xs border rounded focus:outline-hidden focus:ring-1 focus:ring-[#0A192F] ${
                    validationErrors.companyName ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {validationErrors.companyName && (
                  <p className="text-[11px] text-red-600 mt-1">{validationErrors.companyName}</p>
                )}
              </div>
            )}

            {/* Service or Product of Interest */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Service or Protection Requirement *
              </label>
              <select
                value={formData.serviceOfInterest}
                onChange={(e) => setFormData({ ...formData, serviceOfInterest: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-[#0A192F] bg-white"
              >
                <option value="Emergency Contingency & Evacuation Coordination">Emergency Contingency & Evacuation Coordination</option>
                <option value="Silver Membership Tier ($2,400/yr)">Silver Membership Tier ($2,400/yr)</option>
                <option value="Gold Membership Tier ($12,000/yr)">Gold Membership Tier ($12,000/yr)</option>
                <option value="Excelsior Bespoke Logistics Tier">Excelsior Bespoke Logistics Tier</option>
                <option value="Flex Funds Dedicated Escrow Facility">Flex Funds Dedicated Escrow Facility</option>
                <option value="Private Aviation & Maritime Escort">Private Aviation & Maritime Escort</option>
                <option value="Corporate Executive Risk Advisory">Corporate Executive Risk Advisory</option>
              </select>
            </div>

            {/* Preferred Contact Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Contact Method *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className={`flex items-center justify-center gap-1.5 p-2 text-xs rounded border cursor-pointer transition-colors ${
                  formData.preferredContactMethod === 'email' ? 'border-[#0A192F] bg-slate-50 font-medium' : 'border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="preferredMethod"
                    value="email"
                    checked={formData.preferredContactMethod === 'email'}
                    onChange={() => setFormData({ ...formData, preferredContactMethod: 'email' })}
                    className="sr-only"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-600" /> Email
                </label>
                <label className={`flex items-center justify-center gap-1.5 p-2 text-xs rounded border cursor-pointer transition-colors ${
                  formData.preferredContactMethod === 'phone' ? 'border-[#0A192F] bg-slate-50 font-medium' : 'border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="preferredMethod"
                    value="phone"
                    checked={formData.preferredContactMethod === 'phone'}
                    onChange={() => setFormData({ ...formData, preferredContactMethod: 'phone' })}
                    className="sr-only"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-600" /> Phone Call
                </label>
                <label className={`flex items-center justify-center gap-1.5 p-2 text-xs rounded border cursor-pointer transition-colors ${
                  formData.preferredContactMethod === 'whatsapp' ? 'border-[#0A192F] bg-slate-50 font-medium' : 'border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="preferredMethod"
                    value="whatsapp"
                    checked={formData.preferredContactMethod === 'whatsapp'}
                    onChange={() => setFormData({ ...formData, preferredContactMethod: 'whatsapp' })}
                    className="sr-only"
                  />
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                </label>
              </div>
            </div>

            {/* Additional Message (optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Requirements / Context (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Specific operational timelines, geographical regions of interest, travel schedules, or custom requirements..."
                value={formData.additionalMessage}
                onChange={(e) => setFormData({ ...formData, additionalMessage: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-[#0A192F]"
              />
            </div>

            {/* Consent Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consentContacted}
                  onChange={(e) => setFormData({ ...formData, consentContacted: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0A192F] focus:ring-[#0A192F]"
                />
                <span className="text-xs text-slate-600 leading-snug">
                  I consent to confidential contact from R3 Contingencies commanders regarding contingency services and advisory solutions. All data is protected under Swiss and international strict non-disclosure covenants. *
                </span>
              </label>
              {validationErrors.consentContacted && (
                <p className="text-[11px] text-red-600 mt-1 pl-6">{validationErrors.consentContacted}</p>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Encrypted Submission · Operational NDA Enforced
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded transition-colors cursor-pointer disabled:opacity-50 shadow-xs border border-[#D4AF37]/30"
                >
                  {loading ? 'Transmitting...' : 'Submit Registration'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
