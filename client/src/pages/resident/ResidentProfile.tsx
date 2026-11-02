import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  User,
  Phone,
  Mail,
  Home,
  Users,
  Car,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  Shield,
  Key,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';

export const ResidentProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotification();
  const { theme, setTheme } = useTheme();

  // Family modal
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [familyRelation, setFamilyRelation] = useState('Spouse');
  const [familyPhone, setFamilyPhone] = useState('');
  const [familyAge, setFamilyAge] = useState('');

  // Vehicle modal
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehType, setVehType] = useState<'FOUR_WHEELER' | 'TWO_WHEELER' | 'EV'>('FOUR_WHEELER');
  const [vehNumber, setVehNumber] = useState('');
  const [vehSlot, setVehSlot] = useState('');
  const [vehModel, setVehModel] = useState('');

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleAddFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addFamilyMember({
        name: familyName,
        relation: familyRelation,
        phone: familyPhone,
        age: familyAge ? Number(familyAge) : undefined,
      });
      if (res.success) {
        showToast({ type: 'success', title: 'Added', message: 'Family member registered' });
        setShowFamilyModal(false);
        setFamilyName('');
        setFamilyPhone('');
        setFamilyAge('');
        refreshUser();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleDeleteFamily = async (id: string) => {
    if (!window.confirm('Remove family member?')) return;
    try {
      await api.deleteFamilyMember(id);
      showToast({ type: 'info', title: 'Removed', message: 'Family member removed' });
      refreshUser();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addVehicle({
        vehicleType: vehType,
        vehicleNumber: vehNumber,
        parkingSlot: vehSlot,
        makeModel: vehModel,
      });
      if (res.success) {
        showToast({ type: 'success', title: 'Registered', message: 'Vehicle RFID pass issued' });
        setShowVehicleModal(false);
        setVehNumber('');
        setVehSlot('');
        setVehModel('');
        refreshUser();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm('Unregister vehicle?')) return;
    try {
      await api.deleteVehicle(id);
      showToast({ type: 'info', title: 'Removed', message: 'Vehicle pass revoked' });
      refreshUser();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      if (res.success) {
        showToast({ type: 'success', title: 'Updated', message: 'Password updated successfully' });
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Resident Profile & Unit Settings</h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Manage flat ownership details, registered family members, and RFID vehicle gate passes
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-panel border border-border p-6 shadow-card flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
          alt={user?.name || 'Resident'}
          className="w-24 h-24 rounded-2xl border-2 border-primary object-cover shadow-orange-glow"
        />
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h3 className="text-xl font-extrabold text-white">{user?.name}</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold border border-primary/30 w-fit mx-auto sm:mx-0">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-text-secondary flex items-center justify-center sm:justify-start gap-1">
            <Home className="w-3.5 h-3.5 text-primary" />
            <span>Unit {user?.flat?.flatNumber || 'A-402'} • Tower A Aster • 3 BHK (1,550 sq.ft)</span>
          </p>
          <p className="text-xs text-text-muted flex items-center justify-center sm:justify-start gap-4 pt-1">
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user?.email}</span>
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {user?.phone}</span>
          </p>
        </div>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-semibold hover:border-primary/40 text-text-secondary hover:text-white transition flex items-center gap-1.5 self-center"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Change Password</span>
        </button>
      </div>

      {/* 2-Column: Family Members & Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registered Family Members */}
        <div className="bg-card rounded-panel border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>Family Members</span>
              </h3>
              <p className="text-[11px] text-text-muted">Permitted automatic gate entry</p>
            </div>
            <button
              onClick={() => setShowFamilyModal(true)}
              className="p-1.5 rounded-lg bg-surface border border-border hover:border-primary text-text-primary transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {(user?.familyMembers || []).length === 0 ? (
              <p className="text-xs text-text-muted italic py-3">No family members registered.</p>
            ) : (
              user?.familyMembers?.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-text-primary">{m.name}</p>
                    <p className="text-[11px] text-text-muted">
                      {m.relation} {m.age ? `• ${m.age} yrs` : ''} {m.phone ? `• ${m.phone}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteFamily(m.id)}
                    className="text-text-muted hover:text-status-danger p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Registered Vehicles & Parking */}
        <div className="bg-card rounded-panel border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4 text-primary" />
                <span>Vehicles & RFID Tags</span>
              </h3>
              <p className="text-[11px] text-text-muted">Boom barrier ANPR clearance</p>
            </div>
            <button
              onClick={() => setShowVehicleModal(true)}
              className="p-1.5 rounded-lg bg-surface border border-border hover:border-primary text-text-primary transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {(user?.vehicles || []).length === 0 ? (
              <p className="text-xs text-text-muted italic py-3">No vehicles registered.</p>
            ) : (
              user?.vehicles?.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold font-mono text-primary">{v.vehicleNumber}</p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-card text-text-muted border border-border font-mono">
                        Slot: {v.parkingSlot}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">{v.makeModel || v.vehicleType}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteVehicle(v.id)}
                    className="text-text-muted hover:text-status-danger p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>


      {/* Interface Theme & Display Settings */}
      <div className="bg-card rounded-panel border border-border p-6 shadow-card space-y-4">
        <div>
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Display Theme & Interface Mode
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Toggle between signature dark mode and crisp daylight light mode across all resident views.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
              theme === 'dark'
                ? 'bg-primary/10 border-primary shadow-orange-glow'
                : 'bg-surface border-border hover:border-border-light'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-700 text-amber-400">
              <Moon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary text-sm">Signature Dark UI</span>
                {theme === 'dark' && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-1">
                Subtle dark backdrop (#050B10) with orange accents for comfortable night viewing.
              </p>
            </div>
          </div>

          <div
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
              theme === 'light'
                ? 'bg-primary/10 border-primary shadow-orange-glow'
                : 'bg-surface border-border hover:border-border-light'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
              <Sun className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary text-sm">Crisp Light UI</span>
                {theme === 'light' && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-1">
                Bright white theme (#F8FAFC) engineered for high clarity in sunlit spaces.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Family Modal */}
      <Modal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
        title="Register Family Member"
        subtitle="Authorize gate entry and access for family resident"
      >
        <form onSubmit={handleAddFamily} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Full Name</label>
            <input
              type="text"
              required
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g. Ananya Sharma"
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Relationship</label>
              <select
                value={familyRelation}
                onChange={(e) => setFamilyRelation(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="Spouse">Spouse</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Age (Optional)</label>
              <input
                type="number"
                value={familyAge}
                onChange={(e) => setFamilyAge(e.target.value)}
                placeholder="30"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Phone Number</label>
            <input
              type="tel"
              value={familyPhone}
              onChange={(e) => setFamilyPhone(e.target.value)}
              placeholder="+91 98765 00000"
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowFamilyModal(false)}
              className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
            >
              Save Member
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        title="Register Vehicle & Parking Slot"
        subtitle="Generates smart RFID tag for automatic gate clearance"
      >
        <form onSubmit={handleAddVehicle} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Vehicle Type</label>
              <select
                value={vehType}
                onChange={(e) => setVehType(e.target.value as any)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="FOUR_WHEELER">Car (4-Wheeler)</option>
                <option value="TWO_WHEELER">Bike / Scooter</option>
                <option value="EV">Electric Vehicle (EV)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Registration Plate</label>
              <input
                type="text"
                required
                value={vehNumber}
                onChange={(e) => setVehNumber(e.target.value.toUpperCase())}
                placeholder="KA 01 MJ 4022"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary uppercase focus:border-primary focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Assigned Slot</label>
              <input
                type="text"
                required
                value={vehSlot}
                onChange={(e) => setVehSlot(e.target.value.toUpperCase())}
                placeholder="P-402 or EV-12"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary uppercase focus:border-primary focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Make & Model</label>
              <input
                type="text"
                value={vehModel}
                onChange={(e) => setVehModel(e.target.value)}
                placeholder="e.g. Honda City (White)"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowVehicleModal(false)}
              className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
            >
              Issue Vehicle Pass
            </button>
          </div>
        </form>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Update Account Password"
        subtitle="Ensure password is at least 6 characters"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
            >
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

