/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * R3 Contingencies — Corporate Website & Affiliate Management Platform
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { Hero } from './components/public/Hero.tsx';
import { CapabilitiesBento } from './components/public/CapabilitiesBento.tsx';
import { MembershipTiers } from './components/public/MembershipTiers.tsx';
import { FlexFundsSection } from './components/public/FlexFundsSection.tsx';
import { AffiliateSection } from './components/public/AffiliateSection.tsx';
import { FaqSection } from './components/public/FaqSection.tsx';
import { ContactForm } from './components/public/ContactForm.tsx';
import { ApplicationModal } from './components/public/ApplicationModal.tsx';
import { AboutPage } from './components/public/AboutPage.tsx';
import { ServicesPage } from './components/public/ServicesPage.tsx';
import { AffiliatePortal } from './components/affiliate/AffiliatePortal.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { RoleSwitcherModal } from './components/RoleSwitcherModal.tsx';
import type { UserRole } from './types/database.ts';

export default function App() {
  const [currentView, setCurrentView] = useState<
    'home' | 'about' | 'services' | 'membership' | 'flex-funds' | 'affiliates' | 'contact' | 'affiliate-portal' | 'admin-dashboard'
  >('home');

  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [activeRefCode, setActiveRefCode] = useState<string | null>(null);

  // Initialize and handle referral link tracking from URL (?ref=R3-XXXXX)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');

    if (ref) {
      setActiveRefCode(ref);
      let sessionId = sessionStorage.getItem('r3_visitor_session');
      if (!sessionId) {
        sessionId = `sess_${Math.random().toString(36).substring(2, 10)}`;
        sessionStorage.setItem('r3_visitor_session', sessionId);
      }

      // Record referral click server-side
      fetch('/api/tracking/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref,
          landingPage: window.location.pathname + window.location.search,
          sessionId,
          referrer: document.referrer || undefined
        })
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('[R3 Tracking Engine] Attribution event processed:', data);
        })
        .catch((err) => console.warn('[R3 Tracking Engine] Tracking warning:', err));
    }
  }, []);

  const handleSelectRole = (role: UserRole, token: string) => {
    setActiveRole(role);
    setAuthToken(token);
    setCurrentView('admin-dashboard');
  };

  const handleSelectAffiliate = (token: string) => {
    setActiveRole('affiliate');
    setAuthToken(token);
    setCurrentView('affiliate-portal');
  };

  const handleLogout = () => {
    setActiveRole(null);
    setAuthToken(null);
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAF9F6] text-slate-900">
      {/* Referral Banner if visitor arrived via affiliate code */}
      {activeRefCode && currentView !== 'affiliate-portal' && currentView !== 'admin-dashboard' && (
        <div className="bg-[#0A192F] text-white text-xs px-6 py-2 text-center border-b border-[#D4AF37]/30 flex items-center justify-center gap-2">
          <span className="text-[#D4AF37] font-semibold">Priority Partner Referral:</span>
          <span>
            You are browsing via authorized R3 advisory link{' '}
            <strong className="font-mono text-[#D4AF37]">{activeRefCode}</strong>. Attributed to verified partner representation.
          </span>
        </div>
      )}

      {/* Main Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeRole={activeRole}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenApplication={() => setIsApplicationModalOpen(true)}
      />

      {/* Content View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <Hero
              onExplore={() => {
                const el = document.getElementById('membership');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onPartner={() => setIsApplicationModalOpen(true)}
            />
            <CapabilitiesBento />
            <MembershipTiers
              onSelectTier={(tier) => {
                const el = document.getElementById('contact');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <FlexFundsSection
              onInquire={() => {
                const el = document.getElementById('contact');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <AffiliateSection
              onApply={() => setIsApplicationModalOpen(true)}
              onOpenPortal={() => setIsAuthModalOpen(true)}
            />
            <FaqSection />
            <ContactForm />
          </>
        )}

        {currentView === 'about' && (
          <AboutPage
            onContact={() => setCurrentView('contact')}
            onPartner={() => setIsApplicationModalOpen(true)}
          />
        )}

        {currentView === 'services' && (
          <ServicesPage
            onInquire={() => setCurrentView('contact')}
          />
        )}

        {currentView === 'membership' && (
          <div className="py-12">
            <MembershipTiers
              onSelectTier={(tier) => setCurrentView('contact')}
            />
            <FaqSection />
            <ContactForm />
          </div>
        )}

        {currentView === 'flex-funds' && (
          <div className="py-12">
            <FlexFundsSection
              onInquire={() => setCurrentView('contact')}
            />
            <FaqSection />
            <ContactForm />
          </div>
        )}

        {currentView === 'affiliates' && (
          <div className="py-12">
            <AffiliateSection
              onApply={() => setIsApplicationModalOpen(true)}
              onOpenPortal={() => setIsAuthModalOpen(true)}
            />
            <FaqSection />
          </div>
        )}

        {currentView === 'contact' && (
          <div className="py-12">
            <ContactForm />
          </div>
        )}

        {/* Affiliate Partner Authenticated Portal */}
        {currentView === 'affiliate-portal' && authToken && (
          <AffiliatePortal token={authToken} onLogout={handleLogout} />
        )}

        {/* Administrative Staff Dashboard */}
        {currentView === 'admin-dashboard' && authToken && activeRole && (
          <AdminDashboard
            token={authToken}
            activeRole={activeRole}
            onLogout={handleLogout}
            onSwitchRole={(role) => setActiveRole(role)}
          />
        )}
      </main>

      {/* Footer */}
      {currentView !== 'affiliate-portal' && currentView !== 'admin-dashboard' && (
        <Footer
          setCurrentView={setCurrentView}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* Role / Auth Modal */}
      <RoleSwitcherModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSelectRole={handleSelectRole}
        onSelectAffiliate={handleSelectAffiliate}
      />

      {/* Affiliate Partner Application Modal */}
      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
      />
    </div>
  );
}
