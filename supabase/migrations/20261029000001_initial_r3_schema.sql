-- ====================================================================
-- R3 Contingencies: Enterprise PostgreSQL Database Schema
-- Migration: 20261029000001_initial_r3_schema.sql
-- ====================================================================

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  timezone TEXT DEFAULT 'UTC',
  role TEXT NOT NULL DEFAULT 'affiliate' CHECK (role IN ('super_admin', 'affiliate_manager', 'finance_manager', 'content_manager', 'affiliate')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. STAFF ROLES (Explicit RBAC permissions for R3 staff)
CREATE TABLE IF NOT EXISTS public.staff_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL CHECK (role_name IN ('super_admin', 'affiliate_manager', 'finance_manager', 'content_manager')),
  granted_by UUID REFERENCES public.profiles(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  revoked_at TIMESTAMPTZ,
  notes TEXT
);

-- 3. AFFILIATE APPLICATIONS (Onboarding funnel)
CREATE TABLE IF NOT EXISTS public.affiliate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  applicant_type TEXT NOT NULL CHECK (applicant_type IN ('individual', 'business')),
  business_name TEXT,
  email TEXT NOT NULL,
  normalized_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  partnership_type TEXT NOT NULL,
  industry_background TEXT NOT NULL,
  audience_description TEXT NOT NULL,
  partnership_objectives TEXT NOT NULL,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'info_requested', 'approved', 'rejected', 'withdrawn')),
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  internal_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  activation_token TEXT UNIQUE,
  activation_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. AFFILIATES (Approved & activated partners)
CREATE TABLE IF NOT EXISTS public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE RESTRICT,
  application_id UUID REFERENCES public.affiliate_applications(id),
  affiliate_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending_activation', 'active', 'suspended', 'terminated')),
  custom_commission_rate NUMERIC(5,2), -- NULL means use system approved rule
  payout_method TEXT CHECK (payout_method IN ('wire_transfer', 'sepa', 'swift', 'ach', 'corporate_check')),
  payout_currency TEXT NOT NULL DEFAULT 'USD',
  payout_details JSONB DEFAULT '{}'::jsonb,
  tax_id_verified BOOLEAN NOT NULL DEFAULT false,
  country TEXT NOT NULL,
  total_referral_clicks INT NOT NULL DEFAULT 0,
  total_conversions INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. REFERRAL CODES (Unique attribution tokens)
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  target_url TEXT NOT NULL DEFAULT '/',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. REFERRAL EVENTS (Raw click tracking)
CREATE TABLE IF NOT EXISTS public.referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  ip_hash TEXT NOT NULL,
  user_agent TEXT,
  referrer_url TEXT,
  landing_page TEXT NOT NULL,
  country_code TEXT,
  visitor_session_id TEXT NOT NULL,
  is_duplicate BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. REFERRAL ATTRIBUTIONS (Attribution cookie sessions)
CREATE TABLE IF NOT EXISTS public.referral_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_session_id TEXT NOT NULL UNIQUE,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  first_click_at TIMESTAMPTZ NOT NULL,
  last_click_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. LEADS (Prospect inquiries originating from referral)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE SET NULL,
  referral_code_id UUID REFERENCES public.referral_codes(id) ON DELETE SET NULL,
  visitor_session_id TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  interested_tier TEXT CHECK (interested_tier IN ('silver', 'gold', 'excelsior', 'bespoke', 'other')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. CONVERSIONS (Manually verified customer sales)
CREATE TABLE IF NOT EXISTS public.conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_reference TEXT NOT NULL UNIQUE,
  customer_reference TEXT NOT NULL,
  customer_email TEXT,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE RESTRICT,
  membership_tier TEXT NOT NULL CHECK (membership_tier IN ('silver', 'gold', 'excelsior', 'bespoke_service')),
  eligible_sale_amount_cents BIGINT NOT NULL CHECK (eligible_sale_amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  transaction_date DATE NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected', 'reversed')),
  supporting_evidence_url TEXT,
  supporting_notes TEXT,
  rejection_reason TEXT,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. COMMISSION RULES (Configurable admin rules, subject to R3 approval)
CREATE TABLE IF NOT EXISTS public.commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  commission_percentage NUMERIC(5,2) NOT NULL CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
  eligible_basis TEXT NOT NULL DEFAULT 'net_eligible_sale' CHECK (eligible_basis IN ('gross_sale', 'net_eligible_sale')),
  membership_tier TEXT CHECK (membership_tier IN ('all', 'silver', 'gold', 'excelsior', 'bespoke_service')),
  is_approved_by_r3 BOOLEAN NOT NULL DEFAULT false,
  effective_from DATE NOT NULL,
  effective_until DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. COMMISSION LEDGER (Auditable, immutable financial ledger)
CREATE TABLE IF NOT EXISTS public.commission_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE RESTRICT,
  conversion_id UUID REFERENCES public.conversions(id) ON DELETE RESTRICT,
  rule_id UUID REFERENCES public.commission_rules(id),
  rate_applied_percentage NUMERIC(5,2) NOT NULL,
  eligible_sale_cents BIGINT NOT NULL,
  commission_amount_cents BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  event_type TEXT NOT NULL CHECK (event_type IN ('commission_earned', 'commission_reversed', 'manual_adjustment', 'payout_deduction')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'payable', 'in_payout_batch', 'paid', 'reversed', 'disputed')),
  adjustment_reason TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. PAYOUT BATCHES (Monthly payout groupings)
CREATE TABLE IF NOT EXISTS public.payout_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT NOT NULL UNIQUE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_affiliates_count INT NOT NULL DEFAULT 0,
  total_amount_cents BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'processing', 'paid', 'failed', 'reconciled')),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. PAYOUT ITEMS (Per-affiliate itemized totals in a batch)
CREATE TABLE IF NOT EXISTS public.payout_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_batch_id UUID NOT NULL REFERENCES public.payout_batches(id) ON DELETE CASCADE,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE RESTRICT,
  total_commissions_count INT NOT NULL,
  gross_amount_cents BIGINT NOT NULL,
  fees_deducted_cents BIGINT NOT NULL DEFAULT 0,
  net_payable_cents BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payout_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'paid', 'failed', 'on_hold')),
  payment_reference TEXT,
  payment_evidence_url TEXT,
  processed_at TIMESTAMPTZ
);

-- 14. PAYOUT TRANSACTIONS (Reconciliation records)
CREATE TABLE IF NOT EXISTS public.payout_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_item_id UUID NOT NULL REFERENCES public.payout_items(id) ON DELETE CASCADE,
  external_transaction_id TEXT,
  provider TEXT,
  amount_cents BIGINT NOT NULL,
  currency TEXT NOT NULL,
  reconciliation_notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. CONTACT INQUIRIES (Public contact form submissions)
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  privacy_consent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'responded', 'escalated', 'archived')),
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. SITE PAGES (CMS page registry)
CREATE TABLE IF NOT EXISTS public.site_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_description TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. SITE CONTENT (CMS editable sections and copy)
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL REFERENCES public.site_pages(slug) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  content_json JSONB NOT NULL,
  version INT NOT NULL DEFAULT 1,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(page_slug, section_key)
);

-- 18. SITE FAQS (CMS FAQs)
CREATE TABLE IF NOT EXISTS public.site_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('membership', 'services', 'flex_funds', 'affiliates', 'general')),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 19. MEDIA ASSETS (Supabase storage file records)
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  alt_text TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 20. NOTIFICATIONS (System alerts and transactional notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  link_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 21. AUDIT LOGS (Compliance, security, and administrative action trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  previous_state JSONB,
  new_state JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 22. SYSTEM SETTINGS (Configurable commercial parameters)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  is_approved_by_r3 BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_affiliates_profile ON public.affiliates(profile_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_code ON public.referral_events(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_created ON public.referral_events(created_at);
CREATE INDEX IF NOT EXISTS idx_conversions_affiliate ON public.conversions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_affiliate ON public.commission_ledger(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_profile_id);
