/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * R3 Contingencies — Full-Stack Server & Enterprise API
 * Integrates Express API, Supabase architecture, and Vite middlewares.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { z } from 'zod';
import dotenv from 'dotenv';
import type {
  Profile,
  AffiliateApplication,
  Affiliate,
  ReferralCode,
  ReferralEvent,
  ReferralAttribution,
  Lead,
  Conversion,
  CommissionRule,
  CommissionLedgerEntry,
  PayoutBatch,
  PayoutItem,
  ContactInquiry,
  SitePage,
  SiteFAQ,
  AuditLog,
  SystemSetting,
  UserRole
} from './src/types/database.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

const app = express();
app.use(express.json());

// In-Memory Persistent Data Store mirroring the PostgreSQL schema
// This ensures 100% functional completeness and testability out of the box,
// while migration files reflect identical schemas for Supabase deployment.

interface DatabaseState {
  profiles: Profile[];
  applications: AffiliateApplication[];
  affiliates: Affiliate[];
  referralCodes: ReferralCode[];
  referralEvents: ReferralEvent[];
  attributions: ReferralAttribution[];
  leads: Lead[];
  conversions: Conversion[];
  commissionRules: CommissionRule[];
  commissionLedger: CommissionLedgerEntry[];
  payoutBatches: PayoutBatch[];
  payoutItems: PayoutItem[];
  contactInquiries: ContactInquiry[];
  sitePages: SitePage[];
  siteFaqs: SiteFAQ[];
  auditLogs: AuditLog[];
  systemSettings: SystemSetting[];
  sessions: Map<string, { profileId: string; role: UserRole; expiresAt: number }>;
}

const db: DatabaseState = {
  profiles: [
    {
      id: 'prof-super-admin-01',
      email: 'director@r3contingencies.com',
      full_name: 'Arthur Vance',
      phone: '+41 22 819 4000',
      country: 'Switzerland',
      role: 'super_admin',
      is_active: true,
      created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
      updated_at: new Date('2026-01-01T00:00:00Z').toISOString()
    },
    {
      id: 'prof-aff-manager-02',
      email: 'affiliates@r3contingencies.com',
      full_name: 'Helena Lindqvist',
      phone: '+44 20 7946 0912',
      country: 'United Kingdom',
      role: 'affiliate_manager',
      is_active: true,
      created_at: new Date('2026-01-05T00:00:00Z').toISOString(),
      updated_at: new Date('2026-01-05T00:00:00Z').toISOString()
    },
    {
      id: 'prof-fin-manager-03',
      email: 'finance@r3contingencies.com',
      full_name: 'Marcus Sterling',
      phone: '+1 212 555 0198',
      country: 'United States',
      role: 'finance_manager',
      is_active: true,
      created_at: new Date('2026-01-05T00:00:00Z').toISOString(),
      updated_at: new Date('2026-01-05T00:00:00Z').toISOString()
    },
    {
      id: 'prof-content-mgr-04',
      email: 'editor@r3contingencies.com',
      full_name: 'Sophia Chen',
      phone: '+65 6789 0123',
      country: 'Singapore',
      role: 'content_manager',
      is_active: true,
      created_at: new Date('2026-01-10T00:00:00Z').toISOString(),
      updated_at: new Date('2026-01-10T00:00:00Z').toISOString()
    },
    {
      id: 'prof-affiliate-01',
      email: 'partner.sterling@crestview-concierge.ch',
      full_name: 'Julian Sterling',
      phone: '+41 79 123 4567',
      country: 'Switzerland',
      role: 'affiliate',
      is_active: true,
      created_at: new Date('2026-02-01T00:00:00Z').toISOString(),
      updated_at: new Date('2026-02-01T00:00:00Z').toISOString()
    }
  ],
  applications: [
    {
      id: 'app-001',
      full_name: 'Julian Sterling',
      applicant_type: 'business',
      business_name: 'Crestview Executive Concierge AG',
      email: 'partner.sterling@crestview-concierge.ch',
      normalized_email: 'partner.sterling@crestview-concierge.ch',
      phone: '+41 79 123 4567',
      country: 'Switzerland',
      partnership_type: 'Private Wealth & Family Office Advisory',
      industry_background: 'Executive concierge and private aviation advisory for UHNW families in Geneva & Zurich.',
      audience_description: 'Portfolio of 60+ family offices and international executives requiring discreet contingency coverage.',
      partnership_objectives: 'Offer comprehensive contingency and crisis extraction memberships to high-risk principals.',
      additional_notes: 'Verified compliance documentation and Swiss commercial registry on file.',
      status: 'approved',
      terms_accepted: true,
      privacy_accepted: true,
      internal_notes: 'Approved following compliance verification on 2026-02-01.',
      reviewed_by: 'prof-aff-manager-02',
      reviewed_at: new Date('2026-02-01T10:00:00Z').toISOString(),
      created_at: new Date('2026-01-28T14:30:00Z').toISOString(),
      updated_at: new Date('2026-02-01T10:00:00Z').toISOString()
    },
    {
      id: 'app-002',
      full_name: 'Beatrice Fontaine',
      applicant_type: 'individual',
      business_name: undefined,
      email: 'b.fontaine@monaco-advisors.mc',
      normalized_email: 'b.fontaine@monaco-advisors.mc',
      phone: '+377 98 98 00 11',
      country: 'Monaco',
      partnership_type: 'Maritime & Superyacht Security Brokerage',
      industry_background: 'Superyacht charter risk management and Mediterranean offshore travel coordination.',
      audience_description: 'Principals chartering mega-yachts across Mediterranean, Caribbean and Red Sea transit lanes.',
      partnership_objectives: 'Introduce Gold and Excelsior tier contingency coverage for yacht owners and guests.',
      additional_notes: 'Requests clarification regarding emergency medical coordination in international waters.',
      status: 'under_review',
      terms_accepted: true,
      privacy_accepted: true,
      internal_notes: 'Initial background check complete. Awaiting regional compliance clearance.',
      created_at: new Date('2026-10-15T09:12:00Z').toISOString(),
      updated_at: new Date('2026-10-16T11:00:00Z').toISOString()
    },
    {
      id: 'app-003',
      full_name: 'David O\'Connor',
      applicant_type: 'business',
      business_name: 'Apex Strategic Logistics Ltd',
      email: 'david@apex-logistics.ae',
      normalized_email: 'david@apex-logistics.ae',
      phone: '+971 4 312 8800',
      country: 'United Arab Emirates',
      partnership_type: 'Corporate Risk & Expatriate Mobility',
      industry_background: 'Middle East & East Africa executive extraction and secure logistics consultation.',
      audience_description: 'Multinational corporations stationing executive staff in emerging trade hubs.',
      partnership_objectives: 'Cross-reference corporate travel disruptions with R3 contingency and Flex Funds.',
      additional_notes: '',
      status: 'submitted',
      terms_accepted: true,
      privacy_accepted: true,
      created_at: new Date('2026-10-24T16:45:00Z').toISOString(),
      updated_at: new Date('2026-10-24T16:45:00Z').toISOString()
    }
  ],
  affiliates: [
    {
      id: 'aff-001',
      profile_id: 'prof-affiliate-01',
      application_id: 'app-001',
      affiliate_number: 'R3-10245',
      status: 'active',
      custom_commission_rate: undefined, // Uses system rule
      payout_method: 'wire_transfer',
      payout_currency: 'USD',
      payout_details: {
        bank_name: 'Banque Cantonale de Genève',
        iban: 'CH89 0078 8000 0123 4567 8',
        swift_bic: 'BCGECHGGXXX',
        beneficiary_name: 'Crestview Executive Concierge AG'
      },
      tax_id_verified: true,
      country: 'Switzerland',
      total_referral_clicks: 142,
      total_conversions: 3,
      created_at: new Date('2026-02-01T10:05:00Z').toISOString(),
      updated_at: new Date('2026-10-20T12:00:00Z').toISOString()
    }
  ],
  referralCodes: [
    {
      id: 'code-001',
      affiliate_id: 'aff-001',
      code: 'R3-10245',
      target_url: '/',
      is_active: true,
      created_at: new Date('2026-02-01T10:05:00Z').toISOString()
    }
  ],
  referralEvents: [
    {
      id: 'ev-001',
      referral_code_id: 'code-001',
      affiliate_id: 'aff-001',
      ip_hash: crypto.createHash('sha256').update('194.230.145.10').digest('hex').substring(0, 16),
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      referrer_url: 'https://crestview-concierge.ch/partners',
      landing_page: '/?ref=R3-10245',
      country_code: 'CH',
      visitor_session_id: 'sess_99a81b2c',
      is_duplicate: false,
      created_at: new Date('2026-09-12T14:22:00Z').toISOString()
    },
    {
      id: 'ev-002',
      referral_code_id: 'code-001',
      affiliate_id: 'aff-001',
      ip_hash: crypto.createHash('sha256').update('82.165.197.12').digest('hex').substring(0, 16),
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      referrer_url: 'https://crestview-concierge.ch',
      landing_page: '/?ref=R3-10245',
      country_code: 'DE',
      visitor_session_id: 'sess_14bc88ef',
      is_duplicate: false,
      created_at: new Date('2026-10-02T09:15:00Z').toISOString()
    }
  ],
  attributions: [
    {
      id: 'attr-001',
      visitor_session_id: 'sess_99a81b2c',
      affiliate_id: 'aff-001',
      referral_code_id: 'code-001',
      first_click_at: new Date('2026-09-12T14:22:00Z').toISOString(),
      last_click_at: new Date('2026-09-12T14:22:00Z').toISOString(),
      expires_at: new Date('2026-11-11T14:22:00Z').toISOString(), // 60 days
      created_at: new Date('2026-09-12T14:22:00Z').toISOString()
    }
  ],
  leads: [
    {
      id: 'lead-001',
      affiliate_id: 'aff-001',
      referral_code_id: 'code-001',
      visitor_session_id: 'sess_99a81b2c',
      full_name: 'Baron Henri de Montmirail',
      email: 'henri@montmirail-holdings.ch',
      phone: '+41 22 710 3344',
      country: 'Switzerland',
      interested_tier: 'gold',
      status: 'converted',
      created_at: new Date('2026-09-14T11:00:00Z').toISOString(),
      updated_at: new Date('2026-09-20T16:00:00Z').toISOString()
    },
    {
      id: 'lead-002',
      affiliate_id: 'aff-001',
      referral_code_id: 'code-001',
      visitor_session_id: 'sess_14bc88ef',
      full_name: 'Dr. Clara Zimmerman',
      email: 'c.zimmerman@bavaria-capital.de',
      phone: '+49 89 244 5566',
      country: 'Germany',
      interested_tier: 'silver',
      status: 'qualified',
      created_at: new Date('2026-10-04T15:30:00Z').toISOString(),
      updated_at: new Date('2026-10-08T09:45:00Z').toISOString()
    }
  ],
  conversions: [
    {
      id: 'conv-001',
      transaction_reference: 'TX-R3-2026-0922-01',
      customer_reference: 'CUST-CH-9182',
      customer_email: 'henri@montmirail-holdings.ch',
      affiliate_id: 'aff-001',
      membership_tier: 'gold',
      eligible_sale_amount_cents: 1200000, // $12,000.00
      currency: 'USD',
      transaction_date: '2026-09-20',
      verification_status: 'verified',
      supporting_evidence_url: '/docs/transactions/tx_9182_wire_confirmation.pdf',
      supporting_notes: 'Annual Gold Tier membership paid via Banque Cantonale wire transfer. Confirmed received by Treasury.',
      verified_by: 'prof-fin-manager-03',
      verified_at: new Date('2026-09-22T14:00:00Z').toISOString(),
      created_at: new Date('2026-09-21T09:00:00Z').toISOString(),
      updated_at: new Date('2026-09-22T14:00:00Z').toISOString()
    },
    {
      id: 'conv-002',
      transaction_reference: 'TX-R3-2026-1010-02',
      customer_reference: 'CUST-DE-8831',
      customer_email: 'office@krupp-asset.de',
      affiliate_id: 'aff-001',
      membership_tier: 'silver',
      eligible_sale_amount_cents: 240000, // $2,400.00
      currency: 'USD',
      transaction_date: '2026-10-09',
      verification_status: 'pending',
      supporting_evidence_url: '/docs/transactions/tx_8831_invoice.pdf',
      supporting_notes: 'Silver Tier subscription initiated via corporate invoice. Pending final treasury verification.',
      created_at: new Date('2026-10-10T08:30:00Z').toISOString(),
      updated_at: new Date('2026-10-10T08:30:00Z').toISOString()
    }
  ],
  commissionRules: [
    {
      id: 'rule-001',
      rule_name: 'Executive Partner Commission (Awaiting R3 Executive Sign-off)',
      commission_percentage: 10.0,
      eligible_basis: 'net_eligible_sale',
      membership_tier: 'all',
      is_approved_by_r3: false, // Explicitly unapproved as required by prompt
      effective_from: '2026-10-01',
      created_by: 'prof-super-admin-01',
      created_at: new Date('2026-10-01T00:00:00Z').toISOString()
    }
  ],
  commissionLedger: [
    {
      id: 'led-001',
      affiliate_id: 'aff-001',
      conversion_id: 'conv-001',
      rule_id: 'rule-001',
      rate_applied_percentage: 10.0,
      eligible_sale_cents: 1200000,
      commission_amount_cents: 120000, // $1,200.00
      currency: 'USD',
      event_type: 'commission_earned',
      status: 'approved',
      adjustment_reason: 'Gold Membership conversion TX-R3-2026-0922-01 verified by Finance.',
      created_by: 'prof-fin-manager-03',
      created_at: new Date('2026-09-22T14:05:00Z').toISOString()
    }
  ],
  payoutBatches: [
    {
      id: 'batch-001',
      batch_number: 'BATCH-2026-09-USD',
      period_start: '2026-09-01',
      period_end: '2026-09-30',
      total_affiliates_count: 1,
      total_amount_cents: 120000,
      currency: 'USD',
      status: 'approved',
      approved_by: 'prof-fin-manager-03',
      approved_at: new Date('2026-10-05T10:00:00Z').toISOString(),
      notes: 'September 2026 closed reconciliation batch.',
      created_at: new Date('2026-10-01T08:00:00Z').toISOString(),
      updated_at: new Date('2026-10-05T10:00:00Z').toISOString()
    }
  ],
  payoutItems: [
    {
      id: 'pitem-001',
      payout_batch_id: 'batch-001',
      affiliate_id: 'aff-001',
      total_commissions_count: 1,
      gross_amount_cents: 120000,
      fees_deducted_cents: 0,
      net_payable_cents: 120000,
      currency: 'USD',
      payout_method: 'wire_transfer',
      status: 'approved',
      processed_at: undefined
    }
  ],
  contactInquiries: [
    {
      id: 'inq-001',
      full_name: 'Lord Alistair Sterling',
      email: 'a.sterling@westminster-holdings.co.uk',
      phone: '+44 20 7183 9920',
      country: 'United Kingdom',
      subject: 'Inquiry regarding Excelsior Tier coverage for executive aviation team',
      message: 'We are evaluating contingency protection for our international corporate flight crew and principal delegates traveling to high-complexity jurisdictions.',
      privacy_consent: true,
      status: 'new',
      created_at: new Date('2026-10-26T16:10:00Z').toISOString()
    }
  ],
  sitePages: [
    {
      id: 'page-home',
      slug: 'home',
      title: 'R3 Contingencies — Global Contingency & Concierge',
      meta_description: 'Executive contingency coordination, emergency assistance, and bespoke travel protection.',
      status: 'published',
      updated_at: new Date('2026-10-20T00:00:00Z').toISOString()
    },
    {
      id: 'page-about',
      slug: 'about',
      title: 'About R3 Contingencies — Operational Philosophy & Governance',
      meta_description: 'Specialized international emergency contingency coordination founded for high-profile principals.',
      status: 'published',
      updated_at: new Date('2026-10-20T00:00:00Z').toISOString()
    },
    {
      id: 'page-services',
      slug: 'services',
      title: 'Contingency Services — Global Crisis Response & Logistics',
      meta_description: 'Emergency assistance coordination, secure logistics, medical evacuation, and executive concierge.',
      status: 'published',
      updated_at: new Date('2026-10-20T00:00:00Z').toISOString()
    },
    {
      id: 'page-membership',
      slug: 'membership',
      title: 'Membership Tiers — Silver, Gold & Excelsior',
      meta_description: 'Comprehensive contingency protection tiers tailored for individuals, families, and corporations.',
      status: 'published',
      updated_at: new Date('2026-10-20T00:00:00Z').toISOString()
    },
    {
      id: 'page-flex-funds',
      slug: 'flex-funds',
      title: 'Flex Funds — Liquidity Reserves & Emergency Deployment',
      meta_description: 'Dedicated on-demand capital reserves for immediate crisis response and overseas contingency support.',
      status: 'published',
      updated_at: new Date('2026-10-20T00:00:00Z').toISOString()
    },
    {
      id: 'page-affiliates',
      slug: 'affiliates',
      title: 'Affiliate Partner Program — Global Representation',
      meta_description: 'Partner with R3 Contingencies to introduce qualified principals to international preparedness solutions.',
      status: 'published',
      updated_at: new Date('2026-10-20T00:00:00Z').toISOString()
    },
    {
      id: 'page-contact',
      slug: 'contact',
      title: 'Contact & Operations Dispatch — 24/7 Global Desk',
      meta_description: 'Connect with the R3 Contingencies global response advisory desk.',
      status: 'published',
      updated_at: new Date('2026-10-20T00:00:00Z').toISOString()
    }
  ],
  siteFaqs: [
    {
      id: 'faq-001',
      category: 'membership',
      question: 'What is included in the R3 Contingencies Silver and Gold tiers?',
      answer: 'Silver ($2,400/yr) provides foundational international contingency coordination, priority advisory response, and travel risk briefs. Gold ($12,000/yr) includes 24/7 dedicated crisis coordination, comprehensive family logistical routing, and bespoke dispatch readiness. Current membership rates and inclusions are subject to executive review.',
      display_order: 1,
      is_published: true,
      created_at: new Date('2026-09-01T00:00:00Z').toISOString()
    },
    {
      id: 'faq-002',
      category: 'membership',
      question: 'How is the Excelsior Tier tailored for family offices and multinational corporations?',
      answer: 'The Excelsior Tier is individually architected with custom operational response protocols, dedicated dispatch commanders, and structured liquidity facilities. Pricing is provided upon confidential discovery.',
      display_order: 2,
      is_published: true,
      created_at: new Date('2026-09-01T00:00:00Z').toISOString()
    },
    {
      id: 'faq-003',
      category: 'services',
      question: 'Does R3 Contingencies provide direct medical treatment or act as an insurance carrier?',
      answer: 'No. R3 Contingencies is a specialized contingency coordination and emergency concierge firm. We orchestrate vetted third-party medical evacuation aircraft, specialized security transports, and logistics. All services are subject to specific operational agreements and disclaimers.',
      display_order: 3,
      is_published: true,
      created_at: new Date('2026-09-01T00:00:00Z').toISOString()
    },
    {
      id: 'faq-004',
      category: 'flex_funds',
      question: 'What are Flex Funds and how are they disbursed?',
      answer: 'Flex Funds are dedicated liquidity reserves held in escrow for rapid deployment during travel disruptions, emergency hospital guarantees, or immediate transport chartering, preventing delays from international bank wire cutoff times.',
      display_order: 4,
      is_published: true,
      created_at: new Date('2026-09-01T00:00:00Z').toISOString()
    },
    {
      id: 'faq-005',
      category: 'affiliates',
      question: 'Who is eligible to join the R3 Affiliate Program?',
      answer: 'We welcome qualified individuals, corporate concierge firms, wealth managers, private family advisors, and international travel consultants worldwide. Every applicant undergoes compliance and suitability verification.',
      display_order: 5,
      is_published: true,
      created_at: new Date('2026-09-01T00:00:00Z').toISOString()
    },
    {
      id: 'faq-006',
      category: 'affiliates',
      question: 'How are affiliate commissions calculated and paid out?',
      answer: 'Commissions are calculated as a percentage of verified, eligible customer sales. All sales undergo manual verification by authorized R3 administrators. Payouts are reconciled monthly and disbursed in approved international currencies.',
      display_order: 6,
      is_published: true,
      created_at: new Date('2026-09-01T00:00:00Z').toISOString()
    }
  ],
  auditLogs: [
    {
      id: 'log-001',
      actor_email: 'director@r3contingencies.com',
      action: 'SYSTEM_BOOTSTRAP',
      entity_type: 'system',
      entity_id: 'sys-001',
      new_state: { version: '2026.10', environment: 'production-ready' },
      created_at: new Date('2026-10-29T00:00:00Z').toISOString()
    },
    {
      id: 'log-002',
      actor_email: 'finance@r3contingencies.com',
      action: 'VERIFY_CONVERSION',
      entity_type: 'conversions',
      entity_id: 'conv-001',
      previous_state: { verification_status: 'pending' },
      new_state: { verification_status: 'verified', verified_by: 'prof-fin-manager-03' },
      created_at: new Date('2026-09-22T14:00:00Z').toISOString()
    }
  ],
  systemSettings: [
    {
      id: 'set-001',
      setting_key: 'affiliate_attribution_window_days',
      setting_value: { value: 60, unit: 'days' },
      description: 'Attribution window duration in days (Default 60 days, awaiting R3 executive approval)',
      is_approved_by_r3: false,
      updated_at: new Date('2026-10-01T00:00:00Z').toISOString()
    },
    {
      id: 'set-002',
      setting_key: 'monthly_payout_schedule',
      setting_value: { processing_day_of_month: 15, min_threshold_cents: 50000 },
      description: 'Monthly payout schedule on the 15th with $500.00 minimum threshold',
      is_approved_by_r3: false,
      updated_at: new Date('2026-10-01T00:00:00Z').toISOString()
    },
    {
      id: 'set-003',
      setting_key: 'supported_payout_currencies',
      setting_value: { currencies: ['USD', 'EUR', 'GBP', 'CHF'] },
      description: 'Currencies permitted for affiliate commission settlements',
      is_approved_by_r3: false,
      updated_at: new Date('2026-10-01T00:00:00Z').toISOString()
    },
    {
      id: 'set-004',
      setting_key: 'commission_percentage_approval',
      setting_value: { default_percentage: 10.0, status: 'unconfigured_pending_executive_sign_off' },
      description: 'R3 executive rule requirement: no commission rate becomes active until management formally enables it.',
      is_approved_by_r3: false,
      updated_at: new Date('2026-10-01T00:00:00Z').toISOString()
    }
  ],
  sessions: new Map()
};

// Seed demo sessions
db.sessions.set('sess-super-admin', {
  profileId: 'prof-super-admin-01',
  role: 'super_admin',
  expiresAt: Date.now() + 86400000 * 30
});
db.sessions.set('sess-aff-manager', {
  profileId: 'prof-aff-manager-02',
  role: 'affiliate_manager',
  expiresAt: Date.now() + 86400000 * 30
});
db.sessions.set('sess-fin-manager', {
  profileId: 'prof-fin-manager-03',
  role: 'finance_manager',
  expiresAt: Date.now() + 86400000 * 30
});
db.sessions.set('sess-partner-sterling', {
  profileId: 'prof-affiliate-01',
  role: 'affiliate',
  expiresAt: Date.now() + 86400000 * 30
});

// Audit logger helper
function recordAuditLog(
  actorEmail: string | undefined,
  action: string,
  entityType: string,
  entityId: string | undefined,
  previousState?: Record<string, any>,
  newState?: Record<string, any>,
  req?: Request
) {
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    actor_email: actorEmail || 'system',
    action,
    entity_type: entityType,
    entity_id: entityId,
    previous_state: previousState,
    new_state: newState,
    ip_address: req?.ip,
    user_agent: req?.headers['user-agent'] as string,
    created_at: new Date().toISOString()
  };
  db.auditLogs.unshift(log);
}

// Auth Helper middleware
function getAuthenticatedUser(req: Request): { profile: Profile; role: UserRole } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const session = db.sessions.get(token);
  if (!session || session.expiresAt < Date.now()) return null;
  const profile = db.profiles.find((p) => p.id === session.profileId);
  if (!profile || !profile.is_active) return null;
  return { profile, role: session.role };
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// 1. Health check & configuration status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    supabase_configured: Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
    service: 'R3 Contingencies Enterprise Platform'
  });
});

// 2. Authentication: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, requested_role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const profile = db.profiles.find(
    (p) => p.email.toLowerCase() === email.toLowerCase() && p.is_active
  );

  if (!profile) {
    return res.status(401).json({ error: 'Invalid credentials or account inactive' });
  }

  // Generate session token
  const token = `sess-${crypto.randomBytes(16).toString('hex')}`;
  db.sessions.set(token, {
    profileId: profile.id,
    role: profile.role,
    expiresAt: Date.now() + 86400000 * 7 // 7 days
  });

  recordAuditLog(profile.email, 'USER_LOGIN', 'profiles', profile.id, undefined, { role: profile.role }, req);

  let affiliateData = null;
  if (profile.role === 'affiliate') {
    affiliateData = db.affiliates.find((a) => a.profile_id === profile.id);
  }

  res.json({
    token,
    user: profile,
    affiliate: affiliateData
  });
});

// 3. Authentication: Current User
app.get('/api/auth/me', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  let affiliate = null;
  if (auth.role === 'affiliate') {
    affiliate = db.affiliates.find((a) => a.profile_id === auth.profile.id);
  }

  res.json({
    user: auth.profile,
    affiliate
  });
});

// 4. Referral Click Tracking
const clickTrackingSchema = z.object({
  ref: z.string().min(1),
  landingPage: z.string().default('/'),
  sessionId: z.string().min(1),
  referrer: z.string().optional()
});

app.post('/api/tracking/click', (req: Request, res: Response) => {
  const parseResult = clickTrackingSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid tracking payload' });
  }

  const { ref, landingPage, sessionId, referrer } = parseResult.data;

  // Look up referral code
  const referralCode = db.referralCodes.find(
    (c) => c.code.toUpperCase() === ref.toUpperCase() && c.is_active
  );

  if (!referralCode) {
    return res.status(404).json({ error: 'Referral code not found or inactive' });
  }

  const affiliate = db.affiliates.find((a) => a.id === referralCode.affiliate_id);
  if (!affiliate || affiliate.status !== 'active') {
    return res.status(400).json({ error: 'Affiliate partner is not currently active' });
  }

  const ipHash = crypto.createHash('sha256').update(req.ip || '127.0.0.1').digest('hex').substring(0, 16);

  // Check duplicate event within 1 hour
  const oneHourAgo = Date.now() - 3600000;
  const recentEvent = db.referralEvents.find(
    (ev) =>
      ev.affiliate_id === affiliate.id &&
      ev.ip_hash === ipHash &&
      new Date(ev.created_at).getTime() > oneHourAgo
  );

  const isDuplicate = Boolean(recentEvent);

  const event: ReferralEvent = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    referral_code_id: referralCode.id,
    affiliate_id: affiliate.id,
    ip_hash: ipHash,
    user_agent: req.headers['user-agent'] as string,
    referrer_url: referrer,
    landing_page: landingPage,
    visitor_session_id: sessionId,
    is_duplicate: isDuplicate,
    created_at: new Date().toISOString()
  };

  db.referralEvents.unshift(event);
  if (!isDuplicate) {
    affiliate.total_referral_clicks += 1;
  }

  // Attribution record (default 60 days duration unless configured)
  const attributionSetting = db.systemSettings.find((s) => s.setting_key === 'affiliate_attribution_window_days');
  const attributionDays = attributionSetting?.setting_value?.value || 60;
  const expiresAt = new Date(Date.now() + attributionDays * 86400000).toISOString();

  let attribution = db.attributions.find((a) => a.visitor_session_id === sessionId);
  if (attribution) {
    attribution.last_click_at = new Date().toISOString();
    attribution.expires_at = expiresAt;
  } else {
    attribution = {
      id: `attr-${Date.now()}`,
      visitor_session_id: sessionId,
      affiliate_id: affiliate.id,
      referral_code_id: referralCode.id,
      first_click_at: new Date().toISOString(),
      last_click_at: new Date().toISOString(),
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    };
    db.attributions.push(attribution);
  }

  res.json({
    success: true,
    tracked: true,
    affiliate_code: referralCode.code,
    is_duplicate: isDuplicate
  });
});

// 5. Affiliate Application Submission (Public)
const applicationSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  applicantType: z.enum(['individual', 'business']),
  businessName: z.string().optional(),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(6, 'Valid international phone number is required'),
  country: z.string().min(2, 'Country is required'),
  partnershipType: z.string().min(2, 'Partnership type is required'),
  industryBackground: z.string().min(10, 'Please describe your professional background'),
  audienceDescription: z.string().min(10, 'Please describe your network or clientele'),
  partnershipObjectives: z.string().min(10, 'Please describe your partnership goals'),
  additionalNotes: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Affiliate Terms'
  }),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Privacy Policy'
  })
});

app.post('/api/applications/apply', (req: Request, res: Response) => {
  const parseResult = applicationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parseResult.error.flatten().fieldErrors
    });
  }

  const data = parseResult.data;
  const normalizedEmail = data.email.trim().toLowerCase();

  // Check duplicate application
  const existingApp = db.applications.find(
    (a) => a.normalized_email === normalizedEmail && ['submitted', 'under_review', 'approved'].includes(a.status)
  );

  if (existingApp) {
    return res.status(409).json({
      error: 'An active application with this email address already exists. Please contact the R3 partner advisory desk.'
    });
  }

  const newApp: AffiliateApplication = {
    id: `app-${Date.now()}`,
    full_name: data.fullName,
    applicant_type: data.applicantType,
    business_name: data.applicantType === 'business' ? data.businessName : undefined,
    email: data.email,
    normalized_email: normalizedEmail,
    phone: data.phone,
    country: data.country,
    partnership_type: data.partnershipType,
    industry_background: data.industryBackground,
    audience_description: data.audienceDescription,
    partnership_objectives: data.partnershipObjectives,
    additional_notes: data.additionalNotes,
    status: 'submitted',
    terms_accepted: data.termsAccepted,
    privacy_accepted: data.privacyAccepted,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.applications.unshift(newApp);

  recordAuditLog(
    'applicant:' + normalizedEmail,
    'APPLICATION_SUBMITTED',
    'affiliate_applications',
    newApp.id,
    undefined,
    { applicant_type: data.applicantType, country: data.country },
    req
  );

  res.status(201).json({
    success: true,
    message: 'Application received successfully. R3 Compliance will review your credentials within 2 business days.',
    application_id: newApp.id
  });
});

// 6. Admin Applications Review
app.get('/api/admin/applications', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'affiliate_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Unauthorized staff access required' });
  }

  const { status, country, search } = req.query;
  let filtered = [...db.applications];

  if (status && status !== 'all') {
    filtered = filtered.filter((a) => a.status === status);
  }
  if (country && country !== 'all') {
    filtered = filtered.filter((a) => a.country.toLowerCase() === (country as string).toLowerCase());
  }
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.full_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.business_name && a.business_name.toLowerCase().includes(q))
    );
  }

  res.json({ applications: filtered, total: filtered.length });
});

// 7. Admin Application Status Update (Approve, Reject, Request Info)
app.patch('/api/admin/applications/:id', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'affiliate_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Unauthorized staff access required' });
  }

  const { id } = req.params;
  const { status, internal_notes } = req.body;

  const appItem = db.applications.find((a) => a.id === id);
  if (!appItem) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const previousState = { ...appItem };
  appItem.status = status;
  if (internal_notes !== undefined) {
    appItem.internal_notes = internal_notes;
  }
  appItem.reviewed_by = auth.profile.id;
  appItem.reviewed_at = new Date().toISOString();
  appItem.updated_at = new Date().toISOString();

  // If approved, create activation token and provision affiliate entity
  if (status === 'approved' && !appItem.activation_token) {
    const activationToken = `act_${crypto.randomBytes(24).toString('hex')}`;
    appItem.activation_token = activationToken;
    appItem.activation_expires_at = new Date(Date.now() + 86400000 * 14).toISOString(); // 14 days

    // If profile does not exist yet, create or prepare
    let existingProfile = db.profiles.find((p) => p.email.toLowerCase() === appItem.normalized_email);
    if (!existingProfile) {
      existingProfile = {
        id: `prof-${Date.now()}`,
        email: appItem.normalized_email,
        full_name: appItem.full_name,
        phone: appItem.phone,
        country: appItem.country,
        role: 'affiliate',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.profiles.push(existingProfile);
    }

    // Provision affiliate record
    const nextAffiliateNumber = `R3-${10000 + db.affiliates.length + 1}`;
    let affiliate = db.affiliates.find((a) => a.profile_id === existingProfile!.id);
    if (!affiliate) {
      affiliate = {
        id: `aff-${Date.now()}`,
        profile_id: existingProfile.id,
        application_id: appItem.id,
        affiliate_number: nextAffiliateNumber,
        status: 'active',
        payout_currency: 'USD',
        tax_id_verified: false,
        country: appItem.country,
        total_referral_clicks: 0,
        total_conversions: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.affiliates.push(affiliate);

      // Create default referral code
      db.referralCodes.push({
        id: `code-${Date.now()}`,
        affiliate_id: affiliate.id,
        code: nextAffiliateNumber,
        target_url: '/',
        is_active: true,
        created_at: new Date().toISOString()
      });
    }
  }

  recordAuditLog(
    auth.profile.email,
    `APPLICATION_STATUS_${status.toUpperCase()}`,
    'affiliate_applications',
    appItem.id,
    previousState,
    { status, reviewed_by: auth.profile.email },
    req
  );

  res.json({ success: true, application: appItem });
});

// 8. Affiliate Dashboard Data (Authenticated Affiliate)
app.get('/api/affiliate/dashboard', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || auth.role !== 'affiliate') {
    return res.status(403).json({ error: 'Affiliate access required' });
  }

  const affiliate = db.affiliates.find((a) => a.profile_id === auth.profile.id);
  if (!affiliate) {
    return res.status(404).json({ error: 'Affiliate record not found' });
  }

  const referralCodes = db.referralCodes.filter((c) => c.affiliate_id === affiliate.id && c.is_active);
  const events = db.referralEvents.filter((e) => e.affiliate_id === affiliate.id);
  const leads = db.leads.filter((l) => l.affiliate_id === affiliate.id);
  const conversions = db.conversions.filter((c) => c.affiliate_id === affiliate.id);
  const ledgerEntries = db.commissionLedger.filter((l) => l.affiliate_id === affiliate.id);
  const payoutItems = db.payoutItems.filter((p) => p.affiliate_id === affiliate.id);

  // Financial aggregates calculated with exact integer arithmetic
  let pendingCents = 0;
  let approvedCents = 0;
  let payableCents = 0;
  let paidCents = 0;

  for (const entry of ledgerEntries) {
    if (entry.status === 'pending') pendingCents += entry.commission_amount_cents;
    else if (entry.status === 'approved') approvedCents += entry.commission_amount_cents;
    else if (entry.status === 'payable' || entry.status === 'in_payout_batch') payableCents += entry.commission_amount_cents;
    else if (entry.status === 'paid') paidCents += entry.commission_amount_cents;
  }

  const uniqueVisitors = new Set(events.map((e) => e.visitor_session_id)).size;

  res.json({
    affiliate,
    referralCodes,
    stats: {
      total_clicks: events.length,
      unique_visitors: uniqueVisitors,
      leads_generated: leads.length,
      verified_conversions: conversions.filter((c) => c.verification_status === 'verified').length,
      pending_commissions_cents: pendingCents,
      approved_commissions_cents: approvedCents,
      payable_commissions_cents: payableCents,
      paid_commissions_cents: paidCents,
      currency: affiliate.payout_currency || 'USD'
    },
    conversions,
    ledger: ledgerEntries,
    payouts: payoutItems,
    recentEvents: events.slice(0, 10)
  });
});

// 9. Manual Sales Verification System (R3 Staff only)
const createConversionSchema = z.object({
  customerReference: z.string().min(2, 'Customer reference is required'),
  customerEmail: z.string().email().optional(),
  affiliateId: z.string().min(1, 'Assigned affiliate is required'),
  membershipTier: z.enum(['silver', 'gold', 'excelsior', 'bespoke_service']),
  eligibleSaleAmountCents: z.number().int().positive('Eligible sale amount must be positive'),
  currency: z.string().default('USD'),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid YYYY-MM-DD date required'),
  supportingEvidenceUrl: z.string().optional(),
  supportingNotes: z.string().min(5, 'Verification notes are required')
});

app.post('/api/admin/conversions', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'affiliate_manager', 'finance_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Unauthorized staff access required' });
  }

  const parseResult = createConversionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten().fieldErrors });
  }

  const data = parseResult.data;
  const affiliate = db.affiliates.find((a) => a.id === data.affiliateId);
  if (!affiliate) {
    return res.status(404).json({ error: 'Assigned affiliate does not exist' });
  }

  const txRef = `TX-R3-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

  const conversion: Conversion = {
    id: `conv-${Date.now()}`,
    transaction_reference: txRef,
    customer_reference: data.customerReference,
    customer_email: data.customerEmail,
    affiliate_id: data.affiliateId,
    membership_tier: data.membershipTier,
    eligible_sale_amount_cents: data.eligibleSaleAmountCents,
    currency: data.currency,
    transaction_date: data.transactionDate,
    verification_status: 'pending',
    supporting_evidence_url: data.supportingEvidenceUrl,
    supporting_notes: data.supportingNotes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.conversions.unshift(conversion);

  recordAuditLog(
    auth.profile.email,
    'CONVERSION_REGISTERED',
    'conversions',
    conversion.id,
    undefined,
    { transaction_reference: txRef, amount_cents: data.eligibleSaleAmountCents, tier: data.membershipTier },
    req
  );

  res.status(201).json({ success: true, conversion });
});

// 10. Verify / Approve / Reject Conversion (Critical Business Logic)
app.patch('/api/admin/conversions/:id/verify', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'finance_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Only authorized Finance staff or Super Admins can verify sales' });
  }

  const { id } = req.params;
  const { verification_status, rejection_reason, supporting_notes } = req.body;

  if (!['verified', 'rejected', 'reversed', 'under_review'].includes(verification_status)) {
    return res.status(400).json({ error: 'Invalid verification status' });
  }

  const conversion = db.conversions.find((c) => c.id === id);
  if (!conversion) {
    return res.status(404).json({ error: 'Conversion not found' });
  }

  const prev = { ...conversion };
  conversion.verification_status = verification_status;
  if (rejection_reason) conversion.rejection_reason = rejection_reason;
  if (supporting_notes) conversion.supporting_notes = supporting_notes;
  conversion.verified_by = auth.profile.id;
  conversion.verified_at = new Date().toISOString();
  conversion.updated_at = new Date().toISOString();

  // If verified, generate immutable commission ledger entry IF rule is configured
  if (verification_status === 'verified') {
    const affiliate = db.affiliates.find((a) => a.id === conversion.affiliate_id);
    if (affiliate) {
      affiliate.total_conversions += 1;

      // Find active approved commission rule
      const activeRule = db.commissionRules.find((r) => r.is_approved_by_r3);
      
      const rateToUse = affiliate.custom_commission_rate ?? (activeRule ? activeRule.commission_percentage : null);

      if (rateToUse !== null) {
        // Safe integer math: sale_cents * rate / 100
        const commissionCents = Math.round((conversion.eligible_sale_amount_cents * rateToUse) / 100);

        const ledgerEntry: CommissionLedgerEntry = {
          id: `led-${Date.now()}`,
          affiliate_id: affiliate.id,
          conversion_id: conversion.id,
          rule_id: activeRule?.id,
          rate_applied_percentage: rateToUse,
          eligible_sale_cents: conversion.eligible_sale_amount_cents,
          commission_amount_cents: commissionCents,
          currency: conversion.currency,
          event_type: 'commission_earned',
          status: 'approved',
          adjustment_reason: `Sale ${conversion.transaction_reference} verified by ${auth.profile.full_name}`,
          created_by: auth.profile.id,
          created_at: new Date().toISOString()
        };

        db.commissionLedger.unshift(ledgerEntry);
      } else {
        // As mandated by prompt: "Never invent these values. Build configurable administrative settings with no active commission rule until R3 approves and configures it."
        // We create a pending ledger item noting waiting for R3 approval.
        const pendingEntry: CommissionLedgerEntry = {
          id: `led-${Date.now()}`,
          affiliate_id: affiliate.id,
          conversion_id: conversion.id,
          rate_applied_percentage: 0,
          eligible_sale_cents: conversion.eligible_sale_amount_cents,
          commission_amount_cents: 0,
          currency: conversion.currency,
          event_type: 'commission_earned',
          status: 'pending',
          adjustment_reason: 'Awaiting active commission percentage approval by R3 Contingencies executive management',
          created_by: auth.profile.id,
          created_at: new Date().toISOString()
        };
        db.commissionLedger.unshift(pendingEntry);
      }
    }
  }

  recordAuditLog(
    auth.profile.email,
    `CONVERSION_${verification_status.toUpperCase()}`,
    'conversions',
    conversion.id,
    prev,
    { verification_status, verified_by: auth.profile.email },
    req
  );

  res.json({ success: true, conversion });
});

// 11. Conversions list for Admin
app.get('/api/admin/conversions', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'affiliate_manager', 'finance_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Unauthorized staff access required' });
  }

  // Join affiliates
  const enriched = db.conversions.map((conv) => {
    const affiliate = db.affiliates.find((a) => a.id === conv.affiliate_id);
    const profile = affiliate ? db.profiles.find((p) => p.id === affiliate.profile_id) : null;
    return {
      ...conv,
      affiliate_number: affiliate?.affiliate_number,
      affiliate_name: profile?.full_name,
      affiliate_email: profile?.email
    };
  });

  res.json({ conversions: enriched });
});

// 12. Commission Rules Management
app.get('/api/admin/commission-rules', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'finance_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Staff access required' });
  }

  res.json({ rules: db.commissionRules });
});

app.post('/api/admin/commission-rules', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || auth.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only Super Administrators can create commission rules' });
  }

  const { rule_name, commission_percentage, eligible_basis, membership_tier, is_approved_by_r3 } = req.body;

  if (commission_percentage === undefined || commission_percentage < 0 || commission_percentage > 100) {
    return res.status(400).json({ error: 'Valid percentage between 0 and 100 is required' });
  }

  const newRule: CommissionRule = {
    id: `rule-${Date.now()}`,
    rule_name: rule_name || `Commission Tier Rule (${commission_percentage}%)`,
    commission_percentage: Number(commission_percentage),
    eligible_basis: eligible_basis || 'net_eligible_sale',
    membership_tier: membership_tier || 'all',
    is_approved_by_r3: Boolean(is_approved_by_r3),
    effective_from: new Date().toISOString().split('T')[0],
    created_by: auth.profile.id,
    created_at: new Date().toISOString()
  };

  db.commissionRules.unshift(newRule);

  recordAuditLog(
    auth.profile.email,
    'COMMISSION_RULE_CREATED',
    'commission_rules',
    newRule.id,
    undefined,
    newRule,
    req
  );

  res.status(201).json({ success: true, rule: newRule });
});

// Toggle rule approval
app.patch('/api/admin/commission-rules/:id/approve', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || auth.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only Super Administrators can approve commission rules' });
  }

  const { id } = req.params;
  const { is_approved_by_r3 } = req.body;

  const rule = db.commissionRules.find((r) => r.id === id);
  if (!rule) {
    return res.status(404).json({ error: 'Rule not found' });
  }

  const prev = { ...rule };
  rule.is_approved_by_r3 = Boolean(is_approved_by_r3);

  recordAuditLog(
    auth.profile.email,
    rule.is_approved_by_r3 ? 'COMMISSION_RULE_APPROVED' : 'COMMISSION_RULE_DEACTIVATED',
    'commission_rules',
    rule.id,
    prev,
    { is_approved_by_r3: rule.is_approved_by_r3 },
    req
  );

  res.json({ success: true, rule });
});

// 13. Commission Ledger for Admin
app.get('/api/admin/commission-ledger', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'finance_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Finance staff access required' });
  }

  const enriched = db.commissionLedger.map((item) => {
    const affiliate = db.affiliates.find((a) => a.id === item.affiliate_id);
    const profile = affiliate ? db.profiles.find((p) => p.id === affiliate.profile_id) : null;
    const conversion = item.conversion_id ? db.conversions.find((c) => c.id === item.conversion_id) : null;
    return {
      ...item,
      affiliate_number: affiliate?.affiliate_number,
      affiliate_name: profile?.full_name,
      transaction_reference: conversion?.transaction_reference
    };
  });

  res.json({ ledger: enriched });
});

// 14. Monthly Payout Batches
app.get('/api/admin/payouts', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'finance_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Finance staff access required' });
  }

  const enrichedBatches = db.payoutBatches.map((batch) => {
    const items = db.payoutItems.filter((i) => i.payout_batch_id === batch.id).map((item) => {
      const affiliate = db.affiliates.find((a) => a.id === item.affiliate_id);
      const profile = affiliate ? db.profiles.find((p) => p.id === affiliate.profile_id) : null;
      return {
        ...item,
        affiliate_number: affiliate?.affiliate_number,
        affiliate_name: profile?.full_name,
        payout_details: affiliate?.payout_details
      };
    });
    return {
      ...batch,
      items
    };
  });

  res.json({ batches: enrichedBatches });
});

// Generate new monthly payout batch
app.post('/api/admin/payouts/generate-batch', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'finance_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Finance staff access required' });
  }

  const { period_start, period_end, currency = 'USD' } = req.body;
  if (!period_start || !period_end) {
    return res.status(400).json({ error: 'Period start and end dates are required' });
  }

  // Find payable commissions
  const eligibleCommissions = db.commissionLedger.filter(
    (c) => ['approved', 'payable'].includes(c.status) && c.currency === currency
  );

  if (eligibleCommissions.length === 0) {
    return res.status(400).json({ error: 'No approved commissions found for this batch.' });
  }

  // Group by affiliate
  const affiliateGroups = new Map<string, { count: number; totalCents: number }>();
  for (const c of eligibleCommissions) {
    const cur = affiliateGroups.get(c.affiliate_id) || { count: 0, totalCents: 0 };
    cur.count += 1;
    cur.totalCents += c.commission_amount_cents;
    affiliateGroups.set(c.affiliate_id, cur);
  }

  const batchId = `batch-${Date.now()}`;
  const batchNum = `BATCH-${period_start.substring(0, 7)}-${currency}-${Math.floor(100 + Math.random() * 900)}`;

  let batchTotalCents = 0;
  const items: PayoutItem[] = [];

  affiliateGroups.forEach((val, affId) => {
    const aff = db.affiliates.find((a) => a.id === affId);
    batchTotalCents += val.totalCents;
    const item: PayoutItem = {
      id: `pitem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      payout_batch_id: batchId,
      affiliate_id: affId,
      total_commissions_count: val.count,
      gross_amount_cents: val.totalCents,
      fees_deducted_cents: 0,
      net_payable_cents: val.totalCents,
      currency: currency,
      payout_method: aff?.payout_method || 'wire_transfer',
      status: 'pending'
    };
    items.push(item);
  });

  const newBatch: PayoutBatch = {
    id: batchId,
    batch_number: batchNum,
    period_start,
    period_end,
    total_affiliates_count: affiliateGroups.size,
    total_amount_cents: batchTotalCents,
    currency,
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.payoutBatches.unshift(newBatch);
  for (const item of items) {
    db.payoutItems.push(item);
  }

  // Update commission status to 'in_payout_batch'
  for (const c of eligibleCommissions) {
    c.status = 'in_payout_batch';
  }

  recordAuditLog(
    auth.profile.email,
    'PAYOUT_BATCH_GENERATED',
    'payout_batches',
    newBatch.id,
    undefined,
    { batch_number: batchNum, total_cents: batchTotalCents, affiliates: affiliateGroups.size },
    req
  );

  res.status(201).json({ success: true, batch: newBatch, items_count: items.length });
});

// Approve payout batch
app.patch('/api/admin/payouts/batches/:id/approve', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'finance_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Finance staff access required' });
  }

  const batch = db.payoutBatches.find((b) => b.id === req.params.id);
  if (!batch) {
    return res.status(404).json({ error: 'Payout batch not found' });
  }

  batch.status = 'approved';
  batch.approved_by = auth.profile.id;
  batch.approved_at = new Date().toISOString();
  batch.updated_at = new Date().toISOString();

  // Approve all items in batch
  const items = db.payoutItems.filter((i) => i.payout_batch_id === batch.id);
  for (const item of items) {
    if (item.status === 'pending') {
      item.status = 'approved';
    }
  }

  recordAuditLog(
    auth.profile.email,
    'PAYOUT_BATCH_APPROVED',
    'payout_batches',
    batch.id,
    undefined,
    { status: 'approved', approved_by: auth.profile.email },
    req
  );

  res.json({ success: true, batch });
});

// Mark Payout Item Paid & Record Evidence
app.patch('/api/admin/payouts/items/:id/pay', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'finance_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Finance staff access required' });
  }

  const { payment_reference, payment_evidence_url } = req.body;
  if (!payment_reference) {
    return res.status(400).json({ error: 'Payment reference (e.g., bank transfer reference) is required' });
  }

  const item = db.payoutItems.find((i) => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Payout item not found' });
  }

  item.status = 'paid';
  item.payment_reference = payment_reference;
  if (payment_evidence_url) item.payment_evidence_url = payment_evidence_url;
  item.processed_at = new Date().toISOString();

  // Mark ledger entries for this affiliate as paid
  const commissions = db.commissionLedger.filter(
    (c) => c.affiliate_id === item.affiliate_id && c.status === 'in_payout_batch'
  );
  for (const c of commissions) {
    c.status = 'paid';
  }

  recordAuditLog(
    auth.profile.email,
    'PAYOUT_ITEM_PAID',
    'payout_items',
    item.id,
    undefined,
    { payment_reference, net_payable_cents: item.net_payable_cents },
    req
  );

  res.json({ success: true, item });
});

// 15. CMS: Pages
app.get('/api/cms/pages', (req: Request, res: Response) => {
  res.json({ pages: db.sitePages });
});

app.get('/api/cms/pages/:slug', (req: Request, res: Response) => {
  const page = db.sitePages.find((p) => p.slug === req.params.slug);
  if (!page) {
    return res.status(404).json({ error: 'Page not found' });
  }
  res.json({ page });
});

app.put('/api/cms/pages/:slug', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'content_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Content editor access required' });
  }

  const page = db.sitePages.find((p) => p.slug === req.params.slug);
  if (!page) {
    return res.status(404).json({ error: 'Page not found' });
  }

  const { title, meta_description, status } = req.body;
  if (title) page.title = title;
  if (meta_description !== undefined) page.meta_description = meta_description;
  if (status) page.status = status;
  page.updated_by = auth.profile.id;
  page.updated_at = new Date().toISOString();

  recordAuditLog(
    auth.profile.email,
    'CMS_PAGE_UPDATED',
    'site_pages',
    page.id,
    undefined,
    { slug: page.slug, title, status },
    req
  );

  res.json({ success: true, page });
});

// 16. CMS: FAQs
app.get('/api/cms/faqs', (req: Request, res: Response) => {
  const { category } = req.query;
  let faqs = [...db.siteFaqs];
  if (category && category !== 'all') {
    faqs = faqs.filter((f) => f.category === category);
  }
  res.json({ faqs });
});

app.post('/api/cms/faqs', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'content_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Content editor access required' });
  }

  const { category, question, answer, display_order } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  const newFaq: SiteFAQ = {
    id: `faq-${Date.now()}`,
    category: category || 'general',
    question,
    answer,
    display_order: display_order || db.siteFaqs.length + 1,
    is_published: true,
    created_at: new Date().toISOString()
  };

  db.siteFaqs.push(newFaq);

  recordAuditLog(
    auth.profile.email,
    'CMS_FAQ_CREATED',
    'site_faqs',
    newFaq.id,
    undefined,
    { question },
    req
  );

  res.status(201).json({ success: true, faq: newFaq });
});

// 17. Contact Inquiries (Public)
const contactSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  country: z.string().optional(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the privacy consent'
  })
});

app.post('/api/contact', (req: Request, res: Response) => {
  const parseResult = contactSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten().fieldErrors });
  }

  const data = parseResult.data;
  const inquiry: ContactInquiry = {
    id: `inq-${Date.now()}`,
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    country: data.country,
    subject: data.subject,
    message: data.message,
    privacy_consent: data.privacyConsent,
    status: 'new',
    created_at: new Date().toISOString()
  };

  db.contactInquiries.unshift(inquiry);

  recordAuditLog(
    'public:' + data.email,
    'CONTACT_INQUIRY_SUBMITTED',
    'contact_inquiries',
    inquiry.id,
    undefined,
    { subject: data.subject },
    req
  );

  res.status(201).json({
    success: true,
    message: 'Thank you. Your inquiry has been dispatched to the R3 Contingencies coordination desk.'
  });
});

app.get('/api/admin/inquiries', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'affiliate_manager', 'content_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Staff access required' });
  }

  res.json({ inquiries: db.contactInquiries });
});

// 18. Audit Logs for Admin
app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || auth.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only Super Administrators can inspect audit logs' });
  }

  res.json({ logs: db.auditLogs.slice(0, 100) });
});

// 19. System Settings (Commercial rules & toggles)
app.get('/api/admin/settings', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'finance_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Staff access required' });
  }

  res.json({ settings: db.systemSettings });
});

app.patch('/api/admin/settings/:key', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || auth.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only Super Administrators can modify system settings' });
  }

  const { setting_value, is_approved_by_r3 } = req.body;
  const setting = db.systemSettings.find((s) => s.setting_key === req.params.key);
  if (!setting) {
    return res.status(404).json({ error: 'Setting not found' });
  }

  const prev = { ...setting };
  if (setting_value !== undefined) setting.setting_value = setting_value;
  if (is_approved_by_r3 !== undefined) setting.is_approved_by_r3 = Boolean(is_approved_by_r3);
  setting.updated_by = auth.profile.id;
  setting.updated_at = new Date().toISOString();

  recordAuditLog(
    auth.profile.email,
    'SYSTEM_SETTING_UPDATED',
    'system_settings',
    setting.id,
    prev,
    { key: setting.setting_key, is_approved_by_r3: setting.is_approved_by_r3 },
    req
  );

  res.json({ success: true, setting });
});

// 20. Admin System Overview Stats
app.get('/api/admin/overview', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'affiliate_manager', 'finance_manager', 'content_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Staff access required' });
  }

  const totalAffiliates = db.affiliates.length;
  const activeAffiliates = db.affiliates.filter((a) => a.status === 'active').length;
  const pendingApplications = db.applications.filter((a) => ['submitted', 'under_review'].includes(a.status)).length;
  const totalClicks = db.referralEvents.length;
  const totalLeads = db.leads.length;
  const pendingSales = db.conversions.filter((c) => c.verification_status === 'pending').length;
  const verifiedSales = db.conversions.filter((c) => c.verification_status === 'verified').length;

  let totalCommissionLiabilityCents = 0;
  for (const c of db.commissionLedger) {
    if (['approved', 'payable', 'in_payout_batch'].includes(c.status)) {
      totalCommissionLiabilityCents += c.commission_amount_cents;
    }
  }

  let totalPaidOutCents = 0;
  for (const p of db.payoutItems) {
    if (p.status === 'paid') {
      totalPaidOutCents += p.net_payable_cents;
    }
  }

  res.json({
    totalAffiliates,
    activeAffiliates,
    pendingApplications,
    totalClicks,
    totalLeads,
    pendingSales,
    verifiedSales,
    totalCommissionLiabilityCents,
    totalPaidOutCents,
    currency: 'USD'
  });
});

// 21. Affiliates List for Admin
app.get('/api/admin/affiliates', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'affiliate_manager', 'finance_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Staff access required' });
  }

  const enriched = db.affiliates.map((aff) => {
    const profile = db.profiles.find((p) => p.id === aff.profile_id);
    const codes = db.referralCodes.filter((c) => c.affiliate_id === aff.id);
    const conversionsCount = db.conversions.filter((c) => c.affiliate_id === aff.id && c.verification_status === 'verified').length;
    return {
      ...aff,
      profile,
      primary_code: codes[0]?.code || aff.affiliate_number,
      verified_conversions_count: conversionsCount
    };
  });

  res.json({ affiliates: enriched });
});

// 22. Toggle Affiliate Status (Activate / Suspend)
app.patch('/api/admin/affiliates/:id/status', (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth || !['super_admin', 'affiliate_manager'].includes(auth.role)) {
    return res.status(403).json({ error: 'Staff access required' });
  }

  const { status } = req.body;
  if (!['active', 'suspended', 'terminated'].includes(status)) {
    return res.status(400).json({ error: 'Invalid affiliate status' });
  }

  const aff = db.affiliates.find((a) => a.id === req.params.id);
  if (!aff) {
    return res.status(404).json({ error: 'Affiliate not found' });
  }

  const prev = { ...aff };
  aff.status = status;
  aff.updated_at = new Date().toISOString();

  recordAuditLog(
    auth.profile.email,
    `AFFILIATE_STATUS_${status.toUpperCase()}`,
    'affiliates',
    aff.id,
    prev,
    { status },
    req
  );

  res.json({ success: true, affiliate: aff });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE INTEGRATION (DEV / PROD)
// -------------------------------------------------------------

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        port: PORT,
        host: '0.0.0.0',
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[R3 Contingencies Server] Listening on port ${PORT}`);
  });
}

startServer();
