"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  "/gallery/1.jpeg",
  "/gallery/2.jpeg",
  "/gallery/3.jpeg",
  "/gallery/4.jpeg",
];

export default function GalleryCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    skipSnaps: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  // Track active slide
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  // Gentle autoplay
  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className="relative group">
      {/* Carousel Container */}
      <div
        ref={emblaRef}
        className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
      >
        <div className="flex">
          {images.map((src, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0">
              <div className="relative w-full h-[420px] sm:h-[480px] md:h-[520px] overflow-hidden">
                <Image
                  src={src}
                  alt={`Alumni event photo ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04]"
                />

                {/* Brand-aware overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent dark:from-black/50 dark:via-black/10" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 
                   bg-background/80 backdrop-blur-md
                   border border-border
                   hover:bg-background
                   transition-all duration-[var(--dur-2)]
                   p-2.5 rounded-full shadow-sm
                   opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={18} className="text-foreground" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 
                   bg-background/80 backdrop-blur-md
                   border border-border
                   hover:bg-background
                   transition-all duration-[var(--dur-2)]
                   p-2.5 rounded-full shadow-sm
                   opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={18} className="text-foreground" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2 rounded-full transition-all duration-[var(--dur-2)] ${
              index === selectedIndex
                ? "w-6 bg-primary"
                : "w-2 bg-muted hover:bg-primary/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
