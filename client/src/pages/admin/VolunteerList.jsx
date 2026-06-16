import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ToggleLeft, ToggleRight, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { volunteerService } from '../../services/volunteerService';
import { TableSkeleton } from '../../components/skeletons/index';
import { fadeInUp } from '../../utils/animations';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatDate, getSkillColor, getInitials } from '../../utils/helpers';

const VolunteerList = () => {
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [viewVolunteer, setViewVolunteer] = useState(null);
  const LIMIT = 15;

  const load = async () => {
    setLoading(true);
    try {
      const res = await volunteerService.getAll({ page, limit: LIMIT, search: search || undefined });
      setVolunteers(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load volunteers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  useEffect(() => {
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleToggle = async (id) => {
    try {
      const res = await volunteerService.toggleStatus(id);
      setVolunteers((prev) => prev.map((v) => v._id === id ? { ...v, isActive: res.data.data.isActive } : v));
      toast.success(res.data.message);
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this volunteer?')) return;
    try {
      await volunteerService.deactivate(id);
      setVolunteers((prev) => prev.filter((v) => v._id !== id));
      toast.success('Volunteer deactivated');
    } catch { toast.error('Failed to deactivate'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Volunteers</h1>
          <p className="text-white/40 text-sm font-body">{total} total volunteers</p>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full input-glass pl-10 pr-4 py-3 text-sm"
          id="volunteers-search"
        />
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="sk" exit={{ opacity: 0 }}><TableSkeleton rows={LIMIT} columns={6} /></motion.div>
        ) : (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-semibold text-white/50 uppercase tracking-wider px-4 py-4 font-body">Volunteer</th>
                    <th className="text-left text-xs font-semibold text-white/50 uppercase tracking-wider px-4 py-4 font-body">Skills</th>
                    <th className="text-left text-xs font-semibold text-white/50 uppercase tracking-wider px-4 py-4 font-body">Hours</th>
                    <th className="text-left text-xs font-semibold text-white/50 uppercase tracking-wider px-4 py-4 font-body">Joined</th>
                    <th className="text-left text-xs font-semibold text-white/50 uppercase tracking-wider px-4 py-4 font-body">Status</th>
                    <th className="text-right text-xs font-semibold text-white/50 uppercase tracking-wider px-4 py-4 font-body">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {volunteers.map((vol) => (
                    <tr key={vol._id} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-purple/30 to-accent-cyan/30 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {vol.profilePhoto ? (
                              <img 
                                src={vol.profilePhoto.startsWith('http') ? vol.profilePhoto : `http://localhost:5000${vol.profilePhoto}`} 
                                alt="" 
                                className="w-full h-full rounded-full object-cover" 
                              />
                            ) : getInitials(vol.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white font-body">{vol.name}</p>
                            <p className="text-xs text-white/40 font-body">{vol.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {vol.skills?.slice(0, 2).map((s) => (
                            <span key={s} className={`px-2 py-0.5 rounded-full text-[10px] font-body ${getSkillColor(s)}`}>{s}</span>
                          ))}
                          {vol.skills?.length > 2 && <span className="text-xs text-white/30">+{vol.skills.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-white">{vol.totalHours}h</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-white/50 font-body">{formatDate(vol.joinedAt)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-body ${vol.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                          {vol.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewVolunteer(vol)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="View" id={`vol-view-${vol._id}`}><Eye size={14} /></button>
                          <button onClick={() => handleToggle(vol._id)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="Toggle Status" id={`vol-toggle-${vol._id}`}>
                            {vol.isActive ? <ToggleRight size={14} className="text-green-400" /> : <ToggleLeft size={14} />}
                          </button>
                          <button onClick={() => handleDelete(vol._id)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Deactivate" id={`vol-delete-${vol._id}`}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-4 border-t border-white/10">
              <p className="text-xs text-white/40 font-body">Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</p>
              <div className="flex gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white disabled:opacity-30" id="vol-prev-page"><ChevronLeft size={14} /></button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-mono ${page === i + 1 ? 'bg-accent-purple text-white' : 'bg-white/5 text-white/50 hover:text-white'}`} id={`vol-page-${i + 1}`}>{i + 1}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white disabled:opacity-30" id="vol-next-page"><ChevronRight size={14} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Volunteer Modal */}
      <Modal isOpen={!!viewVolunteer} onClose={() => setViewVolunteer(null)} title="Volunteer Details" size="md">
        {viewVolunteer && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-xl font-bold text-white overflow-hidden">
                {viewVolunteer.profilePhoto ? (
                  <img 
                    src={viewVolunteer.profilePhoto.startsWith('http') ? viewVolunteer.profilePhoto : `http://localhost:5000${viewVolunteer.profilePhoto}`} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                ) : getInitials(viewVolunteer.name)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white font-display">{viewVolunteer.name}</h3>
                <p className="text-white/50 text-sm font-body">{viewVolunteer.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm font-body">
              {[
                ['Phone', viewVolunteer.phone || '—'],
                ['Age', viewVolunteer.age || '—'],
                ['Gender', viewVolunteer.gender || '—'],
                ['Total Hours', `${viewVolunteer.totalHours}h`],
                ['City', viewVolunteer.address?.city || '—'],
                ['Joined', formatDate(viewVolunteer.joinedAt)],
              ].map(([l, v]) => (
                <div key={l} className="bg-white/5 rounded-lg p-3">
                  <span className="text-white/40 text-xs">{l}</span>
                  <p className="text-white mt-0.5">{v}</p>
                </div>
              ))}
            </div>
            {viewVolunteer.bio && <p className="text-white/50 text-sm font-body bg-white/5 p-3 rounded-lg">{viewVolunteer.bio}</p>}
            <div className="flex flex-wrap gap-1">
              {viewVolunteer.skills?.map((s) => (
                <span key={s} className={`px-2.5 py-1 rounded-full text-xs font-body border ${getSkillColor(s)}`}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VolunteerList;
