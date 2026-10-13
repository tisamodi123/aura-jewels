'use client';

import React from 'react';

interface HeaderAnnouncementBarProps {
  isScrolled: boolean;
}

export const HeaderAnnouncementBar: React.FC<HeaderAnnouncementBarProps> = ({ isScrolled }) => (
  <div
    className={`transition-all duration-500 ease-in-out overflow-hidden bg-[#A96D56] ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-[80px] opacity-100'
      }`}
    style={{ willChange: 'max-height, opacity' }}
  >
    <div className="text-white text-[9.5px] min-[360px]:text-[10.5px] sm:text-[12px] py-2 px-2 sm:px-6 lg:px-10 xl:px-16 font-jakarta">
      <div className="flex flex-col md:flex-row justify-between items-center gap-y-1.5 md:gap-y-0 font-medium tracking-wide">
        <span className="text-center md:text-left">
          Elevate Your Style with Stunning, Unique Gemstone Jewelry
        </span>
        <span className="text-center md:text-right opacity-95">
          Call : +91 98765 43210 &nbsp;|&nbsp; Mail : support@aurajewels.com
        </span>
      </div>
    </div>
  </div>
);

export default HeaderAnnouncementBar;
