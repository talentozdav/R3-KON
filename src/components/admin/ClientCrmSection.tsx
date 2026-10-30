import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  UserCheck,
  Building,
  User,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Plus,
  RefreshCw,
  X,
  FileText,
  Tag
} from 'lucide-react';
import type { ClientProfile, ClientStatus, ClientNote, ClientFollowup } from '../../types/database.ts';

interface ClientCrmSectionProps {
  token: string;
}

export const ClientCrmSection: React.FC<ClientCrmSectionProps> = ({ token }) => {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  // Selected client for detail drawer
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Note form state
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Follow-up form state
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [followupForm, setFollowupForm] = useState({
    contactMethod: 'phone' as 'email' | 'phone' | 'whatsapp' | 'in_person' | 'other',
    contactResult: 'reached' as 'reached' | 'no_answer' | 'left_voicemail' | 'scheduled_callback' | 'converted' | 'declined',
    notes: '',
    nextFollowupDate: '',
    updateClientStatus: ''
  });
  const [isSubmittingFollowup, setIsSubmittingFollowup] = useState(false);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.set('search', searchTerm);
      if (statusFilter !== 'all') queryParams.set('status', statusFilter);
      if (typeFilter !== 'all') queryParams.set('clientType', typeFilter);
      if (countryFilter !== 'all') queryParams.set('country', countryFilter);

      const [clientsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/crm/clients?${queryParams.toString()}`, { headers: authHeaders }),
        fetch('/api/admin/crm/stats', { headers: authHeaders })
      ]);

      if (!clientsRes.ok) throw new Error('Failed to load client records');
      if (!statsRes.ok) throw new Error('Failed to load CRM statistics');

      const clientsData = await clientsRes.json();
      const statsData = await statsRes.json();

      setClients(clientsData.clients || []);
      setStats(statsData.stats || null);
    } catch (err: any) {
      setError(err.message || 'Error fetching CRM data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [statusFilter, typeFilter, countryFilter]);

  const fetchClientDetails = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/crm/clients/${id}`, { headers: authHeaders });
      if (!res.ok) throw new Error('Could not retrieve full client record');
      const data = await res.json();
      setSelectedClient(data.client);
    } catch (err: any) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelectClient = (client: ClientProfile) => {
    setSelectedClientId(client.id);
    setSelectedClient(client);
    fetchClientDetails(client.id);
    setShowFollowupForm(false);
  };

  const handleStatusChange = async (clientId: string, newStatus: ClientStatus) => {
    try {
      const res = await fetch(`/api/admin/crm/clients/${clientId}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      // Update local state
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, status: newStatus } : c))
      );
      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient({ ...selectedClient, status: newStatus });
      }
      // Refresh stats
      fetch('/api/admin/crm/stats', { headers: authHeaders })
        .then((r) => r.json())
        .then((d) => setStats(d.stats));
    } catch (err: any) {
      alert(err.message || 'Could not update client status');
    }
  };

  const handleAssignStaff = async (clientId: string, staffId: string, staffName: string) => {
    try {
      const res = await fetch(`/api/admin/crm/clients/${clientId}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ assigned_staff_id: staffId, assigned_staff_name: staffName })
      });
      if (!res.ok) throw new Error('Failed to assign staff member');

      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, assigned_staff_id: staffId, assigned_staff_name: staffName } : c))
      );
      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient({ ...selectedClient, assigned_staff_id: staffId, assigned_staff_name: staffName });
      }
    } catch (err: any) {
      alert(err.message || 'Assignment failed');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newNote.trim()) return;

    setIsSubmittingNote(true);
    try {
      const res = await fetch(`/api/admin/crm/clients/${selectedClient.id}/notes`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ note: newNote.trim() })
      });
      if (!res.ok) throw new Error('Failed to record internal note');
      const data = await res.json();

      setSelectedClient({
        ...selectedClient,
        notes: [data.note, ...(selectedClient.notes || [])]
      });
      setNewNote('');
    } catch (err: any) {
      alert(err.message || 'Note submission error');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    setIsSubmittingFollowup(true);
    try {
      const res = await fetch(`/api/admin/crm/clients/${selectedClient.id}/followups`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          contactMethod: followupForm.contactMethod,
          contactResult: followupForm.contactResult,
          notes: followupForm.notes,
          nextFollowupDate: followupForm.nextFollowupDate || undefined,
          updateClientStatus: followupForm.updateClientStatus || undefined
        })
      });
      if (!res.ok) throw new Error('Failed to record follow-up event');
      const data = await res.json();

      fetchClientDetails(selectedClient.id);
      fetchClients();
      setShowFollowupForm(false);
      setFollowupForm({
        contactMethod: 'phone',
        contactResult: 'reached',
        notes: '',
        nextFollowupDate: '',
        updateClientStatus: ''
      });
    } catch (err: any) {
      alert(err.message || 'Follow-up log error');
    } finally {
      setIsSubmittingFollowup(false);
    }
  };

  // Helper to generate WhatsApp URL from phone
  const getWhatsAppLink = (phone: string, fullName: string) => {
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    const greeting = encodeURIComponent(
      `Hello ${fullName}, this is R3 Contingencies Executive Desk. We received your contingency protection inquiry and are ready to assist with your operational requirements.`
    );
    return `https://wa.me/${cleanNumber}?text=${greeting}`;
  };

  // Helper for Status Badge styling
  const getStatusBadge = (status: ClientStatus) => {
    const config: Record<ClientStatus, { bg: string; text: string; label: string }> = {
      new: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'New Lead' },
      contacted: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Contacted' },
      followup_required: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', label: 'Follow-up Due' },
      in_discussion: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', label: 'In Discussion' },
      converted: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Converted' },
      not_interested: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', label: 'Not Interested' },
      closed: { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-500', label: 'Closed' }
    };
    const c = config[status] || config.new;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-[#0A192F] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            Client Management & Executive CRM
          </h2>
          <p className="text-xs text-slate-500">
            Confidential principal intake, communication logs, staff dispatch, and conversion tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchClients}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Clients</span>
            <div className="text-2xl font-bold text-[#0A192F] mt-1">{stats.total_clients}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{stats.corporate_count} Corporate / {stats.individual_count} Private</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">New Leads</span>
            <div className="text-2xl font-bold text-blue-700 mt-1">{stats.new_leads}</div>
            <div className="text-[11px] text-blue-500 mt-0.5">Pending initial review</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-600">Follow-ups Due</span>
            <div className="text-2xl font-bold text-purple-700 mt-1">{stats.followup_due}</div>
            <div className="text-[11px] text-purple-500 mt-0.5">Scheduled for action</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Converted</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{stats.converted}</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">{stats.conversion_rate}% Conversion rate</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">In Discussion</span>
            <div className="text-2xl font-bold text-amber-700 mt-1">{stats.in_discussion || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Active negotiation</div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchClients();
          }}
          className="relative flex-1"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by principal name, email, phone, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-[#0A192F]"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="followup_required">Follow-up Due</option>
            <option value="in_discussion">In Discussion</option>
            <option value="converted">Converted</option>
            <option value="not_interested">Not Interested</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Client Types</option>
            <option value="individual">Private Principals</option>
            <option value="business">Corporate / Family Offices</option>
          </select>
        </div>
      </div>

      {/* Main Layout: Client List + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Client Table */}
        <div className={`${selectedClient ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden transition-all duration-300`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Client / Principal</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Staff Assignment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Loading client directory...
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No client profiles match your current search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => {
                    const isSelected = selectedClientId === client.id;
                    return (
                      <tr
                        key={client.id}
                        onClick={() => handleSelectClient(client)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#0A192F] flex items-center gap-1.5">
                            {client.full_name}
                            {client.attributed_affiliate_id && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#D4AF37]/20 text-[#0A192F] font-mono">
                                REF
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{client.country}</div>
                        </td>

                        <td className="py-3 px-4">
                          {client.client_type === 'business' ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-800 font-medium">
                                <Building className="w-3 h-3 text-slate-400" />
                                {client.company_name || 'Corporate'}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                              <User className="w-3 h-3 text-slate-400" /> Private
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-700 font-mono text-[11px]">{client.email}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{client.phone}</div>
                        </td>

                        <td className="py-3 px-4">
                          {getStatusBadge(client.status)}
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-[11px] text-slate-600">
                            {client.assigned_staff_name || 'Unassigned'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`mailto:${client.email}?subject=R3%20Contingencies%20Advisory`}
                              title="Send Email"
                              className="p-1 text-slate-500 hover:text-[#0A192F] hover:bg-slate-100 rounded"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`tel:${client.phone}`}
                              title="Call Principal"
                              className="p-1 text-slate-500 hover:text-[#0A192F] hover:bg-slate-100 rounded"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={getWhatsAppLink(client.phone, client.full_name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="WhatsApp Dispatch"
                              className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleSelectClient(client)}
                              className="p-1 text-slate-500 hover:text-[#0A192F] hover:bg-slate-100 rounded cursor-pointer"
                              title="Open Full Profile"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Client Detail Drawer / Side Panel */}
        {selectedClient && (
          <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-md p-5 space-y-5 sticky top-20">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#0A192F]">{selectedClient.full_name}</h3>
                  {getStatusBadge(selectedClient.status)}
                </div>
                <p className="text-xs text-slate-500">
                  {selectedClient.client_type === 'business' ? selectedClient.company_name : 'Private Individual'} · {selectedClient.country}
                </p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Contact & Status Bar */}
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`mailto:${selectedClient.email}?subject=R3%20Contingencies%20Advisory`}
                className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" /> Email
              </a>
              <a
                href={`tel:${selectedClient.phone}`}
                className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-indigo-600" /> Call
              </a>
              <a
                href={getWhatsAppLink(selectedClient.phone, selectedClient.full_name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
              </a>
            </div>

            {/* One-Click Status & Staff Assignment */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200/80">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
                <select
                  value={selectedClient.status}
                  onChange={(e) => handleStatusChange(selectedClient.id, e.target.value as ClientStatus)}
                  className="w-full text-xs py-1.5 px-2 border border-slate-300 rounded bg-white text-slate-800"
                >
                  <option value="new">New Lead</option>
                  <option value="contacted">Contacted</option>
                  <option value="followup_required">Follow-up Required</option>
                  <option value="in_discussion">In Discussion</option>
                  <option value="converted">Converted Principal</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="closed">Closed / Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Assigned Commander</label>
                <select
                  value={selectedClient.assigned_staff_id || ''}
                  onChange={(e) => {
                    const staffMap: Record<string, string> = {
                      'prof-super-admin-01': 'Arthur Vance (Super Admin)',
                      'prof-aff-manager-02': 'Helena Lindqvist (Operations)',
                      'prof-fin-manager-03': 'Marcus Sterling (Finance)'
                    };
                    const selectedId = e.target.value;
                    handleAssignStaff(selectedClient.id, selectedId, staffMap[selectedId] || 'Assigned Staff');
                  }}
                  className="w-full text-xs py-1.5 px-2 border border-slate-300 rounded bg-white text-slate-800"
                >
                  <option value="">Unassigned</option>
                  <option value="prof-super-admin-01">Arthur Vance (Super Admin)</option>
                  <option value="prof-aff-manager-02">Helena Lindqvist (Operations)</option>
                  <option value="prof-fin-manager-03">Marcus Sterling (Finance)</option>
                </select>
              </div>
            </div>

            {/* Inquiries & Registered Needs */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Inquiries & Inbound Submissions
              </h4>
              <div className="space-y-2">
                {selectedClient.registrations && selectedClient.registrations.length > 0 ? (
                  selectedClient.registrations.map((reg) => (
                    <div key={reg.id} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{reg.service_of_interest}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(reg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {reg.message && (
                        <p className="text-slate-600 text-[11px] italic bg-white p-2 rounded border border-slate-100">
                          "{reg.message}"
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400">No prior inquiries recorded.</p>
                )}
              </div>
            </div>

            {/* Follow-up / Contact Attempt Logger */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Follow-ups & Contact Attempts
                </h4>
                <button
                  type="button"
                  onClick={() => setShowFollowupForm(!showFollowupForm)}
                  className="text-xs font-semibold text-[#0A192F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Attempt
                </button>
              </div>

              {showFollowupForm && (
                <form onSubmit={handleAddFollowup} className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-md mb-3 space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Channel</label>
                      <select
                        value={followupForm.contactMethod}
                        onChange={(e: any) => setFollowupForm({ ...followupForm, contactMethod: e.target.value })}
                        className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white"
                      >
                        <option value="phone">Phone Call</option>
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="in_person">In-Person Briefing</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Result</label>
                      <select
                        value={followupForm.contactResult}
                        onChange={(e: any) => setFollowupForm({ ...followupForm, contactResult: e.target.value })}
                        className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white"
                      >
                        <option value="reached">Reached Principal</option>
                        <option value="left_voicemail">Left Voicemail / Brief</option>
                        <option value="scheduled_callback">Scheduled Callback</option>
                        <option value="converted">Converted to Contract</option>
                        <option value="declined">Declined</option>
                        <option value="no_answer">No Answer</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Contact Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Discussed flight evacuation readiness and Flex Funds reserve guarantee..."
                      value={followupForm.notes}
                      onChange={(e) => setFollowupForm({ ...followupForm, notes: e.target.value })}
                      className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Next Follow-up Date</label>
                      <input
                        type="date"
                        value={followupForm.nextFollowupDate}
                        onChange={(e) => setFollowupForm({ ...followupForm, nextFollowupDate: e.target.value })}
                        className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Update Status to</label>
                      <select
                        value={followupForm.updateClientStatus}
                        onChange={(e) => setFollowupForm({ ...followupForm, updateClientStatus: e.target.value })}
                        className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white"
                      >
                        <option value="">Keep Current</option>
                        <option value="contacted">Contacted</option>
                        <option value="followup_required">Follow-up Due</option>
                        <option value="in_discussion">In Discussion</option>
                        <option value="converted">Converted</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowFollowupForm(false)}
                      className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingFollowup}
                      className="px-3 py-1 text-xs font-semibold text-white bg-[#0A192F] rounded cursor-pointer"
                    >
                      {isSubmittingFollowup ? 'Saving...' : 'Save Log'}
                    </button>
                  </div>
                </form>
              )}

              {/* Follow-up history */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedClient.followups && selectedClient.followups.length > 0 ? (
                  selectedClient.followups.map((f) => (
                    <div key={f.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs">
                      <div className="flex items-center justify-between font-medium text-slate-700">
                        <span className="capitalize">{f.contact_method} · {f.contact_attempt_result.replace('_', ' ')}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(f.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {f.notes && <p className="text-slate-600 text-[11px] mt-0.5">{f.notes}</p>}
                      {f.next_followup_date && (
                        <div className="text-[10px] text-purple-700 font-semibold mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Next Follow-up: {f.next_followup_date}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400">No contact attempts recorded yet.</p>
                )}
              </div>
            </div>

            {/* Internal Notes Thread */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Internal Staff Notes
              </h4>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Add confidential briefing note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-[#0A192F]"
                />
                <button
                  type="submit"
                  disabled={isSubmittingNote || !newNote.trim()}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#112240] rounded transition-colors cursor-pointer disabled:opacity-50"
                >
                  Post Note
                </button>
              </form>

              {/* Notes List */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedClient.notes && selectedClient.notes.length > 0 ? (
                  selectedClient.notes.map((note) => (
                    <div key={note.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="font-semibold text-slate-700">{note.staff_email}</span>
                        <span>{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-800 text-[11px] mt-1">{note.note}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400">No internal notes for this client.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
