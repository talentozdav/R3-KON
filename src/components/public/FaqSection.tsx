import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SiteFAQ } from '../../types/database.ts';

export const FaqSection: React.FC = () => {
  const [faqs, setFaqs] = useState<SiteFAQ[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>('faq-001');

  useEffect(() => {
    fetch('/api/cms/faqs')
      .then((res) => res.json())
      .then((data) => {
        if (data.faqs) setFaqs(data.faqs);
      })
      .catch((err) => console.error('Failed to load FAQs', err));
  }, []);

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'membership', label: 'Membership' },
    { id: 'services', label: 'Services' },
    { id: 'flex_funds', label: 'Flex Funds' },
    { id: 'affiliates', label: 'Affiliates' }
  ];

  const filteredFaqs = faqs.filter(
    (f) => activeCategory === 'all' || f.category === activeCategory
  );

  return (
    <section id="faqs" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
            Governance & Protocols
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A192F]">
            Frequently Answered Inquiries
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Clear clarity regarding operational scope, emergency protocols, and affiliate compliance.
          </p>
        </div>

        {/* Category filter tabs */}
        <div className="flex items-center justify-center flex-wrap gap-1.5 p-1 bg-slate-100 rounded-lg max-w-lg mx-auto mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-white text-[#0A192F] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-[#0A192F]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ list */}
        <div className="space-y-4">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-lg border border-slate-200 bg-[#FAF9F6] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 cursor-pointer hover:bg-slate-100/60 transition-colors"
                >
                  <span className="text-sm font-semibold text-[#0A192F]">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
