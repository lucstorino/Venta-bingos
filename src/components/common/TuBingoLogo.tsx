import React from 'react';

interface TuBingoLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showTagline?: boolean;
}

export const TuBingoLogo: React.FC<TuBingoLogoProps> = ({
  className = '',
  variant = 'light',
}) => {
  return (
    <div className={`brand inline-flex items-center select-none ${className}`}>
      {/* Logo Oficial de TuBINGO.com (Nombre de la página) */}
      <img
        src="/logo_tubingo.png"
        alt="TuBINGO.com"
        className={`brand-logo h-8 sm:h-9 md:h-10 w-auto max-w-full object-contain shrink-0 transition-transform duration-200 hover:scale-[1.03] ${
          variant === 'dark' ? 'drop-shadow-[0_2px_10px_rgba(255,255,255,0.14)] brightness-105' : 'drop-shadow-xs'
        }`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
