import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  tilt = false,
  glow = false,
  hover = true,
  onClick,
  padding = true,
}) => {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e) => {
    if (!tilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const handleMouseLeave = () => setTransform('');

  return (
    <motion.div
      ref={cardRef}
      whileHover={hover ? { y: -4, borderColor: 'rgba(124,58,237,0.4)' } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: transform ? 'none' : 'transform 0.5s ease' }}
      className={`
        backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl
        transition-colors duration-200
        ${glow ? 'animate-glow-pulse' : ''}
        ${hover ? 'hover:bg-white/8 cursor-pointer' : ''}
        ${padding ? 'p-6' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;
