'use client';

import React from 'react';

interface CountryFlagProps {
  code: string;
  name: string;
  className?: string;
}

export default function CountryFlag({ code, name, className = 'w-5 h-4 object-cover rounded-sm shadow-sm inline-block' }: CountryFlagProps) {
  // Special case: international / non-standard codes
  if (!code || code.length !== 2) {
    const isIntl = code === 'intl';
    return <span className="text-2xl select-none" title={name}>{isIntl ? '🌐' : '🏳️'}</span>;
  }

  const cleanCode = code.toLowerCase();
  
  // Custom mapping for any non-standard codes if needed
  // (though search.ts maps everything cleanly to 2-letter country codes)
  
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w80/${cleanCode}.png`}
      alt={`${name} flag`}
      className={`${className} select-none`}
      loading="lazy"
      onError={(e) => {
        // Fallback to emoji if CDN fails
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
      }}
    />
  );
}
