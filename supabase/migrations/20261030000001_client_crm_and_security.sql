-- ====================================================================
-- R3 Contingencies: Client CRM & Enhanced Security Migration
-- Migration: 20261030000001_client_crm_and_security.sql
-- ====================================================================

-- 1. CLIENT PROFILES
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  normalized_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  client_type TEXT NOT NULL CHECK (client_type IN ('individual', 'business')),
  company_name TEXT,
  preferred_contact_method TEXT NOT NULL CHECK (preferred_contact_method IN ('email', 'phone', 'whatsapp')),
  consent_contacted BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'followup_required', 'in_discussion', 'converted', 'not_interested', 'closed')),
  assigned_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lead_source TEXT DEFAULT 'direct_web',
  attributed_affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Unique index on normalized email for active leads
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_profiles_email ON public.client_profiles(normalized_email);
CREATE INDEX IF NOT EXISTS idx_client_profiles_status ON public.client_profiles(status);
CREATE INDEX IF NOT EXISTS idx_client_profiles_country ON public.client_profiles(country);
CREATE INDEX IF NOT EXISTS idx_client_profiles_assigned ON public.client_profiles(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_created ON public.client_profiles(created_at);

-- 2. CLIENT REGISTRATIONS (Registration event details)
CREATE TABLE IF NOT EXISTS public.client_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  service_of_interest TEXT NOT NULL,
  message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  referrer_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_client_registrations_client ON public.client_registrations(client_id);
CREATE INDEX IF NOT EXISTS idx_client_registrations_created ON public.client_registrations(created_at);

-- 3. CLIENT INQUIRIES (Subsequent inquiry threads)
CREATE TABLE IF NOT EXISTS public.client_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  service_category TEXT,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_client_inquiries_client ON public.client_inquiries(client_id);

-- 4. CLIENT NOTES (Staff internal CRM notes)
CREATE TABLE IF NOT EXISTS public.client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  staff_email TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_client_notes_client ON public.client_notes(client_id);

-- 5. CLIENT FOLLOWUPS (Follow-up log, contact attempts & scheduling)
CREATE TABLE IF NOT EXISTS public.client_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  staff_email TEXT NOT NULL,
  contact_method TEXT NOT NULL CHECK (contact_method IN ('email', 'phone', 'whatsapp', 'in_person', 'other')),
  contact_attempt_result TEXT NOT NULL CHECK (contact_attempt_result IN ('reached', 'no_answer', 'left_voicemail', 'scheduled_callback', 'converted', 'declined')),
  notes TEXT,
  next_followup_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_client_followups_client ON public.client_followups(client_id);
CREATE INDEX IF NOT EXISTS idx_client_followups_date ON public.client_followups(next_followup_date);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_followups ENABLE ROW LEVEL SECURITY;

-- Rule 1: Public visitors can submit client registrations, but CANNOT read private records
CREATE POLICY "Public can submit client profile" ON public.client_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can submit client registration" ON public.client_registrations
  FOR INSERT WITH CHECK (true);

-- Rule 2: Only authenticated R3 staff and administrators can view client profiles
CREATE POLICY "Staff can view all client profiles" ON public.client_profiles
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update client profiles" ON public.client_profiles
  FOR UPDATE USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can view client registrations" ON public.client_registrations
  FOR SELECT USING (public.is_staff(auth.uid()));

-- Rule 3: Client inquiries
CREATE POLICY "Staff can manage client inquiries" ON public.client_inquiries
  FOR ALL USING (public.is_staff(auth.uid()));

-- Rule 4: Client notes & followups are strictly internal to staff
CREATE POLICY "Staff can manage client notes" ON public.client_notes
  FOR ALL USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage client followups" ON public.client_followups
  FOR ALL USING (public.is_staff(auth.uid()));

-- Rule 5: Affiliates explicitly prohibited from viewing private client contact records
-- (Affiliates have NO select policy on client_profiles, client_notes, client_followups)
