'use client';

import React, { useState, useRef } from 'react';
import { Play, Pause, X } from 'lucide-react';
import { PREFIX } from '@/lib/constants';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { getImageUrl } from '@/lib/utils';

import 'swiper/css';
import OurServices from './OurServices';

interface ReelItem {
  id: number;
  videoUrl: string;
  title: string;
  fallbackImage?: string;
  redirectUrl?: string;
}

const DEFAULT_REELS: ReelItem[] = [
  { id: 1, videoUrl: `${PREFIX}/videos/Reel1.mp4`, title: 'Diamond Elegance' },
  { id: 2, videoUrl: `${PREFIX}/videos/Reel2.mp4`, title: 'Bespoke Bracelet' },
  { id: 3, videoUrl: `${PREFIX}/videos/Reel3.mp4`, title: 'Vintage Earring' },
  { id: 4, videoUrl: `${PREFIX}/videos/Reel4.mp4`, title: 'Statement Ring' },
  { id: 5, videoUrl: `${PREFIX}/videos/Reel5.mp4`, title: 'Solitaire Pendant' },
  { id: 6, videoUrl: `${PREFIX}/videos/Reel6.mp4`, title: 'Classic Bangle' },
];

interface EndlessMemoriesProps {
  data?: {
    subTitle?: string;
    heading?: string;
    items?: Array<{
      video?: string;
      image?: string;
      redirect?: { href?: string, url?: string };
    }>;
  };
}

export const EndlessMemories: React.FC<EndlessMemoriesProps> = ({ data }) => {
  const [activeModalVideo, setActiveModalVideo] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  const handleTogglePlay = (id: number, redirectUrl?: string) => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }

    const video = videoRefs.current[id];
    if (!video) return;

    if (video.paused) {
      // Pause all other videos
      Object.entries(videoRefs.current).forEach(([k, v]) => {
        if (v && Number(k) !== id) {
          v.pause();
        }
      });
      video.play().catch(() => { });
      setPlayingId(id);
    } else {
      video.pause();
      setPlayingId(null);
    }
  };

  const cmsReels: ReelItem[] | undefined = data?.items?.map((item, index) => ({
    id: index + 1,
    videoUrl: getImageUrl(item.video) || "",
    title: `Video ${index + 1}`,
    fallbackImage: getImageUrl(item.image) || "",
    redirectUrl: item.redirect?.href || item.redirect?.url || ""
  })).filter(reel => reel.videoUrl || reel.fallbackImage);

  const REELS = cmsReels && cmsReels.length > 0 ? cmsReels : DEFAULT_REELS;

  const displayReels = REELS;

  return (
    <>
      <section className="bg-white py-12 md:py-20 px-4 md:px-8 border-t border-gray-100 overflow-hidden">
        <div className="max-w-[1700px] mx-auto">
          {/* Top Header */}
          <div className="text-center max-w-4xl mx-auto mb-10 md:mb-14">
            <p className="text-[11px] md:text-[12px] uppercase tracking-[0.45em] text-stone-500 font-bold mb-3 font-instrument-sans">
              {data?.subTitle || "ENDLESS MEMORIES"}
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-[36px] xl:text-[38px] leading-[1.3] text-[#1A1A1A] font-cormorant-garamond font-light max-w-4xl mx-auto px-2">
              {data?.heading || "Make Every Moment Unforgettable With Pieces That Capture The Beauty Of Your Story."}
            </h2>
          </div>

          {/* Swiper Reels Slider */}
          <div className="relative px-1 group/carousel">
            <Swiper
              modules={[Autoplay]}
              spaceBetween={16}
              slidesPerView={1.4}
              breakpoints={{
                480: { slidesPerView: 2.2, spaceBetween: 16 },
                640: { slidesPerView: 2.8, spaceBetween: 18 },
                768: { slidesPerView: 3.5, spaceBetween: 20 },
                1024: { slidesPerView: 4.8, spaceBetween: 20 },
                1280: { slidesPerView: 5.5, spaceBetween: 20 },
                1536: { slidesPerView: 6, spaceBetween: 22 },
              }}
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
              }}
              grabCursor={true}
              className="w-full !py-2"
            >
              {displayReels.map((reel, idx) => {
                const uniqueKey = `${reel.id}-${idx}`;
                const isPlaying = playingId === reel.id;

                return (
                  <SwiperSlide key={uniqueKey} className="h-auto">
                    <div
                      className="group relative aspect-[9/16] w-full rounded-xs overflow-hidden bg-stone-100 shadow-xs cursor-pointer select-none"
                      onClick={() => handleTogglePlay(reel.id, reel.redirectUrl)}
                    >
                      {/* Video or Image Element */}
                      {reel.videoUrl ? (
                        <video
                          ref={(el) => {
                            videoRefs.current[reel.id] = el;
                          }}
                          src={reel.videoUrl}
                          loop
                          muted
                          playsInline
                          autoPlay
                          preload="metadata"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <img
                          src={reel.fallbackImage}
                          alt="Fallback"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}

                      {/* Aura Top Left Logo Badge */}
                      <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-[2px] px-2.5 py-1 flex flex-col justify-center rounded-[2px] shadow-xs pointer-events-none">
                        <span className="text-[10px] md:text-[11px] font-serif font-bold tracking-[0.12em] text-black uppercase leading-none">
                          Aurajewels
                        </span>
                        <span className="text-[5.5px] font-instrument-sans tracking-[0.15em] text-gray-500 uppercase leading-none mt-[2px]">
                          NEW YORK
                        </span>
                      </div>



                      {/* Bottom Shadow Gradient */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>

        {/* Video Modal if clicked */}
        {activeModalVideo && (
          <div
            className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setActiveModalVideo(null)}
          >
            <div
              className="relative max-w-sm w-full aspect-[9/16] bg-black rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModalVideo(null)}
                className="absolute top-4 right-4 z-20 text-white bg-black/50 p-2 rounded-full hover:bg-black/80"
              >
                <X size={20} />
              </button>
              <video src={activeModalVideo} controls autoPlay className="w-full h-full object-cover" />
            </div>
          </div>
        )}






      </section>

      {/* Our Services Icon Section */}
      <OurServices />
    </>
  );
};

export default EndlessMemories;
