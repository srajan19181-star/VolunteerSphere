import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => (
  <div className="min-h-screen bg-primary flex items-center justify-center relative overflow-hidden">
    {/* Background orbs */}
    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl" />
    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl" />

    <div className="relative z-10 text-center px-4">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-[10rem] font-display font-bold leading-none"
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #06B6D4, #EC4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        404
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-display font-bold text-white mb-3"
      >
        Page not found
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-white/50 font-body mb-8 max-w-sm mx-auto"
      >
        The page you're looking for doesn't exist or has been moved.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-3"
      >
        <Link to="/">
          <Button variant="primary" id="404-home">
            <Home size={16} /> Go Home
          </Button>
        </Link>
        <button onClick={() => window.history.back()}>
          <Button variant="glass" id="404-back">
            <ArrowLeft size={16} /> Go Back
          </Button>
        </button>
      </motion.div>
    </div>
  </div>
);

export default NotFound;
