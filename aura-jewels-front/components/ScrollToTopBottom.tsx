'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const ScrollToTopBottom = () => {
  const [isNearTop, setIsNearTop] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const currentScroll = window.scrollY;
      if (currentScroll > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      if (currentScroll < (scrollHeight - clientHeight) * 0.4) {
        setIsNearTop(true);
      } else {
        setIsNearTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    if (isNearTop) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div 
      className={`fixed bottom-28 right-8 z-[9999] transition-all duration-500 transform scroll-to-top-bottom ${
        isVisible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-10 opacity-0 pointer-events-none'
      }`}
    >
      <button
        onClick={handleClick}
        className="group relative flex h-11 w-11 lg:h-14 lg:w-14 items-center justify-center overflow-hidden bg-[#A96D56] text-white shadow-2xl transition-all duration-500 hover:bg-[#995e48] hover:scale-105 active:scale-95 rounded-full animate-glow-pulse"
        aria-label={isNearTop ? "Scroll to Bottom" : "Scroll to Top"}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" /> 
        <div className="relative h-5 w-5 lg:h-6 lg:w-6">
          <ChevronUp
            className={`absolute inset-0 h-full w-full transition-all duration-500 ${
              isNearTop ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'
            }`}
          />
          <ChevronDown
            className={`absolute inset-0 h-full w-full transition-all duration-500 ${
              isNearTop ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
            }`}
          />
        </div>
        <div className="absolute -inset-1 bg-[#A96D56] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
      </button>
    </div>
  );
};

export default ScrollToTopBottom;
