import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Home,
  Shield,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  Key,
} from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const AdminResidents: React.FC = () => {
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'RESIDENTS' | 'GUARDS'>('RESIDENTS');
  const [residents, setResidents] = useState<any[]>([]);
  const [guards, setGuards] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddResidentOpen, setIsAddResidentOpen] = useState(false);
  const [isAddGuardOpen, setIsAddGuardOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Resident Form
  const [resForm, setResForm] = useState({
    name: '',
    email: '',
    phone: '',
    flatId: '',
    occupancyType: 'OWNER',
    password: 'password123',
  });

  // Guard Form
  const [guardForm, setGuardForm] = useState({
    name: '',
    email: '',
    phone: '',
    gateName: 'Main Security Gate',
    shift: 'Day Shift (08:00 - 20:00)',
    password: 'password123',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRes, guardsRes, flatsRes] = await Promise.all([
        api.getResidents().catch(() => ({ success: true, residents: [] })),
        api.getGuards().catch(() => ({ success: true, guards: [] })),
        api.getFlats().catch(() => ({ success: true, flats: [] })),
      ]);

      if (resRes.success) setResidents(resRes.residents || []);
      if (guardsRes.success) setGuards(guardsRes.guards || []);
      if (flatsRes.success) {
        setFlats(flatsRes.flats || []);
        // Pre-select first vacant flat if available
        const vacant = (flatsRes.flats || []).find((f: any) => f.status === 'VACANT');
        if (vacant) {
          setResForm((prev) => ({ ...prev, flatId: vacant.id }));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const vacantFlats = flats.filter((f) => f.status === 'VACANT');
  const occupiedFlats = flats.filter((f) => f.status === 'OCCUPIED');

  const filteredResidents = residents.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.flat?.flatNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGuards = guards.filter(
    (g) =>
      g.name?.toLowerCase().includes(search.toLowerCase()) ||
      g.email?.toLowerCase().includes(search.toLowerCase()) ||
      g.gateName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddResident = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!resForm.name.trim() || !resForm.email.trim() || !resForm.phone.trim()) {
      setFormError('Please fill in all required resident details.');
      return;
    }

    if (!resForm.flatId) {
      setFormError('Please select an apartment flat to assign.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createResident(resForm);
      if (res.success) {
        showToast({
          type: 'success',
          title: 'Resident Added',
          message: `${resForm.name} was successfully registered and assigned to their unit.`,
        });
        setIsAddResidentOpen(false);
        setResForm({
          name: '',
          email: '',
          phone: '',
          flatId: vacantFlats[0]?.id || '',
          occupancyType: 'OWNER',
          password: 'password123',
        });
        await fetchData();
      } else {
        setFormError(res.message || 'Failed to add resident');
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to add resident');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveResident = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove resident ${name}? Their assigned unit will become vacant.`)) {
      return;
    }
    try {
      const res = await api.deleteResident(id);
      if (res.success) {
        showToast({
          type: 'info',
          title: 'Resident Removed',
          message: `${name} has been removed from the society roster.`,
        });
        await fetchData();
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to remove resident',
      });
    }
  };

  const handleAddGuard = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!guardForm.name.trim() || !guardForm.email.trim() || !guardForm.phone.trim()) {
      setFormError('Please fill in all required guard details.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createGuard(guardForm);
      if (res.success) {
        showToast({
          type: 'success',
          title: 'Security Guard Added',
          message: `${guardForm.name} assigned to ${guardForm.gateName}.`,
        });
        setIsAddGuardOpen(false);
        setGuardForm({
          name: '',
          email: '',
          phone: '',
          gateName: 'Main Security Gate',
          shift: 'Day Shift (08:00 - 20:00)',
          password: 'password123',
        });
        await fetchData();
      } else {
        setFormError(res.message || 'Failed to add security guard');
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to add security guard');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveGuard = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove security guard ${name}?`)) {
      return;
    }
    try {
      const res = await api.deleteGuard(id);
      if (res.success) {
        showToast({
          type: 'info',
          title: 'Guard Removed',
          message: `${name} removed from security duty roster.`,
        });
        await fetchData();
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to remove guard',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Society Staff & Residents Directory</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Only the Estate Administrator has permission to onboard residents and assign security personnel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'RESIDENTS' ? (
            <button
              onClick={() => {
                setFormError(null);
                setIsAddResidentOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-primary text-background font-bold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add Resident
            </button>
          ) : (
            <button
              onClick={() => {
                setFormError(null);
                setIsAddGuardOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-primary text-background font-bold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity"
            >
              <Shield className="w-4 h-4" />
              Add Security Guard
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-surface rounded-panel border border-border">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Total Units</p>
          <p className="text-2xl font-black text-text-primary mt-1">{flats.length}</p>
          <p className="text-[10px] text-text-secondary mt-0.5 font-mono">{vacantFlats.length} vacant in inventory</p>
        </div>
        <div className="p-4 bg-surface rounded-panel border border-border">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Registered Residents</p>
          <p className="text-2xl font-black text-primary mt-1">{residents.length}</p>
          <p className="text-[10px] text-text-secondary mt-0.5 font-mono">{occupiedFlats.length} units occupied</p>
        </div>
        <div className="p-4 bg-surface rounded-panel border border-border">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Security Guards</p>
          <p className="text-2xl font-black text-amber-500 mt-1">{guards.length}</p>
          <p className="text-[10px] text-text-secondary mt-0.5 font-mono">24/7 Gate Surveillance</p>
        </div>
        <div className="p-4 bg-surface rounded-panel border border-border">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Occupancy Rate</p>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            {flats.length > 0 ? Math.round((occupiedFlats.length / flats.length) * 100) : 0}%
          </p>
          <p className="text-[10px] text-text-secondary mt-0.5 font-mono">Community capacity</p>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('RESIDENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'RESIDENTS'
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <Users className="w-4 h-4" />
            Residents Directory ({residents.length})
          </button>
          <button
            onClick={() => setActiveTab('GUARDS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'GUARDS'
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <Shield className="w-4 h-4" />
            Security Guards ({guards.length})
          </button>
        </div>

        <div className="p-2 bg-surface rounded-xl border border-border flex items-center gap-2 max-w-sm w-full">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === 'RESIDENTS' ? 'Search resident name, flat or email...' : 'Search guard name or gate...'}
            className="w-full bg-transparent border-none outline-none text-xs text-text-primary placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-surface rounded-panel border border-border p-5 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-text-muted">Loading directory roster...</div>
        ) : activeTab === 'RESIDENTS' ? (
          filteredResidents.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-text-primary">No Residents Found</p>
              <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
                No residents have been onboarded yet. Click "Add Resident" above to register a homeowner or tenant and assign their apartment flat.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    <th className="py-3 px-3">Resident</th>
                    <th className="py-3 px-3">Assigned Unit</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Occupancy</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredResidents.map((r) => (
                    <tr key={r.id} className="hover:bg-card/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={r.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={r.name}
                            className="w-8 h-8 rounded-full border border-border object-cover"
                          />
                          <div>
                            <p className="font-semibold text-text-primary">{r.name}</p>
                            <p className="text-[10px] text-text-muted">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                          {r.flat?.flatNumber || 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-text-secondary font-mono">{r.phone}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-card text-text-secondary border border-border text-[10px] font-semibold">
                          {r.residentProfile?.occupancyType || 'OWNER'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => handleRemoveResident(r.id, r.name)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Remove resident"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredGuards.length === 0 ? (
            <div className="py-12 text-center">
              <Shield className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-text-primary">No Security Guards Found</p>
              <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
                No security personnel have been assigned yet. Click "Add Security Guard" above to register a guard for gate duty.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    <th className="py-3 px-3">Security Guard</th>
                    <th className="py-3 px-3">Assigned Gate / Post</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Shift Roster</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredGuards.map((g) => (
                    <tr key={g.id} className="hover:bg-card/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={g.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                            alt={g.name}
                            className="w-8 h-8 rounded-full border border-border object-cover"
                          />
                          <div>
                            <p className="font-semibold text-text-primary">{g.name}</p>
                            <p className="text-[10px] text-text-muted">{g.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-amber-500 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                          {g.gateName || 'Main Security Gate'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-text-secondary font-mono">{g.phone}</td>
                      <td className="py-3.5 px-3 text-text-muted font-sans">{g.shift || 'Day Shift'}</td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => handleRemoveGuard(g.id, g.name)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Remove guard"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Modal: Add Resident */}
      {isAddResidentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-border rounded-panel w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddResidentOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">Onboard New Resident</h3>
                <p className="text-[11px] text-text-secondary">Register homeowner or tenant and assign an apartment unit.</p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleAddResident} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={resForm.name}
                  onChange={(e) => setResForm({ ...resForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Email (Login ID) *</label>
                  <input
                    type="email"
                    required
                    value={resForm.email}
                    onChange={(e) => setResForm({ ...resForm, email: e.target.value })}
                    placeholder="resident@email.com"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={resForm.phone}
                    onChange={(e) => setResForm({ ...resForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Assign Unit (Flat) *</label>
                  <select
                    value={resForm.flatId}
                    onChange={(e) => setResForm({ ...resForm, flatId: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary outline-none"
                  >
                    {vacantFlats.length === 0 ? (
                      <option value="">No Vacant Units in Inventory</option>
                    ) : (
                      vacantFlats.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.flatNumber} ({f.bhkType || 'Unit'})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Occupancy Type</label>
                  <select
                    value={resForm.occupancyType}
                    onChange={(e) => setResForm({ ...resForm, occupancyType: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary outline-none"
                  >
                    <option value="OWNER">Homeowner</option>
                    <option value="TENANT">Tenant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Initial Password</label>
                <input
                  type="text"
                  value={resForm.password}
                  onChange={(e) => setResForm({ ...resForm, password: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary font-mono focus:border-primary outline-none"
                />
                <p className="text-[10px] text-text-muted mt-1">Resident can change their password anytime after sign in.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddResidentOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs text-text-secondary hover:text-text-primary font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || vacantFlats.length === 0}
                  className="px-5 py-2 rounded-xl bg-primary text-background font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {submitting ? 'Registering...' : 'Add Resident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Security Guard */}
      {isAddGuardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-border rounded-panel w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddGuardOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">Add Security Guard</h3>
                <p className="text-[11px] text-text-secondary">Register gate security personnel for visitor verification and deliveries.</p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleAddGuard} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Guard Full Name *</label>
                <input
                  type="text"
                  required
                  value={guardForm.name}
                  onChange={(e) => setGuardForm({ ...guardForm, name: e.target.value })}
                  placeholder="e.g. Vikram Singh"
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Email (Login ID) *</label>
                  <input
                    type="email"
                    required
                    value={guardForm.email}
                    onChange={(e) => setGuardForm({ ...guardForm, email: e.target.value })}
                    placeholder="guard@society.com"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={guardForm.phone}
                    onChange={(e) => setGuardForm({ ...guardForm, phone: e.target.value })}
                    placeholder="+91 98111 22334"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Assigned Gate Post *</label>
                  <input
                    type="text"
                    required
                    value={guardForm.gateName}
                    onChange={(e) => setGuardForm({ ...guardForm, gateName: e.target.value })}
                    placeholder="e.g. Main Gate, Tower A Entry"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Shift Schedule</label>
                  <select
                    value={guardForm.shift}
                    onChange={(e) => setGuardForm({ ...guardForm, shift: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary outline-none"
                  >
                    <option value="Day Shift (08:00 - 20:00)">Day Shift (08:00 - 20:00)</option>
                    <option value="Night Shift (20:00 - 08:00)">Night Shift (20:00 - 08:00)</option>
                    <option value="24/7 Rotational Roster">24/7 Rotational Roster</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Initial Password</label>
                <input
                  type="text"
                  value={guardForm.password}
                  onChange={(e) => setGuardForm({ ...guardForm, password: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary font-mono focus:border-primary outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGuardOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs text-text-secondary hover:text-text-primary font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-primary text-background font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {submitting ? 'Registering...' : 'Add Guard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminResidents;
