-- ====================================================================
-- R3 Contingencies: Row Level Security (RLS) Policies
-- Migration: 20261029000002_rls_policies.sql
-- ====================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check staff status
CREATE OR REPLACE FUNCTION public.is_staff(auth_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth_user_id AND role IN ('super_admin', 'affiliate_manager', 'finance_manager', 'content_manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(auth_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth_user_id AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_staff(auth.uid()));

CREATE POLICY "Users can update own contact details" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can manage profiles" ON public.profiles
  FOR ALL USING (public.is_staff(auth.uid()));

-- 2. AFFILIATE APPLICATIONS
CREATE POLICY "Public can submit application" ON public.affiliate_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can view and update applications" ON public.affiliate_applications
  FOR ALL USING (public.is_staff(auth.uid()));

-- 3. AFFILIATES
CREATE POLICY "Affiliate can view own affiliate profile" ON public.affiliates
  FOR SELECT USING (profile_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "Affiliate can update payout details" ON public.affiliates
  FOR UPDATE USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Staff can manage all affiliates" ON public.affiliates
  FOR ALL USING (public.is_staff(auth.uid()));

-- 4. REFERRAL CODES
CREATE POLICY "Affiliate can view own referral codes" ON public.referral_codes
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE profile_id = auth.uid())
    OR public.is_staff(auth.uid())
  );

CREATE POLICY "Staff can manage referral codes" ON public.referral_codes
  FOR ALL USING (public.is_staff(auth.uid()));

-- 5. REFERRAL EVENTS
CREATE POLICY "Public can insert tracking clicks" ON public.referral_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Affiliates can view own events" ON public.referral_events
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE profile_id = auth.uid())
    OR public.is_staff(auth.uid())
  );

-- 6. LEADS
CREATE POLICY "Public can create lead" ON public.leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Affiliates can view assigned leads" ON public.leads
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE profile_id = auth.uid())
    OR public.is_staff(auth.uid())
  );

CREATE POLICY "Staff can manage all leads" ON public.leads
  FOR ALL USING (public.is_staff(auth.uid()));

-- 7. CONVERSIONS (SALES)
CREATE POLICY "Affiliates can view own verified conversions" ON public.conversions
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE profile_id = auth.uid())
    OR public.is_staff(auth.uid())
  );

CREATE POLICY "Staff can manage conversions" ON public.conversions
  FOR ALL USING (public.is_staff(auth.uid()));

-- 8. COMMISSION LEDGER
CREATE POLICY "Affiliates can view own commissions" ON public.commission_ledger
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE profile_id = auth.uid())
    OR public.is_staff(auth.uid())
  );

CREATE POLICY "Staff can view and manage commission ledger" ON public.commission_ledger
  FOR ALL USING (public.is_staff(auth.uid()));

-- 9. PAYOUTS
CREATE POLICY "Affiliates can view own payout items" ON public.payout_items
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE profile_id = auth.uid())
    OR public.is_staff(auth.uid())
  );

CREATE POLICY "Staff can manage payout batches and items" ON public.payout_batches
  FOR ALL USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage payout items" ON public.payout_items
  FOR ALL USING (public.is_staff(auth.uid()));

-- 10. CMS: PAGES & CONTENT & FAQS
CREATE POLICY "Public can view published pages" ON public.site_pages
  FOR SELECT USING (status = 'published' OR public.is_staff(auth.uid()));

CREATE POLICY "Public can view published content" ON public.site_content
  FOR SELECT USING (true);

CREATE POLICY "Public can view published faqs" ON public.site_faqs
  FOR SELECT USING (is_published = true OR public.is_staff(auth.uid()));

CREATE POLICY "Content managers and staff can edit CMS" ON public.site_pages
  FOR ALL USING (public.is_staff(auth.uid()));

CREATE POLICY "Content managers and staff can edit content" ON public.site_content
  FOR ALL USING (public.is_staff(auth.uid()));

CREATE POLICY "Content managers and staff can edit faqs" ON public.site_faqs
  FOR ALL USING (public.is_staff(auth.uid()));

-- 11. CONTACT INQUIRIES
CREATE POLICY "Public can submit contact inquiry" ON public.contact_inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can read and manage inquiries" ON public.contact_inquiries
  FOR ALL USING (public.is_staff(auth.uid()));

-- 12. AUDIT LOGS & SETTINGS
CREATE POLICY "Staff can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can view and edit settings" ON public.system_settings
  FOR ALL USING (public.is_staff(auth.uid()));
