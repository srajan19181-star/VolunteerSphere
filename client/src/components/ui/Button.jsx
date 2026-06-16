import React from 'react';
import { motion } from 'framer-motion';
import useMagneticButton from '../../hooks/useMagneticButton';

const variants = {
  primary: 'bg-white text-primary border border-transparent shadow-md hover:bg-white/90',
  glass: 'bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 hover:border-accent-purple/50',
  danger: 'bg-gradient-to-r from-red-600 to-red-500 text-[#F8FAFC] hover:from-red-500 hover:to-red-400',
  ghost: 'text-white/70 hover:text-white hover:bg-white/5',
  outline: 'border border-accent-purple/50 text-accent-purple hover:bg-accent-purple/10',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
  xl: 'px-10 py-5 text-lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  magnetic = true,
  fullWidth = false,
  id,
}) => {
  const { ref, style } = useMagneticButton(0.25);

  return (
    <motion.button
      ref={magnetic ? ref : null}
      style={magnetic ? style : {}}
      type={type}
      id={id}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-200 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
        font-body
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : children}
    </motion.button>
  );
};

export default Button;
