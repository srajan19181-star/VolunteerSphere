import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Users, CheckSquare, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventService } from '../../services/eventService';
import { TableSkeleton } from '../../components/skeletons/index';
import { fadeInUp, slideInFromRight } from '../../utils/animations';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { formatDate, ALL_CATEGORIES } from '../../utils/helpers';

const DEFAULT_FORM = {
  title: '', description: '', category: 'Community', location: '',
  date: '', startTime: '09:00', endTime: '17:00', hoursAwarded: 4,
  maxVolunteers: 30, requiredSkills: [],
};

const EventManager = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [attendanceEvent, setAttendanceEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [attendance, setAttendance] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await eventService.getAll({ page, limit: 15 });
      setEvents(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const openCreate = () => { setEditEvent(null); setForm(DEFAULT_FORM); setPanelOpen(true); };
  const openEdit = (evt) => {
    setEditEvent(evt);
    setForm({
      title: evt.title, description: evt.description, category: evt.category,
      location: evt.location, date: evt.date ? evt.date.split('T')[0] : '',
      startTime: evt.startTime, endTime: evt.endTime, hoursAwarded: evt.hoursAwarded,
      maxVolunteers: evt.maxVolunteers, requiredSkills: evt.requiredSkills || [],
    });
    setPanelOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.date) return toast.error('Title and date are required');
    setSaving(true);
    try {
      if (editEvent) {
        const res = await eventService.update(editEvent._id, form);
        setEvents((p) => p.map((e) => e._id === editEvent._id ? res.data.data : e));
        toast.success('Event updated!');
      } else {
        const res = await eventService.create(form);
        setEvents((p) => [res.data.data, ...p]);
        toast.success('Event created!');
      }
      setPanelOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save event'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await eventService.delete(id);
      setEvents((p) => p.filter((e) => e._id !== id));
      toast.success('Event deleted');
    } catch { toast.error('Failed to delete event'); }
  };

  const openAttendance = async (evt) => {
    setAttendanceEvent(evt);
    try {
      const res = await eventService.getRegistrations(evt._id);
      const regs = res.data.data || [];
      setRegistrations(regs);
      const init = {};
      regs.forEach((r) => { init[r.volunteer?._id] = r.attendanceMarked ? r.status === 'attended' : true; });
      setAttendance(init);
    } catch { toast.error('Failed to load registrations'); }
  };

  const handleMarkAttendance = async () => {
    try {
      const attendees = Object.entries(attendance).map(([volunteerId, attended]) => ({ volunteerId, attended }));
      await eventService.markAttendance(attendanceEvent._id, { attendees });
      toast.success('Attendance marked! Hours updated for volunteers.');
      setAttendanceEvent(null);
      load();
    } catch { toast.error('Failed to mark attendance'); }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl relative">
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Event Manager</h1>
          <p className="text-white/40 text-sm font-body">{total} total events</p>
        </div>
        <Button variant="primary" onClick={openCreate} id="create-event-btn">
          <Plus size={16} /> Create Event
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="sk" exit={{ opacity: 0 }}><TableSkeleton rows={10} columns={5} /></motion.div>
        ) : (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Title', 'Category', 'Date', 'Slots', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-white/50 uppercase tracking-wider px-4 py-4 font-body">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {events.map((evt) => (
                    <tr key={evt._id} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-white font-body max-w-[200px] truncate">{evt.title}</p>
                        <p className="text-xs text-white/40 font-body">{evt.location}</p>
                      </td>
                      <td className="px-4 py-3"><Badge category={evt.category} size="xs">{evt.category}</Badge></td>
                      <td className="px-4 py-3"><span className="text-xs text-white/60 font-body">{formatDate(evt.date)}</span></td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-white">{evt.registeredCount}/{evt.maxVolunteers}</span>
                      </td>
                      <td className="px-4 py-3"><Badge status={evt.status} size="xs">{evt.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(evt)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="Edit" id={`evt-edit-${evt._id}`}><Edit2 size={13} /></button>
                          <button onClick={() => openAttendance(evt)} className="p-1.5 rounded-lg text-white/40 hover:text-accent-cyan hover:bg-accent-cyan/10 transition-colors" title="Attendance" id={`evt-attend-${evt._id}`}><Users size={13} /></button>
                          <button onClick={() => handleDelete(evt._id)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete" id={`evt-delete-${evt._id}`}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-in Create/Edit Panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanelOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            <motion.div
              variants={slideInFromRight} initial="initial" animate="animate" exit="exit"
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-secondary border-l border-white/10 z-50 overflow-y-auto"
            >
              <div className="h-0.5 bg-gradient-to-r from-accent-purple to-accent-cyan" />
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white font-display">{editEvent ? 'Edit Event' : 'Create Event'}</h2>
                  <button onClick={() => setPanelOpen(false)} className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10"><X size={16} /></button>
                </div>

                <Input label="Title *" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Event title" id="event-title" />

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 font-body">Category</label>
                  <select className="w-full input-glass px-4 py-3 font-body text-sm" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} id="event-category">
                    {ALL_CATEGORIES.map((c) => <option key={c} value={c} className="bg-secondary">{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 font-body">Description</label>
                  <textarea rows={3} className="w-full input-glass px-4 py-3 text-sm font-body resize-none" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the event..." id="event-description" />
                </div>

                <Input label="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="Venue, City" id="event-location" />

                <div className="grid grid-cols-2 gap-3">
                  <Input label="Date *" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} id="event-date" />
                  <Input label="Hours Awarded" type="number" value={form.hoursAwarded} onChange={(e) => setForm((p) => ({ ...p, hoursAwarded: e.target.value }))} id="event-hours" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input label="Start Time" type="time" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} id="event-start" />
                  <Input label="End Time" type="time" value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} id="event-end" />
                </div>

                <Input label="Max Volunteers" type="number" value={form.maxVolunteers} onChange={(e) => setForm((p) => ({ ...p, maxVolunteers: e.target.value }))} id="event-max" />

                <Button variant="primary" fullWidth loading={saving} onClick={handleSave} id="event-save">
                  <Save size={14} /> {editEvent ? 'Save Changes' : 'Create Event'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Attendance Modal */}
      <Modal isOpen={!!attendanceEvent} onClose={() => setAttendanceEvent(null)} title={`Attendance — ${attendanceEvent?.title}`} size="lg">
        <div className="p-6 space-y-4">
          {registrations.length === 0 ? (
            <p className="text-white/40 text-sm font-body text-center py-6">No registrations for this event.</p>
          ) : (
            <div className="space-y-2">
              {registrations.map((reg) => (
                <div key={reg._id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-purple/30 to-accent-cyan/30 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {reg.volunteer?.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white font-body">{reg.volunteer?.name}</p>
                    <p className="text-xs text-white/40 font-body">{reg.volunteer?.email}</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!attendance[reg.volunteer?._id]}
                      onChange={(e) => setAttendance((p) => ({ ...p, [reg.volunteer?._id]: e.target.checked }))}
                      className="w-4 h-4 rounded accent-accent-purple"
                      id={`attend-${reg.volunteer?._id}`}
                    />
                    <span className="text-sm text-white/60 font-body">Attended</span>
                  </label>
                </div>
              ))}
            </div>
          )}
          {registrations.length > 0 && (
            <Button variant="primary" fullWidth onClick={handleMarkAttendance} id="mark-attendance-submit">
              <CheckSquare size={14} /> Mark Attendance & Award Hours
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default EventManager;
