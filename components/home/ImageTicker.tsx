// components/home/ImageTicker.tsx
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
];

export default function ImageTicker() {
  // Duplicate the images so the loop wraps seamlessly at -50%
  const tickerImages = [...images, ...images];

  return (
    <div className="w-full overflow-hidden relative">
      <style>{`@keyframes image-ticker { to { transform: translateX(-50%); } }`}</style>
      <div
        className="flex gap-4"
        style={{ animation: "image-ticker 8s linear infinite" }}
      >
        {tickerImages.map((img, i) => (
          <div
            key={`${img.id}-${i}`}
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
      </div>
    </div>
  );
}
