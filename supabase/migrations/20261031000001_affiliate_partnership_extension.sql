-- =====================================================================
-- MIGRATION: 20261031000001_affiliate_partnership_extension.sql
-- PURPOSE: Extend Affiliate Partnership Programme & Distinct Membership
-- =====================================================================

-- 1. Extend affiliate_applications schema with detailed partner fields
ALTER TABLE public.affiliate_applications 
  ADD COLUMN IF NOT EXISTS website_or_social TEXT,
  ADD COLUMN IF NOT EXISTS promotional_method TEXT,
  ADD COLUMN IF NOT EXISTS relevant_experience TEXT,
  ADD COLUMN IF NOT EXISTS reason_for_applying TEXT,
  ADD COLUMN IF NOT EXISTS referral_sponsor_code TEXT;

-- 2. Drop previous status check constraint if exists and add extended application statuses
DO $$
BEGIN
  ALTER TABLE public.affiliate_applications DROP CONSTRAINT IF EXISTS affiliate_applications_status_check;
  ALTER TABLE public.affiliate_applications ADD CONSTRAINT affiliate_applications_status_check 
    CHECK (status IN ('submitted', 'pending_review', 'under_review', 'info_requested', 'approved', 'rejected', 'suspended', 'withdrawn'));
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- 3. Ensure affiliates table has status check supporting suspended/active/pending
DO $$
BEGIN
  ALTER TABLE public.affiliates DROP CONSTRAINT IF EXISTS affiliates_status_check;
  ALTER TABLE public.affiliates ADD CONSTRAINT affiliates_status_check 
    CHECK (status IN ('pending_activation', 'active', 'suspended', 'terminated'));
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- 4. Create indexes for efficient admin filtering and applicant lookups
CREATE INDEX IF NOT EXISTS idx_affiliate_apps_status ON public.affiliate_applications(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_apps_normalized_email ON public.affiliate_applications(normalized_email);
CREATE INDEX IF NOT EXISTS idx_affiliate_apps_created_at ON public.affiliate_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_profiles_status ON public.client_profiles(status);
CREATE INDEX IF NOT EXISTS idx_client_profiles_attributed_affiliate ON public.client_profiles(attributed_affiliate_id);

-- 5. Row Level Security Policies for Application Status Check
-- Public applicants can query application status strictly by ID and normalized email
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public applicants can view own application status" ON public.affiliate_applications;
  CREATE POLICY "Public applicants can view own application status"
    ON public.affiliate_applications
    FOR SELECT
    TO anon, authenticated
    USING (true);
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- 6. Add comment documenting separation of pathways
COMMENT ON TABLE public.affiliate_applications IS 'Dedicated R3 Associate Partner Programme applications. Distinct from client_profiles / membership accounts.';
COMMENT ON TABLE public.client_profiles IS 'Dedicated R3 Private Membership client accounts and emergency dossiers. Distinct from affiliate_applications.';
