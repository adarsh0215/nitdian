// components/PosterPlain.tsx
import React from "react";

export default function PosterPlain() {
  return (
    <div className="flex justify-center my-6">
      <img
        src="/events/poster.jpg"
        alt="Event Poster"
        style={{ maxWidth: 400, width: "100%", maxHeight: 420, height: "auto" }}
        className="rounded-xl shadow-lg object-contain"
      />
    </div>
  );
}
