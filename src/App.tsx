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
import { AffiliateLoginModal } from './components/affiliate/AffiliateLoginModal.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AdminLoginView } from './components/admin/AdminLoginView.tsx';
import { ClientRegistrationModal } from './components/public/ClientRegistrationModal.tsx';
import { AffiliatePartnershipPage } from './components/public/AffiliatePartnershipPage.tsx';
import { AssociateRegistrationPage } from './components/public/AssociateRegistrationPage.tsx';
import { MemberLoginModal } from './components/public/MemberLoginModal.tsx';
import { MemberDashboard } from './components/member/MemberDashboard.tsx';
import type { UserRole, Profile } from './types/database.ts';
import { supabase, isSupabaseConfigured } from './lib/supabase/client.ts';

export default function App() {
  const [currentView, setCurrentView] = useState<
    'home' | 'about' | 'services' | 'membership' | 'flex-funds' | 'affiliates' | 'affiliate-partnership' | 'associate-register' | 'contact' | 'affiliate-portal' | 'member-portal' | 'admin-dashboard'
  >('home');

  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [memberData, setMemberData] = useState<any | null>(null);

  const [isAffiliateAuthOpen, setIsAffiliateAuthOpen] = useState(false);
  const [isMemberAuthOpen, setIsMemberAuthOpen] = useState(false);
  const [isClientRegOpen, setIsClientRegOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [activeRefCode, setActiveRefCode] = useState<string | null>(null);

  // Synchronize route on initial mount (e.g. direct navigation to /admin or /affiliate-partnership)
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin' || path.startsWith('/admin')) {
      setCurrentView('admin-dashboard');
    } else if (path === '/affiliate-partnership' || path === '/affiliates') {
      setCurrentView('affiliate-partnership');
    } else if (path === '/associate/register' || path === '/associate-register') {
      setCurrentView('associate-register');
    } else if (path === '/membership') {
      setCurrentView('membership');
    } else if (path === '/member/dashboard' || path === '/member-portal') {
      setCurrentView('member-portal');
    }

    // Check if session exists in sessionStorage
    const savedToken = sessionStorage.getItem('r3_auth_token');
    const savedRole = sessionStorage.getItem('r3_auth_role') as UserRole;
    const savedMember = sessionStorage.getItem('r3_member_data');
    if (savedMember) {
      try { setMemberData(JSON.parse(savedMember)); } catch {}
    }
    if (savedToken && savedRole) {
      setAuthToken(savedToken);
      setActiveRole(savedRole);
    }

    // If frontend Supabase client is initialized, sync auth session if available
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.access_token && !savedToken) {
          setAuthToken(data.session.access_token);
        }
      }).catch((err) => {
        console.warn('[R3 Frontend] Supabase session check error:', err);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.access_token) {
          setAuthToken(session.access_token);
          sessionStorage.setItem('r3_auth_token', session.access_token);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

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

  const handleAdminLoginSuccess = (token: string, user: Profile) => {
    setAuthToken(token);
    setActiveRole(user.role);
    sessionStorage.setItem('r3_auth_token', token);
    sessionStorage.setItem('r3_auth_role', user.role);
    setCurrentView('admin-dashboard');
    window.history.pushState(null, '', '/admin');
  };

  const handleAffiliateLoginSuccess = (token: string, affiliateData: any) => {
    setAuthToken(token);
    setActiveRole('affiliate');
    sessionStorage.setItem('r3_auth_token', token);
    sessionStorage.setItem('r3_auth_role', 'affiliate');
    setCurrentView('affiliate-portal');
  };

  const handleMemberLoginSuccess = (token: string, clientData: any) => {
    setAuthToken(token);
    setActiveRole('client');
    setMemberData(clientData);
    sessionStorage.setItem('r3_auth_token', token);
    sessionStorage.setItem('r3_auth_role', 'client');
    sessionStorage.setItem('r3_member_data', JSON.stringify(clientData));
    setCurrentView('member-portal');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('r3_auth_token');
    sessionStorage.removeItem('r3_auth_role');
    setActiveRole(null);
    setAuthToken(null);
    setCurrentView('home');
    if (window.location.pathname === '/admin') {
      window.history.pushState(null, '', '/');
    }
  };

  const handleNavigateView = (view: any) => {
    if (view === 'admin-dashboard') {
      window.history.pushState(null, '', '/admin');
    } else if (window.location.pathname === '/admin') {
      window.history.pushState(null, '', '/');
    }
    setCurrentView(view);
  };

  // If on admin view, check if user is authenticated with a valid staff role
  const isStaffRole = activeRole && ['super_admin', 'affiliate_manager', 'finance_manager', 'content_manager'].includes(activeRole);

  if (currentView === 'admin-dashboard') {
    if (!authToken || !isStaffRole) {
      return (
        <AdminLoginView
          onLoginSuccess={handleAdminLoginSuccess}
          onReturnHome={() => handleNavigateView('home')}
        />
      );
    }
    return (
      <div className="min-h-screen flex flex-col font-sans bg-[#FAF9F6] text-slate-900">
        <Navbar
          currentView={currentView}
          setCurrentView={handleNavigateView}
          activeRole={activeRole}
          onOpenAffiliateAuth={() => setIsAffiliateAuthOpen(true)}
          onOpenClientRegistration={() => setIsClientRegOpen(true)}
          onOpenApplication={() => setIsApplicationModalOpen(true)}
          onOpenMemberAuth={() => setIsMemberAuthOpen(true)}
          onLogout={handleLogout}
        />
        <main className="flex-1">
          <AdminDashboard
            token={authToken}
            activeRole={activeRole}
            onLogout={handleLogout}
            onSwitchRole={(role) => {
              setActiveRole(role);
              sessionStorage.setItem('r3_auth_role', role);
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAF9F6] text-slate-900">
      {/* Referral Banner if visitor arrived via affiliate code */}
      {activeRefCode && currentView !== 'affiliate-portal' && (
        <div className="bg-[#0A192F] text-white text-xs px-6 py-2 text-center border-b border-[#D4AF37]/30 flex items-center justify-center gap-2">
          <span className="text-[#D4AF37] font-semibold">Priority Partner Referral:</span>
          <span>
            You are browsing via authorized R3 advisory link{' '}
            <strong className="font-mono text-[#D4AF37]">{activeRefCode}</strong>. Attributed to verified partner representation.
          </span>
        </div>
      )}

      {/* Main Navigation - Customer Facing & Partner Portal Only */}
      <Navbar
        currentView={currentView}
        setCurrentView={handleNavigateView}
        activeRole={activeRole}
        onOpenAffiliateAuth={() => setIsAffiliateAuthOpen(true)}
        onOpenClientRegistration={() => setIsClientRegOpen(true)}
        onOpenApplication={() => setIsApplicationModalOpen(true)}
        onOpenMemberAuth={() => setIsMemberAuthOpen(true)}
        onLogout={handleLogout}
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
                setIsClientRegOpen(true);
              }}
            />
            <FlexFundsSection
              onInquire={() => {
                setIsClientRegOpen(true);
              }}
            />
            <AffiliateSection
              onApply={() => setIsApplicationModalOpen(true)}
              onOpenPortal={() => setIsAffiliateAuthOpen(true)}
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
            onInquire={() => setIsClientRegOpen(true)}
          />
        )}

        {currentView === 'membership' && (
          <div className="py-12">
            <MembershipTiers
              onSelectTier={(tier) => setIsClientRegOpen(true)}
            />
            <FaqSection />
            <ContactForm />
          </div>
        )}

        {currentView === 'flex-funds' && (
          <div className="py-12">
            <FlexFundsSection
              onInquire={() => setIsClientRegOpen(true)}
            />
            <FaqSection />
            <ContactForm />
          </div>
        )}

        {/* Dedicated Affiliate Partnership Page */}
        {(currentView === 'affiliate-partnership' || currentView === 'affiliates') && (
          <AffiliatePartnershipPage
            onApply={() => setIsApplicationModalOpen(true)}
            onOpenPortal={() => setIsAffiliateAuthOpen(true)}
          />
        )}

        {/* Dedicated Associate Registration Page */}
        {currentView === 'associate-register' && (
          <AssociateRegistrationPage
            onSuccessReturn={() => setCurrentView('affiliate-partnership')}
          />
        )}

        {/* Dedicated Member Portal */}
        {currentView === 'member-portal' && (
          <MemberDashboard
            token={authToken || 'session'}
            onLogout={handleLogout}
            clientData={memberData}
          />
        )}

        {currentView === 'contact' && (
          <div className="py-12">
            <ContactForm />
          </div>
        )}

        {/* Affiliate Partner Authenticated Portal */}
        {currentView === 'affiliate-portal' && authToken && activeRole === 'affiliate' && (
          <AffiliatePortal token={authToken} onLogout={handleLogout} />
        )}
      </main>

      {/* Footer */}
      {currentView !== 'affiliate-portal' && currentView !== 'member-portal' && (
        <Footer
          setCurrentView={handleNavigateView}
          onOpenAffiliateAuth={() => setIsAffiliateAuthOpen(true)}
          onOpenClientRegistration={() => setIsClientRegOpen(true)}
        />
      )}

      {/* Client / Member Registration Modal */}
      <ClientRegistrationModal
        isOpen={isClientRegOpen}
        onClose={() => setIsClientRegOpen(false)}
        referralCode={activeRefCode}
      />

      {/* Member Portal Login Modal */}
      <MemberLoginModal
        isOpen={isMemberAuthOpen}
        onClose={() => setIsMemberAuthOpen(false)}
        onLoginSuccess={handleMemberLoginSuccess}
        onOpenRegistration={() => setIsClientRegOpen(true)}
      />

      {/* Affiliate Partner Login Modal */}
      <AffiliateLoginModal
        isOpen={isAffiliateAuthOpen}
        onClose={() => setIsAffiliateAuthOpen(false)}
        onLoginSuccess={handleAffiliateLoginSuccess}
        onOpenApplication={() => setIsApplicationModalOpen(true)}
      />

      {/* Associate Partner Application Modal */}
      {isApplicationModalOpen && (
        <AssociateRegistrationPage
          isModal={true}
          onClose={() => setIsApplicationModalOpen(false)}
          onSuccessReturn={() => setIsApplicationModalOpen(false)}
        />
      )}
    </div>
  );
}
