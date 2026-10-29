/**
 * R3 Contingencies - Database Types & Domain Models
 */

export type UserRole = 
  | 'super_admin' 
  | 'affiliate_manager' 
  | 'finance_manager' 
  | 'content_manager' 
  | 'affiliate';

export type ApplicationStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'info_requested' 
  | 'approved' 
  | 'rejected' 
  | 'withdrawn';

export type AffiliateStatus = 
  | 'pending_activation' 
  | 'active' 
  | 'suspended' 
  | 'terminated';

export type VerificationStatus = 
  | 'pending' 
  | 'under_review' 
  | 'verified' 
  | 'rejected' 
  | 'reversed';

export type CommissionStatus = 
  | 'pending' 
  | 'approved' 
  | 'payable' 
  | 'in_payout_batch' 
  | 'paid' 
  | 'reversed' 
  | 'disputed';

export type PayoutBatchStatus = 
  | 'draft' 
  | 'under_review' 
  | 'approved' 
  | 'processing' 
  | 'paid' 
  | 'failed' 
  | 'reconciled';

export type PayoutItemStatus = 
  | 'pending' 
  | 'approved' 
  | 'processing' 
  | 'paid' 
  | 'failed' 
  | 'on_hold';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  country?: string;
  timezone?: string;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AffiliateApplication {
  id: string;
  full_name: string;
  applicant_type: 'individual' | 'business';
  business_name?: string;
  email: string;
  normalized_email: string;
  phone: string;
  country: string;
  partnership_type: string;
  industry_background: string;
  audience_description: string;
  partnership_objectives: string;
  additional_notes?: string;
  status: ApplicationStatus;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  internal_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  activation_token?: string;
  activation_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Affiliate {
  id: string;
  profile_id: string;
  application_id?: string;
  affiliate_number: string;
  status: AffiliateStatus;
  custom_commission_rate?: number;
  payout_method?: string;
  payout_currency: string;
  payout_details?: Record<string, any>;
  tax_id_verified: boolean;
  country: string;
  total_referral_clicks: number;
  total_conversions: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  profile?: Profile;
}

export interface ReferralCode {
  id: string;
  affiliate_id: string;
  code: string;
  target_url: string;
  is_active: boolean;
  created_at: string;
}

export interface ReferralEvent {
  id: string;
  referral_code_id: string;
  affiliate_id: string;
  ip_hash: string;
  user_agent?: string;
  referrer_url?: string;
  landing_page: string;
  country_code?: string;
  visitor_session_id: string;
  is_duplicate: boolean;
  created_at: string;
}

export interface ReferralAttribution {
  id: string;
  visitor_session_id: string;
  affiliate_id: string;
  referral_code_id: string;
  first_click_at: string;
  last_click_at: string;
  expires_at: string;
  created_at: string;
}

export interface Lead {
  id: string;
  affiliate_id?: string;
  referral_code_id?: string;
  visitor_session_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  interested_tier?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Conversion {
  id: string;
  transaction_reference: string;
  customer_reference: string;
  customer_email?: string;
  affiliate_id: string;
  membership_tier: 'silver' | 'gold' | 'excelsior' | 'bespoke_service';
  eligible_sale_amount_cents: number;
  currency: string;
  transaction_date: string;
  verification_status: VerificationStatus;
  supporting_evidence_url?: string;
  supporting_notes?: string;
  rejection_reason?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  // Joined
  affiliate?: Affiliate;
}

export interface CommissionRule {
  id: string;
  rule_name: string;
  commission_percentage: number;
  eligible_basis: 'gross_sale' | 'net_eligible_sale';
  membership_tier: string;
  is_approved_by_r3: boolean;
  effective_from: string;
  effective_until?: string;
  created_by?: string;
  created_at: string;
}

export interface CommissionLedgerEntry {
  id: string;
  affiliate_id: string;
  conversion_id?: string;
  rule_id?: string;
  rate_applied_percentage: number;
  eligible_sale_cents: number;
  commission_amount_cents: number;
  currency: string;
  event_type: 'commission_earned' | 'commission_reversed' | 'manual_adjustment' | 'payout_deduction';
  status: CommissionStatus;
  adjustment_reason?: string;
  created_by?: string;
  created_at: string;
  // Joined
  affiliate?: Affiliate;
  conversion?: Conversion;
}

export interface PayoutBatch {
  id: string;
  batch_number: string;
  period_start: string;
  period_end: string;
  total_affiliates_count: number;
  total_amount_cents: number;
  currency: string;
  status: PayoutBatchStatus;
  approved_by?: string;
  approved_at?: string;
  processed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PayoutItem {
  id: string;
  payout_batch_id: string;
  affiliate_id: string;
  total_commissions_count: number;
  gross_amount_cents: number;
  fees_deducted_cents: number;
  net_payable_cents: number;
  currency: string;
  payout_method: string;
  status: PayoutItemStatus;
  payment_reference?: string;
  payment_evidence_url?: string;
  processed_at?: string;
  // Joined
  affiliate?: Affiliate;
}

export interface ContactInquiry {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  subject: string;
  message: string;
  privacy_consent: boolean;
  status: 'new' | 'responded' | 'escalated' | 'archived';
  assigned_to?: string;
  created_at: string;
}

export interface SitePage {
  id: string;
  slug: string;
  title: string;
  meta_description?: string;
  status: 'draft' | 'published' | 'archived';
  updated_by?: string;
  updated_at: string;
}

export interface SiteFAQ {
  id: string;
  category: 'membership' | 'services' | 'flex_funds' | 'affiliates' | 'general';
  question: string;
  answer: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_profile_id?: string;
  actor_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  previous_state?: Record<string, any>;
  new_state?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: Record<string, any>;
  description?: string;
  is_approved_by_r3: boolean;
  updated_by?: string;
  updated_at: string;
}
