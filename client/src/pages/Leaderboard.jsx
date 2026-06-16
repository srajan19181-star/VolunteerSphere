import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, Clock, Heart, Award, ArrowUp } from 'lucide-react';
import { volunteerService } from '../services/volunteerService';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { fadeInUp, staggerContainer } from '../utils/animations';
import toast from 'react-hot-toast';

const PodiumItem = ({ volunteer, place, delay }) => {
  if (!volunteer) return null;

  const heights = {
    1: 'h-48 bg-gradient-to-t from-accent-purple/30 to-accent-purple/10 border-accent-purple/40',
    2: 'h-36 bg-gradient-to-t from-accent-cyan/30 to-accent-cyan/10 border-accent-cyan/30',
    3: 'h-28 bg-gradient-to-t from-accent-pink/30 to-accent-pink/10 border-accent-pink/30',
  };

  const ringColors = {
    1: 'border-accent-purple ring-accent-purple/20',
    2: 'border-accent-cyan ring-accent-cyan/20',
    3: 'border-accent-pink ring-accent-pink/20',
  };

  const trophyColors = {
    1: 'text-yellow-400',
    2: 'text-slate-300',
    3: 'text-amber-600',
  };

  const getAvatarUrl = () => {
    if (volunteer.profilePhoto) {
      if (volunteer.profilePhoto.startsWith('http')) return volunteer.profilePhoto;
      return `http://localhost:5000${volunteer.profilePhoto}`;
    }
    return null;
  };

  const initials = volunteer.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center w-full max-w-[150px] sm:max-w-[180px] z-10"
    >
      {/* Crown or Place Badge */}
      <div className="mb-2 relative">
        {place === 1 && (
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400"
          >
            <Trophy size={26} className="fill-current" />
          </motion.div>
        )}
        
        {/* Avatar */}
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 ring-4 ${ringColors[place]} flex items-center justify-center overflow-hidden bg-secondary relative`}>
          {getAvatarUrl() ? (
            <img src={getAvatarUrl()} alt={volunteer.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold text-lg">{initials}</span>
          )}
          <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-secondary border border-white/10 flex items-center justify-center text-[10px] font-bold text-white font-mono">
            {place}
          </span>
        </div>
      </div>

      <p className="text-sm font-semibold text-white font-display text-center truncate w-full px-2 mt-1">{volunteer.name}</p>
      <p className="text-xs text-white/50 font-body mb-3">{volunteer.address?.city || 'India'}</p>

      {/* Podium Block */}
      <div className={`w-full border border-b-0 rounded-t-2xl flex flex-col items-center justify-center p-3 shadow-2xl ${heights[place]}`}>
        <span className={`text-4xl font-bold font-display ${trophyColors[place]}`}>{place}</span>
        <div className="flex items-center gap-1 mt-2 text-xs font-mono text-white/80 bg-white/5 px-2 py-0.5 rounded-full">
          <Clock size={11} className="text-accent-cyan" />
          <span>{volunteer.totalHours || 0} hrs</span>
        </div>
      </div>
    </motion.div>
  );
};

const Leaderboard = () => {
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await volunteerService.getLeaderboard();
        setVolunteers(res.data.data || []);
      } catch {
        toast.error('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const topThree = volunteers.slice(0, 3);
  const rest = volunteers.slice(3);

  // Re-order top three for visual podium layout: [2nd, 1st, 3rd]
  const podiumLayout = [];
  if (topThree[1]) podiumLayout.push({ v: topThree[1], place: 2, delay: 0.3 });
  if (topThree[0]) podiumLayout.push({ v: topThree[0], place: 1, delay: 0.1 });
  if (topThree[2]) podiumLayout.push({ v: topThree[2], place: 3, delay: 0.5 });

  return (
    <div className="min-h-screen bg-primary flex flex-col justify-between">
      <Navbar />
      <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 flex-grow w-full">
        
        {/* Header */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-purple/10 text-accent-purple mb-4 border border-accent-purple/20">
            <Trophy size={24} className="animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
            Hall of <span className="gradient-text">Fame</span>
          </h1>
          <p className="text-white/50 font-body">Honoring our top contributors making a difference worldwide</p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-accent-purple border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/40 text-xs font-body mt-4">Loading top volunteers...</p>
          </div>
        ) : volunteers.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <Award size={48} className="mx-auto mb-4 text-white/30" />
            <h3 className="text-lg font-display text-white font-semibold mb-1">No contributors yet</h3>
            <p className="text-white/40 font-body text-sm">Join an event and mark attendance to lock in your hours!</p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Podium Visual Section */}
            <div className="flex justify-center items-end gap-2 sm:gap-6 pt-10 border-b border-white/5 pb-1 relative overflow-hidden">
              {/* Glow background */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-accent-purple/10 rounded-full blur-3xl opacity-60 pointer-events-none" />
              
              {podiumLayout.map(({ v, place, delay }) => (
                <PodiumItem key={v._id} volunteer={v} place={place} delay={delay} />
              ))}
            </div>

            {/* Rest of Leaderboard List */}
            {rest.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider font-display mb-4">Rankings #4 – #{volunteers.length}</h2>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
                  {rest.map((vol, index) => {
                    const place = index + 4;
                    const getAvatarUrl = () => {
                      if (vol.profilePhoto) {
                        if (vol.profilePhoto.startsWith('http')) return vol.profilePhoto;
                        return `http://localhost:5000${vol.profilePhoto}`;
                      }
                      return null;
                    };
                    const initials = vol.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

                    return (
                      <div key={vol._id} className="flex items-center gap-4 p-4 hover:bg-white/3 transition-colors">
                        {/* Rank */}
                        <span className="w-6 text-sm font-bold font-mono text-white/40">{place}</span>

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center overflow-hidden bg-secondary flex-shrink-0">
                          {getAvatarUrl() ? (
                            <img src={getAvatarUrl()} alt={vol.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-xs font-bold">{initials}</span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate font-body">{vol.name}</p>
                          <p className="text-xs text-white/40 font-body">{vol.address?.city || 'India'}</p>
                        </div>

                        {/* Hours */}
                        <div className="flex items-center gap-1.5 text-sm font-mono font-medium text-accent-cyan">
                          <Clock size={13} />
                          <span>{vol.totalHours || 0} hrs</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default Leaderboard;
