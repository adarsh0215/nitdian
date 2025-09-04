"use client"
import  Link  from "next/link";
import { useEffect, useState } from "react";


export default function ComingSoon() {
  const endTime = process.env.NEXT_PUBLIC_COMING_SOON_UNTIL!;
  const launchTime = new Date(endTime).getTime();
  const calculateTimeLeft = () => Math.max(launchTime - Date.now(), 0);
  const [timeLeft, setTimeLeft] = useState(launchTime - Date.now());

  useEffect(() => {
    if (timeLeft <= 0) return; // stop updating if already reached 0

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]); // re-run only if timeLeft changes

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-cover bg-center text-white"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      <div className="bg-black bg-opacity-60 p-10 rounded-2xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Launching at 6:00 PM, 4th September
        </h1>

        <div className="text-5xl md:text-7xl font-mono mb-6">
          {formatTime(timeLeft)}
        </div>

        {timeLeft <= 0 && (
          <p>
              <Link
            href="/"
            className="text-xl md:text-2xl font-semibold text-blue-400 underline hover:text-blue-300"
          >
            🎉 We are live! Click here to continue →
          </Link>
          </p>

          
          
        )}
      </div>
    </div>
  );
}

// (ComingSoon as unknown).hideLayout = true;

// export default ComingSoon;