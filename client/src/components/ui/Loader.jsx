import React from 'react';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.png';

const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className={`${sizes[size]} relative`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-purple border-r-accent-cyan" />
      </motion.div>
      {fullScreen && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white/50 text-sm font-body"
        >
          Loading...
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-primary z-50">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center gap-3.5 mb-6"
          >
            <img 
              src={logo} 
              alt="VolunteerSphere Logo" 
              className="w-14 h-14 rounded-2xl object-cover border border-white/15 shadow-2xl animate-pulse" 
            />
            <h2 className="font-display text-2xl font-bold text-white tracking-wide">
              VolunteerSphere
            </h2>
          </motion.div>
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

export default Loader;
