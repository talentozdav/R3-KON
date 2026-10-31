import React, { useState, useEffect } from 'react';
import {
  Users,
  FileCheck,
  CheckCircle,
  XCircle,
  DollarSign,
  Briefcase,
  Layers,
  Settings,
  Shield,
  Clock,
  Search,
  Filter,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertTriangle,
  RotateCcw,
  Check,
  Building,
  Mail,
  Lock,
  Globe,
  Database,
  Activity
} from 'lucide-react';
import type { UserRole } from '../../types/database.ts';
import { ClientCrmSection } from './ClientCrmSection.tsx';
import { isSupabaseConfigured, getSupabaseClientEndpoint } from '../../lib/supabase/client.ts';
import { r3Logo } from '../../assets/images/index.ts';

interface AdminDashboardProps {
  token: string;
  activeRole: UserRole;
  onLogout: () => void;
  onSwitchRole: (role: UserRole) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  activeRole,
  onLogout,
  onSwitchRole
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'crm' | 'applications' | 'affiliates' | 'conversions' | 'commissions' | 'payouts' | 'cms' | 'inquiries' | 'audit' | 'settings'
  >('overview');

  const [overview, setOverview] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [commissionRules, setCommissionRules] = useState<any[]>([]);
  const [commissionLedger, setCommissionLedger] = useState<any[]>([]);
  const [payoutBatches, setPayoutBatches] = useState<any[]>([]);
  const [sitePages, setSitePages] = useState<any[]>([]);
  const [siteFaqs, setSiteFaqs] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [dbDiagnostic, setDbDiagnostic] = useState<any>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Filter states
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [appSearch, setAppSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [appInternalNote, setAppInternalNote] = useState('');

  // New conversion form state
  const [newConv, setNewConv] = useState({
    customerReference: '',
    customerEmail: '',
    affiliateId: '',
    membershipTier: 'gold',
    eligibleSaleAmountCents: 1200000, // $12,000.00
    currency: 'USD',
    transactionDate: new Date().toISOString().split('T')[0],
    supportingEvidenceUrl: '',
    supportingNotes: ''
  });

  // New commission rule form state
  const [newRule, setNewRule] = useState({
    rule_name: 'Standard Executive Partner Rate',
    commission_percentage: 10,
    eligible_basis: 'net_eligible_sale',
    membership_tier: 'all',
    is_approved_by_r3: false
  });

  // New payout batch form state
  const [newBatch, setNewBatch] = useState({
    period_start: '2026-10-01',
    period_end: '2026-10-31',
    currency: 'USD'
  });

  // Reusable fetcher with auth header
  const authFetch = (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    });
  };

  const loadAllData = async () => {
    try {
      const [
        ovRes,
        appsRes,
        affsRes,
        convsRes,
        rulesRes,
        ledgerRes,
        payoutsRes,
        pagesRes,
        faqsRes,
        inqsRes,
        auditsRes,
        setsRes
      ] = await Promise.all([
        authFetch('/api/admin/overview'),
        authFetch('/api/admin/applications'),
        authFetch('/api/admin/affiliates'),
        authFetch('/api/admin/conversions'),
        authFetch('/api/admin/commission-rules'),
        authFetch('/api/admin/commission-ledger'),
        authFetch('/api/admin/payouts'),
        authFetch('/api/cms/pages'),
        authFetch('/api/cms/faqs'),
        authFetch('/api/admin/inquiries'),
        authFetch('/api/admin/audit-logs'),
        authFetch('/api/admin/settings')
      ]);

      if (ovRes.ok) setOverview(await ovRes.json());
      if (appsRes.ok) {
        const d = await appsRes.json();
        setApplications(d.applications || []);
      }
      if (affsRes.ok) {
        const d = await affsRes.json();
        setAffiliates(d.affiliates || []);
        if (d.affiliates?.[0] && !newConv.affiliateId) {
          setNewConv((prev) => ({ ...prev, affiliateId: d.affiliates[0].id }));
        }
      }
      if (convsRes.ok) {
        const d = await convsRes.json();
        setConversions(d.conversions || []);
      }
      if (rulesRes.ok) {
        const d = await rulesRes.json();
        setCommissionRules(d.rules || []);
      }
      if (ledgerRes.ok) {
        const d = await ledgerRes.json();
        setCommissionLedger(d.ledger || []);
      }
      if (payoutsRes.ok) {
        const d = await payoutsRes.json();
        setPayoutBatches(d.batches || []);
      }
      if (pagesRes.ok) {
        const d = await pagesRes.json();
        setSitePages(d.pages || []);
      }
      if (faqsRes.ok) {
        const d = await faqsRes.json();
        setSiteFaqs(d.faqs || []);
      }
      if (inqsRes.ok) {
        const d = await inqsRes.json();
        setInquiries(d.inquiries || []);
      }
      if (auditsRes.ok) {
        const d = await auditsRes.json();
        setAuditLogs(d.logs || []);
      }
      if (setsRes.ok) {
        const d = await setsRes.json();
        setSettings(d.settings || []);
      }

      // Fetch live Supabase connectivity status
      try {
        const healthRes = await fetch('/api/health');
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setDbHealth(healthData);
        }
      } catch (e) {
        console.warn('Health check fetch failed', e);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const runDbConnectionTest = async () => {
    setIsTestingDb(true);
    try {
      const res = await authFetch('/api/admin/supabase/test-connection');
      const data = await res.json();
      setDbDiagnostic(data);
      if (data.all_tables_verified) {
        showNotification('Live Supabase query test successful: All core tables verified.');
      } else {
        showNotification('Database reached, but some tables require SQL migrations.');
      }
    } catch (err: any) {
      showNotification(`Connection test error: ${err.message}`);
    } finally {
      setIsTestingDb(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [token, activeRole]);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const formatMoney = (cents: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(cents / 100);
  };

  // Application Actions
  const handleUpdateAppStatus = async (appId: string, status: string, notes?: string) => {
    try {
      const res = await authFetch(`/api/admin/applications/${appId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, internal_notes: notes })
      });
      if (res.ok) {
        showNotification(`Application updated to: ${status}`);
        loadAllData();
      }
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  // Conversion Registration
  const handleCreateConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/admin/conversions', {
        method: 'POST',
        body: JSON.stringify(newConv)
      });
      if (res.ok) {
        showNotification('Sale registered successfully. Now pending manual verification.');
        setNewConv({
          customerReference: '',
          customerEmail: '',
          affiliateId: affiliates[0]?.id || '',
          membershipTier: 'gold',
          eligibleSaleAmountCents: 1200000,
          currency: 'USD',
          transactionDate: new Date().toISOString().split('T')[0],
          supportingEvidenceUrl: '',
          supportingNotes: ''
        });
        loadAllData();
      } else {
        const errData = await res.json();
        showNotification(`Error: ${errData.error}`);
      }
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  // Conversion Verification (Approve / Reject)
  const handleVerifyConversion = async (convId: string, status: 'verified' | 'rejected') => {
    const reason = status === 'rejected' ? prompt('Enter reason for rejecting conversion:') : undefined;
    if (status === 'rejected' && !reason) return;

    try {
      const res = await authFetch(`/api/admin/conversions/${convId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({
          verification_status: status,
          rejection_reason: reason,
          supporting_notes: `Administrative decision executed by ${activeRole}`
        })
      });
      if (res.ok) {
        showNotification(`Conversion marked as: ${status}`);
        loadAllData();
      } else {
        const d = await res.json();
        showNotification(`Failed: ${d.error}`);
      }
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  // Commission Rule Creation
  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/admin/commission-rules', {
        method: 'POST',
        body: JSON.stringify(newRule)
      });
      if (res.ok) {
        showNotification('Commission rule saved.');
        loadAllData();
      }
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  // Toggle Rule Approval
  const handleToggleRuleApproval = async (ruleId: string, current: boolean) => {
    try {
      const res = await authFetch(`/api/admin/commission-rules/${ruleId}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ is_approved_by_r3: !current })
      });
      if (res.ok) {
        showNotification(`Rule approval updated.`);
        loadAllData();
      }
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  // Payout Batch Generation
  const handleGeneratePayoutBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/admin/payouts/generate-batch', {
        method: 'POST',
        body: JSON.stringify(newBatch)
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(`Batch created: ${data.batch?.batch_number}`);
        loadAllData();
      } else {
        showNotification(`Error: ${data.error}`);
      }
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  // Approve Payout Batch
  const handleApproveBatch = async (batchId: string) => {
    try {
      const res = await authFetch(`/api/admin/payouts/batches/${batchId}/approve`, {
        method: 'PATCH'
      });
      if (res.ok) {
        showNotification('Payout batch approved by Finance.');
        loadAllData();
      }
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  // Pay Payout Item
  const handlePayPayoutItem = async (itemId: string) => {
    const ref = prompt('Enter bank transfer payment reference (e.g. SWIFT-R3-882910):', `SWIFT-R3-${Math.floor(100000 + Math.random() * 900000)}`);
    if (!ref) return;

    try {
      const res = await authFetch(`/api/admin/payouts/items/${itemId}/pay`, {
        method: 'PATCH',
        body: JSON.stringify({ payment_reference: ref })
      });
      if (res.ok) {
        showNotification(`Settlement recorded with reference: ${ref}`);
        loadAllData();
      }
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  // Toggle Page Publish Status
  const handleTogglePageStatus = async (slug: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      const res = await authFetch(`/api/cms/pages/${slug}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showNotification(`Page ${slug} set to: ${nextStatus}`);
        loadAllData();
      }
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  // Toggle Affiliate Status (Activate / Suspend)
  const handleToggleAffiliateStatus = async (affId: string, currentStatus: string) => {
    const next = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await authFetch(`/api/admin/affiliates/${affId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next })
      });
      if (res.ok) {
        showNotification(`Affiliate status updated to: ${next}`);
        loadAllData();
      }
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 animate-spin" />
          Loading Administrative Console...
        </div>
      </div>
    );
  }

  // Filtered applications
  const filteredApps = applications.filter((a) => {
    const matchesStatus =
      appStatusFilter === 'all' ||
      a.status === appStatusFilter ||
      (appStatusFilter === 'submitted' && (a.status === 'submitted' || a.status === 'pending_review'));
    const matchesSearch =
      !appSearch ||
      a.full_name?.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.email?.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.country?.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.business_name?.toLowerCase().includes(appSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 pb-20">
      {/* Top Banner Header */}
      <div className="border-b border-slate-200 bg-[#0A192F] text-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={r3Logo}
              alt="R3 Contingencies"
              className="h-10 w-auto max-w-[150px] object-contain rounded bg-black px-1.5 py-0.5 border border-slate-700 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight">R3 Staff Administrative Console</h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-200 border border-white/20 uppercase">
                  {activeRole.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authoritative governance, manual verification & immutable financial ledger
              </p>
            </div>
          </div>

          {/* Role Switching & Logout */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded border border-white/10 text-xs">
              <span className="text-slate-400 text-[11px] px-1.5">Staff Persona:</span>
              {(['super_admin', 'affiliate_manager', 'finance_manager', 'content_manager'] as UserRole[]).map(
                (role) => (
                  <button
                    key={role}
                    onClick={() => onSwitchRole(role)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      activeRole === role
                        ? 'bg-[#D4AF37] text-[#0A192F] font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {role.replace('_', ' ')}
                  </button>
                )
              )}
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 overflow-x-auto text-xs font-medium text-slate-300 pt-2 border-t border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview' ? 'border-[#D4AF37] text-white font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'crm' ? 'border-[#D4AF37] text-white font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Client CRM
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'applications' ? 'border-[#D4AF37] text-white font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Affiliate Partnership Management ({applications.filter((a) => a.status === 'submitted' || a.status === 'pending_review').length} new)
          </button>
          <button
            onClick={() => setActiveTab('affiliates')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'affiliates' ? 'border-[#D4AF37] text-white font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Affiliates ({affiliates.length})
          </button>
          <button
            onClick={() => setActiveTab('conversions')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'conversions' ? 'border-[#D4AF37] text-white font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Sales Verification ({conversions.filter((c) => c.verification_status === 'pending').length} pending)
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'commissions' ? 'border-[#D4AF37] text-white font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Commissions & Rules
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'payouts' ? 'border-[#D4AF37] text-white font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Monthly Payouts
          </button>
          <button
            onClick={() => setActiveTab('cms')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'cms' ? 'border-[#D4AF37] text-white font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Website CMS
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'inquiries' ? 'border-[#D4AF37] text-white font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Contact Desk ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'audit' ? 'border-[#D4AF37] text-white font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Audit Trail
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'settings' ? 'border-[#D4AF37] text-white font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Commercial Settings
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {actionMessage && (
          <div className="mb-6 p-3 text-xs rounded bg-[#0A192F] text-white flex items-center justify-between shadow-xs">
            <span>{actionMessage}</span>
          </div>
        )}

        {/* CRM TAB */}
        {activeTab === 'crm' && (
          <ClientCrmSection token={token} />
        )}

        {/* 1. TAB: OVERVIEW */}
        {activeTab === 'overview' && overview && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-xs">
                <span className="text-xs text-slate-500 block">Total Affiliates</span>
                <span className="text-2xl font-bold text-[#0A192F] tabular-nums">
                  {overview.totalAffiliates}
                </span>
                <span className="text-[11px] text-emerald-700 block mt-0.5">
                  {overview.activeAffiliates} active accounts
                </span>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-xs">
                <span className="text-xs text-slate-500 block">Pending Applications</span>
                <span className="text-2xl font-bold text-amber-700 tabular-nums">
                  {overview.pendingApplications}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Awaiting compliance review</span>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-xs">
                <span className="text-xs text-slate-500 block">Tracked Referral Clicks</span>
                <span className="text-2xl font-bold text-[#0A192F] tabular-nums">
                  {overview.totalClicks}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Server-side validated</span>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-xs">
                <span className="text-xs text-slate-500 block">Sales Verification Queue</span>
                <span className="text-2xl font-bold text-[#0A192F] tabular-nums">
                  {overview.pendingSales}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {overview.verifiedSales} approved conversions
                </span>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-xs">
                <span className="text-xs text-slate-500 block">Commission Liabilities</span>
                <span className="text-2xl font-bold text-emerald-800 tabular-nums">
                  {formatMoney(overview.totalCommissionLiabilityCents, overview.currency)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Paid to date: {formatMoney(overview.totalPaidOutCents, overview.currency)}
                </span>
              </div>
            </div>

            {/* Quick Action Decision Notice regarding Unresolved R3 Rules */}
            <div className="rounded-lg border border-amber-300 bg-amber-50/70 p-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Unresolved Commercial Parameters (Awaiting Executive R3 Approval)
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                As required by the R3 Contingencies mandate, no commission percentages or automatic payout schedules are permanently hardcoded. An active commission rule remains in unapproved mode until R3 management reviews and enables it in Commercial Settings.
              </p>
            </div>
          </div>
        )}

        {/* 2. TAB: AFFILIATE PARTNERSHIP MANAGEMENT & APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-lg bg-white border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-[#0A192F]">
                  Affiliate Partnership Management
                </h2>
                <p className="text-xs text-slate-500">
                  Review associate applications, conduct compliance due diligence, activate/suspend partner credentials, and inspect referral performance.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('affiliates')}
                  className="px-3 py-1.5 text-xs font-semibold text-[#0A192F] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 cursor-pointer"
                >
                  View Active Associates ({affiliates.length}) →
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    placeholder="Search applicant name, email, firm..."
                    className="w-full text-xs pl-8 pr-3 py-2 rounded border border-slate-300 bg-white focus:outline-hidden"
                  />
                </div>
                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  className="text-xs px-3 py-2 rounded border border-slate-300 bg-white focus:outline-hidden"
                >
                  <option value="all">All Statuses ({applications.length})</option>
                  <option value="submitted">Pending Review / Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="info_requested">Info Requested</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="text-xs text-slate-500">
                Showing {filteredApps.length} of {applications.length} applications
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
              {filteredApps.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No applications match the current filter criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF9F6] text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3">Applicant & Entity</th>
                        <th className="px-6 py-3">Country</th>
                        <th className="px-6 py-3">Partnership Sector</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Submission Date</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApps.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3">
                            <div className="font-semibold text-slate-900">{app.full_name}</div>
                            <div className="text-[11px] text-slate-500">
                              {app.business_name ? `${app.business_name} · ` : ''}{app.email}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-slate-700">{app.country}</td>
                          <td className="px-6 py-3 text-slate-700">
                            {app.partnership_type || app.promotional_method || 'Advisory Partner'}
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                                app.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : app.status === 'under_review'
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : app.status === 'info_requested'
                                  ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                  : app.status === 'submitted' || app.status === 'pending_review'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : app.status === 'suspended'
                                  ? 'bg-orange-50 text-orange-800 border border-orange-200'
                                  : 'bg-red-50 text-red-800 border border-red-200'
                              }`}
                            >
                              {app.status ? app.status.replace('_', ' ').toUpperCase() : 'PENDING'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-slate-500 font-mono">
                            {new Date(app.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedApp(app);
                                  setAppInternalNote(app.internal_notes || '');
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#0A192F] bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded cursor-pointer"
                              >
                                View Dossier
                              </button>
                              {app.status !== 'approved' && (
                                <button
                                  onClick={() => handleUpdateAppStatus(app.id, 'approved', 'Compliance verification confirmed.')}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              {app.status !== 'rejected' && app.status !== 'approved' && (
                                <button
                                  onClick={() => handleUpdateAppStatus(app.id, 'rejected', 'Does not meet current representation criteria.')}
                                  className="px-2.5 py-1 text-[11px] font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded cursor-pointer"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Applicant Details Dossier Modal */}
            {selectedApp && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden my-8">
                  <div className="px-6 py-4 border-b border-slate-200 bg-[#0A192F] text-white flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold">Associate Applicant Dossier: {selectedApp.full_name}</h3>
                      <p className="text-[11px] text-slate-300">ID: {selectedApp.id}</p>
                    </div>
                    <button
                      onClick={() => setSelectedApp(null)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-slate-500">Applicant Legal Structure:</span>
                        <div className="font-semibold text-slate-800 capitalize mt-0.5">
                          {selectedApp.applicant_type} {selectedApp.business_name ? `(${selectedApp.business_name})` : ''}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">Country of Domicile:</span>
                        <div className="font-semibold text-slate-800 mt-0.5">{selectedApp.country}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Corporate Email:</span>
                        <div className="font-mono text-slate-800 mt-0.5">{selectedApp.email}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Direct Telephone:</span>
                        <div className="font-mono text-slate-800 mt-0.5">{selectedApp.phone}</div>
                      </div>
                      {selectedApp.website_or_social && (
                        <div className="col-span-2">
                          <span className="text-slate-500">Website or Profile:</span>
                          <div className="font-mono text-[#0A192F] mt-0.5 truncate">
                            <a href={selectedApp.website_or_social} target="_blank" rel="noreferrer" className="hover:underline">
                              {selectedApp.website_or_social}
                            </a>
                          </div>
                        </div>
                      )}
                      {selectedApp.referral_sponsor_code && (
                        <div>
                          <span className="text-slate-500">Referral / Sponsor Code:</span>
                          <div className="font-mono font-bold text-[#0A192F] mt-0.5">{selectedApp.referral_sponsor_code}</div>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        Preferred Promotional Method & Scope:
                      </span>
                      <div className="p-3 mt-1 rounded bg-[#FAF9F6] border border-slate-200 text-slate-700">
                        {selectedApp.promotional_method || selectedApp.partnership_type || 'Direct Advisory Representation'}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        Relevant Experience & Advisory Tenure:
                      </span>
                      <div className="p-3 mt-1 rounded bg-[#FAF9F6] border border-slate-200 text-slate-700 whitespace-pre-wrap">
                        {selectedApp.relevant_experience || selectedApp.industry_background || 'N/A'}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        Reason for Applying & Objectives:
                      </span>
                      <div className="p-3 mt-1 rounded bg-[#FAF9F6] border border-slate-200 text-slate-700 whitespace-pre-wrap">
                        {selectedApp.reason_for_applying || selectedApp.partnership_objectives || 'N/A'}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        Internal Compliance & Review Notes:
                      </span>
                      <textarea
                        rows={2}
                        value={appInternalNote}
                        onChange={(e) => setAppInternalNote(e.target.value)}
                        placeholder="Add internal compliance assessment notes..."
                        className="w-full text-xs p-2.5 mt-1 rounded border border-slate-300 focus:outline-hidden"
                      />
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-500">
                        Current Status: <strong className="uppercase text-[#0A192F]">{selectedApp.status}</strong>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            handleUpdateAppStatus(selectedApp.id, 'info_requested', appInternalNote || 'Additional documentation requested.');
                            setSelectedApp(null);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded cursor-pointer"
                        >
                          Request Info
                        </button>
                        <button
                          onClick={() => {
                            handleUpdateAppStatus(selectedApp.id, 'under_review', appInternalNote || 'Dossier escalated for compliance review.');
                            setSelectedApp(null);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer"
                        >
                          Under Review
                        </button>
                        <button
                          onClick={() => {
                            handleUpdateAppStatus(selectedApp.id, 'suspended', appInternalNote || 'Suspended by administrative action.');
                            setSelectedApp(null);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded cursor-pointer"
                        >
                          Suspend
                        </button>
                        <button
                          onClick={() => {
                            handleUpdateAppStatus(selectedApp.id, 'rejected', appInternalNote || 'Rejected by administrative action.');
                            setSelectedApp(null);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            handleUpdateAppStatus(selectedApp.id, 'approved', appInternalNote || 'Compliance verified and approved.');
                            setSelectedApp(null);
                          }}
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded cursor-pointer shadow-xs"
                        >
                          Approve & Activate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. TAB: AFFILIATES */}
        {activeTab === 'affiliates' && (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-[#0A192F]">Active & Registered Affiliates</h3>
              <p className="text-xs text-slate-500">
                Partner accounts provisioned following approved applications.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF9F6] text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Affiliate ID</th>
                    <th className="px-6 py-3">Principal / Partner</th>
                    <th className="px-6 py-3">Country</th>
                    <th className="px-6 py-3">Referral Clicks</th>
                    <th className="px-6 py-3">Verified Conversions</th>
                    <th className="px-6 py-3">Account Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {affiliates.map((aff) => (
                    <tr key={aff.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 font-mono font-bold text-[#0A192F]">
                        {aff.affiliate_number}
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-semibold text-slate-900">{aff.profile?.full_name}</div>
                        <div className="text-[11px] text-slate-500">{aff.profile?.email}</div>
                      </td>
                      <td className="px-6 py-3 text-slate-700">{aff.country}</td>
                      <td className="px-6 py-3 font-mono tabular-nums text-slate-800">
                        {aff.total_referral_clicks}
                      </td>
                      <td className="px-6 py-3 font-mono tabular-nums font-semibold text-emerald-800">
                        {aff.verified_conversions_count}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            aff.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}
                        >
                          {aff.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => handleToggleAffiliateStatus(aff.id, aff.status)}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 cursor-pointer"
                        >
                          {aff.status === 'active' ? 'Suspend' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. TAB: SALES VERIFICATION SYSTEM */}
        {activeTab === 'conversions' && (
          <div className="space-y-8">
            {/* Critical Business Requirement: Manual Sales Registration Form */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-[#0A192F]">
                  Manual Sales Registration (R3 Treasury Desk)
                </h3>
                <p className="text-xs text-slate-500">
                  Authorized R3 administrators manually register client conversions when payment has been cleared by Treasury.
                </p>
              </div>

              <form onSubmit={handleCreateConversion} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                      Customer Reference / Invoice *
                    </label>
                    <input
                      type="text"
                      required
                      value={newConv.customerReference}
                      onChange={(e) => setNewConv({ ...newConv, customerReference: e.target.value })}
                      placeholder="e.g. CUST-CH-9182"
                      className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      value={newConv.customerEmail}
                      onChange={(e) => setNewConv({ ...newConv, customerEmail: e.target.value })}
                      placeholder="principal@familyoffice.com"
                      className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                      Attributed Affiliate Partner *
                    </label>
                    <select
                      value={newConv.affiliateId}
                      onChange={(e) => setNewConv({ ...newConv, affiliateId: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:outline-hidden"
                    >
                      {affiliates.map((aff) => (
                        <option key={aff.id} value={aff.id}>
                          {aff.affiliate_number} — {aff.profile?.full_name} ({aff.country})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                      Membership Tier *
                    </label>
                    <select
                      value={newConv.membershipTier}
                      onChange={(e) => setNewConv({ ...newConv, membershipTier: e.target.value as any })}
                      className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:outline-hidden"
                    >
                      <option value="silver">Silver Tier ($2,400)</option>
                      <option value="gold">Gold Tier ($12,000)</option>
                      <option value="excelsior">Excelsior Bespoke</option>
                      <option value="bespoke_service">Bespoke Crisis Logistics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                      Eligible Sale Amount (USD Cents) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newConv.eligibleSaleAmountCents}
                      onChange={(e) => setNewConv({ ...newConv, eligibleSaleAmountCents: parseInt(e.target.value, 10) || 0 })}
                      className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:outline-hidden tabular-nums font-mono"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Value: {formatMoney(newConv.eligibleSaleAmountCents, 'USD')}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                      Transaction Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newConv.transactionDate}
                      onChange={(e) => setNewConv({ ...newConv, transactionDate: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                    Supporting Verification Notes & Wire Reference *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newConv.supportingNotes}
                    onChange={(e) => setNewConv({ ...newConv, supportingNotes: e.target.value })}
                    placeholder="Enter wire clearing details, corporate contract confirmation, or treasury record..."
                    className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Register Pending Sale
                  </button>
                </div>
              </form>
            </div>

            {/* Sales Verification Table */}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-sm font-bold text-[#0A192F]">Sales Verification Queue</h3>
                <p className="text-xs text-slate-500">
                  Only verified and approved sales generate an immutable commission ledger entry.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF9F6] text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Transaction Ref</th>
                      <th className="px-6 py-3">Customer ID</th>
                      <th className="px-6 py-3">Affiliate Partner</th>
                      <th className="px-6 py-3">Eligible Sale</th>
                      <th className="px-6 py-3">Verification Status</th>
                      <th className="px-6 py-3">Notes</th>
                      <th className="px-6 py-3 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {conversions.map((conv) => (
                      <tr key={conv.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 font-mono font-bold text-[#0A192F]">
                          {conv.transaction_reference}
                        </td>
                        <td className="px-6 py-3 font-mono text-slate-700">
                          {conv.customer_reference}
                        </td>
                        <td className="px-6 py-3">
                          <span className="font-mono text-[#0A192F] font-semibold">{conv.affiliate_number}</span>
                          <span className="text-[11px] text-slate-500 block">{conv.affiliate_name}</span>
                        </td>
                        <td className="px-6 py-3 font-mono tabular-nums font-bold text-slate-900">
                          {formatMoney(conv.eligible_sale_amount_cents, conv.currency)}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              conv.verification_status === 'verified'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : conv.verification_status === 'pending'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                            }`}
                          >
                            {conv.verification_status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-500 max-w-xs truncate">
                          {conv.supporting_notes || '—'}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {conv.verification_status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleVerifyConversion(conv.id, 'verified')}
                                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Verify & Authorize
                              </button>
                              <button
                                onClick={() => handleVerifyConversion(conv.id, 'rejected')}
                                className="px-2.5 py-1 text-[11px] font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-mono">
                              Verified {conv.verified_at ? new Date(conv.verified_at).toLocaleDateString() : ''}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. TAB: COMMISSIONS & RULES */}
        {activeTab === 'commissions' && (
          <div className="space-y-8">
            {/* Commission Rules Section */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#0A192F]">
                    Configurable Commission Engine Rules
                  </h3>
                  <p className="text-xs text-slate-500">
                    R3 compliance rule: No commission percentage is active without management authorization.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {commissionRules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-4 rounded border ${
                      rule.is_approved_by_r3
                        ? 'border-emerald-300 bg-emerald-50/30'
                        : 'border-amber-300 bg-amber-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#0A192F]">{rule.rule_name}</span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                          rule.is_approved_by_r3
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rule.is_approved_by_r3 ? 'ACTIVE APPROVED' : 'AWAITING R3 SIGN-OFF'}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Percentage</span>
                        <span className="font-mono font-bold text-base text-[#0A192F]">
                          {rule.commission_percentage}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Eligible Basis</span>
                        <span className="font-medium text-slate-800 capitalize">
                          {rule.eligible_basis.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {activeRole === 'super_admin' && (
                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex justify-end">
                        <button
                          onClick={() => handleToggleRuleApproval(rule.id, rule.is_approved_by_r3)}
                          className="px-3 py-1 text-xs font-semibold rounded cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-800"
                        >
                          {rule.is_approved_by_r3 ? 'Revoke Approval' : 'Grant R3 Executive Approval'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Immutable Ledger View */}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-sm font-bold text-[#0A192F]">
                  Authoritative Commission Financial Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Immutable records preserving historical snapshot of applied rate and eligible amount.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF9F6] text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Ledger Ref</th>
                      <th className="px-6 py-3">Affiliate Partner</th>
                      <th className="px-6 py-3">Eligible Sale</th>
                      <th className="px-6 py-3">Applied Rate</th>
                      <th className="px-6 py-3">Commission Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Event Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {commissionLedger.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 font-mono text-slate-600">{item.id}</td>
                        <td className="px-6 py-3">
                          <span className="font-mono text-[#0A192F] font-bold">{item.affiliate_number}</span>
                          <span className="text-[11px] text-slate-500 block">{item.affiliate_name}</span>
                        </td>
                        <td className="px-6 py-3 font-mono tabular-nums text-slate-800">
                          {formatMoney(item.eligible_sale_cents, item.currency)}
                        </td>
                        <td className="px-6 py-3 font-mono tabular-nums font-semibold text-[#0A192F]">
                          {item.rate_applied_percentage > 0 ? `${item.rate_applied_percentage}%` : 'Pending Approval'}
                        </td>
                        <td className="px-6 py-3 font-mono tabular-nums font-bold text-emerald-800">
                          {formatMoney(item.commission_amount_cents, item.currency)}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              item.status === 'paid'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : item.status === 'approved' || item.status === 'payable'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-mono text-slate-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. TAB: MONTHLY PAYOUTS */}
        {activeTab === 'payouts' && (
          <div className="space-y-8">
            {/* Generate Batch Control */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-[#0A192F]">Generate Monthly Payout Batch</h3>
                <p className="text-xs text-slate-500">
                  Scans all payable commissions, groups by affiliate and currency, and calculates settlement liabilities.
                </p>
              </div>

              <form onSubmit={handleGeneratePayoutBatch} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-[#0A192F] mb-1">Period Start</label>
                  <input
                    type="date"
                    required
                    value={newBatch.period_start}
                    onChange={(e) => setNewBatch({ ...newBatch, period_start: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A192F] mb-1">Period End</label>
                  <input
                    type="date"
                    required
                    value={newBatch.period_end}
                    onChange={(e) => setNewBatch({ ...newBatch, period_end: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A192F] mb-1">Settlement Currency</label>
                  <select
                    value={newBatch.currency}
                    onChange={(e) => setNewBatch({ ...newBatch, currency: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                  >
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
                    <option value="CHF">CHF (Swiss Franc)</option>
                  </select>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Payout Batch
                  </button>
                </div>
              </form>
            </div>

            {/* Payout Batches List */}
            <div className="space-y-6">
              {payoutBatches.map((batch) => (
                <div key={batch.id} className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
                  <div className="px-6 py-4 border-b border-slate-200 bg-[#FAF9F6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#0A192F]">{batch.batch_number}</span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                            batch.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : batch.status === 'draft'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {batch.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Period: {batch.period_start} to {batch.period_end} · Currency: {batch.currency}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Total Liabilities</span>
                        <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                          {formatMoney(batch.total_amount_cents, batch.currency)}
                        </span>
                      </div>
                      {batch.status === 'draft' && (
                        <button
                          onClick={() => handleApproveBatch(batch.id)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded cursor-pointer"
                        >
                          Approve Batch
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Batch Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="text-slate-500 font-semibold border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-2.5">Affiliate Partner</th>
                          <th className="px-6 py-2.5">Net Payable</th>
                          <th className="px-6 py-2.5">Payout Method</th>
                          <th className="px-6 py-2.5">Payment Reference</th>
                          <th className="px-6 py-2.5">Status</th>
                          <th className="px-6 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {batch.items?.map((item: any) => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-3">
                              <span className="font-mono font-bold text-[#0A192F]">{item.affiliate_number}</span>
                              <span className="text-[11px] text-slate-500 block">{item.affiliate_name}</span>
                            </td>
                            <td className="px-6 py-3 font-mono tabular-nums font-bold text-slate-900">
                              {formatMoney(item.net_payable_cents, item.currency)}
                            </td>
                            <td className="px-6 py-3 capitalize text-slate-700">
                              {item.payout_method.replace('_', ' ')}
                            </td>
                            <td className="px-6 py-3 font-mono text-slate-600">
                              {item.payment_reference || 'Pending Wire Execution'}
                            </td>
                            <td className="px-6 py-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  item.status === 'paid'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {item.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right">
                              {item.status !== 'paid' && batch.status === 'approved' && (
                                <button
                                  onClick={() => handlePayPayoutItem(item.id)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer"
                                >
                                  Record Settlement
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. TAB: WEBSITE CMS */}
        {activeTab === 'cms' && (
          <div className="space-y-8">
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-sm font-bold text-[#0A192F]">Website Public Pages</h3>
                <p className="text-xs text-slate-500">
                  Manage publication state and metadata for corporate website pages.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {sitePages.map((page) => (
                  <div key={page.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#0A192F]">/{page.slug}</span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                            page.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {page.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{page.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{page.meta_description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePageStatus(page.slug, page.status)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded cursor-pointer"
                      >
                        {page.status === 'published' ? 'Unpublish to Draft' : 'Publish to Live Web'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 8. TAB: INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-[#0A192F]">Public Contact Desk Inquiries</h3>
              <p className="text-xs text-slate-500">Submissions received via public dispatch contact form.</p>
            </div>

            <div className="divide-y divide-slate-100">
              {inquiries.map((inq) => (
                <div key={inq.id} className="p-6 space-y-2 hover:bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{inq.full_name} ({inq.email})</span>
                    <span className="font-mono text-slate-500">{new Date(inq.created_at).toLocaleString()}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#0A192F]">{inq.subject}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{inq.message}</p>
                  <div className="text-[11px] text-slate-500 pt-1">
                    Jurisdiction: {inq.country || 'International'} · Phone: {inq.phone || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. TAB: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-[#0A192F]">Immutable Compliance Audit Log</h3>
              <p className="text-xs text-slate-500">
                Auditable event trail recording every staff verification, approval, and financial adjustment.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-[#FAF9F6] text-slate-500 font-sans font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Timestamp (UTC)</th>
                    <th className="px-6 py-3">Staff Actor</th>
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">Target Entity</th>
                    <th className="px-6 py-3">Entity ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-2.5 text-slate-600">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-2.5 text-slate-900 font-medium font-sans">
                        {log.actor_email}
                      </td>
                      <td className="px-6 py-2.5 text-emerald-800 font-bold">
                        {log.action}
                      </td>
                      <td className="px-6 py-2.5 text-slate-700">{log.entity_type}</td>
                      <td className="px-6 py-2.5 text-slate-500">{log.entity_id || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. TAB: SETTINGS & UNRESOLVED RULES */}
        {activeTab === 'settings' && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#0A192F]">
                Commercial Settings & Governance Policies
              </h3>
              <p className="text-xs text-slate-500">
                Parameters awaiting official company approval by R3 Contingencies executive board.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {settings.map((s) => (
                <div key={s.id} className="p-5 rounded border border-slate-200 bg-[#FAF9F6] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#0A192F]">{s.setting_key}</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                        s.is_approved_by_r3 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {s.is_approved_by_r3 ? 'APPROVED' : 'AWAITING R3 SIGN-OFF'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{s.description}</p>
                  <pre className="p-3 bg-white border border-slate-200 rounded text-[11px] font-mono overflow-x-auto text-slate-800">
                    {JSON.stringify(s.setting_value, null, 2)}
                  </pre>
                </div>
              ))}
            </div>

            {/* Supabase Foundation & Database Diagnostics */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-bold text-[#0A192F] flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#D4AF37]" />
                    Supabase Infrastructure & Security Diagnostics
                  </h4>
                  <p className="text-xs text-slate-500">
                    Real-time connectivity verification between client SDK, Node.js API server, and PostgreSQL database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={runDbConnectionTest}
                  disabled={isTestingDb}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#0A192F] hover:bg-[#1E293B] text-white text-xs font-semibold rounded transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Activity className={`w-3.5 h-3.5 text-[#D4AF37] ${isTestingDb ? 'animate-spin' : ''}`} />
                  {isTestingDb ? 'Querying Database...' : 'Run Live Table Audit'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded border border-slate-200 bg-[#FAF9F6]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Frontend Client SDK
                  </span>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    <span className="font-semibold text-[#0A192F]">
                      {isSupabaseConfigured ? 'Active & Configured' : 'Client Fallback Mode'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Endpoint: <span className="font-mono">{getSupabaseClientEndpoint() || 'Not set'}</span>
                  </p>
                  <p className="text-slate-500 text-[10px] mt-1">
                    Security: Uses Vite import.meta.env with publishable key only (zero secret leaks).
                  </p>
                </div>

                <div className="p-4 rounded border border-slate-200 bg-[#FAF9F6]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Backend PostgreSQL Connection
                  </span>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        dbHealth?.database?.connected ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span className="font-semibold text-[#0A192F]">
                      {dbHealth?.database?.connected
                        ? dbHealth.database.schema_status === 'tables_verified'
                          ? 'Live & Tables Verified'
                          : 'Live Connection (Pending Migrations)'
                        : 'Disconnected'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Verified via: <span className="font-semibold text-slate-800">Live Query Execution</span>
                  </p>
                  <p className="text-slate-500 text-[10px] mt-1">
                    Latency: {dbHealth?.database?.latency_ms != null ? `${dbHealth.database.latency_ms} ms` : 'Measuring...'}
                  </p>
                </div>

                <div className="p-4 rounded border border-slate-200 bg-[#FAF9F6]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Auth & Security Configuration
                  </span>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-[#0A192F]">JWKS Endpoint Configured</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    JWKS Status: {dbHealth?.database?.jwks_configured ? 'Validated' : 'Pending'}
                  </p>
                  <p className="text-slate-500 text-[10px] mt-1">
                    Secret keys isolated strictly to backend server environment.
                  </p>
                </div>
              </div>

              {dbDiagnostic && (
                <div className="mt-4 p-4 rounded border border-slate-200 bg-white">
                  <h5 className="font-bold text-[#0A192F] text-xs mb-2 flex items-center justify-between">
                    <span>Database Table Verification Results</span>
                    <span className="text-[11px] font-normal text-slate-500 font-mono">
                      Latency: {dbDiagnostic.latency_ms}ms
                    </span>
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-[11px]">
                    {Object.entries(dbDiagnostic.tables || {}).map(([tbl, info]: [string, any]) => (
                      <div
                        key={tbl}
                        className={`p-2 rounded border ${
                          info.exists
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-amber-50 border-amber-200 text-amber-900'
                        }`}
                      >
                        <div className="font-mono font-bold truncate">{tbl}</div>
                        <div className="text-[10px]">
                          {info.exists ? '✓ Table verified' : 'Pending migration'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
