import React from 'react';

const SkeletonBase = ({ className = '' }) => (
  <div
    className={`
      relative overflow-hidden rounded-md bg-white/5
      before:absolute before:inset-0
      before:bg-gradient-to-r before:from-transparent before:via-white/7 before:to-transparent
      before:translate-x-[-200%] before:animate-shimmer
      ${className}
    `}
    style={{
      '--shimmer-bg': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)',
    }}
  />
);

export default SkeletonBase;
