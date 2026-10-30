-- ====================================================================
-- R3 Contingencies: Production Database Reconciliation & Financial Integrity
-- Migration: 20261030000002_reconciliation_and_financial_integrity.sql
-- ====================================================================

-- 1. Ensure cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Idempotency & Financial Constraints
-- Enforce single commission earnings per conversion
CREATE UNIQUE INDEX IF NOT EXISTS idx_commission_ledger_conversion_earned 
  ON public.commission_ledger (conversion_id) 
  WHERE (event_type = 'commission_earned');

-- Enforce single payout item per affiliate per payout batch
CREATE UNIQUE INDEX IF NOT EXISTS idx_payout_items_batch_affiliate 
  ON public.payout_items (payout_batch_id, affiliate_id);

-- Enforce unique FAQ entries to prevent seed data duplication
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_faqs_category_question 
  ON public.site_faqs (category, question);

-- Enforce case-insensitive uniqueness on referral codes
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_codes_code_upper 
  ON public.referral_codes (upper(code));

-- Prevent duplicate active applications with the same email
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliate_apps_email_active 
  ON public.affiliate_applications (normalized_email) 
  WHERE (status IN ('submitted', 'under_review', 'approved'));

-- 3. Automatic Profile Creation on Supabase Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
  v_phone TEXT;
  v_country TEXT;
BEGIN
  -- Extract metadata or defaults
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'affiliate');
  -- Validate allowed roles
  IF v_role NOT IN ('super_admin', 'affiliate_manager', 'finance_manager', 'content_manager', 'affiliate') THEN
    v_role := 'affiliate';
  END IF;

  v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  v_phone := new.raw_user_meta_data->>'phone';
  v_country := COALESCE(new.raw_user_meta_data->>'country', 'International');

  INSERT INTO public.profiles (id, email, full_name, phone, country, role, is_active, created_at, updated_at)
  VALUES (new.id, new.email, v_full_name, v_phone, v_country, v_role, true, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 4. Immutable Financial Ledger Protection Trigger
-- Commission ledger entries cannot be updated or deleted once posted (only reversed with a new entry)
CREATE OR REPLACE FUNCTION public.prevent_ledger_tampering()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Financial Compliance Error: Direct deletion of commission ledger entries is strictly prohibited. Use compensatory reversal entries.';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    -- Only status transitions to in_payout_batch or paid are permitted
    IF OLD.status = 'paid' AND NEW.status != 'paid' THEN
      RAISE EXCEPTION 'Financial Compliance Error: Paid ledger entries are permanently settled and cannot be modified.';
    END IF;
    IF OLD.commission_amount_cents != NEW.commission_amount_cents OR OLD.eligible_sale_cents != NEW.eligible_sale_cents THEN
      RAISE EXCEPTION 'Financial Compliance Error: Ledger financial amounts are immutable.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_commission_ledger ON public.commission_ledger;
CREATE TRIGGER trg_protect_commission_ledger
  BEFORE UPDATE OR DELETE ON public.commission_ledger
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_tampering();

-- 5. Atomic Conversion Verification & Commission Generation
CREATE OR REPLACE FUNCTION public.verify_conversion_and_create_commission(
  p_conversion_id UUID,
  p_verifier_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_conversion RECORD;
  v_affiliate RECORD;
  v_active_rule RECORD;
  v_rate_to_use NUMERIC(5,2);
  v_commission_cents BIGINT;
  v_ledger_id UUID;
  v_result JSONB;
BEGIN
  -- Verify permission: must be staff
  IF NOT public.is_staff(p_verifier_id) THEN
    RAISE EXCEPTION 'Authorization Error: Only authorized R3 Finance or Executive staff can verify sales.';
  END IF;

  -- Load conversion
  SELECT * INTO v_conversion FROM public.conversions WHERE id = p_conversion_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not Found: Conversion record % does not exist.', p_conversion_id;
  END IF;

  -- Update conversion status
  UPDATE public.conversions
  SET 
    verification_status = p_status,
    verified_by = p_verifier_id,
    verified_at = now(),
    supporting_notes = COALESCE(p_notes, supporting_notes),
    rejection_reason = p_rejection_reason,
    updated_at = now()
  WHERE id = p_conversion_id;

  -- If status is 'verified', generate ledger entry
  IF p_status = 'verified' THEN
    -- Load affiliate
    SELECT * INTO v_affiliate FROM public.affiliates WHERE id = v_conversion.affiliate_id FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Data Integrity Error: Assigned affiliate % not found.', v_conversion.affiliate_id;
    END IF;

    -- Increment verified conversions
    UPDATE public.affiliates
    SET 
      total_conversions = total_conversions + 1,
      updated_at = now()
    WHERE id = v_affiliate.id;

    -- Lookup rule: custom rate takes priority, otherwise find active approved rule
    IF v_affiliate.custom_commission_rate IS NOT NULL THEN
      v_rate_to_use := v_affiliate.custom_commission_rate;
    ELSE
      SELECT * INTO v_active_rule 
      FROM public.commission_rules 
      WHERE is_approved_by_r3 = true 
        AND (membership_tier = 'all' OR membership_tier = v_conversion.membership_tier)
      ORDER BY created_at DESC 
      LIMIT 1;

      IF FOUND THEN
        v_rate_to_use := v_active_rule.commission_percentage;
      ELSE
        v_rate_to_use := NULL;
      END IF;
    END IF;

    -- Calculate integer commission cents
    IF v_rate_to_use IS NOT NULL THEN
      v_commission_cents := ROUND((v_conversion.eligible_sale_amount_cents * v_rate_to_use) / 100);

      INSERT INTO public.commission_ledger (
        affiliate_id,
        conversion_id,
        rule_id,
        rate_applied_percentage,
        eligible_sale_cents,
        commission_amount_cents,
        currency,
        event_type,
        status,
        adjustment_reason,
        created_by,
        created_at
      ) VALUES (
        v_affiliate.id,
        v_conversion.id,
        v_active_rule.id,
        v_rate_to_use,
        v_conversion.eligible_sale_amount_cents,
        v_commission_cents,
        v_conversion.currency,
        'commission_earned',
        'approved',
        CONCAT('Sale ', v_conversion.transaction_reference, ' verified by staff.'),
        p_verifier_id,
        now()
      )
      RETURNING id INTO v_ledger_id;
    ELSE
      -- Pending executive configuration entry
      INSERT INTO public.commission_ledger (
        affiliate_id,
        conversion_id,
        rule_id,
        rate_applied_percentage,
        eligible_sale_cents,
        commission_amount_cents,
        currency,
        event_type,
        status,
        adjustment_reason,
        created_by,
        created_at
      ) VALUES (
        v_affiliate.id,
        v_conversion.id,
        NULL,
        0,
        v_conversion.eligible_sale_amount_cents,
        0,
        v_conversion.currency,
        'commission_earned',
        'pending',
        'Awaiting active commission percentage approval by R3 executive management.',
        p_verifier_id,
        now()
      )
      RETURNING id INTO v_ledger_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'conversion_id', p_conversion_id,
    'status', p_status,
    'ledger_id', v_ledger_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Atomic Monthly Payout Batch Generation
CREATE OR REPLACE FUNCTION public.generate_payout_batch(
  p_period_start DATE,
  p_period_end DATE,
  p_currency TEXT,
  p_creator_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_batch_id UUID;
  v_batch_number TEXT;
  v_total_amount_cents BIGINT := 0;
  v_affiliate_count INT := 0;
  v_affiliate RECORD;
BEGIN
  IF NOT public.is_staff(p_creator_id) THEN
    RAISE EXCEPTION 'Authorization Error: Only authorized R3 Finance staff can generate payout batches.';
  END IF;

  v_batch_number := CONCAT('BATCH-', TO_CHAR(p_period_start, 'YYYY-MM'), '-', p_currency, '-', LPAD(FLOOR(RANDOM() * 900 + 100)::TEXT, 3, '0'));

  INSERT INTO public.payout_batches (
    batch_number,
    period_start,
    period_end,
    total_affiliates_count,
    total_amount_cents,
    currency,
    status,
    notes,
    created_at,
    updated_at
  ) VALUES (
    v_batch_number,
    p_period_start,
    p_period_end,
    0,
    0,
    p_currency,
    'draft',
    CONCAT('Generated on ', now()::date),
    now(),
    now()
  )
  RETURNING id INTO v_batch_id;

  -- Aggregate approved commissions by affiliate
  FOR v_affiliate IN 
    SELECT 
      cl.affiliate_id,
      COUNT(cl.id) as commission_count,
      SUM(cl.commission_amount_cents) as total_cents,
      a.payout_method
    FROM public.commission_ledger cl
    JOIN public.affiliates a ON a.id = cl.affiliate_id
    WHERE cl.status IN ('approved', 'payable')
      AND cl.currency = p_currency
    GROUP BY cl.affiliate_id, a.payout_method
  LOOP
    INSERT INTO public.payout_items (
      payout_batch_id,
      affiliate_id,
      total_commissions_count,
      gross_amount_cents,
      fees_deducted_cents,
      net_payable_cents,
      currency,
      payout_method,
      status
    ) VALUES (
      v_batch_id,
      v_affiliate.affiliate_id,
      v_affiliate.commission_count,
      v_affiliate.total_cents,
      0,
      v_affiliate.total_cents,
      p_currency,
      COALESCE(v_affiliate.payout_method, 'wire_transfer'),
      'pending'
    );

    -- Mark included ledger entries
    UPDATE public.commission_ledger
    SET status = 'in_payout_batch'
    WHERE affiliate_id = v_affiliate.affiliate_id
      AND status IN ('approved', 'payable')
      AND currency = p_currency;

    v_total_amount_cents := v_total_amount_cents + v_affiliate.total_cents;
    v_affiliate_count := v_affiliate_count + 1;
  END LOOP;

  -- Update batch totals
  UPDATE public.payout_batches
  SET 
    total_affiliates_count = v_affiliate_count,
    total_amount_cents = v_total_amount_cents
  WHERE id = v_batch_id;

  RETURN jsonb_build_object(
    'success', true,
    'batch_id', v_batch_id,
    'batch_number', v_batch_number,
    'affiliates_count', v_affiliate_count,
    'total_amount_cents', v_total_amount_cents
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
