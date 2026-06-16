import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, MeshWobbleMaterial, Sphere } from '@react-three/drei';

const OrbDistort = ({ position, color, scale, speed, distort }) => {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.4;
    ref.current.rotation.x = state.clock.elapsedTime * speed * 0.1;
    ref.current.rotation.z = state.clock.elapsedTime * speed * 0.05;
  });

  return (
    <Sphere ref={ref} args={[1, 64, 64]} position={position} scale={scale}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={distort}
        speed={2}
        roughness={0.2}
        metalness={0.1}
        transparent
        opacity={0.55}
      />
    </Sphere>
  );
};

const OrbWobble = ({ position, color, scale, speed }) => {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * speed * 0.4) * 0.5;
    ref.current.rotation.y = state.clock.elapsedTime * speed * 0.1;
  });

  return (
    <Sphere ref={ref} args={[1, 64, 64]} position={position} scale={scale}>
      <MeshWobbleMaterial
        color={color}
        attach="material"
        factor={0.4}
        speed={1.5}
        roughness={0.1}
        transparent
        opacity={0.4}
      />
    </Sphere>
  );
};

const FloatingOrbs = () => (
  <>
    <OrbDistort position={[-3.5, 1, -2]} color="#7C3AED" scale={1.8} speed={0.8} distort={0.4} />
    <OrbDistort position={[3.5, -0.5, -3]} color="#06B6D4" scale={1.4} speed={0.6} distort={0.3} />
    <OrbWobble position={[0.5, 2.5, -4]} color="#EC4899" scale={1.0} speed={1.0} />
  </>
);

export default FloatingOrbs;
