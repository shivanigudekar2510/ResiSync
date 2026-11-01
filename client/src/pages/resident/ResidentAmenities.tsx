import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Sparkles,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Info,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import api from '../../services/api';
import { Amenity, AmenityBooking } from '../../types';

export const ResidentAmenities: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'all' | 'my-bookings'>('all');
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [myBookings, setMyBookings] = useState<AmenityBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState<string>('07:00');
  const [endTime, setEndTime] = useState<string>('08:00');
  const [guestsCount, setGuestsCount] = useState<number>(1);
  const [isBooking, setIsBooking] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [amenRes, bookRes] = await Promise.all([
        api.getAmenities(),
        api.getMyBookings(),
      ]);
      if (amenRes.success) setAmenities(amenRes.amenities || []);
      if (bookRes.success) setMyBookings(bookRes.bookings || []);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity) return;
    setIsBooking(true);
    setConflictError(null);

    try {
      const res = await api.bookAmenity({
        amenityId: selectedAmenity.id,
        bookingDate,
        startTime,
        endTime,
        guestsCount: Number(guestsCount),
      });

      if (res.success) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FF8A00', '#10B981'],
        });

        showToast({
          type: 'success',
          title: 'Reservation Confirmed',
          message: res.message,
        });

        setSelectedAmenity(null);
        fetchData();
        setActiveTab('my-bookings');
      }
    } catch (err: any) {
      setConflictError(err.message || 'Failed to reserve amenity slot');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      const res = await api.cancelBooking(id);
      showToast({ type: 'info', title: 'Booking Cancelled', message: res.message });
      fetchData();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Amenities Marketplace</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Reserve community facilities, manage slot bookings, and view capacity limits
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'all'
                ? 'bg-primary text-background shadow-sm'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            All Amenities ({amenities.length})
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'my-bookings'
                ? 'bg-primary text-background shadow-sm'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            My Reservations ({myBookings.filter((b) => b.status === 'CONFIRMED').length})
          </button>
        </div>
      </div>

      {/* Content based on Tab */}
      {activeTab === 'all' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((amenity) => (
            <div
              key={amenity.id}
              className="bg-card hover:bg-card-hover border border-border hover:border-primary/40 rounded-panel overflow-hidden transition-all duration-200 shadow-card flex flex-col group"
            >
              {/* Amenity Image Banner */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={amenity.imageUrl}
                  alt={amenity.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />
                <div className="absolute top-3 right-3">
                  <StatusBadge status={amenity.status} size="sm" />
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-md uppercase tracking-wider">
                    {amenity.category}
                  </span>
                </div>
              </div>

              {/* Amenity Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-text-primary group-hover:text-primary transition">
                    {amenity.name}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                    {amenity.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/60 text-xs">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{amenity.openTime} - {amenity.closeTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>Max {amenity.capacity} persons</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase">Resident Fee</span>
                    <p className="text-xs font-bold text-text-primary">
                      {amenity.pricing === 0 ? (
                        <span className="text-status-success">Free for Residents</span>
                      ) : (
                        `₹${amenity.pricing.toLocaleString('en-IN')} / slot`
                      )}
                    </p>
                  </div>

                  <button
                    disabled={amenity.status === 'MAINTENANCE'}
                    onClick={() => {
                      setSelectedAmenity(amenity);
                      setConflictError(null);
                    }}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
                      amenity.status === 'MAINTENANCE'
                        ? 'bg-surface text-text-muted cursor-not-allowed border border-border'
                        : 'bg-primary text-background hover:bg-primary-hover shadow-orange-glow'
                    }`}
                  >
                    {amenity.status === 'MAINTENANCE' ? 'In Maintenance' : 'Book Slot'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* My Bookings Tab */
        <div>
          {myBookings.length === 0 ? (
            <EmptyState
              title="No amenity reservations"
              description="Explore the swimming pool, high-performance gym, celebration hall, and sports courts to reserve your private recreation slots."
              actionText="Browse Amenities"
              onAction={() => setActiveTab('all')}
            />
          ) : (
            <div className="space-y-3">
              {myBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={b.amenity?.imageUrl}
                      alt={b.amenity?.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-text-primary">{b.amenity?.name}</h4>
                        <StatusBadge status={b.status} size="sm" />
                      </div>
                      <p className="text-xs text-text-muted mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> {b.bookingDate} • {b.startTime} - {b.endTime}
                      </p>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        {b.guestsCount} {b.guestsCount === 1 ? 'Guest' : 'Guests'} • Fee: {b.totalFee === 0 ? 'Complimentary' : `₹${b.totalFee}`}
                      </p>
                    </div>
                  </div>

                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="px-3.5 py-1.5 rounded-xl border border-status-danger/40 text-status-danger hover:bg-status-danger/10 text-xs font-semibold self-start sm:self-center transition"
                    >
                      Cancel Slot
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Slot Modal */}
      <Modal
        isOpen={!!selectedAmenity}
        onClose={() => setSelectedAmenity(null)}
        title={`Reserve ${selectedAmenity?.name}`}
        subtitle={`Operating hours: ${selectedAmenity?.openTime} - ${selectedAmenity?.closeTime}`}
      >
        {selectedAmenity && (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            {conflictError && (
              <div className="p-3 rounded-xl bg-status-danger/15 border border-status-danger/40 text-status-danger text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{conflictError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Reservation Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Start Time</label>
                <select
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    const hour = parseInt(e.target.value.split(':')[0], 10);
                    const endH = (hour + 1).toString().padStart(2, '0');
                    setEndTime(`${endH}:00`);
                  }}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                >
                  {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">End Time</label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                >
                  {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Number of Guests (Max {selectedAmenity.capacity})
              </label>
              <input
                type="number"
                min={1}
                max={selectedAmenity.capacity}
                required
                value={guestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            {selectedAmenity.rules && (
              <div className="p-3 rounded-xl bg-surface border border-border text-[11px] text-text-muted">
                <p className="font-semibold text-text-secondary mb-0.5">Facility Bylaws & Guidelines:</p>
                <p>{selectedAmenity.rules}</p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedAmenity(null)}
                className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBooking}
                className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
              >
                {isBooking ? 'Checking Availability...' : 'Confirm Reservation'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

