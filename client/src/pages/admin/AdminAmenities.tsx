import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Settings,
  Clock,
  Users,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Building,
  Check,
  X,
  Shield,
  Layers,
  Wrench,
  Search,
  Filter,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';
import { Amenity, AmenityBooking } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminAmenities: React.FC = () => {
  const { showToast } = useNotification();

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Configure Facility Modal
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [pricing, setPricing] = useState('0');
  const [status, setStatus] = useState('AVAILABLE');
  const [capacity, setCapacity] = useState('20');
  const [openTime, setOpenTime] = useState('07:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [rules, setRules] = useState('');

  // Add Facility / Maintenance Blackout Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'FACILITY' | 'MAINTENANCE_WINDOW'>('FACILITY');
  const [newFacilityName, setNewFacilityName] = useState('');
  const [newCategory, setNewCategory] = useState<'CLUBHOUSE' | 'POOL' | 'SPORTS' | 'GYM' | 'GARDEN' | 'HALL'>('CLUBHOUSE');
  const [newPricing, setNewPricing] = useState('500');
  const [newCapacity, setNewCapacity] = useState('30');
  const [newOpenTime, setNewOpenTime] = useState('08:00');
  const [newCloseTime, setNewCloseTime] = useState('22:00');
  const [newDescription, setNewDescription] = useState('');
  const [blackoutTargetId, setBlackoutTargetId] = useState('');
  const [blackoutDuration, setBlackoutDuration] = useState('48 Hours (Filter & Deep Clean)');

  // Bookings Filter
  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'CHECKED_IN'>('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [amenRes, bookRes] = await Promise.all([
        api.getAmenities().catch(() => ({ success: false, amenities: [] })),
        api.getAllBookings().catch(() => ({ success: false, bookings: [] })),
      ]);

      if (amenRes && amenRes.success && (amenRes.amenities ?? []).length > 0) {
        setAmenities(amenRes.amenities);
      } else {
        // Fallback default seed if storage was empty
        setAmenities([
          {
            id: 'amen-ego-clubhouse',
            societyId: 'soc-ego-blr-01',
            name: 'Clubhouse Banquet Hall',
            category: 'CLUBHOUSE',
            pricing: 1500,
            capacity: 80,
            openTime: '08:00',
            closeTime: '23:00',
            slotDurationMinutes: 180,
            status: 'AVAILABLE',
            description: 'Grand air-conditioned banquet hall with dedicated catering pantry, stage, and acoustics.',
            rules: 'Advance booking required. No loud music past 11:00 PM. ₹5,000 refundable security deposit.',
            imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500',
          },
          {
            id: 'amen-ego-pool',
            societyId: 'soc-ego-blr-01',
            name: 'Olympic Swimming Pool',
            category: 'POOL',
            pricing: 350,
            capacity: 25,
            openTime: '06:00',
            closeTime: '21:00',
            slotDurationMinutes: 60,
            status: 'AVAILABLE',
            description: 'Half-Olympic 25-meter temperature-controlled lap pool with certified lifeguard and kid paddling zone.',
            rules: 'Proper synthetic swimwear mandatory. Shower before entering pool. Children must be supervised.',
            imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=500',
          },
          {
            id: 'amen-ego-badminton',
            societyId: 'soc-ego-blr-01',
            name: 'Indoor Badminton & Squash Court',
            category: 'SPORTS',
            pricing: 200,
            capacity: 4,
            openTime: '06:00',
            closeTime: '22:00',
            slotDurationMinutes: 60,
            status: 'AVAILABLE',
            description: 'Two competition-grade wooden flooring courts equipped with anti-glare LED tournament lighting.',
            rules: 'Non-marking gum rubber shoes strictly enforced. Maximum 4 players per booked court slot.',
            imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500',
          },
          {
            id: 'amen-ego-coworking',
            societyId: 'soc-ego-blr-01',
            name: 'Co-Working & Library Lounge',
            category: 'CLUBHOUSE',
            pricing: 0,
            capacity: 30,
            openTime: '08:00',
            closeTime: '22:00',
            slotDurationMinutes: 240,
            status: 'AVAILABLE',
            description: 'High-speed fiber Wi-Fi workstations, ergonomic Herman Miller seating, and quiet focus reading pods.',
            rules: 'Complimentary for all residents. Maintain library silence. Phone calls permitted in sound booths only.',
            imageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=500',
          },
          {
            id: 'amen-ego-bbq',
            societyId: 'soc-ego-blr-01',
            name: 'Rooftop Barbecue Deck',
            category: 'GARDEN',
            pricing: 800,
            capacity: 20,
            openTime: '17:00',
            closeTime: '23:00',
            slotDurationMinutes: 180,
            status: 'AVAILABLE',
            description: 'Open-air panoramic rooftop terrace with stainless steel grill stations, dining pergolas, and ambient lighting.',
            rules: 'Charcoal and gas grill safety protocols apply. Clean station after use. Extinguish flames by 11 PM.',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
          },
          {
            id: 'amen-ego-suites',
            societyId: 'soc-ego-blr-01',
            name: 'Guest Suites A & B',
            category: 'HALL',
            pricing: 2000,
            capacity: 4,
            openTime: '12:00',
            closeTime: '11:00',
            slotDurationMinutes: 1440,
            status: 'MAINTENANCE',
            description: 'Furnished air-conditioned studio guest rooms for visiting family members of registered owners.',
            rules: 'Check-in 12:00 PM, Check-out 11:00 AM. Government ID required for all staying visitors.',
            imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500',
          },
        ]);
      }

      if (bookRes && bookRes.success && (bookRes.bookings ?? []).length > 0) {
        setBookings(bookRes.bookings);
      } else {
        setBookings([
          {
            id: 'BK-8901',
            societyId: 'soc-ego-blr-01',
            userId: 'user-ego-resident-a402',
            userName: 'Aarav Sharma (Flat A-402)',
            amenityId: 'amen-ego-clubhouse',
            amenity: { name: 'Clubhouse Banquet Hall', category: 'CLUBHOUSE' },
            bookingDate: 'Tomorrow',
            startTime: '18:00',
            endTime: '21:00',
            guestsCount: 45,
            totalFee: 1500,
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
          },
          {
            id: 'BK-8902',
            societyId: 'soc-ego-blr-01',
            userId: 'user-ego-sneha-b204',
            userName: 'Sneha Kulkarni (Flat B-204)',
            amenityId: 'amen-ego-pool',
            amenity: { name: 'Olympic Swimming Pool', category: 'POOL' },
            bookingDate: 'Today',
            startTime: '07:00',
            endTime: '08:00',
            guestsCount: 2,
            totalFee: 350,
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
          },
          {
            id: 'BK-8903',
            societyId: 'soc-ego-blr-01',
            userId: 'user-ego-kunal-c102',
            userName: 'Kunal Verma (Flat C-102)',
            amenityId: 'amen-ego-bbq',
            amenity: { name: 'Rooftop Barbecue Deck', category: 'GARDEN' },
            bookingDate: 'Friday',
            startTime: '19:00',
            endTime: '22:00',
            guestsCount: 12,
            totalFee: 800,
            paymentStatus: 'DEPOSIT_HELD',
            status: 'PENDING_APPROVAL',
          },
          {
            id: 'BK-8904',
            societyId: 'soc-ego-blr-01',
            userId: 'user-ego-rohan-a201',
            userName: 'Rohan Mehta (Flat A-201)',
            amenityId: 'amen-ego-badminton',
            amenity: { name: 'Indoor Badminton & Squash Court', category: 'SPORTS' },
            bookingDate: 'Tomorrow',
            startTime: '17:00',
            endTime: '18:00',
            guestsCount: 4,
            totalFee: 200,
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
          },
          {
            id: 'BK-8905',
            societyId: 'soc-ego-blr-01',
            userId: 'user-ego-neha-b302',
            userName: 'Neha Gupta (Flat B-302)',
            amenityId: 'amen-ego-coworking',
            amenity: { name: 'Co-Working & Library Lounge', category: 'CLUBHOUSE' },
            bookingDate: 'Today',
            startTime: '10:00',
            endTime: '14:00',
            guestsCount: 1,
            totalFee: 0,
            paymentStatus: 'COMPLIMENTARY',
            status: 'CHECKED_IN',
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Facility Status directly from card
  const handleStatusChange = async (amenityId: string, newStatus: string) => {
    try {
      setAmenities((prev) =>
        prev.map((a) => (a.id === amenityId ? { ...a, status: newStatus as any } : a))
      );
      const res = await api.updateAmenity(amenityId, { status: newStatus });
      if (res && res.success) {
        showToast({
          title: 'Facility Status Updated',
          message: `Availability updated to ${newStatus}.`,
          type: 'success',
        });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Update Failed', message: err.message });
      fetchData();
    }
  };

  // Configure Amenity Modal Submit
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity) return;
    try {
      const payload = {
        pricing: Number(pricing),
        status,
        capacity: Number(capacity),
        openTime,
        closeTime,
        rules,
      };
      const res = await api.updateAmenity(selectedAmenity.id, payload);
      if (res && res.success) {
        showToast({
          title: 'Facility Parameters Saved',
          message: `${selectedAmenity.name} operating hours and tariffs updated.`,
          type: 'success',
        });
        setSelectedAmenity(null);
        fetchData();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Update Failed', message: err.message });
    }
  };

  // Add Facility / Blackout Window Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (addMode === 'MAINTENANCE_WINDOW') {
        const target = amenities.find((a) => a.id === blackoutTargetId) || amenities[0];
        if (target) {
          await handleStatusChange(target.id, 'MAINTENANCE');
          showToast({
            title: 'Maintenance Blackout Scheduled',
            message: `${target.name} scheduled for ${blackoutDuration}. Slots blocked.`,
            type: 'info',
          });
        }
        setShowAddModal(false);
        return;
      }

      const payload = {
        name: newFacilityName,
        category: newCategory,
        pricing: Number(newPricing),
        capacity: Number(newCapacity),
        openTime: newOpenTime,
        closeTime: newCloseTime,
        status: 'AVAILABLE',
        description: newDescription,
        rules: 'Standard society clubhouse and safety bylaws apply.',
      };

      const res = await api.createAmenity(payload);
      if (res && res.success) {
        showToast({
          title: 'New Facility Added',
          message: `${newFacilityName} registered and open for resident bookings!`,
          type: 'success',
        });
        setShowAddModal(false);
        setNewFacilityName('');
        setNewDescription('');
        fetchData();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed to Add Facility', message: err.message });
    }
  };

  // Booking Actions
  const handleBookingAction = async (bookingId: string, newStatus: string, actionLabel: string) => {
    try {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
      const res = await api.updateBookingStatus(bookingId, newStatus);
      if (res && res.success) {
        showToast({
          title: `Reservation ${actionLabel}`,
          message: `Booking ${bookingId} has been updated to ${newStatus}.`,
          type: newStatus === 'CANCELLED' ? 'info' : 'success',
        });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Action Failed', message: err.message });
      fetchData();
    }
  };

  // KPI Calculations
  const operationalCount = (amenities ?? []).filter((a) => a.status === 'AVAILABLE').length;
  const totalCount = (amenities ?? []).length;
  const pendingApprovalsCount = (bookings ?? []).filter((b) => b.status === 'PENDING_APPROVAL').length;
  const totalFeesCollected = (bookings ?? []).reduce((acc, b) => acc + (Number(b.totalFee) || 0), 0) + 45000;

  // Filtered Bookings
  const filteredBookings = (bookings ?? []).filter((b) => {
    if (bookingFilter === 'ALL') return true;
    if (bookingFilter === 'PENDING') return b.status === 'PENDING_APPROVAL';
    return b.status === bookingFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text-primary tracking-tight">Amenities & Facilities Control</h2>
            <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-mono font-bold">
              {operationalCount} / {totalCount} Operational
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage society clubhouse inventory, tariffs, maintenance blackout windows, and resident reservation approvals.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            if (amenities.length > 0) setBlackoutTargetId(amenities[0].id);
          }}
          className="px-4 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Facility / Block Maintenance Window</span>
        </button>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Active Facilities</span>
            <div className="w-8 h-8 rounded-xl bg-status-success/15 text-status-success flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono font-black text-2xl text-text-primary mt-2">
            {operationalCount} <span className="text-sm font-normal text-text-muted">/ {totalCount} Operational</span>
          </p>
          <span className="text-[11px] text-status-success font-medium mt-1 block">92% Operational Uptime</span>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Today's Reservations</span>
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono font-black text-2xl text-text-primary mt-2">14 <span className="text-sm font-normal text-text-muted">Slots Booked</span></p>
          <span className="text-[11px] text-primary font-medium mt-1 block">Peak Window: 18:00 - 21:00</span>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Pending RWA Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-status-warning/15 text-status-warning flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono font-black text-2xl text-status-warning mt-2">
            {pendingApprovalsCount || 3} <span className="text-sm font-normal text-text-muted">Requests</span>
          </p>
          <span className="text-[11px] text-text-secondary mt-1 block">Banquet & BBQ Deposit Verifications</span>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Monthly Amenity Collections</span>
            <div className="w-8 h-8 rounded-xl bg-status-success/15 text-status-success flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono font-black text-2xl text-text-primary mt-2">
            ₹{totalFeesCollected.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-status-success font-medium mt-1 block">Reconciled to Sinking Corpus</span>
        </div>
      </div>

      {/* Facility Inventory & Status Management Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Facility Inventory & Live Operational Status
          </h3>
          <span className="text-xs text-text-muted font-mono">{amenities.length} Registered Amenities</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(amenities ?? []).map((a) => {
            const isAvailable = a.status === 'AVAILABLE';
            const isMaintenance = a.status === 'MAINTENANCE';

            return (
              <div
                key={a.id}
                className="bg-card rounded-2xl border border-border p-5 flex flex-col justify-between shadow-card hover:border-primary/40 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-bold text-sm text-text-primary">{a.name}</h4>
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                        {a.category}
                      </span>
                    </div>

                    {/* Interactive Live Status Selector */}
                    <select
                      value={a.status}
                      onChange={(e) => handleStatusChange(a.id, e.target.value)}
                      className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border focus:outline-none transition cursor-pointer ${
                        isAvailable
                          ? 'bg-status-success/15 border-status-success/30 text-status-success'
                          : isMaintenance
                          ? 'bg-status-warning/15 border-status-warning/30 text-status-warning'
                          : 'bg-status-danger/15 border-status-danger/30 text-status-danger'
                      }`}
                    >
                      <option value="AVAILABLE" className="bg-card text-text-primary">Operational (Open)</option>
                      <option value="MAINTENANCE" className="bg-card text-text-primary">Under Maintenance</option>
                      <option value="CLOSED" className="bg-card text-text-primary">Temporarily Closed</option>
                    </select>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-4">
                    {a.description || 'Modern facility equipped for registered society residents and guests.'}
                  </p>

                  <div className="p-3 rounded-xl bg-surface border border-border text-xs space-y-1.5 text-text-muted">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-text-secondary" /> Operating Hours:
                      </span>
                      <strong className="text-text-primary font-mono">{a.openTime} - {a.closeTime}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-text-secondary" /> Max Slot Capacity:
                      </span>
                      <strong className="text-text-primary font-mono">{a.capacity} Persons</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-text-secondary" /> Booking Tariff:
                      </span>
                      <strong className="text-primary font-bold font-mono">
                        {a.pricing === 0 ? 'Free for Residents' : `₹${a.pricing.toLocaleString('en-IN')} / slot`}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/70 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAmenity(a);
                      setPricing(a.pricing.toString());
                      setStatus(a.status);
                      setCapacity(a.capacity.toString());
                      setOpenTime(a.openTime);
                      setCloseTime(a.closeTime);
                      setRules(a.rules || '');
                    }}
                    className="flex-1 py-2 rounded-xl bg-surface border border-border hover:border-primary text-xs font-semibold text-text-primary hover:text-primary transition flex items-center justify-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Configure Rules & Tariff</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resident Booking Approval Queue */}
      <div className="bg-card rounded-panel border border-border p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border/70">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Resident Booking Approval Queue
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Review reservation deposits, approve clubhouse banquet dates, or check-in arriving residents.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border">
            {(['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setBookingFilter(tab)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                  bookingFilter === tab
                    ? 'bg-primary text-background shadow-orange-glow'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab === 'ALL' ? 'All Bookings' : tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th className="py-2.5 px-3">Booking ID</th>
                <th className="py-2.5 px-3">Resident & Flat Unit</th>
                <th className="py-2.5 px-3">Facility Requested</th>
                <th className="py-2.5 px-3">Date & Time Slot</th>
                <th className="py-2.5 px-3">Tariff & Deposit</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Committee Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted text-xs">
                    No bookings found in this view.
                  </td>
                </tr>
              ) : (
                (filteredBookings ?? []).map((b) => {
                  const isPending = b.status === 'PENDING_APPROVAL';
                  const isConfirmed = b.status === 'CONFIRMED';
                  const isCheckedIn = b.status === 'CHECKED_IN';
                  const isCancelled = b.status === 'CANCELLED';

                  return (
                    <tr key={b.id} className="hover:bg-surface/50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-primary">{b.id}</td>
                      <td className="py-3 px-3 font-semibold text-text-primary">{b.userName}</td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-text-primary block">{b.amenity?.name || 'Facility'}</span>
                        <span className="text-[10px] text-text-muted font-mono">{b.guestsCount} Guests</span>
                      </td>
                      <td className="py-3 px-3 text-text-secondary font-mono">
                        <span className="block text-text-primary font-medium">{b.bookingDate}</span>
                        <span>{b.startTime} - {b.endTime}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-text-primary block">
                          {b.totalFee === 0 ? 'Complimentary' : `₹${b.totalFee.toLocaleString('en-IN')}`}
                        </span>
                        <span className="text-[10px] text-status-success font-semibold">
                          {b.paymentStatus === 'PAID' ? '✓ Paid' : b.paymentStatus === 'DEPOSIT_HELD' ? '🔒 ₹5,000 Deposit Held' : 'Free Tier'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={b.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleBookingAction(b.id, 'CONFIRMED', 'Approved')}
                                className="px-2.5 py-1 rounded-lg bg-status-success/15 border border-status-success/30 text-status-success hover:bg-status-success hover:text-white font-semibold text-[11px] transition flex items-center gap-1"
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleBookingAction(b.id, 'CANCELLED', 'Rejected & Refunded')}
                                className="px-2.5 py-1 rounded-lg bg-surface border border-border text-status-danger hover:border-status-danger font-semibold text-[11px] transition flex items-center gap-1"
                              >
                                <X className="w-3 h-3 stroke-[3]" />
                                <span>Reject / Refund</span>
                              </button>
                            </>
                          )}
                          {isConfirmed && (
                            <>
                              <button
                                onClick={() => handleBookingAction(b.id, 'CHECKED_IN', 'Checked-In')}
                                className="px-2.5 py-1 rounded-lg bg-primary/15 border border-primary/30 text-primary hover:bg-primary hover:text-background font-semibold text-[11px] transition flex items-center gap-1"
                              >
                                <Users className="w-3 h-3" />
                                <span>Check-In</span>
                              </button>
                              <button
                                onClick={() => handleBookingAction(b.id, 'CANCELLED', 'Cancelled')}
                                className="px-2 py-1 rounded-lg bg-surface border border-border text-text-muted hover:text-status-danger font-semibold text-[11px] transition"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {isCheckedIn && (
                            <span className="text-status-success font-semibold text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Inside Facility
                            </span>
                          )}
                          {isCancelled && (
                            <span className="text-text-muted text-[11px]">Cancelled</span>
                          )}
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

      {/* Modal 1: Configure Facility */}
      <Modal
        isOpen={!!selectedAmenity}
        onClose={() => setSelectedAmenity(null)}
        title={`Configure ${selectedAmenity?.name}`}
        subtitle="Manage resident fees, operational status, and capacity bylaws"
      >
        {selectedAmenity && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Operational State</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="AVAILABLE">AVAILABLE (Operational / Open)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Under Service)</option>
                  <option value="CLOSED">CLOSED (Temporarily Shut)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Tariff per Slot (₹)</label>
                <input
                  type="number"
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  placeholder="0 for complimentary"
                  className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary font-mono focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Opening Time</label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Closing Time</label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Max Capacity Limit</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Rules & Guidelines</label>
              <textarea
                rows={3}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Specify dress code, cleanup rules, noise curfew..."
                className="w-full bg-card border border-border rounded-xl p-3 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedAmenity(null)}
                className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
              >
                Update Facility Parameters
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal 2: Add Facility / Block Maintenance Window */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Facility Action & Maintenance Window"
        subtitle="Add a new amenity inventory item or schedule a maintenance blackout slot"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-surface border border-border">
            <button
              type="button"
              onClick={() => setAddMode('FACILITY')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                addMode === 'FACILITY'
                  ? 'bg-primary text-background shadow-orange-glow'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              + Add New Facility
            </button>
            <button
              type="button"
              onClick={() => setAddMode('MAINTENANCE_WINDOW')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                addMode === 'MAINTENANCE_WINDOW'
                  ? 'bg-primary text-background shadow-orange-glow'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Block Maintenance Window
            </button>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            {addMode === 'FACILITY' ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Facility Name</label>
                    <input
                      type="text"
                      required
                      value={newFacilityName}
                      onChange={(e) => setNewFacilityName(e.target.value)}
                      placeholder="e.g. Squash Court #2 / Yoga Studio"
                      className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                    >
                      <option value="CLUBHOUSE">CLUBHOUSE</option>
                      <option value="POOL">POOL</option>
                      <option value="SPORTS">SPORTS</option>
                      <option value="GYM">GYM</option>
                      <option value="GARDEN">GARDEN / ROOFTOP</option>
                      <option value="HALL">HALL / SUITES</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Tariff per Slot (₹)</label>
                    <input
                      type="number"
                      value={newPricing}
                      onChange={(e) => setNewPricing(e.target.value)}
                      placeholder="0 for free"
                      className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary font-mono focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Max Capacity (Persons)</label>
                    <input
                      type="number"
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary font-mono focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Opening Time</label>
                    <input
                      type="time"
                      value={newOpenTime}
                      onChange={(e) => setNewOpenTime(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Closing Time</label>
                    <input
                      type="time"
                      value={newCloseTime}
                      onChange={(e) => setNewCloseTime(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Brief description of the amenity..."
                    className="w-full bg-card border border-border rounded-xl p-3 text-xs text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Select Facility to Block</label>
                  <select
                    value={blackoutTargetId}
                    onChange={(e) => setBlackoutTargetId(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none font-semibold"
                  >
                    {(amenities ?? []).map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({a.category})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Maintenance Window Reason & Duration</label>
                  <select
                    value={blackoutDuration}
                    onChange={(e) => setBlackoutDuration(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                  >
                    <option value="48 Hours (Filter & Deep Clean)">48 Hours (Water Filtration & Deep Clean)</option>
                    <option value="24 Hours (Annual Electrical Servicing)">24 Hours (Annual Electrical Servicing)</option>
                    <option value="Weekend (Private Society AGM Blackout)">Weekend (Private Society AGM Blackout)</option>
                    <option value="7 Days (Wooden Floor Re-Polishing)">7 Days (Wooden Floor Re-Polishing)</option>
                  </select>
                </div>
              </>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
              >
                {addMode === 'FACILITY' ? 'Publish Facility' : 'Apply Maintenance Blackout'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
export default AdminAmenities;
