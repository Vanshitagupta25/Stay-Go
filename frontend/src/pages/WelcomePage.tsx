import React, { useEffect, useState } from 'react';
import { ArrowRight, Compass, MapPin } from 'lucide-react';
import {
  WELCOME_DESTINATIONS,
  WELCOME_ROTATION_MS,
  WELCOME_TIMINGS,
  getNextDestinationIndex,
} from '../utils/welcomeConfig';

export interface WelcomePageProps {
  onExplore: () => void;
  isLeaving?: boolean;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onExplore,
  isLeaving = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDestination = WELCOME_DESTINATIONS[activeIndex] ?? WELCOME_DESTINATIONS[0];

  useEffect(() => {
    WELCOME_DESTINATIONS.forEach((destination) => {
      const image = new Image();
      image.src = destination.image;
    });
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) =>
        getNextDestinationIndex(current, WELCOME_DESTINATIONS.length)
      );
    }, WELCOME_ROTATION_MS);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      className={`welcome-page relative flex min-h-screen flex-col overflow-hidden bg-[#151210] text-white ${
        isLeaving ? 'welcome-exit' : ''
      }`}
    >
      <div
        className="welcome-destinations absolute inset-0"
        style={{ animationDelay: `${WELCOME_TIMINGS.destinations}ms` }}
        aria-hidden="true"
      >
        {WELCOME_DESTINATIONS.map((destination, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={destination.id}
              className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={destination.image}
                alt=""
                loading={index === 0 ? 'eager' : 'lazy'}
                className={`h-full w-full object-cover ${
                  isActive ? 'welcome-kenburns' : ''
                }`}
              />
            </div>
          );
        })}

        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/85" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.45)_100%)]" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-32 pt-20 text-center">
        <div
          className="welcome-logo inline-flex items-center gap-3"
          style={{ animationDelay: `${WELCOME_TIMINGS.logo}ms` }}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-lg backdrop-blur-md">
            <Compass className="h-8 w-8 text-[#fe424d]" strokeWidth={2.2} />
          </span>
          <span className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Stay-Go
          </span>
        </div>

        <h1
          className="welcome-title mt-8 max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
          style={{ animationDelay: `${WELCOME_TIMINGS.title}ms` }}
        >
          Find Your Perfect Stay
        </h1>

        <p
          className="welcome-tagline mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
          style={{ animationDelay: `${WELCOME_TIMINGS.tagline}ms` }}
        >
          Handpicked villas, cabins and escapes in the destinations you love.
        </p>

        <button
          type="button"
          onClick={onExplore}
          style={{ animationDelay: `${WELCOME_TIMINGS.cta}ms` }}
          className="welcome-cta group mt-10 inline-flex cursor-pointer items-center gap-4 rounded-full bg-[#fe424d] px-7 py-4 text-sm font-semibold text-white shadow-2xl shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e03a45] hover:shadow-[#fe424d]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black/50 sm:text-base"
        >
          <span>Explore your perfect stay</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </span>
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-24 z-20 flex justify-center px-6 sm:justify-start sm:px-8 lg:px-12">
        <div
          className="welcome-destination-chip inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-black/25 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-md sm:text-sm"
          style={{ animationDelay: `${WELCOME_TIMINGS.destinations + 300}ms` }}
        >
          <MapPin className="h-4 w-4 text-[#fe424d]" />
          <span className="font-semibold text-white">{activeDestination.name}</span>
          <span className="hidden text-white/45 sm:inline">·</span>
          <span className="hidden text-white/60 sm:inline">{activeDestination.subtitle}</span>
        </div>
      </div>

      <footer className="welcome-copyright absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/20 px-6 py-4 text-center text-[11px] tracking-wide text-white/65 backdrop-blur-sm sm:text-xs">
        {"\u00A9"} 2026 Stay-Go Inc. All rights reserved.
      </footer>
    </section>
  );
};
