/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * R3 Contingencies — Full-Stack Server & Enterprise API
 * Real Supabase PostgreSQL Integration, Cryptographic Auth & RBAC
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { z } from 'zod';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
  UserRole,
  ClientProfile,
  ClientRegistration,
  ClientInquiry,
  ClientNote,
  ClientFollowup
} from './src/types/database.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

const app = express();
app.use(express.json());

// -------------------------------------------------------------
// SUPABASE CLIENT INITIALIZATION (SERVER-AUTHORITATIVE)
// -------------------------------------------------------------
const rawSupabaseUrl = 
  process.env.SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL || 
  (process.env.SUPABASE_JWKS_URL ? (() => {
    try { return new URL(process.env.SUPABASE_JWKS_URL).origin; } catch { return ''; }
  })() : '') || 
  '';

let supabaseOrigin = '';
if (rawSupabaseUrl) {
  try {
    supabaseOrigin = new URL(rawSupabaseUrl).origin;
  } catch {
    supabaseOrigin = rawSupabaseUrl.replace(/\/+$/, '');
  }
}

const serverSupabaseKey = 
  process.env.SUPABASE_SECRET_KEY || 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_PUBLISHABLE_KEY || 
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY || 
  '';

const supabaseJwksUrl = 
  process.env.SUPABASE_JWKS_URL || 
  (supabaseOrigin ? `${supabaseOrigin}/auth/v1/.well-known/jwks.json` : '');

export let serverSupabase: SupabaseClient | null = null;
if (supabaseOrigin && serverSupabaseKey && !supabaseOrigin.includes('example.com') && supabaseOrigin !== 'https://your-project-id.supabase.co') {
  serverSupabase = createClient(supabaseOrigin, serverSupabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  console.log('[R3 Server] Authoritative Supabase server client active at:', supabaseOrigin);
}

// -------------------------------------------------------------
// POSTGREST ERROR UTILITY
// -------------------------------------------------------------
export function isSchemaPendingError(err: any): boolean {
  if (!err) return false;
  // PGRST205: relation/table does not exist in schema cache
  // 42P01: undefined_table in PostgreSQL
  return (
    err.code === 'PGRST205' ||
    err.code === '42P01' ||
    (typeof err.message === 'string' && (
      err.message.includes('Could not find the table') ||
      err.message.includes('relation') ||
      err.message.includes('schema cache')
    ))
  );
}

export function handleDbError(res: Response, err: any, entityName: string) {
  if (isSchemaPendingError(err)) {
    return res.status(503).json({
      error: `Database schema pending: table '${entityName}' is not yet present in Supabase. Please apply SQL migrations in the Supabase SQL editor.`,
      code: 'SCHEMA_PENDING',
      entity: entityName,
      details: err.message
    });
  }
  return res.status(500).json({
    error: `Database operation failed on ${entityName}: ${err.message || 'Unknown database error'}`,
    code: err.code || 'DB_ERROR',
    details: err.details || null
  });
}

// -------------------------------------------------------------
// AUDIT LOGGING HELPER (Writes to public.audit_logs)
// -------------------------------------------------------------
export async function recordAuditLog(
  actorEmail: string | undefined,
  action: string,
  entityType: string,
  entityId: string | undefined,
  previousState?: Record<string, any>,
  newState?: Record<string, any>,
  req?: Request
) {
  if (!serverSupabase) return;
  try {
    await serverSupabase.from('audit_logs').insert({
      actor_email: actorEmail || 'system',
      action,
      entity_type: entityType,
      entity_id: entityId,
      previous_state: previousState || null,
      new_state: newState || null,
      ip_address: req?.ip || null,
      user_agent: (req?.headers['user-agent'] as string) || null,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    // Non-blocking log catch
    console.warn('[Audit Log Warning]: Could not persist audit log:', (err as any)?.message);
  }
}

// -------------------------------------------------------------
// AUTHENTICATION & JWT VERIFICATION MIDDLEWARE
// -------------------------------------------------------------
export interface AuthenticatedAuth {
  user: any;
  profile: Profile;
  role: UserRole;
}

export async function getAuthenticatedUser(req: Request): Promise<AuthenticatedAuth | null> {
  // 1. Isolated Test-Suite Fixtures (for automated test suite during NODE_ENV === 'test' only)
  if (process.env.NODE_ENV === 'test' && req.headers['x-r3-test-fixture'] === 'true') {
    const testRole = (req.headers['x-r3-test-role'] as UserRole) || 'super_admin';
    return {
      user: { id: 'test-user-fixture', email: 'test@r3contingencies.com' },
      profile: {
        id: 'test-user-fixture',
        email: 'test@r3contingencies.com',
        full_name: 'Automated Test Runner',
        role: testRole,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      role: testRole
    };
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  // 2. Real Supabase JWT Authentication
  if (!serverSupabase) return null;

  try {
    const { data: { user }, error: authErr } = await serverSupabase.auth.getUser(token);
    if (authErr || !user) return null;

    // Check profiles table for user role
    const { data: profile, error: profErr } = await serverSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profErr || !profile) {
      // If table is pending migrations, or profile not yet created, inspect user_metadata
      const metaRole = (user.user_metadata?.role as UserRole) || 'affiliate';
      const fallbackProfile: Profile = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'User'),
        role: metaRole,
        is_active: true,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return { user, profile: fallbackProfile, role: metaRole };
    }

    if (!profile.is_active) return null;
    return { user, profile, role: profile.role };
  } catch (err) {
    console.warn('[Auth Middleware Warning]:', (err as any)?.message);
    return null;
  }
}

// Strict RBAC Middleware for Administrative routes
export async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const auth = await getAuthenticatedUser(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  const staffRoles: UserRole[] = ['super_admin', 'affiliate_manager', 'finance_manager', 'content_manager'];
  if (!staffRoles.includes(auth.role)) {
    return res.status(403).json({ error: 'Forbidden: Insufficient administrative privileges' });
  }
  (req as any).auth = auth;
  next();
}

// Strict RBAC Middleware for Affiliate routes
export async function requireAffiliateAuth(req: Request, res: Response, next: NextFunction) {
  const auth = await getAuthenticatedUser(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  if (auth.role !== 'affiliate') {
    return res.status(403).json({ error: 'Forbidden: Affiliate partner privileges required' });
  }
  (req as any).auth = auth;
  next();
}

// -------------------------------------------------------------
// CORE API ENDPOINTS
// -------------------------------------------------------------

// 1. Health check & Supabase connection test
// Distinguishes: configured, host_reachable, authenticated, successful_query, and schema_readiness
app.get('/api/health', async (req: Request, res: Response) => {
  const startTime = Date.now();
  let hostReachable = false;
  let authenticated = false;
  let successfulQuery = false;
  let schemaReadiness: 'tables_verified' | 'pending_migrations' | 'unreachable' = 'unreachable';
  let latencyMs: number | null = null;
  let errorMsg: string | null = null;

  if (!serverSupabase) {
    errorMsg = 'Server Supabase client not initialized. Verify SUPABASE_URL and SUPABASE_SECRET_KEY in server environment.';
  } else {
    try {
      // Execute live PostgREST query against system_settings
      const { data, error, status } = await serverSupabase
        .from('system_settings')
        .select('setting_key')
        .limit(1);

      latencyMs = Date.now() - startTime;
      hostReachable = true;

      // Status 401/403 means bad credentials; 404/PGRST205 means instance reached, authenticated, but table missing in schema
      if (status !== 401 && status !== 403) {
        authenticated = true;
      }

      if (!error) {
        successfulQuery = true;
        schemaReadiness = 'tables_verified';
      } else if (isSchemaPendingError(error)) {
        successfulQuery = false;
        schemaReadiness = 'pending_migrations';
        errorMsg = 'Supabase instance reached & authenticated. Tables not yet found in schema cache (SQL migrations pending in Supabase SQL editor).';
      } else {
        successfulQuery = false;
        errorMsg = `PostgREST query returned error [${error.code || status}]: ${error.message}`;
      }
    } catch (err: any) {
      latencyMs = Date.now() - startTime;
      hostReachable = false;
      errorMsg = err?.message || 'Database query failed with unhandled network exception';
    }
  }

  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'R3 Contingencies Enterprise Platform',
    database: {
      configured: Boolean(serverSupabase),
      host_reachable: hostReachable,
      authenticated: authenticated,
      successful_query: successfulQuery,
      schema_readiness: schemaReadiness,
      latency_ms: latencyMs,
      endpoint: supabaseOrigin || null,
      jwks_configured: Boolean(supabaseJwksUrl),
      tested_table: 'system_settings',
      error: errorMsg
    }
  });
});

// Diagnostic endpoint for admins to inspect multi-table database availability
app.get('/api/admin/supabase/test-connection', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) {
    return res.status(503).json({
      connected: false,
      error: 'Supabase server client not initialized. Check server environment variables.'
    });
  }

  const startTime = Date.now();
  const testResults: Record<string, { status: number | null; error: string | null; exists: boolean }> = {};
  const coreTables = [
    'system_settings',
    'profiles',
    'affiliates',
    'conversions',
    'commission_ledger',
    'payout_batches',
    'client_profiles'
  ];

  for (const table of coreTables) {
    try {
      const { error, status } = await serverSupabase.from(table).select('*').limit(1);
      testResults[table] = {
        status,
        error: error ? error.message : null,
        exists: !error
      };
    } catch (e: any) {
      testResults[table] = {
        status: null,
        error: e.message,
        exists: false
      };
    }
  }

  res.json({
    timestamp: new Date().toISOString(),
    endpoint: supabaseOrigin,
    latency_ms: Date.now() - startTime,
    tables: testResults,
    all_tables_verified: Object.values(testResults).every((t) => t.exists)
  });
});

// 2. Administrator Initial Provisioning / Bootstrap
// Allows the official project administrator to securely provision their Super Admin credentials in Supabase Auth
app.post('/api/admin/bootstrap-admin', async (req: Request, res: Response) => {
  const { email, password, full_name, secret } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!serverSupabase) {
    return res.status(503).json({ error: 'Supabase client is not configured' });
  }

  // Check if any super_admin already exists
  try {
    const { data: existingAdmins, error: chkErr } = await serverSupabase
      .from('profiles')
      .select('id')
      .eq('role', 'super_admin')
      .limit(1);

    if (!chkErr && existingAdmins && existingAdmins.length > 0) {
      // If a super_admin exists, require valid BOOTSTRAP_SECRET from env
      const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
      if (!expectedSecret || secret !== expectedSecret) {
        return res.status(403).json({
          error: 'An authorized Super Administrator already exists. Bootstrapping is locked. Contact your system director.'
        });
      }
    }

    // Create user in Supabase Auth via admin service client
    const { data: authData, error: createErr } = await serverSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'super_admin',
        full_name: full_name || 'System Director'
      }
    });

    if (createErr) {
      return res.status(400).json({ error: `Failed to create Supabase Auth user: ${createErr.message}` });
    }

    // Upsert into profiles
    const userId = authData.user.id;
    const { error: profErr } = await serverSupabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: full_name || 'System Director',
      role: 'super_admin',
      is_active: true,
      updated_at: new Date().toISOString()
    });

    if (profErr && !isSchemaPendingError(profErr)) {
      console.warn('[Bootstrap Warning]: Could not upsert profile:', profErr.message);
    }

    await recordAuditLog(email, 'SUPER_ADMIN_BOOTSTRAPPED', 'profiles', userId, undefined, { role: 'super_admin' }, req);

    res.status(201).json({
      success: true,
      message: 'Super Administrator successfully provisioned in Supabase Auth.',
      user_id: userId,
      email
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Bootstrap exception' });
  }
});

// 3. Admin Authentication Login
app.post('/api/admin/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Staff email and password are required' });
  }

  if (!serverSupabase) {
    return res.status(503).json({ error: 'Supabase authentication service not initialized' });
  }

  try {
    const { data: authData, error: authErr } = await serverSupabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (authErr || !authData.session) {
      return res.status(401).json({ error: 'Invalid administrative credentials' });
    }

    const user = authData.user;
    let role: UserRole = (user.user_metadata?.role as UserRole) || 'affiliate';

    // Verify role in profiles table
    const { data: profile } = await serverSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      role = profile.role;
      if (!profile.is_active) {
        return res.status(403).json({ error: 'Administrative account is inactive' });
      }
    }

    const staffRoles: UserRole[] = ['super_admin', 'affiliate_manager', 'finance_manager', 'content_manager'];
    if (!staffRoles.includes(role)) {
      return res.status(403).json({
        error: 'Access Denied: Affiliates and clients are strictly prohibited from accessing the Administrative Command Console. Please sign in via the Partner Portal.'
      });
    }

    await recordAuditLog(user.email, 'ADMIN_LOGIN_SUCCESS', 'profiles', user.id, undefined, { role }, req);

    res.json({
      token: authData.session.access_token,
      user: profile || {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 'Staff Member',
        role,
        is_active: true
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login exception' });
  }
});

// 4. Affiliate Partner Login
app.post('/api/affiliate/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Partner email and password are required' });
  }

  if (!serverSupabase) {
    return res.status(503).json({ error: 'Supabase authentication service not initialized' });
  }

  try {
    const { data: authData, error: authErr } = await serverSupabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (authErr || !authData.session) {
      return res.status(401).json({ error: 'Invalid partner credentials or unaccredited account' });
    }

    const user = authData.user;

    // Fetch affiliate record
    const { data: affiliate, error: affErr } = await serverSupabase
      .from('affiliates')
      .select('*, profile:profiles(*)')
      .eq('profile_id', user.id)
      .single();

    if (affErr || !affiliate) {
      return res.status(403).json({ error: 'No active affiliate accreditation found for this account' });
    }

    if (affiliate.status === 'suspended' || affiliate.status === 'terminated') {
      return res.status(403).json({ error: 'Affiliate account is currently suspended or under compliance review' });
    }

    await recordAuditLog(user.email, 'AFFILIATE_LOGIN_SUCCESS', 'affiliates', affiliate.id, undefined, { status: affiliate.status }, req);

    res.json({
      token: authData.session.access_token,
      user: affiliate.profile || { id: user.id, email: user.email, role: 'affiliate' },
      affiliate
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login exception' });
  }
});

// 5. Verify Session
app.get('/api/admin/verify-session', async (req: Request, res: Response) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized: No active administrative session' });
  }
  const staffRoles: UserRole[] = ['super_admin', 'affiliate_manager', 'finance_manager', 'content_manager'];
  if (!staffRoles.includes(auth.role)) {
    return res.status(403).json({ error: 'Forbidden: Account does not possess administrative privileges' });
  }
  res.json({
    valid: true,
    user: auth.profile,
    role: auth.role
  });
});

// 6. User Info
app.get('/api/auth/me', async (req: Request, res: Response) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  let affiliate = null;
  if (auth.role === 'affiliate' && serverSupabase) {
    const { data } = await serverSupabase
      .from('affiliates')
      .select('*')
      .eq('profile_id', auth.profile.id)
      .single();
    affiliate = data;
  }

  res.json({
    user: auth.profile,
    affiliate
  });
});

// -------------------------------------------------------------
// CLIENT REGISTRATION & CRM PERSISTENCE
// -------------------------------------------------------------
const clientRegistrationInputSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required (min 2 characters)'),
  email: z.string().trim().email('Valid email address is required'),
  phone: z.string().trim().min(7, 'Valid international phone with country code is required'),
  country: z.string().trim().min(2, 'Country is required'),
  clientType: z.enum(['individual', 'business']),
  companyName: z.string().optional(),
  serviceOfInterest: z.string().trim().min(2, 'Service of interest is required'),
  additionalMessage: z.string().optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'whatsapp']),
  consentContacted: z.boolean().refine((val) => val === true, {
    message: 'Consent to be contacted is required'
  }),
  referralCode: z.string().optional()
});

app.post('/api/client/register', async (req: Request, res: Response) => {
  const parseResult = clientRegistrationInputSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parseResult.error.flatten().fieldErrors
    });
  }

  const data = parseResult.data;
  const normalizedEmail = data.email.toLowerCase().trim();

  if (data.clientType === 'business' && (!data.companyName || data.companyName.trim().length < 2)) {
    return res.status(400).json({ error: 'Company name is required for corporate registration' });
  }

  if (!serverSupabase) {
    return res.status(503).json({ error: 'Database service is not configured' });
  }

  try {
    // 1. Resolve referral attribution if referralCode provided
    let attributedAffiliateId: string | null = null;
    if (data.referralCode) {
      const { data: codeRow } = await serverSupabase
        .from('referral_codes')
        .select('affiliate_id')
        .ilike('code', data.referralCode.trim())
        .eq('is_active', true)
        .single();
      if (codeRow) attributedAffiliateId = codeRow.affiliate_id;
    }

    // 2. Upsert client_profiles
    const { data: clientProfile, error: profErr } = await serverSupabase
      .from('client_profiles')
      .upsert(
        {
          full_name: data.fullName,
          email: data.email,
          normalized_email: normalizedEmail,
          phone: data.phone,
          country: data.country,
          client_type: data.clientType,
          company_name: data.companyName || null,
          preferred_contact_method: data.preferredContactMethod,
          consent_contacted: true,
          status: 'new',
          lead_source: data.referralCode ? 'partner_referral' : 'direct_web',
          attributed_affiliate_id: attributedAffiliateId,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'normalized_email' }
      )
      .select('id')
      .single();

    if (profErr) {
      return handleDbError(res, profErr, 'client_profiles');
    }

    // 3. Insert client_registrations event
    const { error: regErr } = await serverSupabase
      .from('client_registrations')
      .insert({
        client_id: clientProfile.id,
        service_of_interest: data.serviceOfInterest,
        message: data.additionalMessage || null,
        ip_address: req.ip,
        user_agent: (req.headers['user-agent'] as string) || null,
        referrer_url: data.referralCode ? `?ref=${data.referralCode}` : undefined
      });

    if (regErr && !isSchemaPendingError(regErr)) {
      console.warn('[Supabase client_registrations error]:', regErr.message);
    }

    await recordAuditLog(
      'client:' + normalizedEmail,
      'CLIENT_REGISTERED',
      'client_profiles',
      clientProfile.id,
      undefined,
      { service: data.serviceOfInterest, country: data.country },
      req
    );

    res.status(201).json({
      success: true,
      message: 'Client registration successfully recorded. An R3 Operations Commander will review your profile.',
      client_id: clientProfile.id,
      persisted_to_supabase: true
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Client registration exception' });
  }
});

// Admin CRM Client List
app.get('/api/admin/crm/clients', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) {
    return res.status(503).json({ error: 'Supabase client not initialized' });
  }

  const { search, status, clientType, country } = req.query;

  try {
    let query = serverSupabase.from('client_profiles').select('*');

    if (status && status !== 'all') query = query.eq('status', status);
    if (clientType && clientType !== 'all') query = query.eq('client_type', clientType);
    if (country && country !== 'all') query = query.ilike('country', String(country));
    if (search) {
      const q = String(search).trim();
      query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,company_name.ilike.%${q}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data: clients, error } = await query;
    if (error) {
      if (isSchemaPendingError(error)) {
        return res.json({ clients: [], total: 0, schema_status: 'pending_migrations' });
      }
      return handleDbError(res, error, 'client_profiles');
    }

    res.json({ clients: clients || [], total: clients?.length || 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin CRM Single Client
app.get('/api/admin/crm/clients/:id', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  const { id } = req.params;
  try {
    const { data: client, error } = await serverSupabase
      .from('client_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !client) {
      return res.status(404).json({ error: 'Client profile not found' });
    }

    const [regRes, inqRes, noteRes, flwRes] = await Promise.all([
      serverSupabase.from('client_registrations').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      serverSupabase.from('client_inquiries').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      serverSupabase.from('client_notes').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      serverSupabase.from('client_followups').select('*').eq('client_id', id).order('created_at', { ascending: false })
    ]);

    res.json({
      client: {
        ...client,
        registrations: regRes.data || [],
        inquiries: inqRes.data || [],
        notes: noteRes.data || [],
        followups: flwRes.data || []
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Client Status / Assigned Staff
app.patch('/api/admin/crm/clients/:id', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  const { id } = req.params;
  const { status, assigned_staff_id } = req.body;

  try {
    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status) updatePayload.status = status;
    if (assigned_staff_id !== undefined) updatePayload.assigned_staff_id = assigned_staff_id;

    const { data: updated, error } = await serverSupabase
      .from('client_profiles')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) return handleDbError(res, error, 'client_profiles');

    await recordAuditLog(
      (req as any).auth?.profile?.email,
      'CLIENT_UPDATED',
      'client_profiles',
      id,
      undefined,
      updatePayload,
      req
    );

    res.json({ success: true, client: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add Internal Client Note
app.post('/api/admin/crm/clients/:id/notes', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  const { id } = req.params;
  const { note } = req.body;
  if (!note || !note.trim()) {
    return res.status(400).json({ error: 'Note text cannot be empty' });
  }

  const staff = (req as any).auth?.profile;

  try {
    const { data: inserted, error } = await serverSupabase
      .from('client_notes')
      .insert({
        client_id: id,
        staff_id: staff?.id && !staff.id.startsWith('test-') ? staff.id : null,
        staff_email: staff?.email || 'staff@r3contingencies.com',
        note: note.trim()
      })
      .select()
      .single();

    if (error) return handleDbError(res, error, 'client_notes');

    await recordAuditLog(staff?.email, 'CLIENT_NOTE_ADDED', 'client_notes', inserted?.id, undefined, { client_id: id }, req);

    res.status(201).json({ success: true, note: inserted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add Follow-up Attempt
app.post('/api/admin/crm/clients/:id/followups', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  const { id } = req.params;
  const { contactMethod, contactResult, notes, nextFollowupDate, updateClientStatus } = req.body;
  const staff = (req as any).auth?.profile;

  try {
    const { data: inserted, error } = await serverSupabase
      .from('client_followups')
      .insert({
        client_id: id,
        staff_id: staff?.id && !staff.id.startsWith('test-') ? staff.id : null,
        staff_email: staff?.email || 'staff@r3contingencies.com',
        contact_method: contactMethod || 'phone',
        contact_attempt_result: contactResult || 'reached',
        notes: notes || null,
        next_followup_date: nextFollowupDate || null,
        is_completed: false
      })
      .select()
      .single();

    if (error) return handleDbError(res, error, 'client_followups');

    if (updateClientStatus) {
      await serverSupabase
        .from('client_profiles')
        .update({ status: updateClientStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
    }

    res.status(201).json({ success: true, followup: inserted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CRM Statistics
app.get('/api/admin/crm/stats', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const { data: profiles, error } = await serverSupabase.from('client_profiles').select('status,client_type');
    if (error) {
      if (isSchemaPendingError(error)) {
        return res.json({
          stats: {
            total_clients: 0,
            new_leads: 0,
            contacted: 0,
            followup_due: 0,
            in_discussion: 0,
            converted: 0,
            conversion_rate: 0,
            corporate_count: 0,
            individual_count: 0
          }
        });
      }
      return handleDbError(res, error, 'client_profiles');
    }

    const total = profiles?.length || 0;
    const newLeads = profiles?.filter((c) => c.status === 'new').length || 0;
    const contacted = profiles?.filter((c) => c.status === 'contacted').length || 0;
    const followupDue = profiles?.filter((c) => c.status === 'followup_required').length || 0;
    const inDiscussion = profiles?.filter((c) => c.status === 'in_discussion').length || 0;
    const converted = profiles?.filter((c) => c.status === 'converted').length || 0;
    const corporateCount = profiles?.filter((c) => c.client_type === 'business').length || 0;
    const individualCount = profiles?.filter((c) => c.client_type === 'individual').length || 0;
    const rate = total > 0 ? Math.round((converted / total) * 100) : 0;

    res.json({
      stats: {
        total_clients: total,
        new_leads: newLeads,
        contacted,
        followup_due: followupDue,
        in_discussion: inDiscussion,
        converted,
        conversion_rate: rate,
        corporate_count: corporateCount,
        individual_count: individualCount
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// REFERRAL TRACKING & ATTRIBUTION
// -------------------------------------------------------------
const clickTrackingSchema = z.object({
  ref: z.string().min(1),
  landingPage: z.string().default('/'),
  sessionId: z.string().min(1),
  referrer: z.string().optional()
});

app.post('/api/tracking/click', async (req: Request, res: Response) => {
  const parseResult = clickTrackingSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid tracking payload' });
  }

  const { ref, landingPage, sessionId, referrer } = parseResult.data;
  if (!serverSupabase) return res.status(503).json({ error: 'Database service not initialized' });

  try {
    // 1. Look up referral code
    const { data: refCode, error: codeErr } = await serverSupabase
      .from('referral_codes')
      .select('id, affiliate_id, is_active')
      .ilike('code', ref.trim())
      .single();

    if (codeErr || !refCode || !refCode.is_active) {
      return res.status(404).json({ error: 'Referral code not found or inactive' });
    }

    const ipHash = crypto.createHash('sha256').update(req.ip || '127.0.0.1').digest('hex').substring(0, 16);

    // 2. Check duplicate within 1 hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { data: recentEvents } = await serverSupabase
      .from('referral_events')
      .select('id')
      .eq('affiliate_id', refCode.affiliate_id)
      .eq('ip_hash', ipHash)
      .gt('created_at', oneHourAgo)
      .limit(1);

    const isDuplicate = Boolean(recentEvents && recentEvents.length > 0);

    // 3. Insert event
    await serverSupabase.from('referral_events').insert({
      referral_code_id: refCode.id,
      affiliate_id: refCode.affiliate_id,
      ip_hash: ipHash,
      user_agent: (req.headers['user-agent'] as string) || null,
      referrer_url: referrer || null,
      landing_page: landingPage,
      visitor_session_id: sessionId,
      is_duplicate: isDuplicate
    });

    if (!isDuplicate) {
      try {
        await serverSupabase.rpc('increment_affiliate_clicks', { p_affiliate_id: refCode.affiliate_id });
      } catch {}
    }

    // 4. Attribution record (60-day window)
    const expiresAt = new Date(Date.now() + 60 * 86400000).toISOString();
    await serverSupabase.from('referral_attributions').upsert(
      {
        visitor_session_id: sessionId,
        affiliate_id: refCode.affiliate_id,
        referral_code_id: refCode.id,
        first_click_at: new Date().toISOString(),
        last_click_at: new Date().toISOString(),
        expires_at: expiresAt
      },
      { onConflict: 'visitor_session_id' }
    );

    res.json({
      success: true,
      tracked: true,
      affiliate_code: ref,
      is_duplicate: isDuplicate
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// AFFILIATE APPLICATION SUBMISSION & MANAGEMENT
// -------------------------------------------------------------
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

app.post('/api/applications/apply', async (req: Request, res: Response) => {
  const parseResult = applicationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parseResult.error.flatten().fieldErrors
    });
  }

  const data = parseResult.data;
  const normalizedEmail = data.email.trim().toLowerCase();

  if (!serverSupabase) return res.status(503).json({ error: 'Supabase client not initialized' });

  try {
    // Check existing application
    const { data: existingApp } = await serverSupabase
      .from('affiliate_applications')
      .select('id, status')
      .eq('normalized_email', normalizedEmail)
      .in('status', ['submitted', 'under_review', 'approved'])
      .maybeSingle();

    if (existingApp) {
      return res.status(409).json({
        error: 'An active application with this email address already exists. Please contact the R3 partner advisory desk.'
      });
    }

    const { data: newApp, error: insErr } = await serverSupabase
      .from('affiliate_applications')
      .insert({
        full_name: data.fullName,
        applicant_type: data.applicantType,
        business_name: data.applicantType === 'business' ? data.businessName : null,
        email: data.email,
        normalized_email: normalizedEmail,
        phone: data.phone,
        country: data.country,
        partnership_type: data.partnershipType,
        industry_background: data.industryBackground,
        audience_description: data.audienceDescription,
        partnership_objectives: data.partnershipObjectives,
        additional_notes: data.additionalNotes || null,
        status: 'submitted',
        terms_accepted: data.termsAccepted,
        privacy_accepted: data.privacyAccepted
      })
      .select()
      .single();

    if (insErr) return handleDbError(res, insErr, 'affiliate_applications');

    await recordAuditLog(
      'applicant:' + normalizedEmail,
      'APPLICATION_SUBMITTED',
      'affiliate_applications',
      newApp.id,
      undefined,
      { country: data.country },
      req
    );

    res.status(201).json({
      success: true,
      message: 'Application received successfully. R3 Compliance will review your credentials within 2 business days.',
      application_id: newApp.id
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Applications List
app.get('/api/admin/applications', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  const { status, country, search } = req.query;

  try {
    let query = serverSupabase.from('affiliate_applications').select('*');
    if (status && status !== 'all') query = query.eq('status', status);
    if (country && country !== 'all') query = query.ilike('country', String(country));
    if (search) {
      const q = String(search).trim();
      query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,business_name.ilike.%${q}%`);
    }
    query = query.order('created_at', { ascending: false });

    const { data: applications, error } = await query;
    if (error) {
      if (isSchemaPendingError(error)) {
        return res.json({ applications: [], total: 0, schema_status: 'pending_migrations' });
      }
      return handleDbError(res, error, 'affiliate_applications');
    }

    res.json({ applications: applications || [], total: applications?.length || 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Review Application
app.patch('/api/admin/applications/:id', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  const { id } = req.params;
  const { status, internal_notes } = req.body;
  const staff = (req as any).auth?.profile;

  try {
    const updatePayload: Record<string, any> = {
      status,
      reviewed_by: staff?.id && !staff.id.startsWith('test-') ? staff.id : null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (internal_notes !== undefined) updatePayload.internal_notes = internal_notes;

    const { data: updatedApp, error } = await serverSupabase
      .from('affiliate_applications')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) return handleDbError(res, error, 'affiliate_applications');

    // If approved, provision affiliate entity if not already present
    if (status === 'approved') {
      const affNum = `R3-${Math.floor(10000 + Math.random() * 89999)}`;
      
      // Ensure profile exists for affiliate
      const { data: existingProf } = await serverSupabase
        .from('profiles')
        .select('id')
        .eq('email', updatedApp.normalized_email)
        .maybeSingle();

      let profId = existingProf?.id;
      if (!profId) {
        const { data: newProf } = await serverSupabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            email: updatedApp.email,
            full_name: updatedApp.full_name,
            phone: updatedApp.phone,
            country: updatedApp.country,
            role: 'affiliate',
            is_active: true
          })
          .select('id')
          .single();
        profId = newProf?.id;
      }

      if (profId) {
        const { data: newAff } = await serverSupabase
          .from('affiliates')
          .insert({
            profile_id: profId,
            application_id: updatedApp.id,
            affiliate_number: affNum,
            status: 'active',
            country: updatedApp.country,
            payout_currency: 'USD'
          })
          .select('id')
          .single();

        if (newAff) {
          await serverSupabase.from('referral_codes').insert({
            affiliate_id: newAff.id,
            code: affNum,
            target_url: '/',
            is_active: true
          });
        }
      }
    }

    res.json({ success: true, application: updatedApp });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// AFFILIATE PORTAL & SALES VERIFICATION
// -------------------------------------------------------------
app.get('/api/affiliate/dashboard', requireAffiliateAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  const staff = (req as any).auth?.profile;

  try {
    const { data: affiliate, error: affErr } = await serverSupabase
      .from('affiliates')
      .select('*')
      .eq('profile_id', staff.id)
      .single();

    if (affErr || !affiliate) {
      return res.status(404).json({ error: 'Affiliate record not found' });
    }

    const [codesRes, convsRes, ledgerRes, payoutsRes] = await Promise.all([
      serverSupabase.from('referral_codes').select('*').eq('affiliate_id', affiliate.id),
      serverSupabase.from('conversions').select('*').eq('affiliate_id', affiliate.id),
      serverSupabase.from('commission_ledger').select('*').eq('affiliate_id', affiliate.id),
      serverSupabase.from('payout_items').select('*').eq('affiliate_id', affiliate.id)
    ]);

    const ledger = ledgerRes.data || [];
    let pendingCents = 0;
    let approvedCents = 0;
    let payableCents = 0;
    let paidCents = 0;

    for (const entry of ledger) {
      if (entry.status === 'pending') pendingCents += entry.commission_amount_cents;
      else if (entry.status === 'approved') approvedCents += entry.commission_amount_cents;
      else if (entry.status === 'payable' || entry.status === 'in_payout_batch') payableCents += entry.commission_amount_cents;
      else if (entry.status === 'paid') paidCents += entry.commission_amount_cents;
    }

    // Zero client PII exposed to affiliate
    const sanitizedConversions = (convsRes.data || []).map((c: any) => ({
      id: c.id,
      transaction_reference: c.transaction_reference,
      customer_reference: `REF-${c.id.substring(c.id.length - 4)}`,
      membership_tier: c.membership_tier,
      eligible_sale_amount_cents: c.eligible_sale_amount_cents,
      currency: c.currency,
      transaction_date: c.transaction_date,
      verification_status: c.verification_status
    }));

    res.json({
      affiliate,
      referralCodes: codesRes.data || [],
      stats: {
        total_clicks: affiliate.total_referral_clicks || 0,
        unique_visitors: affiliate.total_referral_clicks || 0,
        leads_generated: 0,
        verified_conversions: affiliate.total_conversions || 0,
        pending_commissions_cents: pendingCents,
        approved_commissions_cents: approvedCents,
        payable_commissions_cents: payableCents,
        paid_commissions_cents: paidCents,
        currency: affiliate.payout_currency || 'USD'
      },
      conversions: sanitizedConversions,
      ledger,
      payouts: payoutsRes.data || []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Manual Sales Registration
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

app.post('/api/admin/conversions', requireAdminAuth, async (req: Request, res: Response) => {
  const parseResult = createConversionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten().fieldErrors });
  }

  if (!serverSupabase) return res.status(503).json({ error: 'Supabase client not initialized' });

  const data = parseResult.data;
  const staff = (req as any).auth?.profile;
  const txRef = `TX-R3-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

  try {
    const { data: conv, error } = await serverSupabase
      .from('conversions')
      .insert({
        transaction_reference: txRef,
        customer_reference: data.customerReference,
        customer_email: data.customerEmail || null,
        affiliate_id: data.affiliateId,
        membership_tier: data.membershipTier,
        eligible_sale_amount_cents: data.eligibleSaleAmountCents,
        currency: data.currency,
        transaction_date: data.transactionDate,
        verification_status: 'pending',
        supporting_evidence_url: data.supportingEvidenceUrl || null,
        supporting_notes: data.supportingNotes
      })
      .select()
      .single();

    if (error) return handleDbError(res, error, 'conversions');

    await recordAuditLog(
      staff?.email,
      'CONVERSION_REGISTERED',
      'conversions',
      conv.id,
      undefined,
      { txRef, amount: data.eligibleSaleAmountCents },
      req
    );

    res.status(201).json({ success: true, conversion: conv });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Conversions List
app.get('/api/admin/conversions', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const { data: conversions, error } = await serverSupabase
      .from('conversions')
      .select('*, affiliate:affiliates(id, affiliate_number, profile:profiles(full_name, email))')
      .order('created_at', { ascending: false });

    if (error) {
      if (isSchemaPendingError(error)) {
        return res.json({ conversions: [], schema_status: 'pending_migrations' });
      }
      return handleDbError(res, error, 'conversions');
    }

    const enriched = (conversions || []).map((c: any) => ({
      ...c,
      affiliate_number: c.affiliate?.affiliate_number,
      affiliate_name: c.affiliate?.profile?.full_name,
      affiliate_email: c.affiliate?.profile?.email
    }));

    res.json({ conversions: enriched });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Verify / Reject Conversion & Calculate Commission (Atomic DB Function)
app.patch('/api/admin/conversions/:id/verify', requireAdminAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { verification_status, rejection_reason, supporting_notes } = req.body;
  const staff = (req as any).auth?.profile;

  if (!['verified', 'rejected', 'reversed', 'under_review'].includes(verification_status)) {
    return res.status(400).json({ error: 'Invalid verification status' });
  }

  if (!serverSupabase) return res.status(503).json({ error: 'Supabase client not initialized' });

  try {
    // Attempt database atomic verification stored function
    const verifierUuid = staff?.id && !staff.id.startsWith('test-') ? staff.id : null;

    if (verifierUuid) {
      const { data: rpcData, error: rpcErr } = await serverSupabase.rpc('verify_conversion_and_create_commission', {
        p_conversion_id: id,
        p_verifier_id: verifierUuid,
        p_status: verification_status,
        p_notes: supporting_notes || null,
        p_rejection_reason: rejection_reason || null
      });

      if (!rpcErr) {
        return res.json({ success: true, result: rpcData });
      }
    }

    // Direct table fallback if function not yet applied
    const { data: conv, error: updErr } = await serverSupabase
      .from('conversions')
      .update({
        verification_status,
        verified_by: verifierUuid,
        verified_at: new Date().toISOString(),
        rejection_reason: rejection_reason || null,
        supporting_notes: supporting_notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updErr) return handleDbError(res, updErr, 'conversions');

    res.json({ success: true, conversion: conv });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Commission Rules Management
app.get('/api/admin/commission-rules', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const { data: rules, error } = await serverSupabase
      .from('commission_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (isSchemaPendingError(error)) {
        return res.json({ rules: [], schema_status: 'pending_migrations' });
      }
      return handleDbError(res, error, 'commission_rules');
    }

    res.json({ rules: rules || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/commission-rules', requireAdminAuth, async (req: Request, res: Response) => {
  const staff = (req as any).auth?.profile;
  if (staff?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only Super Administrators can create commission rules' });
  }

  const { rule_name, commission_percentage, eligible_basis, membership_tier, is_approved_by_r3 } = req.body;
  if (commission_percentage === undefined || commission_percentage < 0 || commission_percentage > 100) {
    return res.status(400).json({ error: 'Valid percentage between 0 and 100 is required' });
  }

  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const { data: newRule, error } = await serverSupabase
      .from('commission_rules')
      .insert({
        rule_name: rule_name || `Commission Rule (${commission_percentage}%)`,
        commission_percentage: Number(commission_percentage),
        eligible_basis: eligible_basis || 'net_eligible_sale',
        membership_tier: membership_tier || 'all',
        is_approved_by_r3: Boolean(is_approved_by_r3),
        effective_from: new Date().toISOString().split('T')[0],
        created_by: staff?.id && !staff.id.startsWith('test-') ? staff.id : null
      })
      .select()
      .single();

    if (error) return handleDbError(res, error, 'commission_rules');

    res.status(201).json({ success: true, rule: newRule });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/commission-rules/:id/approve', requireAdminAuth, async (req: Request, res: Response) => {
  const staff = (req as any).auth?.profile;
  if (staff?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only Super Administrators can approve commission rules' });
  }

  const { id } = req.params;
  const { is_approved_by_r3 } = req.body;

  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const { data: rule, error } = await serverSupabase
      .from('commission_rules')
      .update({ is_approved_by_r3: Boolean(is_approved_by_r3) })
      .eq('id', id)
      .select()
      .single();

    if (error) return handleDbError(res, error, 'commission_rules');

    res.json({ success: true, rule });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Commission Ledger
app.get('/api/admin/commission-ledger', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const { data: ledger, error } = await serverSupabase
      .from('commission_ledger')
      .select('*, affiliate:affiliates(affiliate_number, profile:profiles(full_name)), conversion:conversions(transaction_reference)')
      .order('created_at', { ascending: false });

    if (error) {
      if (isSchemaPendingError(error)) {
        return res.json({ ledger: [], schema_status: 'pending_migrations' });
      }
      return handleDbError(res, error, 'commission_ledger');
    }

    const enriched = (ledger || []).map((item: any) => ({
      ...item,
      affiliate_number: item.affiliate?.affiliate_number,
      affiliate_name: item.affiliate?.profile?.full_name,
      transaction_reference: item.conversion?.transaction_reference
    }));

    res.json({ ledger: enriched });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// PAYOUT BATCHES & ITEMS
// -------------------------------------------------------------
app.get('/api/admin/payouts', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const { data: batches, error } = await serverSupabase
      .from('payout_batches')
      .select('*, items:payout_items(*, affiliate:affiliates(affiliate_number, payout_details, profile:profiles(full_name)))')
      .order('created_at', { ascending: false });

    if (error) {
      if (isSchemaPendingError(error)) {
        return res.json({ batches: [], schema_status: 'pending_migrations' });
      }
      return handleDbError(res, error, 'payout_batches');
    }

    res.json({ batches: batches || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/payouts/generate-batch', requireAdminAuth, async (req: Request, res: Response) => {
  const { period_start, period_end, currency = 'USD' } = req.body;
  if (!period_start || !period_end) {
    return res.status(400).json({ error: 'Period start and end dates are required' });
  }

  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });
  const staff = (req as any).auth?.profile;

  try {
    // Attempt database atomic stored procedure
    const staffId = staff?.id && !staff.id.startsWith('test-') ? staff.id : null;
    if (staffId) {
      const { data: rpcData, error: rpcErr } = await serverSupabase.rpc('generate_payout_batch', {
        p_period_start: period_start,
        p_period_end: period_end,
        p_currency: currency,
        p_creator_id: staffId
      });

      if (!rpcErr) {
        return res.status(201).json({ success: true, batch: rpcData });
      }
    }

    // Direct fallback if function pending
    const batchNum = `BATCH-${period_start.substring(0, 7)}-${currency}-${Math.floor(100 + Math.random() * 900)}`;
    const { data: newBatch, error: batchErr } = await serverSupabase
      .from('payout_batches')
      .insert({
        batch_number: batchNum,
        period_start,
        period_end,
        currency,
        status: 'draft',
        total_affiliates_count: 0,
        total_amount_cents: 0
      })
      .select()
      .single();

    if (batchErr) return handleDbError(res, batchErr, 'payout_batches');

    res.status(201).json({ success: true, batch: newBatch });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/payouts/batches/:id/approve', requireAdminAuth, async (req: Request, res: Response) => {
  const staff = (req as any).auth?.profile;
  const { id } = req.params;

  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const { data: batch, error } = await serverSupabase
      .from('payout_batches')
      .update({
        status: 'approved',
        approved_by: staff?.id && !staff.id.startsWith('test-') ? staff.id : null,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return handleDbError(res, error, 'payout_batches');

    // Update item statuses
    await serverSupabase
      .from('payout_items')
      .update({ status: 'approved' })
      .eq('payout_batch_id', id)
      .eq('status', 'pending');

    res.json({ success: true, batch });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/payouts/items/:id/pay', requireAdminAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { payment_reference, payment_evidence_url } = req.body;
  if (!payment_reference) {
    return res.status(400).json({ error: 'Payment reference is required' });
  }

  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const { data: item, error } = await serverSupabase
      .from('payout_items')
      .update({
        status: 'paid',
        payment_reference,
        payment_evidence_url: payment_evidence_url || null,
        processed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return handleDbError(res, error, 'payout_items');

    res.json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// CMS: PAGES, CONTENT & FAQS
// -------------------------------------------------------------
app.get('/api/cms/pages', async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const { data: pages, error } = await serverSupabase
      .from('site_pages')
      .select('*')
      .order('slug');

    if (error) {
      if (isSchemaPendingError(error)) {
        return res.json({ pages: [], schema_status: 'pending_migrations' });
      }
      return handleDbError(res, error, 'site_pages');
    }

    res.json({ pages: pages || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/pages/:slug', requireAdminAuth, async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { title, meta_description, status } = req.body;
  const staff = (req as any).auth?.profile;

  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const updatePayload: Record<string, any> = {
      updated_by: staff?.id && !staff.id.startsWith('test-') ? staff.id : null,
      updated_at: new Date().toISOString()
    };
    if (title) updatePayload.title = title;
    if (meta_description !== undefined) updatePayload.meta_description = meta_description;
    if (status) updatePayload.status = status;

    const { data: page, error } = await serverSupabase
      .from('site_pages')
      .update(updatePayload)
      .eq('slug', slug)
      .select()
      .single();

    if (error) return handleDbError(res, error, 'site_pages');

    res.json({ success: true, page });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cms/faqs', async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  const { category } = req.query;

  try {
    let query = serverSupabase.from('site_faqs').select('*').order('display_order');
    if (category && category !== 'all') query = query.eq('category', category);

    const { data: faqs, error } = await query;
    if (error) {
      if (isSchemaPendingError(error)) {
        return res.json({ faqs: [], schema_status: 'pending_migrations' });
      }
      return handleDbError(res, error, 'site_faqs');
    }

    res.json({ faqs: faqs || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cms/faqs', requireAdminAuth, async (req: Request, res: Response) => {
  const { category, question, answer, display_order } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const { data: newFaq, error } = await serverSupabase
      .from('site_faqs')
      .insert({
        category: category || 'general',
        question: question.trim(),
        answer: answer.trim(),
        display_order: display_order || 0,
        is_published: true
      })
      .select()
      .single();

    if (error) return handleDbError(res, error, 'site_faqs');

    res.status(201).json({ success: true, faq: newFaq });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// PUBLIC CONTACT FORM
// -------------------------------------------------------------
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

app.post('/api/contact', async (req: Request, res: Response) => {
  const parseResult = contactSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten().fieldErrors });
  }

  const data = parseResult.data;
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase client not initialized' });

  try {
    const { data: inquiry, error } = await serverSupabase
      .from('contact_inquiries')
      .insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || null,
        country: data.country || null,
        subject: data.subject,
        message: data.message,
        privacy_consent: data.privacyConsent,
        status: 'new'
      })
      .select()
      .single();

    if (error) return handleDbError(res, error, 'contact_inquiries');

    await recordAuditLog(
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/inquiries', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const { data: inquiries, error } = await serverSupabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (isSchemaPendingError(error)) {
        return res.json({ inquiries: [], schema_status: 'pending_migrations' });
      }
      return handleDbError(res, error, 'contact_inquiries');
    }

    res.json({ inquiries: inquiries || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// AUDIT LOGS, SETTINGS & OVERVIEW
// -------------------------------------------------------------
app.get('/api/admin/audit-logs', requireAdminAuth, async (req: Request, res: Response) => {
  const staff = (req as any).auth?.profile;
  if (staff?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only Super Administrators can inspect audit logs' });
  }

  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const { data: logs, error } = await serverSupabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      if (isSchemaPendingError(error)) {
        return res.json({ logs: [], schema_status: 'pending_migrations' });
      }
      return handleDbError(res, error, 'audit_logs');
    }

    res.json({ logs: logs || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/settings', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const { data: settings, error } = await serverSupabase
      .from('system_settings')
      .select('*')
      .order('setting_key');

    if (error) {
      if (isSchemaPendingError(error)) {
        return res.json({ settings: [], schema_status: 'pending_migrations' });
      }
      return handleDbError(res, error, 'system_settings');
    }

    res.json({ settings: settings || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/settings/:key', requireAdminAuth, async (req: Request, res: Response) => {
  const staff = (req as any).auth?.profile;
  if (staff?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only Super Administrators can modify system settings' });
  }

  const { setting_value, is_approved_by_r3 } = req.body;
  const { key } = req.params;

  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const updatePayload: Record<string, any> = {
      updated_by: staff?.id && !staff.id.startsWith('test-') ? staff.id : null,
      updated_at: new Date().toISOString()
    };
    if (setting_value !== undefined) updatePayload.setting_value = setting_value;
    if (is_approved_by_r3 !== undefined) updatePayload.is_approved_by_r3 = Boolean(is_approved_by_r3);

    const { data: setting, error } = await serverSupabase
      .from('system_settings')
      .update(updatePayload)
      .eq('setting_key', key)
      .select()
      .single();

    if (error) return handleDbError(res, error, 'system_settings');

    res.json({ success: true, setting });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin System Overview Stats
app.get('/api/admin/overview', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const [affRes, appRes, convRes, ledgRes, payRes] = await Promise.all([
      serverSupabase.from('affiliates').select('status'),
      serverSupabase.from('affiliate_applications').select('status'),
      serverSupabase.from('conversions').select('verification_status'),
      serverSupabase.from('commission_ledger').select('commission_amount_cents, status'),
      serverSupabase.from('payout_items').select('net_payable_cents, status')
    ]);

    const affiliates = affRes.data || [];
    const applications = appRes.data || [];
    const conversions = convRes.data || [];
    const ledger = ledgRes.data || [];
    const payoutItems = payRes.data || [];

    let totalCommissionLiabilityCents = 0;
    for (const c of ledger) {
      if (['approved', 'payable', 'in_payout_batch'].includes(c.status)) {
        totalCommissionLiabilityCents += c.commission_amount_cents || 0;
      }
    }

    let totalPaidOutCents = 0;
    for (const p of payoutItems) {
      if (p.status === 'paid') {
        totalPaidOutCents += p.net_payable_cents || 0;
      }
    }

    res.json({
      totalAffiliates: affiliates.length,
      activeAffiliates: affiliates.filter((a: any) => a.status === 'active').length,
      pendingApplications: applications.filter((a: any) => ['submitted', 'under_review'].includes(a.status)).length,
      totalClicks: 0,
      totalLeads: 0,
      pendingSales: conversions.filter((c: any) => c.verification_status === 'pending').length,
      verifiedSales: conversions.filter((c: any) => c.verification_status === 'verified').length,
      totalCommissionLiabilityCents,
      totalPaidOutCents,
      currency: 'USD'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Affiliates List
app.get('/api/admin/affiliates', requireAdminAuth, async (req: Request, res: Response) => {
  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const { data: affiliates, error } = await serverSupabase
      .from('affiliates')
      .select('*, profile:profiles(*), referral_codes(*), conversions(id, verification_status)')
      .order('created_at', { ascending: false });

    if (error) {
      if (isSchemaPendingError(error)) {
        return res.json({ affiliates: [], schema_status: 'pending_migrations' });
      }
      return handleDbError(res, error, 'affiliates');
    }

    const enriched = (affiliates || []).map((aff: any) => ({
      ...aff,
      primary_code: aff.referral_codes?.[0]?.code || aff.affiliate_number,
      verified_conversions_count: aff.conversions?.filter((c: any) => c.verification_status === 'verified').length || 0
    }));

    res.json({ affiliates: enriched });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/affiliates/:id/status', requireAdminAuth, async (req: Request, res: Response) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!['active', 'suspended', 'terminated'].includes(status)) {
    return res.status(400).json({ error: 'Invalid affiliate status' });
  }

  if (!serverSupabase) return res.status(503).json({ error: 'Supabase not initialized' });

  try {
    const { data: aff, error } = await serverSupabase
      .from('affiliates')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return handleDbError(res, error, 'affiliates');

    res.json({ success: true, affiliate: aff });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// STATIC ASSET & SPA MIDDLEWARE (DEV & PRODUCTION)
// -------------------------------------------------------------
app.use(express.static(path.resolve(__dirname, 'public')));

export async function startServer() {
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
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[R3 Contingencies Server] Active on port ${PORT}`);
  });

  return { app, server };
}

// Only start automatically if this file is run directly (not imported by test runner)
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
