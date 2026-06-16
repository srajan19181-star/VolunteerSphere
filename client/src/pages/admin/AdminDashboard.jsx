import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { volunteerService } from '../../services/volunteerService';
import { eventService } from '../../services/eventService';
import { AdminDashboardSkeleton } from '../../components/skeletons/index';
import { fadeInUp, staggerContainer } from '../../utils/animations';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import VolunteerChart from '../../components/charts/VolunteerChart';
import EventChart from '../../components/charts/EventChart';
import SkillsRadar from '../../components/charts/SkillsRadar';
import Badge from '../../components/ui/Badge';
import { formatRelativeTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const KPICard = ({ label, value, icon, color, subtitle }) => (
  <Card hover={false} className="relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl opacity-15 ${color}`} />
    <div className="flex items-center justify-between mb-3">
      <span className="text-white/50 text-xs font-body uppercase tracking-wider">{label}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} bg-opacity-20`}>{icon}</div>
    </div>
    <p className="text-4xl font-bold text-white font-mono">{value}</p>
    {subtitle && <p className="text-xs text-white/30 font-body mt-1">{subtitle}</p>}
  </Card>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState({ volunteers: [], events: [] });
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [activity, setActivity] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, monthRes, volRes, evtRes, actRes] = await Promise.all([
        reportService.getSummary(),
        reportService.getMonthly(),
        volunteerService.getAll({ limit: 100 }),
        eventService.getAll({ limit: 100 }),
        reportService.getActivity(),
      ]);
      setSummary(sumRes.data.data);
      setMonthly(monthRes.data.data);
      setVolunteers(volRes.data.data || []);
      setEvents(evtRes.data.data || []);
      setActivity(actRes.data.data || []);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="min-h-screen p-6">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="sk" exit={{ opacity: 0 }}><AdminDashboardSkeleton /></motion.div>
        ) : (
          <motion.div key="content" variants={staggerContainer} initial="initial" animate="animate" className="space-y-8 max-w-7xl">

            {/* Header */}
            <motion.div variants={fadeInUp} className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-white">Admin <span className="gradient-text">Overview</span></h1>
                <p className="text-white/40 text-sm font-body mt-1">Platform performance at a glance</p>
              </div>
              <Button variant="glass" size="sm" onClick={loadData} id="admin-refresh">
                <RefreshCw size={14} /> Refresh
              </Button>
            </motion.div>

            {/* KPI Cards */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard label="Total Volunteers" value={summary?.totalVolunteers ?? '—'} icon={<Users size={16} className="text-accent-purple" />} color="bg-accent-purple" subtitle={`+${summary?.newThisMonth || 0} this month`} />
              <KPICard label="Total Events" value={summary?.totalEvents ?? '—'} icon={<Calendar size={16} className="text-accent-cyan" />} color="bg-accent-cyan" subtitle={`${summary?.activeEvents || 0} active`} />
              <KPICard label="Hours Logged" value={`${(summary?.totalHours || 0).toLocaleString()}`} icon={<Clock size={16} className="text-accent-green" />} color="bg-accent-green" />
              <KPICard label="New This Month" value={summary?.newThisMonth ?? '—'} icon={<TrendingUp size={16} className="text-accent-pink" />} color="bg-accent-pink" />
            </motion.div>

            {/* Line Chart — Volunteer Registrations */}
            <motion.div variants={fadeInUp}>
              <Card hover={false}>
                <h2 className="text-base font-semibold text-white font-display mb-6">Monthly Volunteer Registrations</h2>
                <VolunteerChart data={monthly.volunteers} />
              </Card>
            </motion.div>

            {/* Bar + Radar side-by-side */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card hover={false}>
                <h2 className="text-base font-semibold text-white font-display mb-4">Events by Category</h2>
                <EventChart events={events} />
              </Card>
              <Card hover={false}>
                <h2 className="text-base font-semibold text-white font-display mb-4">Volunteer Skills</h2>
                <SkillsRadar volunteers={volunteers} />
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={fadeInUp}>
              <Card hover={false} padding={false}>
                <div className="p-6 border-b border-white/5">
                  <h2 className="text-base font-semibold text-white font-display">Recent Activity</h2>
                </div>
                <div className="divide-y divide-white/5">
                  {activity.slice(0, 8).map((reg) => (
                    <div key={reg._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/3 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {reg.volunteer?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 font-body">
                          <span className="font-semibold text-white">{reg.volunteer?.name}</span> registered for{' '}
                          <span className="text-accent-cyan">{reg.event?.title}</span>
                        </p>
                        <p className="text-xs text-white/30 font-body">{formatRelativeTime(reg.registeredAt)}</p>
                      </div>
                      <Badge category={reg.event?.category} size="xs">{reg.event?.category}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
