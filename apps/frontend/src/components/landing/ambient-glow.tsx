'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

export function AmbientGlow() {
  const { theme } = useTheme();

  return (
    <div
      className="absolute inset-0 w-full h-[600px] pointer-events-none select-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/5 to-background z-10" />

      <svg
        className="w-full h-full opacity-40 dark:opacity-40"
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main soft colored glow */}
          <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="45%" stopColor="var(--primary)" stopOpacity="0.4" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.8" />
            <stop offset="55%" stopColor="var(--primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>

          {/* Brighter core for the 'filament' look */}
          <linearGradient id="core-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="40%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.6" />
            <stop offset="60%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <mask id="fade-mask">
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#mask-gradient)"
            />
          </mask>

          <linearGradient id="mask-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="black" />
            <stop offset="15%" stopColor="white" />
            <stop offset="85%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </linearGradient>
        </defs>

        {/* 
          Refined Premium Curves:
          Harmonic waves that flow naturally across the screen.
        */}
        {[
          // Curve 1: Upper flow
          'M -100 280 C 400 320, 900 180, 1540 260',
          // Curve 2: Middle flow (Main)
          'M -100 340 C 450 380, 850 260, 1540 320',
          // Curve 3: Lower gentle flow
          'M -100 380 C 500 420, 900 340, 1540 400',
        ].map((d, i) => (
          <React.Fragment key={i}>
            {/* Base static line */}
            <path
              d={d}
              fill="none"
              stroke="currentColor"
              strokeWidth={i === 1 ? 0.8 : 0.5} // Middle line slightly thicker
              className="text-muted-foreground/30 dark:text-white/10"
              mask="url(#fade-mask)"
            />

            {/* Traveling Halo (Wide & Colored) */}
            <path
              d={d}
              fill="none"
              stroke="url(#glow-gradient)"
              strokeWidth={i === 1 ? 3 : 2}
              strokeLinecap="round"
              className="motion-reduce:hidden"
              style={{
                strokeDasharray: '400 2800',
                strokeDashoffset: 3200,
                opacity: 0.8,
                filter: 'url(#soft-glow)',
                animation: `travel-glow ${20 + i * 5}s linear infinite`,
                animationDelay: `${i * 3}s`,
              }}
              mask="url(#fade-mask)"
            />

            {/* Traveling Core (Thin & Bright) - Only for the main middle curve */}
            {i === 1 && (
              <path
                d={d}
                fill="none"
                stroke="url(#core-gradient)"
                strokeWidth="1"
                strokeLinecap="round"
                className="motion-reduce:hidden"
                style={{
                  strokeDasharray: '400 2800',
                  strokeDashoffset: 3200,
                  opacity: 0.6,
                  // No blur for the core, or very slight
                  animation: `travel-glow ${20 + i * 5}s linear infinite`,
                  animationDelay: `${i * 3}s`,
                }}
                mask="url(#fade-mask)"
              />
            )}
          </React.Fragment>
        ))}
      </svg>

      <style jsx>{`
        @keyframes travel-glow {
          0% {
            stroke-dashoffset: 3200;
          }
          100% {
            stroke-dashoffset: -400;
          }
        }
      `}</style>
    </div>
  );
}
