import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    subject: '',
    message: '',
    privacyConsent: false
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-[#FAF9F6] border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-6">
        <div className="max-w-2xl mb-8">
          <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
            Global Advisory Desk
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A192F]">
            Connect with R3 Contingencies
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            For bespoke contingency inquiries, corporate retainer structuring, or international representation details.
          </p>
        </div>

        {/* Direct Official Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-5 rounded-lg border border-slate-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block tracking-wider">
              Official Network Email
            </span>
            <a
              href="mailto:r3affiliate.network@gmail.com"
              className="text-sm font-bold text-[#0A192F] hover:text-[#112240] hover:underline block break-all"
            >
              r3affiliate.network@gmail.com
            </a>
            <span className="text-[11px] text-slate-500 block">Direct inquiry dispatch & partner advisory</span>
          </div>

          <div className="p-5 rounded-lg border border-slate-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block tracking-wider">
              Direct Operations Cell
            </span>
            <a
              href="tel:+19313660615"
              className="text-sm font-bold text-[#0A192F] hover:text-[#112240] hover:underline font-mono block"
            >
              +1 (931) 366-0615
            </a>
            <span className="text-[11px] text-slate-500 block">24/7 principal assistance & rapid coordination</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-8 sm:p-10 shadow-xs">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0A192F]">Inquiry Successfully Dispatched</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Your message has been securely recorded. An R3 contingency coordinator will review your transmission and respond discreetly within four operational hours.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      fullName: '',
                      email: '',
                      phone: '',
                      country: '',
                      subject: '',
                      message: '',
                      privacyConsent: false
                    });
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-3 text-xs rounded bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[#0A192F] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Lord Alistair Vance"
                    className="w-full text-xs px-3.5 py-2.5 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A192F] mb-1.5">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="principal@advisory.com"
                    className="w-full text-xs px-3.5 py-2.5 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[#0A192F] mb-1.5">
                    International Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (931) 366-0615"
                    className="w-full text-xs px-3.5 py-2.5 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A192F] mb-1.5">
                    Country / Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Switzerland, United Kingdom, UAE..."
                    className="w-full text-xs px-3.5 py-2.5 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A192F] mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Inquiry regarding Gold Tier coverage or Flex Funds"
                  className="w-full text-xs px-3.5 py-2.5 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A192F] mb-1.5">
                  Message Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detail your operational or advisory inquiry..."
                  className="w-full text-xs px-3.5 py-2.5 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.privacyConsent}
                    onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                    className="mt-0.5 rounded text-[#0A192F] focus:ring-0"
                  />
                  <span>
                    I acknowledge that communications are processed in strict confidence in compliance with R3 Contingencies data protection standards.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Transmitting...' : 'Dispatch Inquiry'}
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
