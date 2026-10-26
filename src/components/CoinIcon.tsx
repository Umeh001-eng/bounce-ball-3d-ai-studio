import React from 'react';

interface CoinIconProps {
  className?: string;
  size?: number;
}

export const CoinIcon: React.FC<CoinIconProps> = ({ className = '', size = 20 }) => {
  return (
    <img
      src="/assets/aistudio/IMG_0741_9c2ce743.jpeg"
      alt="3D Coin"
      width={size}
      height={size}
      className={`inline-block object-contain rounded-full flex-shrink-0 drop-shadow-[0_2px_5px_rgba(245,158,11,0.5)] ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};
