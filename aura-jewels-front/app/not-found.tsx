import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl md:text-8xl serif mb-6 opacity-20">404</h1>
      <h2 className="text-2xl md:text-3xl serif mb-8">Whisper of Brilliance Lost</h2>
      <p className="text-gray-500 font-jakarta max-w-md mb-12 leading-relaxed">
        The piece you are looking for has eluded us. It may have been moved, or perhaps it was a ephemeral spark that has now faded.
      </p>
      <Link 
        href="/"
        className="px-12 py-4 bg-[#013D3D] text-white text-[11px] font-black uppercase tracking-widest font-jakarta hover:bg-[#1A1A1A] transition-all"
      >
        Return to Home
      </Link>
    </div>
  );
}
