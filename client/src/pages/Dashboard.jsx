import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Star, TrendingUp, ChevronRight, MapPin, Award, Trophy, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { volunteerService } from '../services/volunteerService';
import { eventService } from '../services/eventService';
import { reportService } from '../services/reportService';
import { fadeInUp, staggerContainer } from '../utils/animations';
import { DashboardSkeleton, ActivityFeedSkeleton } from '../components/skeletons/index';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Navbar from '../components/layout/Navbar';
import { formatDate, formatCountdown, formatRelativeTime, getCategoryStyle } from '../utils/helpers';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon, color }) => (
  <Card hover={false} className="relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 ${color}`} />
    <div className="flex items-center justify-between mb-3">
      <p className="text-white/50 text-sm font-body">{label}</p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} bg-opacity-20`}>
        {icon}
      </div>
    </div>
    <p className="text-3xl font-bold text-white font-mono">{value}</p>
  </Card>
);

// SVG Progress Ring
const ProgressRing = ({ value, max, size = 140 }) => {
  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / Math.max(max, 1), 1);
  return (
    <svg width={size} height={size} className="mx-auto">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="url(#ringGrad)" strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - pct) }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="font-mono" fontSize="20" fontWeight="700" fill="white">
        {value}h
      </text>
      <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)">
        / {max}h goal
      </text>
    </svg>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [activity, setActivity] = useState([]);
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [regsRes, eventsRes, actRes] = await Promise.all([
          volunteerService.getEvents(user.id),
          eventService.getAll({ status: 'upcoming', limit: 6 }),
          reportService.getActivity().catch(() => ({ data: { data: [] } })),
        ]);
        setRegistrations(regsRes.data.data || []);
        setAllEvents(eventsRes.data.data || []);
        setActivity(actRes.data.data || []);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  const upcoming = registrations.filter((r) => r.event?.status === 'upcoming' || r.event?.status === 'active');
  const attended = registrations.filter((r) => r.status === 'attended');

  const downloadCertificate = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [600, 400]
      });

      doc.setFillColor(10, 15, 30);
      doc.rect(0, 0, 600, 400, 'F');

      doc.setDrawColor(124, 58, 237);
      doc.setLineWidth(4);
      doc.rect(20, 20, 560, 360);

      doc.setDrawColor(6, 182, 212);
      doc.setLineWidth(1);
      doc.rect(25, 25, 550, 350);

      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(26);
      doc.text('VOLUNTEERSPHERE', 300, 70, { align: 'center' });

      doc.setTextColor(6, 182, 212);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(14);
      doc.text('CERTIFICATE OF APPRECIATION', 300, 95, { align: 'center' });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('This is proudly presented to', 300, 140, { align: 'center' });

      doc.setTextColor(236, 72, 153);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text(user.name?.toUpperCase() || 'VOLUNTEER', 300, 175, { align: 'center' });

      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);
      const descriptionText = `For outstanding commitment and dedication to community service. By logging a total of ${user.totalHours || 0} hours of active volunteering across events, you have made a tangible, positive impact.`;
      doc.text(doc.splitTextToSize(descriptionText, 450), 300, 215, { align: 'center' });

      doc.setDrawColor(255, 255, 255, 0.2);
      doc.setLineWidth(1);
      doc.line(150, 310, 250, 310);
      doc.line(350, 310, 450, 310);

      doc.setTextColor(255, 255, 255, 0.5);
      doc.setFontSize(9);
      doc.text('DATE', 200, 325, { align: 'center' });
      doc.text('REPRESENTATIVE', 400, 325, { align: 'center' });

      doc.setTextColor(255, 255, 255, 0.9);
      doc.text(new Date().toLocaleDateString('en-IN'), 200, 305, { align: 'center' });
      doc.text('VolunteerSphere Team', 400, 305, { align: 'center' });

      doc.save(`VolunteerSphere_Certificate_${user.name?.replace(/\s+/g, '_')}.pdf`);
      toast.success('Certificate downloaded successfully!');
    }).catch((err) => {
      console.error(err);
      toast.error('Failed to generate certificate');
    });
  };

  const totalHours = user.totalHours || 0;
  const milestones = [
    { name: 'Bronze Helper', hours: 5, color: 'text-amber-600 border-amber-600/30 bg-amber-600/5', desc: 'Completed 5+ volunteering hours' },
    { name: 'Silver Champion', hours: 15, color: 'text-slate-300 border-slate-300/30 bg-slate-300/5', desc: 'Completed 15+ volunteering hours' },
    { name: 'Gold Hero', hours: 30, color: 'text-yellow-400 border-yellow-400/30 bg-yellow-600/5', desc: 'Completed 30+ volunteering hours' },
  ];

  // Recommended events — match user skills
  const recommended = allEvents.filter((e) =>
    e.requiredSkills?.some((s) => user.skills?.includes(s))
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.25 } }}>
              <DashboardSkeleton />
            </motion.div>
          ) : (
            <motion.div key="content" variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
              {/* Header */}
              <motion.div variants={fadeInUp}>
                <h1 className="text-3xl font-display font-bold text-white">
                  Welcome back, <span className="gradient-text">{user.name?.split(' ')[0]}</span> 👋
                </h1>
                <p className="text-white/50 font-body mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </motion.div>

              {/* KPI Cards */}
              <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Events Joined" value={registrations.length} icon={<Calendar size={16} className="text-accent-purple" />} color="bg-accent-purple" />
                <StatCard label="Hours Logged" value={`${user.totalHours || 0}h`} icon={<Clock size={16} className="text-accent-cyan" />} color="bg-accent-cyan" />
                <StatCard label="Upcoming" value={upcoming.length} icon={<TrendingUp size={16} className="text-accent-green" />} color="bg-accent-green" />
                <StatCard label="Attended" value={attended.length} icon={<Star size={16} className="text-accent-pink" />} color="bg-accent-pink" />
              </motion.div>

              {/* Two column layout */}
              <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Upcoming Events — 2/3 */}
                <div className="lg:col-span-2">
                  <Card padding={false} hover={false}>
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white font-display">My Upcoming Events</h2>
                    </div>
                    {upcoming.length === 0 ? (
                      <div className="p-8 text-center text-white/30 font-body text-sm">
                        <Calendar size={32} className="mx-auto mb-3 opacity-30" />
                        No upcoming events. <a href="/events" className="text-accent-purple hover:underline">Browse events →</a>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {upcoming.slice(0, 5).map((reg) => {
                          const evt = reg.event;
                          if (!evt) return null;
                          const catStyle = getCategoryStyle(evt.category);
                          return (
                            <div key={reg._id} className="flex items-center gap-4 p-4 hover:bg-white/3 transition-colors">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${catStyle.bg}`}>
                                <Calendar size={18} className={catStyle.text} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate font-body">{evt.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <MapPin size={11} className="text-white/30" />
                                  <span className="text-xs text-white/40 font-body truncate">{evt.location}</span>
                                  <span className="text-xs text-white/30">•</span>
                                  <span className="text-xs text-white/40 font-body">{formatDate(evt.date)}</span>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <span className="text-xs font-mono text-accent-cyan bg-accent-cyan/10 px-2 py-1 rounded-full">
                                  {formatCountdown(evt.date)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </div>

                {/* Progress Ring — 1/3 */}
                <div>
                  <Card hover={false} className="text-center">
                    <h2 className="text-base font-semibold text-white font-display mb-4">Monthly Goal</h2>
                    <ProgressRing value={user.totalHours || 0} max={40} size={160} />
                    <div className="mt-6 space-y-3 text-sm font-body">
                      <div className="flex justify-between text-white/50">
                        <span>Total Hours</span>
                        <span className="font-mono text-white">{user.totalHours || 0}h</span>
                      </div>
                      <div className="flex justify-between text-white/50">
                        <span>Events Attended</span>
                        <span className="font-mono text-white">{attended.length}</span>
                      </div>
                      <div className="flex justify-between text-white/50">
                        <span>Completion</span>
                        <span className="font-mono text-accent-cyan">
                          {Math.min(Math.round(((user.totalHours || 0) / 40) * 100), 100)}%
                        </span>
                      </div>
                    </div>

                    {totalHours >= 5 ? (
                      <Button
                        variant="primary"
                        fullWidth
                        className="mt-6"
                        onClick={downloadCertificate}
                        id="download-cert-btn"
                      >
                        <Download size={14} className="inline mr-1.5 align-middle" /> Download Certificate
                      </Button>
                    ) : (
                      <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/40 font-body text-center">
                        🔒 Complete 5 hours to unlock Certificate
                      </div>
                    )}
                  </Card>

                  <Card hover={false} className="mt-6">
                    <h2 className="text-base font-semibold text-white font-display mb-4">Milestone Badges</h2>
                    <div className="space-y-3">
                      {milestones.map((m) => {
                        const isUnlocked = totalHours >= m.hours;
                        return (
                          <div key={m.name} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isUnlocked ? 'border-white/10 bg-white/3' : 'border-white/5 opacity-40'}`}>
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border flex-shrink-0 ${isUnlocked ? m.color : 'text-white/20 border-white/5 bg-white/5'}`}>
                              <Award size={18} />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <p className={`text-xs font-semibold font-body ${isUnlocked ? 'text-white' : 'text-white/40'}`}>{m.name}</p>
                              <p className="text-[10px] text-white/30 truncate font-body">{m.desc}</p>
                            </div>
                            <div>
                              {isUnlocked ? (
                                <span className="text-[10px] font-mono text-accent-green bg-accent-green/10 px-2 py-0.5 rounded-full">Unlocked</span>
                              ) : (
                                <span className="text-[10px] text-white/30 font-mono">{m.hours}h req</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </motion.div>

              {/* Recommended Events */}
              {recommended.length > 0 && (
                <motion.div variants={fadeInUp}>
                  <h2 className="text-lg font-semibold text-white font-display mb-4">Recommended For You</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommended.map((evt) => {
                      const catStyle = getCategoryStyle(evt.category);
                      return (
                        <Card key={evt._id} tilt className="space-y-3">
                          <Badge category={evt.category}>{evt.category}</Badge>
                          <h3 className="font-semibold text-white text-sm font-body">{evt.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <MapPin size={11} /> {evt.location}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Calendar size={11} /> {formatDate(evt.date)}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Activity Timeline */}
              {activity.length > 0 && (
                <motion.div variants={fadeInUp}>
                  <ActivityFeedSkeleton items={0} />
                  <Card hover={false} padding={false}>
                    <div className="p-6 border-b border-white/5">
                      <h2 className="text-lg font-semibold text-white font-display">Recent Activity</h2>
                    </div>
                    <div className="p-6 space-y-4">
                      {activity.slice(0, 6).map((reg) => (
                        <div key={reg._id} className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-purple/30 to-accent-cyan/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                            {reg.volunteer?.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-white/80 font-body">
                              <span className="font-semibold">{reg.volunteer?.name}</span> registered for{' '}
                              <span className="text-accent-cyan">{reg.event?.title}</span>
                            </p>
                            <p className="text-xs text-white/30 font-body mt-0.5">{formatRelativeTime(reg.registeredAt)}</p>
                          </div>
                          <Badge category={reg.event?.category} size="xs">{reg.event?.category}</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
