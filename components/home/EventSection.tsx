type EventCardProps = {
  variant?: "hero" | "compact";
};

export default function EventCard({ variant = "compact" }: EventCardProps) {
  const isHero = variant === "hero";

  return (
    <div
      className={`
        bg-white border border-gray-100
        ${isHero ? "rounded-3xl shadow-lg p-14 text-center" : "rounded-2xl shadow-sm p-6"}
      `}
    >
      {/* Badge */}
      <div className={isHero ? "mb-8 flex justify-center" : "mb-4"}>
        <span className="inline-block text-xs font-semibold bg-black text-white px-3 py-1 rounded-full">
          Upcoming Alumni Meet
        </span>
      </div>

      {/* Title */}
      <h2
        className={`
          font-bold text-gray-900 tracking-tight
          ${isHero ? "text-4xl mb-10" : "text-xl mb-5"}
        `}
      >
        NITDIAN Delhi Get Together
      </h2>

      {/* Event Info */}
      <div
        className={`
          space-y-3 text-gray-700
          ${isHero ? "text-lg" : "text-sm"}
        `}
      >
        <p>
          📅 <strong>Sunday, 22nd February</strong>
        </p>
        <p>
          🕛 <strong>12 Noon – 4 PM</strong>
        </p>
        <p>
          📍 <strong>Panchshila Club, New Delhi</strong>
        </p>
      </div>

      {/* Description */}
      <p
        className={`
          text-gray-600 mt-6 leading-relaxed
          ${isHero ? "max-w-2xl mx-auto text-base" : "text-sm"}
        `}
      >
        Join fellow NIT Durgapur alumni for reconnecting and networking.
      </p>

      {/* CTA */}
      <div className={isHero ? "mt-12 flex justify-center" : "mt-6"}>
        <a
          href="https://forms.gle/CLgydgkvPh1UgxwF8"
          target="_blank"
          rel="noopener noreferrer"
          className={`
            inline-block bg-black text-white font-medium
            ${isHero ? "px-8 py-3 rounded-xl text-base" : "px-6 py-2.5 rounded-lg text-sm"}
            hover:opacity-90 transition
          `}
        >
          Register Now
        </a>
      </div>

      {/* Divider */}
      <div className="mt-12 border-t border-gray-100" />

      {/* Payment Section */}
      <div className={`pt-8 ${isHero ? "text-left" : ""}`}>
        <h3 className="text-sm font-semibold text-gray-900 mb-6">
          Payment Details
        </h3>

        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-4 text-sm text-gray-600">
          {/* Left */}
          <div className="space-y-2">
            <p>
              <span className="font-medium text-gray-900">Account Holder:</span>{" "}
              NITDIAN Delhi
            </p>
            <p>
              <span className="font-medium text-gray-900">Account Number:</span>{" "}
              2413023461
            </p>
            <p>
              <span className="font-medium text-gray-900">IFSC Code:</span>{" "}
              KKBK0000198
            </p>
          </div>

          {/* Right */}
          <div className="space-y-2">
            <p>
              <span className="font-medium text-gray-900">Bank:</span> Kotak
              Mahindra Bank Ltd.
            </p>
            <p>
              <span className="font-medium text-gray-900">Branch:</span> M-57,
              Lajpat Nagar II
            </p>
            <p>New Delhi – 110024</p>
          </div>
        </div>
      </div>
    </div>
  );
}
