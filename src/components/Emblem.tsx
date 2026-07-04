import React from 'react';

interface EmblemProps {
  className?: string;
  size?: number;
}

export const Emblem: React.FC<EmblemProps> = ({ className = '', size = 56 }) => {
  return (
    <div 
      className={`relative flex items-center justify-center rounded-lg bg-linear-to-b from-[#e30a17] to-[#9e050c] shadow-lg overflow-hidden border-2 border-amber-500/20 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />
      
      {/* Emblem SVG with crescent and star */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-4/5 h-4/5 text-white fill-current drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
      >
        {/* Crescent */}
        <path d="M48,15 A30,30 0 1,0 78,45 A25,25 0 1,1 48,15 Z" />
        
        {/* Star */}
        <polygon 
          points="68,36 71,45 80,45 73,50 76,59 68,53 60,59 63,50 56,45 65,45"
          transform="rotate(18 68 47.5)"
        />
      </svg>
    </div>
  );
};
