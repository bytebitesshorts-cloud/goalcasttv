'use client';
import React, { useState } from 'react';

interface Slide {
  image: string;
  link: string;
  title?: string;
}

interface SliderTemplateProps {
  slides: Slide[];
  /** Optional className for outer container */
  className?: string;
}

export default function SliderTemplate({ slides, className }: SliderTemplateProps) {
  const [current, setCurrent] = useState(0);

  if (!slides || slides.length === 0) return null;

  const goPrev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const goNext = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className={`relative overflow-hidden rounded-xl ${className ?? ''}`}>
      <a href={slides[current].link} target="_self" className="block relative group">
        <img
          src={slides[current].image}
          alt={slides[current].title ?? `Slide ${current + 1}`}
          className="w-full h-auto aspect-video object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
        />
        {slides[current].title && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 pointer-events-none">
            <h2 className="text-white text-2xl md:text-4xl font-extrabold shadow-black drop-shadow-lg">
              {slides[current].title}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                Live Now
              </span>
            </div>
          </div>
        )}
      </a>
      {/* Navigation arrows */}
      <button
        type="button"
        onClick={goPrev}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-emerald-500/70 text-white p-1 hover:bg-emerald-600 transition"
      >
        &#9664;
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-emerald-500/70 text-white p-1 hover:bg-emerald-600 transition"
      >
        &#9654;
      </button>
      {/* Indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full ${idx === current ? 'bg-emerald-600' : 'bg-emerald-300'}`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
