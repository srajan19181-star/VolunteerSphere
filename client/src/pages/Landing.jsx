import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Users, Calendar, Clock, MapPin, Zap, Shield, BarChart3, Mail, Star, Heart, Globe } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../utils/animations';
import useAnimatedCount from '../hooks/useAnimatedCount';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { formatDate, getCategoryStyle } from '../utils/helpers';
import { SplineScene } from '../components/ui/splite';

const HeroCanvas = lazy(() => import('../components/three/HeroCanvas'));

// Animated counter component
const AnimatedStat = ({ value, suffix = '', label, icon }) => {
  const { ref, count } = useAnimatedCount(value, 2200);
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-bold font-mono text-white mb-1 stat-number">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-white/50 text-sm font-body">{icon} {label}</div>
    </div>
  );
};

const FEATURES = [
  { icon: <Zap size={22} className="text-accent-purple" />, title: 'Instant Slot Signup', desc: 'No lengthy applications. See an event, select your group size, and lock in your slot immediately.' },
  { icon: <Clock size={22} className="text-accent-cyan" />, title: 'Verifiable Hours', desc: 'Your volunteering hours are automatically compiled into official, digital PDF certificates.' },
  { icon: <Star size={22} className="text-accent-pink" />, title: 'Tailored Matchmaking', desc: 'No generic suggestions. Get matched with projects that directly use your unique skills.' },
  { icon: <BarChart3 size={22} className="text-accent-green" />, title: 'NGO Toolkit', desc: 'A dedicated dashboard for organizers to manage check-ins and review impacts.' },
  { icon: <Mail size={22} className="text-accent-purple" />, title: 'Automated Reminders', desc: 'Never miss an event. Receive simple email summaries with directions, dates, and times.' },
  { icon: <Shield size={22} className="text-accent-cyan" />, title: 'Gamified Milestones', desc: 'Unlock progress badges (Bronze, Silver, Gold) as you contribute more hours to the community.' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 3D Canvas Background */}
        <Suspense fallback={null}>
          <HeroCanvas />
        </Suspense>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary/80 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-transparent to-primary/50 z-[1]" />

        {/* Hero Content */}
        <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: 3D Spline Scene */}
          <div className="w-full h-[350px] sm:h-[450px] lg:h-[550px] relative order-2 lg:order-1">
            <SplineScene 
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" 
              className="w-full h-full"
            />
          </div>

          {/* Right Column: Hero Content */}
          <div className="text-center lg:text-left order-1 lg:order-2">
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">

              <motion.div variants={fadeInUp} className="flex justify-center lg:justify-start">
                <Badge variant="purple" size="md">
                   Skip the talking. Start doing.
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-5xl sm:text-6xl md:text-7xl font-display font-bold text-white leading-[1.05] tracking-tight"
              >
                Leave the world{' '}
                <span className="gradient-text animate-gradient-shift block" style={{ backgroundSize: '200% 200%' }}>
                  better than you
                </span>
                <span className="font-serif-italic text-accent-pink block md:inline font-normal">
                  found it.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-base md:text-lg text-white/70 font-body max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                VolunteerSphere matches you with local NGOs, food drives, and coding bootcamps who actually need your hands. No corporate jargon, no subscription fees—just <span className="text-accent-cyan font-semibold">raw, direct impact</span> in your community.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center lg:justify-start gap-4 relative">
                <Link to="/register">
                  <Button variant="primary" size="xl" id="hero-cta-register">
                    Find Your Spot →
                  </Button>
                </Link>
                <Link to="/events">
                  <Button variant="glass" size="xl" id="hero-cta-events">
                    Browse Events
                  </Button>
                </Link>

                {/* Handwritten Annotation */}
                <div className="absolute -top-10 right-10 lg:right-auto lg:-left-24 transform -rotate-6 hidden md:flex items-center gap-1.5 text-accent-cyan font-handwritten text-lg select-none">
                  <span className="bg-accent-cyan/10 px-2 py-0.5 rounded border border-accent-cyan/20">100% free forever</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent-cyan animate-pulse">
                    <path d="M3 17C3 17 9 20 18 11M18 11C18 11 14 11 13 12M18 11C18 11 17 15 16 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </motion.div>

              {/* Social proof */}
              <motion.div variants={fadeInUp} className="flex items-center justify-center lg:justify-start gap-6 text-white/40 text-sm font-body pt-2">
                <div className="flex items-center gap-1.5">
                  <Heart size={14} className="text-accent-pink fill-current" />
                  <span>Direct action</span>
                </div>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-1.5">
                  <Globe size={14} className="text-accent-cyan" />
                  <span>50+ cities</span>
                </div>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-1.5">
                  <Shield size={14} className="text-accent-green" />
                  <span>Verified causes</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] text-white/30"
        >
          <ChevronDown size={28} />
        </motion.div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────── */}
      <section className="py-16 relative">
        <div className="max-w-5xl mx-auto px-4">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-white/10">
              <AnimatedStat value={12450} suffix="+" label="Volunteers" icon="🧑‍🤝‍🧑" />
              <AnimatedStat value={840} suffix="+" label="Events" icon="📅" />
              <AnimatedStat value={98000} suffix="+" label="Hours Logged" icon="⏱️" />
              <AnimatedStat value={52} suffix="" label="Cities" icon="🌍" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              We cut out the <span className="font-serif-italic text-accent-cyan font-normal">red tape.</span> You focus on helping.
            </h2>
            <p className="text-white/50 text-base md:text-lg font-body max-w-xl mx-auto">
              Here's how we make volunteering completely frictionless for both doers and organizers.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((feat, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card tilt hover className="h-full">
                  <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                    {feat.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 font-display">{feat.title}</h3>
                  <p className="text-white/50 text-sm font-body leading-relaxed">{feat.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA SECTION ───────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="gradient-border p-12 relative overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/10 via-transparent to-accent-cyan/10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                Let's get <span className="font-serif-italic text-accent-pink font-normal">started.</span>
              </h2>
              <p className="text-white/60 font-body mb-8 text-base md:text-lg max-w-xl mx-auto">
                NGOs are posting events daily. Grab a slot, bring your enthusiasm, and let's construct some real positive impact.
              </p>
              <Link to="/register">
                <Button variant="primary" size="xl" id="cta-join-now">
                  Join VolunteerSphere <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
