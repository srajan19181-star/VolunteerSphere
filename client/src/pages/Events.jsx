import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Clock, Users, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import L from 'leaflet';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import { fadeInUp, staggerContainer } from '../utils/animations';
import { EventsGridSkeleton } from '../components/skeletons/index';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { formatDate, getCategoryStyle, truncate, ALL_CATEGORIES } from '../utils/helpers';

const EventCard = ({ event, onRegister, isRegistered }) => {
  const catStyle = getCategoryStyle(event.category);
  const pct = Math.min((event.registeredCount / event.maxVolunteers) * 100, 100);
  const isFull = event.registeredCount >= event.maxVolunteers;
  const { isAuthenticated } = useAuth();

  return (
    <motion.div variants={fadeInUp}>
      <Card tilt hover className="h-full flex flex-col space-y-4">
        <Badge category={event.category}>{event.category}</Badge>
        <h3 className="text-base font-semibold text-white font-display leading-snug">{event.title}</h3>
        <p className="text-white/50 text-xs font-body leading-relaxed flex-1">
          {truncate(event.description, 100)}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-white/40 font-body">
            <MapPin size={11} className="text-accent-cyan" /> {event.location || '—'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/40 font-body">
            <Calendar size={11} className="text-accent-purple" /> {formatDate(event.date)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/40 font-body">
            <Clock size={11} className="text-accent-green" /> {event.startTime} – {event.endTime} ({event.hoursAwarded}h)
          </div>
        </div>

        {/* Slots progress */}
        <div>
          <div className="flex justify-between text-xs text-white/40 font-body mb-1.5">
            <span><Users size={10} className="inline mr-1" />{event.registeredCount}/{event.maxVolunteers} slots</span>
            <span className={isFull ? 'text-red-400' : 'text-accent-green'}>{isFull ? 'Full' : `${event.maxVolunteers - event.registeredCount} left`}</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-gradient-to-r from-accent-purple to-accent-cyan'}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        </div>

        {/* Action button */}
        {!isAuthenticated ? (
          <div className="relative group">
            <Button variant="glass" fullWidth disabled id={`event-register-${event._id}`}>Register</Button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-secondary/95 border border-white/10 rounded-lg text-xs text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Login to register
            </div>
          </div>
        ) : isRegistered ? (
          <Button variant="outline" fullWidth disabled className="text-accent-green border-accent-green/30">
            ✓ Registered
          </Button>
        ) : (
          <Button
            variant={isFull ? 'glass' : 'primary'}
            fullWidth
            disabled={isFull || event.status === 'completed' || event.status === 'cancelled'}
            onClick={() => onRegister(event._id)}
            id={`event-register-${event._id}`}
          >
            {isFull ? 'Event Full' : event.status === 'completed' ? 'Completed' : 'Register →'}
          </Button>
        )}
      </Card>
    </motion.div>
  );
};

// Interactive EventMap Component
const EventMap = ({ events }) => {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markersRef = React.useRef([]);

  // Local lookup for common coords
  const cityCoords = {
    mumbai: [19.0760, 72.8777],
    delhi: [28.7041, 77.1025],
    pune: [18.5204, 73.8567],
    bangalore: [12.9716, 77.5946],
    bengaluru: [12.9716, 77.5946],
    chennai: [13.0827, 80.2707],
    kolkata: [22.5726, 88.3639],
    hyderabad: [17.3850, 78.4867],
  };

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // Center on India
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CartoDB'
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #7C3AED; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 10px #06B6D4;"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const bounds = [];

    const addMarker = (coords, title, category, date, loc) => {
      const popupContent = `
        <div style="color: black; font-family: sans-serif; font-size: 12px; min-width: 160px; padding: 2px;">
          <h4 style="margin: 0 0 6px 0; color: #7C3AED; font-weight: bold; font-size: 13px;">${title}</h4>
          <p style="margin: 0 0 4px 0; font-size: 11px;"><b>Category:</b> ${category}</p>
          <p style="margin: 0 0 4px 0; font-size: 11px;"><b>Date:</b> ${new Date(date).toLocaleDateString('en-IN')}</p>
          <p style="margin: 0 0 0 0; color: #666; font-size: 11px;">📍 ${loc}</p>
        </div>
      `;
      const marker = L.marker(coords, { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(mapInstanceRef.current);
      markersRef.current.push(marker);
      bounds.push(coords);
    };

    const plotAll = async () => {
      for (const event of events) {
        if (!event.location) continue;
        const normalized = event.location.toLowerCase();
        
        let coords = null;
        for (const city of Object.keys(cityCoords)) {
          if (normalized.includes(city)) {
            coords = cityCoords[city];
            break;
          }
        }

        if (coords) {
          addMarker(coords, event.title, event.category, event.date, event.location);
        } else {
          // Attempt geocoding on the fly using free OSM Nominatim API
          try {
            const cleanLoc = event.location.split(',')[0].trim();
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanLoc)}`);
            const data = await res.json();
            if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lon = parseFloat(data[0].lon);
              addMarker([lat, lon], event.title, event.category, event.date, event.location);
              if (mapInstanceRef.current && bounds.length > 0) {
                mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
              }
            }
          } catch (e) {
            console.error('Geocoding failed for: ', event.location, e);
          }
        }
      }

      if (mapInstanceRef.current && bounds.length > 0) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [35, 35], maxZoom: 12 });
      }
    };

    plotAll();
  }, [events]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '350px', borderRadius: '16px', overflow: 'hidden' }} className="border border-white/10 shadow-2xl" />
  );
};

const Events = () => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  
  // Basic & Advanced Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showMapView, setShowMapView] = useState(false); // Mobile toggle map

  // Group Registration Modal States
  const [registeringEvent, setRegisteringEvent] = useState(null);
  const [registrationType, setRegistrationType] = useState('individual');
  const [teamSize, setTeamSize] = useState(1);
  const [regNotes, setRegNotes] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const LIMIT = 6; // Reduced to fit layout cleanly

  // Dynamically load Leaflet stylesheet
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventService.getAll({ 
        page, 
        limit: LIMIT, 
        search, 
        category: category || undefined,
        location: locationFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      setEvents(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [page, category, locationFilter, startDate, endDate]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(fetchEvents, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load user's registrations
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    import('../services/volunteerService').then(({ volunteerService }) => {
      volunteerService.getEvents(user.id).then((res) => {
        const ids = new Set(res.data.data?.map((r) => r.event?._id).filter(Boolean));
        setRegisteredIds(ids);
      }).catch(() => {});
    });
  }, [isAuthenticated, user?.id]);

  const handleOpenRegister = (eventId) => {
    const targetEvent = events.find(e => e._id === eventId);
    setRegisteringEvent(targetEvent);
    setRegistrationType('individual');
    setTeamSize(1);
    setRegNotes('');
  };

  const handleRegisterConfirm = async () => {
    if (!registeringEvent) return;
    setRegLoading(true);
    try {
      await eventService.register(registeringEvent._id, {
        registrationType,
        teamSize: registrationType === 'group' ? teamSize : 1,
        notes: regNotes
      });
      setRegisteredIds((prev) => new Set([...prev, registeringEvent._id]));
      setEvents((prev) => prev.map((e) => e._id === registeringEvent._id ? { ...e, registeredCount: e.registeredCount + (registrationType === 'group' ? parseInt(teamSize) : 1) } : e));
      toast.success('Successfully registered for event!');
      setRegisteringEvent(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const maxTeamSize = registeringEvent ? registeringEvent.maxVolunteers - registeringEvent.registeredCount : 1;

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Header */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
            Browse <span className="gradient-text">Events</span>
          </h1>
          <p className="text-white/50 font-body">Discover volunteer opportunities in your community</p>
        </motion.div>

        {/* Search & Toggle Filters */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search by keywords or description..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full input-glass pl-10 pr-4 py-3 text-sm"
                id="events-search"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 border transition-all ${
                  showFilters 
                    ? 'bg-accent-purple/20 border-accent-purple text-white' 
                    : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                }`}
                id="toggle-filters-btn"
              >
                <Filter size={15} /> Filters
              </button>
              <button
                onClick={() => setShowMapView(!showMapView)}
                className="lg:hidden px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 hover:border-white/20"
                id="toggle-map-btn"
              >
                📍 {showMapView ? 'Show List' : 'Show Map'}
              </button>
            </div>
          </div>

          {/* Advanced Filters Expandable Drawer */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase font-body">Location (City/State)</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={locationFilter}
                    onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
                    className="w-full input-glass px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase font-body">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                    className="w-full input-glass px-4 py-2 text-sm text-white/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase font-body">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                    className="w-full input-glass px-4 py-2 text-sm text-white/60"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => { setCategory(''); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-body border transition-all ${!category ? 'bg-accent-purple border-accent-purple text-white' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'}`}
              id="filter-all"
            >
              All Categories
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat === category ? '' : cat); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-body border transition-all ${category === cat ? 'bg-accent-purple border-accent-purple text-white' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'}`}
                id={`filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Layout: Split Grid / Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Events List (Grid) */}
          <div className={`lg:col-span-7 ${showMapView ? 'hidden' : 'block'} lg:block`}>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="skeleton" exit={{ opacity: 0 }}>
                  <EventsGridSkeleton />
                </motion.div>
              ) : events.length === 0 ? (
                <motion.div key="empty" variants={fadeInUp} initial="initial" animate="animate" className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-xl font-display font-semibold text-white mb-2">No events found</h3>
                  <p className="text-white/40 font-body">Try adjusting your search terms or filters</p>
                </motion.div>
              ) : (
                <motion.div key="grid" variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      onRegister={handleOpenRegister}
                      isRegistered={registeredIds.has(event._id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white disabled:opacity-30 transition-all" id="events-prev-page">
                  <ChevronLeft size={18} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-mono transition-all ${page === i + 1 ? 'bg-accent-purple text-white' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'}`}
                    id={`events-page-${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white disabled:opacity-30 transition-all" id="events-next-page">
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            <p className="text-center text-white/30 text-sm font-body mt-4">
              Showing {events.length} of {total} events
            </p>
          </div>

          {/* Right Panel: Interactive Leaflet Map */}
          <div className={`lg:col-span-5 ${showMapView ? 'block' : 'hidden'} lg:block lg:sticky lg:top-24`}>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-white text-sm">Opportunities Map</h3>
                <span className="text-xs text-white/40 font-mono">📍 Plotting {events.length} results</span>
              </div>
              <div style={{ height: '500px' }}>
                <EventMap events={events} />
              </div>
            </div>
          </div>
        </div>

      </div>
      
      {/* Registration Modal for Groups / Individuals */}
      <Modal isOpen={!!registeringEvent} onClose={() => setRegisteringEvent(null)} title={`Register for: ${registeringEvent?.title}`}>
        <div className="p-6 space-y-4 font-body">
          <p className="text-sm text-white/60">
            Join this volunteering opportunity. You can sign up as an individual or bring a team/group!
          </p>

          <div>
            <label className="block text-xs font-semibold text-white/40 mb-2 uppercase">Registration Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRegistrationType('individual')}
                className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                  registrationType === 'individual'
                    ? 'bg-accent-purple/20 border-accent-purple text-white'
                    : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                }`}
              >
                👤 Individual
              </button>
              <button
                type="button"
                onClick={() => setRegistrationType('group')}
                className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                  registrationType === 'group'
                    ? 'bg-accent-purple/20 border-accent-purple text-white'
                    : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                }`}
              >
                👥 Group / Team
              </button>
            </div>
          </div>

          {registrationType === 'group' && (
            <div>
              <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase">Team Size (Max {maxTeamSize} remaining)</label>
              <input
                type="number"
                min={2}
                max={maxTeamSize}
                value={teamSize}
                onChange={(e) => setTeamSize(Math.max(2, Math.min(maxTeamSize, parseInt(e.target.value) || 2)))}
                className="w-full input-glass px-4 py-2.5 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase">Volunteer Notes (Optional)</label>
            <textarea
              rows={3}
              placeholder="Any comments, dietary needs, or team details..."
              value={regNotes}
              onChange={(e) => setRegNotes(e.target.value)}
              className="w-full input-glass px-4 py-2.5 text-sm resize-none"
            />
          </div>

          <Button
            variant="primary"
            fullWidth
            loading={regLoading}
            onClick={handleRegisterConfirm}
            id="register-confirm-btn"
          >
            Confirm Registration
          </Button>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default Events;
