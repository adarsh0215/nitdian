// components/home/ImageTicker.tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type TickerImage = {
  id: number | string;
  src: string;
  alt: string;
};

const images: TickerImage[] = [
  { id: 1, src: "/images/gallery/gallerya.jpeg", alt: "Alumni event 1" },
  { id: 2, src: "/images/gallery/galleryb.jpeg", alt: "Alumni event 2" },
  { id: 3, src: "/images/gallery/galleryc.jpeg", alt: "Alumni event 3" },
  { id: 4, src: "/images/gallery/galleryd.jpeg", alt: "Alumni event 4" },
  { id: 5, src: "/images/gallery/gallerye.jpeg", alt: "Alumni event 5" },
  // { id: 6, src: "/images/gallery/gallery6.jpeg", alt: "Alumni event 6" },
];

export default function ImageTicker() {
  // Duplicate the images so it loops smoothly
  const tickerImages = [...images, ...images];

  return (
    <div className="w-full overflow-hidden relative">
      <motion.div
        className="flex gap-4"
        initial={{ x: 0 }}
        animate={{ x: "-50%" }} // Move half since images are duplicated
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 40, // speed of the ticker
        }}
      >
        {tickerImages.map((img) => (
          <div
            key={`${img.id}-${Math.random()}`}

            className="
              flex-shrink-0
              w-full
              sm:w-1/2
              lg:w-1/3
              relative
              rounded-xl
              overflow-hidden
              border
              border-border
              shadow-sm
              hover:shadow-md
              transition-all
              duration-300
            "
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={500}
              height={300}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
