'use client'

import { useState } from 'react'

interface ImageCarouselProps {
  images: string[]
  alt: string
}

export default function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)
  const hasImages = images.length > 0

  function next() {
    if (images.length > 1) setCurrent((c) => (c + 1) % images.length)
  }

  function prev() {
    if (images.length > 1) setCurrent((c) => (c - 1 + images.length) % images.length)
  }

  return (
    <section className="relative h-[360px] sm:h-[440px] md:h-[520px] lg:h-[580px] rounded-xl overflow-hidden mb-8 group">
      {/* Image */}
      {hasImages ? (
        <img
          src={images[current]}
          alt={`${alt} - Fotoğraf ${current + 1}`}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
          <span className="material-symbols-outlined text-[80px] text-orange-200">pets</span>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all cursor-pointer active:scale-90"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          </div>
          <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={next}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all cursor-pointer active:scale-90"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? 'w-8 h-1.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
