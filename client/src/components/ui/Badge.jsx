import React from 'react';
import { getCategoryStyle, getStatusStyle } from '../../utils/helpers';

const Badge = ({ children, variant = 'default', category, status, size = 'sm', className = '' }) => {
  let styles = 'bg-white/10 text-gray-300 border-white/20';

  if (category) {
    const s = getCategoryStyle(category);
    styles = `${s.bg} ${s.text} border ${s.border}`;
  } else if (status) {
    styles = `${getStatusStyle(status)} border border-white/10`;
  } else if (variant === 'purple') {
    styles = 'bg-accent-purple/20 text-purple-300 border border-accent-purple/30';
  } else if (variant === 'cyan') {
    styles = 'bg-accent-cyan/20 text-cyan-300 border border-accent-cyan/30';
  } else if (variant === 'green') {
    styles = 'bg-accent-green/20 text-green-300 border border-accent-green/30';
  } else if (variant === 'pink') {
    styles = 'bg-accent-pink/20 text-pink-300 border border-accent-pink/30';
  }

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full font-body ${styles} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
