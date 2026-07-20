'use client';

import React, { useEffect, useState, useMemo } from 'react';

const ICONS = [
  'Artboard 10 copy 13.svg', 'Artboard 10 copy 14.svg', 'Artboard 10 copy 15.svg',
  'calculator.svg', 'computer.svg', 'electro-mech.svg', 'health-safety.svg',
  'ideation.svg', 'logical-processing.svg', 'measurement-design.svg',
  'mobile-phone.svg', 'physical-work.svg', 'precision-math.svg',
  'technical-drawing.svg', 'translation.svg', 'working-cleanly.svg'
];

interface Particle {
  id: string;
  icon: string;
  size: number;
  x: number;
  y: number;
  tx: number; // target x
  ty: number; // target y
  duration: number;
  delay: number;
  rotation: number;
  opacity: number;
}

export function FloatingBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // We only want to generate the random values on the client to avoid hydration mismatch
  useEffect(() => {
    const generated: Particle[] = Array.from({ length: 30 }).map((_, i) => ({
      id: `particle-${i}`,
      icon: `/assets/bg-icons/${ICONS[Math.floor(Math.random() * ICONS.length)]}`,
      size: 40 + Math.random() * 80, // 40px to 120px
      x: Math.random() * 100, // vw
      y: Math.random() * 100, // vh
      tx: (Math.random() - 0.5) * 100, // random drift distance
      ty: (Math.random() - 0.5) * 100,
      duration: 30 + Math.random() * 40, // 30s to 70s
      delay: -Math.random() * 30, // start halfway through animation
      rotation: Math.random() * 360,
      opacity: 0.05 + Math.random() * 0.15, // very subtle
    }));
    setParticles(generated);
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      {/* Background base color (adapts to theme via globals.css) */}
      <div className="absolute inset-0 bg-background transition-colors duration-1000" />
      
      {/* Container for particles */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}vw`,
              top: `${p.y}vh`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              // The animation uses CSS variables to define the drift target
              '--tx': `${p.tx}vw`,
              '--ty': `${p.ty}vh`,
              '--rot': `${p.rotation + 360}deg`,
              animation: `drift ${p.duration}s infinite alternate ease-in-out`,
              animationDelay: `${p.delay}s`,
              transform: `rotate(${p.rotation}deg)`,
            } as React.CSSProperties}
          >
            {/* 
              Using mask-image allows us to colorize white SVGs effortlessly. 
              The background gradient supplies the color (which shifts). 
            */}
            <div 
              className="w-full h-full animate-shimmer"
              style={{
                WebkitMaskImage: `url('${p.icon}')`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: `url('${p.icon}')`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                // This gradient defines the colors of the icon itself. It will shift using the animate-shimmer class.
                backgroundImage: 'linear-gradient(45deg, var(--theme-color-1), var(--theme-color-2), var(--theme-color-1))',
                backgroundSize: '200% 200%',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
