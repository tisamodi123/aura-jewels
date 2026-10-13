'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

// Re-defining a minimal version of the Swiper type to maintain compatibility with existing components
export interface SwiperType {
    slideNext: () => void;
    slidePrev: () => void;
    slideTo: (index: number) => void;
    activeIndex: number;
}

interface CommonSliderProps {
    items: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
    slidesPerView?: number | 'auto';
    spaceBetween?: number;
    loop?: boolean;
    autoplay?: boolean | { delay: number; disableOnInteraction: boolean; pauseOnMouseEnter: boolean };
    speed?: number;
    breakpoints?: { [width: number]: { slidesPerView: number; spaceBetween?: number } };
    onSwiper?: (swiper: SwiperType) => void;
    onSlideChange?: (index: number) => void;
    className?: string;
    disableAutoplayOnDesktop?: boolean;
}

const CommonSlider: React.FC<CommonSliderProps> = ({
    items = [],
    renderItem,
    slidesPerView: defaultSlidesPerView = 1.2,
    spaceBetween: defaultSpaceBetween = 20,
    loop = true,
    autoplay = {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
    },
    speed = 500,
    breakpoints,
    onSwiper,
    onSlideChange,
    className = "",
    disableAutoplayOnDesktop = false
}) => {
    const [mounted, setMounted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(loop && items.length > 0 ? items.length : 0);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const [slidesPerView, setSlidesPerView] = useState<number>(typeof defaultSlidesPerView === 'number' ? defaultSlidesPerView : 1.2);
    const [spaceBetween, setSpaceBetween] = useState<number>(defaultSpaceBetween);
    const [isPaused, setIsPaused] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Track tab visibility to pause autoplay and prevent slider moving to blank space when idle
    useEffect(() => {
        const handleVisibilityChange = () => {
            const visible = !document.hidden;
            setIsVisible(visible);
            if (visible && loop && items.length > 0) {
                setTransitionEnabled(false);
                setCurrentIndex((prev) => {
                    const safeIndex = items.length + (((prev % items.length) + items.length) % items.length);
                    return safeIndex;
                });
            }
        };

        handleVisibilityChange();
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [items.length, loop]);

    // Reset currentIndex if items array changes
    useEffect(() => {
        if (loop && items.length > 0) {
            setCurrentIndex(items.length);
        } else {
            setCurrentIndex(0);
        }
    }, [items.length, loop]);

    // Breakpoint handling
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsDesktop(width >= 1024);
            let currentSPV = typeof defaultSlidesPerView === 'number' ? defaultSlidesPerView : 1.2;
            let currentSB = defaultSpaceBetween;

            if (breakpoints) {
                const sortedBps = Object.keys(breakpoints).map(Number).sort((a, b) => b - a);
                for (const bp of sortedBps) {
                    if (width >= bp) {
                        currentSPV = breakpoints[bp].slidesPerView;
                        if (breakpoints[bp].spaceBetween !== undefined) {
                            currentSB = breakpoints[bp].spaceBetween!;
                        }
                        break;
                    }
                }
            }
            setSlidesPerView(currentSPV);
            setSpaceBetween(currentSB);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        setMounted(true);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoints, defaultSlidesPerView, defaultSpaceBetween]);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }
        };
    }, []);

    const startTransition = useCallback(() => {
        setIsTransitioning(true);
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
        }
        // Fallback backup timeout to prevent slider lockup in case onTransitionEnd doesn't fire
        transitionTimeoutRef.current = setTimeout(() => {
            setIsTransitioning(false);
        }, speed);
    }, [speed]);

    const slideNext = useCallback(() => {
        if (!transitionEnabled || isTransitioning || items.length === 0) return;
        startTransition();
        setCurrentIndex((prev) => prev + 1);
    }, [transitionEnabled, isTransitioning, startTransition, items.length]);

    const slidePrev = useCallback(() => {
        if (!transitionEnabled || isTransitioning || items.length === 0) return;
        startTransition();
        setCurrentIndex((prev) => prev - 1);
    }, [transitionEnabled, isTransitioning, startTransition, items.length]);

    const handleTransitionEnd = useCallback((e: React.TransitionEvent) => {
        if (e.target !== e.currentTarget) return;
        setIsTransitioning(false);
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
        }

        if (!loop || items.length === 0) return;

        if (currentIndex >= items.length * 2) {
            setTransitionEnabled(false);
            const normalized = items.length + ((currentIndex - items.length) % items.length);
            setCurrentIndex(normalized);
        } else if (currentIndex < items.length) {
            setTransitionEnabled(false);
            const normalized = items.length + ((currentIndex - items.length + items.length * 10) % items.length);
            setCurrentIndex(normalized);
        }
    }, [currentIndex, items.length, loop]);

    // Failsafe normalization effect: Ensure currentIndex never stays out of loop bounds
    useEffect(() => {
        if (!loop || items.length === 0) return;

        if (currentIndex >= items.length * 2) {
            const normalized = items.length + ((currentIndex - items.length) % items.length);
            setTransitionEnabled(false);
            setCurrentIndex(normalized);
        } else if (currentIndex < items.length) {
            const normalized = items.length + ((currentIndex - items.length + items.length * 10) % items.length);
            setTransitionEnabled(false);
            setCurrentIndex(normalized);
        }
    }, [currentIndex, items.length, loop]);

    // Re-enable transitions after jump
    useEffect(() => {
        if (!transitionEnabled) {
            const timer = setTimeout(() => {
                setTransitionEnabled(true);
            }, 20);
            return () => clearTimeout(timer);
        }
    }, [transitionEnabled]);

    const slideTo = useCallback((index: number) => {
        if (isTransitioning || items.length === 0) return;
        const target = loop ? items.length + (index % items.length) : index;
        startTransition();
        setCurrentIndex(target);
    }, [items.length, loop, isTransitioning, startTransition]);

    // Notify index change
    useEffect(() => {
        if (onSlideChange && mounted && items.length > 0) {
            const realIndex = loop ? (currentIndex % items.length) : currentIndex;
            onSlideChange(realIndex);
        }
    }, [currentIndex, items.length, loop, mounted, onSlideChange]);

    // Expose methods to parent
    useEffect(() => {
        if (onSwiper && mounted) {
            onSwiper({
                slideNext,
                slidePrev,
                slideTo,
                activeIndex: currentIndex
            });
        }
    }, [onSwiper, slideNext, slidePrev, slideTo, currentIndex, mounted]);

    // Autoplay - pauses when tab is backgrounded
    useEffect(() => {
        const shouldAutoplay = autoplay && !isPaused && mounted && isVisible && items.length > 0 && !(disableAutoplayOnDesktop && isDesktop);
        if (shouldAutoplay) {
            const delay = typeof autoplay === 'object' ? autoplay.delay : 3000;
            const timer = setInterval(() => {
                slideNext();
            }, delay);
            return () => clearInterval(timer);
        }
    }, [autoplay, isPaused, slideNext, mounted, disableAutoplayOnDesktop, isDesktop, isVisible, items.length]);

    // Touch handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const diff = touchStartX.current - touchEndX.current;
        if (diff > 50) slideNext();
        if (diff < -50) slidePrev();
        touchStartX.current = null;
        touchEndX.current = null;
    };

    const slideWidth = useMemo(() => {
        return `calc(${100 / slidesPerView}% - ${(spaceBetween * (slidesPerView - 1)) / slidesPerView}px)`;
    }, [slidesPerView, spaceBetween]);

    if (!mounted || !items || items.length === 0) return null;

    return (
        <div
            className={`custom-slider-container relative overflow-hidden w-full ${className}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                className={`flex ${transitionEnabled ? 'transition-transform duration-700 ease-out' : ''}`}
                style={{
                    transform: `translateX(calc(-${currentIndex} * (${100 / slidesPerView}% + ${spaceBetween / slidesPerView}px)))`,
                    gap: `${spaceBetween}px`
                }}
                onTransitionEnd={handleTransitionEnd}
            >
                {(loop ? [...items, ...items, ...items] : items).map((item, idx) => (
                    <div
                        key={idx}
                        className="flex-shrink-0"
                        style={{ width: slideWidth }}
                    >
                        {renderItem(item, idx % items.length)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommonSlider;
