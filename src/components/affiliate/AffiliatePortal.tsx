import React, { useState, useEffect } from 'react';
import {
  Link2,
  Copy,
  Check,
  TrendingUp,
  DollarSign,
  Users,
  Award,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ExternalLink,
  Shield,
  FileText,
  AlertCircle
} from 'lucide-react';
import type { Affiliate, Profile } from '../../types/database.ts';

interface AffiliatePortalProps {
  token: string;
  onLogout: () => void;
}

export const AffiliatePortal: React.FC<AffiliatePortalProps> = ({ token, onLogout }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'events' | 'leads' | 'conversions' | 'ledger' | 'payouts'>('overview');
  const [copied, setCopied] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);

  const fetchDashboard = () => {
    fetch('/api/affiliate/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format currency cents
  const formatMoney = (cents: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(cents / 100);
  };

  // Simulate an attribution click to test real-time tracking
  const simulateClick = async (code: string) => {
    setSimulationStatus('Simulating referral click...');
    try {
      const res = await fetch('/api/tracking/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref: code,
          landingPage: `/?ref=${code}`,
          sessionId: `sess_test_${Date.now()}`
        })
      });
      const resJson = await res.json();
      if (res.ok) {
        setSimulationStatus(`✓ Tracked referral click successfully for ${code}! Refreshing metrics...`);
        fetchDashboard();
      } else {
        setSimulationStatus(`Error: ${resJson.error}`);
      }
    } catch (err: any) {
      setSimulationStatus(`Failed to simulate click: ${err.message}`);
    }
    setTimeout(() => setSimulationStatus(null), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 animate-spin" />
          Loading Authenticated Partner Portal...
        </div>
      </div>
    );
  }

  if (!data || !data.affiliate) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
        <div className="rounded-lg border border-slate-200 bg-white p-8 max-w-md text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="text-base font-bold text-[#0A192F]">Affiliate Record Pending</h3>
          <p className="text-xs text-slate-600">
            Your partner application is under compliance review or activation is pending.
          </p>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const { affiliate, stats, referralCodes, conversions, ledger, payouts, recentEvents } = data;
  const primaryCode = referralCodes[0]?.code || affiliate.affiliate_number;
  const siteUrl = window.location.origin;
  const referralLink = `${siteUrl}/?ref=${primaryCode}`;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 pb-20">
      {/* Top Banner Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#0A192F] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono">
                {affiliate.affiliate_number}
              </span>
              <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Partner
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A192F] mt-1">
              Affiliate Partner Portal
            </h1>
            <p className="text-xs text-slate-500">
              Jurisdiction: {affiliate.country} · Payout Currency: {affiliate.payout_currency || 'USD'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => copyToClipboard(referralLink)}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#0A192F] bg-[#FAF9F6] hover:bg-slate-100 border border-slate-300 rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Link' : 'Copy Referral Link'}
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 overflow-x-auto border-t border-slate-100 text-xs font-medium text-slate-600 pt-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#0A192F] text-[#0A192F] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Performance Overview
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'links'
                ? 'border-[#0A192F] text-[#0A192F] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            My Referral Links
          </button>
          <button
            onClick={() => setActiveTab('conversions')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'conversions'
                ? 'border-[#0A192F] text-[#0A192F] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Sales Conversions ({conversions.length})
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'ledger'
                ? 'border-[#0A192F] text-[#0A192F] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Commission Ledger ({ledger.length})
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'payouts'
                ? 'border-[#0A192F] text-[#0A192F] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Monthly Payouts ({payouts.length})
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {simulationStatus && (
          <div className="mb-6 p-3 text-xs rounded bg-slate-900 text-white flex items-center justify-between">
            <span>{simulationStatus}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-lg border border-slate-200 bg-white space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Referral Clicks</span>
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-[#0A192F] tabular-nums">
                  {stats.total_clicks}
                </div>
                <div className="text-[11px] text-slate-500">
                  {stats.unique_visitors} unique visitors
                </div>
              </div>

              <div className="p-5 rounded-lg border border-slate-200 bg-white space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Verified Conversions</span>
                  <Award className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div className="text-2xl font-bold text-[#0A192F] tabular-nums">
                  {stats.verified_conversions}
                </div>
                <div className="text-[11px] text-slate-500">
                  Manually audited by R3
                </div>
              </div>

              <div className="p-5 rounded-lg border border-slate-200 bg-white space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Approved Commissions</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-800 tabular-nums">
                  {formatMoney(stats.approved_commissions_cents, stats.currency)}
                </div>
                <div className="text-[11px] text-slate-500">
                  Pending monthly batch
                </div>
              </div>

              <div className="p-5 rounded-lg border border-slate-200 bg-white space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Total Settled Payouts</span>
                  <CheckCircle2 className="w-4 h-4 text-[#0A192F]" />
                </div>
                <div className="text-2xl font-bold text-[#0A192F] tabular-nums">
                  {formatMoney(stats.paid_commissions_cents, stats.currency)}
                </div>
                <div className="text-[11px] text-slate-500">
                  Disbursed via wire transfer
                </div>
              </div>
            </div>

            {/* Quick Link Card & Testing Simulator */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0A192F]">
                    Your Primary Referral Link
                  </h3>
                  <p className="text-xs text-slate-500">
                    Share this unique link with prospective clients or embed it in private wealth briefings.
                  </p>
                </div>
                <button
                  onClick={() => simulateClick(primaryCode)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors cursor-pointer"
                  title="Simulates a real click event to verify tracking works immediately"
                >
                  Test Track Click
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded border border-slate-300 bg-slate-50 text-slate-800 select-all"
                />
                <button
                  onClick={() => copyToClipboard(referralLink)}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Recent Verified Conversions Preview */}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0A192F]">
                  Recent Verified Conversions
                </h3>
                <button
                  onClick={() => setActiveTab('conversions')}
                  className="text-xs font-semibold text-slate-600 hover:text-[#0A192F] cursor-pointer"
                >
                  View All →
                </button>
              </div>

              {conversions.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  No conversions registered yet. Once an introduced principal completes membership, R3 administrators will manually verify the sale.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF9F6] text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3">Transaction Reference</th>
                        <th className="px-6 py-3">Membership Tier</th>
                        <th className="px-6 py-3">Eligible Sale</th>
                        <th className="px-6 py-3">Transaction Date</th>
                        <th className="px-6 py-3">Verification Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {conversions.map((conv: any) => (
                        <tr key={conv.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3 font-mono font-medium text-slate-800">
                            {conv.transaction_reference}
                          </td>
                          <td className="px-6 py-3 capitalize font-medium text-slate-700">
                            {conv.membership_tier.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-3 font-mono tabular-nums font-semibold text-slate-900">
                            {formatMoney(conv.eligible_sale_amount_cents, conv.currency)}
                          </td>
                          <td className="px-6 py-3 text-slate-500 font-mono">
                            {conv.transaction_date}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: REFERRAL LINKS */}
        {activeTab === 'links' && (
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="text-base font-bold text-[#0A192F]">Referral Codes & Attribution Routing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Referral attribution is strictly server-side verified. When an introduced principal accesses R3 Contingencies via your referral code, an attribution session is established with a 60-day window.
              </p>

              <div className="space-y-3 pt-2">
                {referralCodes.map((codeItem: any) => (
                  <div key={codeItem.id} className="p-4 rounded border border-slate-200 bg-[#FAF9F6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#0A192F]">{codeItem.code}</span>
                        <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        {siteUrl}/?ref={codeItem.code}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(`${siteUrl}/?ref=${codeItem.code}`)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                      <button
                        onClick={() => simulateClick(codeItem.code)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer"
                      >
                        Test Tracking
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Click Event Log */}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h4 className="text-sm font-bold text-[#0A192F]">Recent Click Events Log</h4>
                <p className="text-xs text-slate-500">Live server-side referral events logged for your code.</p>
              </div>

              {recentEvents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No click events recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF9F6] text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3">Timestamp (UTC)</th>
                        <th className="px-6 py-3">Landing URL</th>
                        <th className="px-6 py-3">IP Hash</th>
                        <th className="px-6 py-3">Session Ref</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {recentEvents.map((ev: any) => (
                        <tr key={ev.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-2.5 text-slate-600">
                            {new Date(ev.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-2.5 text-slate-800">{ev.landing_page}</td>
                          <td className="px-6 py-2.5 text-slate-500">{ev.ip_hash}</td>
                          <td className="px-6 py-2.5 text-slate-500">{ev.visitor_session_id}</td>
                          <td className="px-6 py-2.5">
                            {ev.is_duplicate ? (
                              <span className="text-amber-700 font-sans text-[11px]">Duplicate Click (Filtered)</span>
                            ) : (
                              <span className="text-emerald-700 font-sans text-[11px]">Verified Referral</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CONVERSIONS */}
        {activeTab === 'conversions' && (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-[#0A192F]">
                Verified Customer Conversions
              </h3>
              <p className="text-xs text-slate-500">
                Sales generated through your referrals and verified by authorized R3 administrators.
              </p>
            </div>

            {conversions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No conversions currently logged.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF9F6] text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Transaction Reference</th>
                      <th className="px-6 py-3">Customer ID</th>
                      <th className="px-6 py-3">Tier</th>
                      <th className="px-6 py-3">Eligible Sale</th>
                      <th className="px-6 py-3">Sale Date</th>
                      <th className="px-6 py-3">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {conversions.map((conv: any) => (
                      <tr key={conv.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 font-mono font-medium text-slate-800">
                          {conv.transaction_reference}
                        </td>
                        <td className="px-6 py-3 font-mono text-slate-600">
                          {conv.customer_reference}
                        </td>
                        <td className="px-6 py-3 capitalize font-medium text-slate-700">
                          {conv.membership_tier.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-3 font-mono tabular-nums font-semibold text-slate-900">
                          {formatMoney(conv.eligible_sale_amount_cents, conv.currency)}
                        </td>
                        <td className="px-6 py-3 text-slate-500 font-mono">
                          {conv.transaction_date}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              conv.verification_status === 'verified'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {conv.verification_status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: COMMISSION LEDGER */}
        {activeTab === 'ledger' && (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-[#0A192F]">
                Immutable Commission Financial Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Auditable financial ledger tracking approved commissions and exact percentage rates locked at time of sale.
              </p>
            </div>

            {ledger.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No ledger transactions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF9F6] text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Ledger ID</th>
                      <th className="px-6 py-3">Event Type</th>
                      <th className="px-6 py-3">Eligible Sale</th>
                      <th className="px-6 py-3">Applied Rate</th>
                      <th className="px-6 py-3">Commission Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Audit Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledger.map((entry: any) => (
                      <tr key={entry.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 font-mono text-slate-600">{entry.id}</td>
                        <td className="px-6 py-3 font-medium capitalize text-slate-800">
                          {entry.event_type.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-3 font-mono tabular-nums text-slate-700">
                          {formatMoney(entry.eligible_sale_cents, entry.currency)}
                        </td>
                        <td className="px-6 py-3 font-mono tabular-nums font-semibold text-[#0A192F]">
                          {entry.rate_applied_percentage > 0 ? `${entry.rate_applied_percentage}%` : 'Pending R3 Approval'}
                        </td>
                        <td className="px-6 py-3 font-mono tabular-nums font-bold text-emerald-800">
                          {formatMoney(entry.commission_amount_cents, entry.currency)}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              entry.status === 'paid'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : entry.status === 'approved' || entry.status === 'payable'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {entry.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-500 max-w-xs truncate">
                          {entry.adjustment_reason || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PAYOUTS */}
        {activeTab === 'payouts' && (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-[#0A192F]">
                Monthly Payout Statements & Settlements
              </h3>
              <p className="text-xs text-slate-500">
                Monthly reconciled payment batches disbursed to your registered banking institution.
              </p>
            </div>

            {payouts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No monthly payout batches generated for your account yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF9F6] text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Batch Reference</th>
                      <th className="px-6 py-3">Commissions Included</th>
                      <th className="px-6 py-3">Net Settled Amount</th>
                      <th className="px-6 py-3">Payout Method</th>
                      <th className="px-6 py-3">Payment Reference</th>
                      <th className="px-6 py-3">Settlement Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payouts.map((pitem: any) => (
                      <tr key={pitem.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 font-mono font-medium text-slate-800">
                          {pitem.payout_batch_id}
                        </td>
                        <td className="px-6 py-3 tabular-nums font-mono text-slate-700">
                          {pitem.total_commissions_count} commissions
                        </td>
                        <td className="px-6 py-3 font-mono tabular-nums font-bold text-slate-900">
                          {formatMoney(pitem.net_payable_cents, pitem.currency)}
                        </td>
                        <td className="px-6 py-3 capitalize text-slate-700">
                          {pitem.payout_method.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-3 font-mono text-slate-600">
                          {pitem.payment_reference || 'Processing'}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              pitem.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {pitem.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
