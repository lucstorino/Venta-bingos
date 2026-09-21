import React from 'react';

interface TuBingoLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showTagline?: boolean;
}

export const TuBingoLogo: React.FC<TuBingoLogoProps> = ({
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-2 sm:space-x-3 select-none ${className}`}>
      {/* Mascota Oficial */}
      <img
        src="/D3D6D92C-3883-4894-A39F-3EC814A809D4.PNG"
        alt="Mascota TuBINGO"
        className="h-10 w-10 sm:h-12 sm:w-12 md:h-13 md:w-13 object-contain shrink-0"
        referrerPolicy="no-referrer"
      />

      {/* Logotipo Oficial TuBINGO.com exacto sin alteraciones */}
      <img
        src="/3B50B378-AFBA-476D-A6F1-A37BCC81D27E.PNG"
        alt="TuBINGO.com"
        className="h-8 sm:h-9 md:h-10 w-auto object-contain shrink-0"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
