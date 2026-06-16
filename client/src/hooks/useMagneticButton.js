import { useMotionValue, useSpring } from 'framer-motion';
import { useRef, useEffect } from 'react';

/**
 * Magnetic button hook — button subtly follows the cursor.
 * @param {number} strength - How far the button moves (default 0.3)
 * @returns {{ ref, style }} - attach ref to button, spread style on motion.div
 */
const useMagneticButton = (strength = 0.3) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set((e.clientX - centerX) * strength);
      y.set((e.clientY - centerY) * strength);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, x, y]);

  return {
    ref,
    style: { x: springX, y: springY },
  };
};

export default useMagneticButton;
