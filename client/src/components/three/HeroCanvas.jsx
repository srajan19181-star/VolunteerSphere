import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import FloatingOrbs from './FloatingOrbs';
import ParticleField from './ParticleField';

const HeroScene = () => (
  <>
    <ambientLight intensity={0.3} color="#7C3AED" />
    <pointLight position={[5, 5, 5]} intensity={1.5} color="#7C3AED" />
    <pointLight position={[-5, -5, 5]} intensity={1} color="#06B6D4" />
    <pointLight position={[0, -5, -5]} intensity={0.5} color="#EC4899" />
    <Stars radius={80} depth={50} count={1500} factor={3} saturation={0.5} fade speed={0.5} />
    <FloatingOrbs />
    <ParticleField />
  </>
);

const HeroCanvas = () => (
  <div className="absolute inset-0 z-0">
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      frameloop="demand"
    >
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  </div>
);

export default HeroCanvas;
