
'use client';

import Image, { ImageProps } from 'next/image';

interface WatermarkedImageProps extends ImageProps {
  watermarkText?: string;
}

export function WatermarkedImage({ watermarkText = "cuddleia", ...props }: WatermarkedImageProps) {
  return (
    <div className="relative w-full h-auto">
      <Image
        {...props}
        className="object-cover w-full h-auto"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span 
          className="text-6xl md:text-8xl font-bold text-white/20 -rotate-45 select-none"
        >
          {watermarkText}
        </span>
      </div>
    </div>
  );
}
