'use client';
// components/shop/ProductGallery.tsx
import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-cream-200 flex items-center justify-center">
        <span className="font-serif text-6xl text-cream-300">✦</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square bg-cream-100 overflow-hidden">
        <Image
          src={images[selected]}
          alt={`${name} - image ${selected + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(idx)}
              className={`relative w-20 aspect-square overflow-hidden transition-all duration-200 ${
                selected === idx
                  ? 'ring-2 ring-gold-300 ring-offset-1'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
