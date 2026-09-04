import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const sizeConfig = {
    sm: { iconSize: 32, textTitle: 'text-base', textSub: 'text-[9px]' },
    md: { iconSize: 42, textTitle: 'text-xl', textSub: 'text-[11px]' },
    lg: { iconSize: 56, textTitle: 'text-2xl sm:text-3xl', textSub: 'text-xs' },
  };

  const { iconSize, textTitle, textSub } = sizeConfig[size];

  return (
    <div
      id="rds-brand-logo"
      onClick={onClick}
      className={`inline-flex items-center gap-3 cursor-pointer group select-none ${className}`}
    >
      {/* RDS Futuristic Vector Monogram */}
      <div className="relative flex-shrink-0">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Cyan to Electric Blue gradient */}
            <linearGradient id="rdsBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>

            {/* Silver to Violet Gradient for S and D */}
            <linearGradient id="rdsPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            <linearGradient id="rdsSilverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            {/* Metallic Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Digital Pixel particles top-left (Rishi Digital signature) */}
          <rect x="18" y="16" width="5" height="5" fill="#38bdf8" rx="1" />
          <rect x="25" y="16" width="5" height="5" fill="#06b6d4" rx="1" />
          <rect x="25" y="23" width="5" height="5" fill="#818cf8" rx="1" />
          <rect x="18" y="23" width="4" height="4" fill="#a855f7" rx="0.8" />
          <rect x="32" y="18" width="5" height="5" fill="#38bdf8" rx="1" />

          {/* Main Stylized 'R' Ribbon (Cyan / Electric Blue) */}
          <path
            d="M 32 28 H 64 C 74 28 80 34 80 43 C 80 52 73 57 62 57 L 48 57 L 68 82 L 53 82 L 36 60 L 48 60 C 58 60 64 57 64 43 C 64 36 59 36 50 36 L 44 36 L 44 82 L 32 82 Z"
            fill="url(#rdsBlueGrad)"
          />

          {/* Connected Stylized 'D'/'S' Ribbon (Silver / Violet Shimmer) */}
          <path
            d="M 52 28 C 68 28 84 34 84 50 C 84 62 76 68 67 70 C 74 72 78 78 78 84 C 78 90 71 94 60 94 C 50 94 44 88 44 82 L 54 82 C 54 86 58 88 62 88 C 66 88 68 86 68 83 C 68 79 64 78 57 78 L 50 78 L 50 70 L 59 70 C 66 70 72 66 72 50 C 72 38 62 36 52 36 Z"
            fill="url(#rdsPurpleGrad)"
            opacity="0.95"
          />

          {/* Bevel highlight */}
          <path
            d="M 32 28 L 64 28 C 70 28 75 31 77 35 L 73 37 C 71 34 68 32 63 32 L 34 32 Z"
            fill="#ffffff"
            opacity="0.6"
          />
        </svg>

        {/* Ambient pulse dot */}
        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse ring-2 ring-[#070b19]" />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight text-white font-sans ${textTitle}`}>
            RDS
          </span>
          <span className={`font-extrabold tracking-wide bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent ${textTitle}`}>
            SMART LEARN
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-medium tracking-wider text-slate-400 uppercase mt-0.5 ${textSub}`}>
            By Rishi Digital Solutions
          </span>
        )}
      </div>
    </div>
  );
};
