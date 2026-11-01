import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Home, Car } from 'lucide-react';
import api from '../../services/api';

export const AdminResidents: React.FC = () => {
  const [residents, setResidents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getResidents()
      .then((res) => {
        if (res.success) setResidents(res.residents || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = residents.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.flat?.flatNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Residents Directory</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Registered homeowners, tenants, authorized family members, and assigned parking slots
          </p>
        </div>

        <div className="p-2.5 bg-surface rounded-xl border border-border flex items-center gap-2 max-w-sm w-full">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resident name, flat or email..."
            className="w-full bg-transparent border-none outline-none text-xs text-text-primary placeholder:text-text-muted"
          />
        </div>
      </div>

      <div className="bg-card rounded-panel border border-border p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th className="py-2.5 px-3">Resident</th>
                <th className="py-2.5 px-3">Unit / Tower</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Occupancy</th>
                <th className="py-2.5 px-3">Family</th>
                <th className="py-2.5 px-3 text-right">Vehicles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-surface/50">
                  <td className="py-3 px-3">
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
                  <td className="py-3 px-3 font-bold text-primary">
                    Flat {r.flat?.flatNumber || 'Unassigned'}
                  </td>
                  <td className="py-3 px-3 text-text-secondary font-mono">{r.phone}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-surface text-text-secondary border border-border text-[10px] font-semibold">
                      {r.residentProfile?.occupancyType || 'OWNER'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-text-muted">
                    {(r.familyMembers || []).length} registered
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-text-primary">
                    {(r.vehicles || []).length} passes
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

