import React, { useState, useEffect } from 'react';
import {
  Shield,
  Phone,
  Mail,
  User,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Send,
  LogOut,
  Calendar,
  Lock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { r3Logo } from '../../assets/images/index.ts';

interface MemberDashboardProps {
  token: string;
  onLogout: () => void;
  clientData?: any;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  token,
  onLogout,
  clientData
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Service Request Form Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    subject: '',
    details: '',
    serviceCategory: 'Emergency Contingency & Aeromedical Evacuation'
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  const fetchDashboard = () => {
    const emailHeader = clientData?.client?.email || clientData?.user?.email || '';
    fetch('/api/member/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-client-email': emailHeader
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to retrieve member record');
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to load member dashboard.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.client?.id) return;

    setRequestLoading(true);
    setRequestSuccess(null);

    try {
      const res = await fetch('/api/member/service-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: data.client.id,
          subject: requestForm.subject,
          details: requestForm.details,
          serviceCategory: requestForm.serviceCategory
        })
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to dispatch request.');

      setRequestSuccess('Contingency service request securely transmitted to Senior Dispatch Coordinator.');
      setRequestForm({
        subject: '',
        details: '',
        serviceCategory: 'Emergency Contingency & Aeromedical Evacuation'
      });
      fetchDashboard();
      setTimeout(() => {
        setIsRequestModalOpen(false);
        setRequestSuccess(null);
      }, 2500);
    } catch (err: any) {
      alert(err.message || 'Error creating request');
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-[#0A192F]" />
          <span>Decrypting Principal Membership Dossier...</span>
        </div>
      </div>
    );
  }

  const client = data?.client || clientData?.client;
  const membership = data?.membership || {
    status: 'Active Member Intake',
    tier: 'Gold Tier',
    dossier_id: `R3-MBR-${client?.id?.slice(0, 8)?.toUpperCase() || '884192'}`,
    assigned_coordinator: 'Senior Crisis Operations Lead',
    emergency_hotline: '+41 22 819 4000 (24/7 Global Desk)',
    flex_funds_allocation: '$100,000 Standby'
  };

  const inquiries = client?.inquiries || [];
  const registrations = client?.registrations || [];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 pb-20">
      {/* Top Bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={r3Logo}
              alt="R3 Contingencies"
              className="h-10 w-auto max-w-[150px] object-contain rounded bg-black px-1.5 py-0.5 border border-slate-700 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#0A192F]">
                  {client?.full_name || 'Executive Principal'}
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#D4AF37]/20 text-[#0A192F] border border-[#D4AF37]/40 rounded">
                  {membership.tier}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 font-mono">
                <span>Dossier: {membership.dossier_id}</span>
                <span>•</span>
                <span>{client?.country || 'International'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="flex-1 md:flex-none px-4 py-2 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded shadow-xs border border-[#D4AF37]/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Request Rapid Coordination</span>
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-700 bg-slate-100 hover:bg-red-50 rounded transition-colors cursor-pointer flex items-center gap-1.5"
              title="Sign Out of Member Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Emergency Hotline Alert Banner */}
        <div className="p-4 rounded-lg bg-[#0A192F] text-white border border-[#D4AF37]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                24/7 Rapid Emergency Response Desk
              </div>
              <div className="text-sm font-bold text-white">
                {membership.emergency_hotline}
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-300">
            Assigned Coordinator: <strong className="text-white">{membership.assigned_coordinator}</strong>
          </div>
        </div>

        {/* Membership Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-lg border border-slate-200 bg-white space-y-1 shadow-xs">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Membership Retainer
            </div>
            <div className="text-xl font-bold text-[#0A192F]">
              {membership.tier}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>{membership.status}</span>
            </div>
          </div>

          <div className="p-5 rounded-lg border border-slate-200 bg-white space-y-1 shadow-xs">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Standby Flex Funds
            </div>
            <div className="text-xl font-bold text-[#0A192F]">
              {membership.flex_funds_allocation}
            </div>
            <div className="text-[11px] text-slate-500">
              Emergency liquidity reserve ready
            </div>
          </div>

          <div className="p-5 rounded-lg border border-slate-200 bg-white space-y-1 shadow-xs">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Principal Profile
            </div>
            <div className="text-xl font-bold text-[#0A192F]">
              {client?.client_type === 'business' ? 'Family Office / Corporate' : 'Private Principal'}
            </div>
            <div className="text-[11px] text-slate-500">
              {client?.company_name || client?.email}
            </div>
          </div>

          <div className="p-5 rounded-lg border border-slate-200 bg-white space-y-1 shadow-xs">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Contingency Dossier
            </div>
            <div className="text-xl font-bold text-[#0A192F]">
              Verified On File
            </div>
            <div className="text-[11px] text-slate-500">
              Passport & protocols secured
            </div>
          </div>
        </div>

        {/* Inquiries & Requests Section */}
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0A192F]">
                Active Contingency Dispatches & Service Requests
              </h3>
              <p className="text-xs text-slate-500">
                Direct operational communication channel with the R3 Crisis Command Center.
              </p>
            </div>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-[#0A192F] bg-amber-50 hover:bg-amber-100 border border-[#D4AF37]/50 rounded cursor-pointer"
            >
              + New Request
            </button>
          </div>

          {inquiries.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500 space-y-3">
              <Shield className="w-8 h-8 text-slate-400 mx-auto" />
              <p>No active emergency service dispatches currently open.</p>
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="text-[#0A192F] font-semibold underline cursor-pointer"
              >
                Transmit a dispatch or operational consultation request
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF9F6] text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Subject / Mission</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Details</th>
                    <th className="px-6 py-3">Date Dispatched</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inquiries.map((inq: any) => (
                    <tr key={inq.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 font-semibold text-[#0A192F]">
                        {inq.subject}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {inq.service_category || 'Contingency'}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate">
                        {inq.details}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 font-mono">
                        {new Date(inq.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                          inq.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inq.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {inq.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Member Profile & Registered Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg border border-slate-200 bg-white space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#0A192F] flex items-center gap-2">
              <User className="w-4 h-4 text-[#D4AF37]" />
              <span>Principal Contact & Notification Preferences</span>
            </h3>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Legal Name:</span>
                <span className="font-semibold text-slate-800">{client?.full_name}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Corporate Email:</span>
                <span className="font-mono text-slate-800">{client?.email}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Secure Mobile:</span>
                <span className="font-mono text-slate-800">{client?.phone}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Jurisdiction:</span>
                <span className="text-slate-800">{client?.country}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Preferred Channel:</span>
                <span className="capitalize font-semibold text-[#0A192F]">{client?.preferred_contact_method || 'Email'}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg border border-slate-200 bg-white space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#0A192F] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              <span>Membership Scope & Retainer Service</span>
            </h3>

            <div className="p-4 rounded-md bg-[#FAF9F6] border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-[#0A192F]">
                {registrations[0]?.service_of_interest || 'Emergency Contingency & Aeromedical Evacuation'}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Retainer covers priority dispatch coordination, 24/7 medical evacuation routing, sovereign crisis advisory, and direct drawdown access to Flex Funds reserve.
              </p>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <div>🔒 All medical profiles and passport records are end-to-end encrypted under Swiss data protection standards.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 bg-[#0A192F] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Transmit Contingency Request</h3>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {requestSuccess ? (
                <div className="py-6 text-center space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-800">{requestSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleCreateRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                      Request Category *
                    </label>
                    <select
                      value={requestForm.serviceCategory}
                      onChange={(e) => setRequestForm({ ...requestForm, serviceCategory: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden bg-white"
                    >
                      <option value="Emergency Contingency & Aeromedical Evacuation">Emergency Aeromedical Evacuation</option>
                      <option value="Sovereign Crisis & Travel Extraction">Sovereign Crisis & Travel Extraction</option>
                      <option value="Armored Secure Logistics Dispatch">Armored Secure Logistics Dispatch</option>
                      <option value="Flex Funds Drawdown Authorization">Flex Funds Drawdown Authorization</option>
                      <option value="General Contingency Briefing">General Contingency Briefing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                      Subject / Brief Description *
                    </label>
                    <input
                      type="text"
                      required
                      value={requestForm.subject}
                      onChange={(e) => setRequestForm({ ...requestForm, subject: e.target.value })}
                      placeholder="e.g. Urgent Aeromedical Coordination — Geneva to London"
                      className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0A192F] mb-1">
                      Operational Details & Timing *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={requestForm.details}
                      onChange={(e) => setRequestForm({ ...requestForm, details: e.target.value })}
                      placeholder="Provide coordinates, location, passenger count, patient condition, and required timing..."
                      className="w-full text-xs px-3 py-2 rounded border border-slate-300 focus:border-[#0A192F] focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsRequestModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={requestLoading}
                      className="px-5 py-2 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {requestLoading ? 'Transmitting...' : 'Transmit Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
