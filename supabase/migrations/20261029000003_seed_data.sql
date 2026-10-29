-- ====================================================================
-- R3 Contingencies: Seed Data & System Defaults
-- Migration: 20261029000003_seed_data.sql
-- ====================================================================

-- 1. Initial System Settings (Commercial rules awaiting R3 executive sign-off)
INSERT INTO public.system_settings (setting_key, setting_value, description, is_approved_by_r3)
VALUES 
  ('affiliate_attribution_window_days', '{"value": 60, "status": "pending_r3_approval"}'::jsonb, 'Affiliate cookie attribution duration in calendar days (Default 60 days, awaiting executive sign-off)', false),
  ('monthly_payout_schedule', '{"processing_day_of_month": 15, "min_threshold_cents": 50000, "status": "pending_r3_approval"}'::jsonb, 'Monthly payout processing schedule on the 15th with $500.00 minimum threshold', false),
  ('supported_payout_currencies', '{"currencies": ["USD", "EUR", "GBP", "CHF"], "status": "pending_r3_approval"}'::jsonb, 'Currencies permitted for affiliate commission settlements', false),
  ('commission_model_configuration', '{"model": "percentage_per_sale", "active_rule_id": null, "status": "unconfigured_pending_executive_approval"}'::jsonb, 'No active percentage rule is enabled until R3 management reviews and activates one', false)
ON CONFLICT (setting_key) DO NOTHING;

-- 2. Initial CMS Pages
INSERT INTO public.site_pages (slug, title, meta_description, status)
VALUES
  ('home', 'R3 Contingencies — Global Preparedness & Contingency Concierge', 'Executive contingency coordination, emergency assistance, and bespoke travel protection.', 'published'),
  ('about', 'About R3 Contingencies — Operational Philosophy & Governance', 'Specialized international emergency contingency coordination founded for high-profile principals.', 'published'),
  ('services', 'Contingency Services — Global Crisis Response & Logistics', 'Emergency assistance coordination, secure logistics, medical evacuation, and executive concierge.', 'published'),
  ('membership', 'Membership Tiers — Silver, Gold & Excelsior', 'Comprehensive contingency protection tiers tailored for individuals, families, and corporations.', 'published'),
  ('flex-funds', 'Flex Funds — Liquidity Reserves & Emergency Deployment', 'Dedicated on-demand capital reserves for immediate crisis response and overseas contingency support.', 'published'),
  ('affiliates', 'Affiliate Partner Program — Global Representation', 'Partner with R3 Contingencies to introduce qualified principals to international preparedness solutions.', 'published'),
  ('contact', 'Contact & Operations Dispatch — 24/7 Global Desk', 'Connect with the R3 Contingencies global response advisory desk.', 'published')
ON CONFLICT (slug) DO NOTHING;

-- 3. Initial FAQs
INSERT INTO public.site_faqs (category, question, answer, display_order, is_published)
VALUES
  ('membership', 'What is included in the R3 Contingencies Silver and Gold tiers?', 'Silver ($2,400/yr) provides foundational international contingency coordination, priority advisory response, and travel risk briefs. Gold ($12,000/yr) includes 24/7 dedicated crisis coordination, comprehensive family logistical routing, and bespoke dispatch readiness. Current membership rates and inclusions are subject to executive review.', 1, true),
  ('membership', 'How is the Excelsior Tier tailored for family offices and multinational corporations?', 'The Excelsior Tier is individually architected with custom operational response protocols, dedicated dispatch commanders, and structured liquidity facilities. Pricing is provided upon confidential discovery.', 2, true),
  ('services', 'Does R3 Contingencies provide direct medical treatment or act as an insurance carrier?', 'No. R3 Contingencies is a specialized contingency coordination and emergency concierge firm. We orchestrate vetted third-party medical evacuation aircraft, specialized security transports, and logistics. All services are subject to specific operational agreements and disclaimers.', 3, true),
  ('flex_funds', 'What are Flex Funds and how are they disbursed?', 'Flex Funds are dedicated liquidity reserves held in escrow for rapid deployment during travel disruptions, emergency hospital guarantees, or immediate transport chartering, preventing delays from international bank wire cutoff times.', 4, true),
  ('affiliates', 'Who is eligible to join the R3 Affiliate Program?', 'We welcome qualified individuals, corporate concierge firms, wealth managers, private family advisors, and international travel consultants worldwide. Every applicant undergoes compliance and suitability verification.', 5, true),
  ('affiliates', 'How are affiliate commissions calculated and paid out?', 'Commissions are calculated as a percentage of verified, eligible customer sales. All sales undergo manual verification by authorized R3 administrators. Payouts are reconciled monthly and disbursed in approved international currencies.', 6, true);
