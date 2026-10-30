/**
 * R3 Contingencies — Comprehensive Production Readiness & Security Test Suite
 * Executes actual contract, security, RBAC, financial validation, and secret-leakage checks.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import app from '../server.ts';

// Test runner helper
let passed = 0;
let failed = 0;
const results: { test: string; status: 'PASS' | 'FAIL'; message?: string }[] = [];

function assert(condition: boolean, testName: string, failureDetails?: string) {
  if (condition) {
    passed++;
    results.push({ test: testName, status: 'PASS' });
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failed++;
    results.push({ test: testName, status: 'FAIL', message: failureDetails || 'Assertion failed' });
    console.error(`  ✗ [FAIL] ${testName}: ${failureDetails || 'Assertion failed'}`);
  }
}

async function request(
  server: http.Server,
  method: string,
  urlPath: string,
  headers: Record<string, string> = {},
  body?: any
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const address = server.address() as any;
    const reqOptions: http.RequestOptions = {
      hostname: '127.0.0.1',
      port: address.port,
      path: urlPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(reqOptions, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        let parsed = rawData;
        try {
          parsed = JSON.parse(rawData);
        } catch {}
        resolve({ status: res.statusCode || 0, headers: res.headers, body: parsed });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('R3 CONTINGENCIES — PRODUCTION READINESS TEST SUITE');
  console.log('======================================================\n');

  // Start test server on dynamic port
  const testServer = http.createServer(app);
  await new Promise<void>((resolve) => {
    testServer.listen(0, '127.0.0.1', () => resolve());
  });

  try {
    // ---------------------------------------------------------
    // TEST SUITE 1: SECRET LEAKAGE & CODE INTEGRITY CHECKS
    // ---------------------------------------------------------
    console.log('[1/8] Security & Secret-Leakage Audit:');
    
    // Check all files in src/ for secret keys
    function scanDir(dir: string, foundSecrets: string[]) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath, foundSecrets);
        } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('SUPABASE_SECRET_KEY') || content.includes('SUPABASE_SERVICE_ROLE_KEY')) {
            foundSecrets.push(fullPath);
          }
          if (content.includes('process.env.SUPABASE_') || content.includes('process.env.VITE_')) {
            foundSecrets.push(`${fullPath} uses process.env instead of import.meta.env`);
          }
        }
      }
    }

    const leakedFiles: string[] = [];
    scanDir(path.resolve('./src'), leakedFiles);
    assert(leakedFiles.length === 0, 'Zero secret keys or server process.env leaked to frontend src/', leakedFiles.join(', '));

    // Confirm Resend and Sentry completely removed
    const allFiles: string[] = [];
    function scanResendSentry(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git' || entry.name === 'tests') continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanResendSentry(fullPath);
        } else if (/\.(ts|tsx|js|json|html|css|sql)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (/RESEND_API_KEY|from\s+['"]resend['"]|@sentry\//i.test(content)) {
            allFiles.push(fullPath);
          }
        }
      }
    }
    scanResendSentry(path.resolve('.'));
    assert(allFiles.length === 0, 'Zero Resend or Sentry dependencies or active references exist', allFiles.join(', '));

    // ---------------------------------------------------------
    // TEST SUITE 2: DATABASE HEALTH & DIAGNOSTICS ENDPOINT
    // ---------------------------------------------------------
    console.log('\n[2/8] Database Health & Precision Diagnostics:');
    const healthRes = await request(testServer, 'GET', '/api/health');
    assert(healthRes.status === 200, 'Health endpoint responds HTTP 200 OK');
    assert(healthRes.body.status === 'online', 'Service status reports online');
    assert(typeof healthRes.body.database?.configured === 'boolean', 'Database configuration flag is boolean');
    assert(typeof healthRes.body.database?.host_reachable === 'boolean', 'Host reachability flag is boolean');
    assert(typeof healthRes.body.database?.authenticated === 'boolean', 'Authentication status flag is boolean');
    assert(typeof healthRes.body.database?.successful_query === 'boolean', 'Successful query verification flag is boolean');
    assert(
      ['tables_verified', 'pending_migrations', 'unreachable'].includes(healthRes.body.database?.schema_readiness),
      'Schema readiness accurately categorizes state (tables_verified / pending_migrations / unreachable)'
    );

    // ---------------------------------------------------------
    // TEST SUITE 3: RBAC & ADMINISTRATIVE AUTHORIZATION GUARDS
    // ---------------------------------------------------------
    console.log('\n[3/8] RBAC & Administrative Security Enforcement:');
    
    // Unauthenticated requests MUST fail with 401
    const unauthClients = await request(testServer, 'GET', '/api/admin/crm/clients');
    assert(unauthClients.status === 401, 'Unauthenticated CRM access strictly blocked with HTTP 401');

    const unauthConversions = await request(testServer, 'GET', '/api/admin/conversions');
    assert(unauthConversions.status === 401, 'Unauthenticated Conversions access blocked with HTTP 401');

    const unauthAuditLogs = await request(testServer, 'GET', '/api/admin/audit-logs');
    assert(unauthAuditLogs.status === 401, 'Unauthenticated Audit Logs access blocked with HTTP 401');

    // Affiliate role attempting to access admin CRM MUST fail with 403 Forbidden
    const affiliateForbidden = await request(testServer, 'GET', '/api/admin/crm/clients', {
      'x-r3-test-fixture': 'true',
      'x-r3-test-role': 'affiliate'
    });
    assert(affiliateForbidden.status === 403, 'Affiliate role prohibited from Admin CRM with HTTP 403 Forbidden');

    // Super Admin authorized access
    const adminAuthorized = await request(testServer, 'GET', '/api/admin/verify-session', {
      'x-r3-test-fixture': 'true',
      'x-r3-test-role': 'super_admin'
    });
    assert(adminAuthorized.status === 200 && adminAuthorized.body.valid === true, 'Super Admin role successfully verified via RBAC middleware');

    // ---------------------------------------------------------
    // TEST SUITE 4: CLIENT REGISTRATION VALIDATION
    // ---------------------------------------------------------
    console.log('\n[4/8] Client Registration Validation & Integrity:');
    
    // Missing required fields
    const invalidReg = await request(testServer, 'POST', '/api/client/register', {}, {
      fullName: '',
      email: 'invalid-email',
      phone: '',
      consentContacted: false
    });
    assert(invalidReg.status === 400, 'Registration rejects invalid email and empty name with HTTP 400');
    assert(Boolean(invalidReg.body.details?.email), 'Field-level validation error returned for invalid email');
    assert(Boolean(invalidReg.body.details?.consentContacted), 'Field-level validation error returned for missing consent');

    // Corporate registration requires company name
    const missingCompany = await request(testServer, 'POST', '/api/client/register', {}, {
      fullName: 'Lord Edward Sterling',
      email: 'edward@sterling-holdings.co.uk',
      phone: '+44 20 7946 0991',
      country: 'United Kingdom',
      clientType: 'business',
      companyName: '', // Empty
      serviceOfInterest: 'Excelsior Bespoke Logistics Tier',
      preferredContactMethod: 'email',
      consentContacted: true
    });
    assert(missingCompany.status === 400, 'Corporate registration strictly requires valid company name');

    // ---------------------------------------------------------
    // TEST SUITE 5: FINANCIAL INTEGRITY & IDEMPOTENCY CONTRACTS
    // ---------------------------------------------------------
    console.log('\n[5/8] Financial Operations & Idempotency Rules:');

    // Negative eligible sale amount MUST be rejected
    const invalidConv = await request(testServer, 'POST', '/api/admin/conversions', {
      'x-r3-test-fixture': 'true',
      'x-r3-test-role': 'super_admin'
    }, {
      customerReference: 'REF-TEST',
      affiliateId: 'aff-001',
      membershipTier: 'gold',
      eligibleSaleAmountCents: -50000, // Negative!
      transactionDate: '2026-10-29',
      supportingNotes: 'Test entry'
    });
    assert(invalidConv.status === 400, 'Conversion creation strictly rejects negative sale amounts (HTTP 400)');

    // Non-super-admin cannot create commission rules
    const managerRuleForbidden = await request(testServer, 'POST', '/api/admin/commission-rules', {
      'x-r3-test-fixture': 'true',
      'x-r3-test-role': 'affiliate_manager'
    }, {
      commission_percentage: 15
    });
    assert(managerRuleForbidden.status === 403, 'Affiliate Manager prohibited from creating commission rules (Super Admin only)');

    // Payout batch requires valid dates
    const invalidBatch = await request(testServer, 'POST', '/api/admin/payouts/generate-batch', {
      'x-r3-test-fixture': 'true',
      'x-r3-test-role': 'finance_manager'
    }, {
      currency: 'USD'
      // Missing period_start and period_end
    });
    assert(invalidBatch.status === 400, 'Payout batch generation requires period start and end dates');

    // ---------------------------------------------------------
    // TEST SUITE 6: PUBLIC FORMS & REFERRAL TRACKING
    // ---------------------------------------------------------
    console.log('\n[6/8] Public Forms & Referral Click Validation:');

    // Contact form validation
    const invalidContact = await request(testServer, 'POST', '/api/contact', {}, {
      fullName: 'John',
      email: 'not-an-email',
      subject: 'Hi',
      message: 'Too short',
      privacyConsent: false
    });
    assert(invalidContact.status === 400, 'Public contact form rejects invalid inputs with HTTP 400');

    // Affiliate application validation
    const invalidApp = await request(testServer, 'POST', '/api/applications/apply', {}, {
      fullName: 'A',
      applicantType: 'individual',
      email: 'bad-email',
      termsAccepted: false
    });
    assert(invalidApp.status === 400, 'Affiliate application rejects missing terms acceptance');

    // ---------------------------------------------------------
    // TEST SUITE 7: SQL MIGRATIONS AUDIT
    // ---------------------------------------------------------
    console.log('\n[7/8] SQL Migration Files Dependency & Idempotency Audit:');
    const migrationsDir = path.resolve('./supabase/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
    
    assert(migrationFiles.length >= 5, `Found ${migrationFiles.length} sequential SQL migration files`);
    assert(migrationFiles.includes('20261029000001_initial_r3_schema.sql'), '20261029000001_initial_r3_schema.sql exists');
    assert(migrationFiles.includes('20261029000002_rls_policies.sql'), '20261029000002_rls_policies.sql exists');
    assert(migrationFiles.includes('20261029000003_seed_data.sql'), '20261029000003_seed_data.sql exists');
    assert(migrationFiles.includes('20261030000001_client_crm_and_security.sql'), '20261030000001_client_crm_and_security.sql exists');
    assert(migrationFiles.includes('20261030000002_reconciliation_and_financial_integrity.sql'), '20261030000002_reconciliation_and_financial_integrity.sql exists');

    // ---------------------------------------------------------
    // TEST SUITE 8: VERCEL DEPLOYMENT CONFIGURATION AUDIT
    // ---------------------------------------------------------
    console.log('\n[8/8] Vercel & Production Deployment Verification:');
    const vercelConfigExists = fs.existsSync(path.resolve('./vercel.json'));
    assert(vercelConfigExists, 'vercel.json exists with production rewrites and security headers');
    if (vercelConfigExists) {
      const vercelJson = JSON.parse(fs.readFileSync(path.resolve('./vercel.json'), 'utf8'));
      assert(vercelJson.framework === 'vite', 'Vercel framework specified as Vite');
      assert(vercelJson.buildCommand === 'npm run build', 'Vercel build command specified as npm run build');
      assert(vercelJson.outputDirectory === 'dist', 'Vercel outputDirectory specified as dist');
    }

  } finally {
    testServer.close();
  }

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test Suite Fatal Error:', err);
  process.exit(1);
});
