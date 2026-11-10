import React, { useId } from 'react';

export const CardBack: React.FC = () => {
  const patternId = `card-back-${useId().replace(/:/g, '')}`;

  return (
    <svg
      viewBox="0 0 240 336"
      aria-hidden
      className="block w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern
          id={patternId}
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="16" height="16" fill="#B11F2B" />
          <rect width="8" height="16" fill="#FFFFFF" opacity="0.28" />
          <rect width="16" height="8" fill="#FFFFFF" opacity="0.28" />
        </pattern>
      </defs>
      <rect x="0.5" y="0.5" width="239" height="335" rx="12" fill="#FFFFFF" stroke="#000000" strokeOpacity="0.55" />
      <rect x="13" y="13" width="214" height="310" rx="9" fill={`url(#${patternId})`} />
      <rect
        x="19"
        y="19"
        width="202"
        height="298"
        rx="6"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.7"
        strokeWidth="2"
      />
    </svg>
  );
};
