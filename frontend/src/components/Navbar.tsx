import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Compass,
  Search,
  Plus,
  User,
  LogOut,
  X,
  Calendar as CalendarIcon,
  Heart,
  CalendarCheck,
  MapPin,
  Users,
  Minus,
  Sparkles,
} from 'lucide-react';
import { TwoMonthCalendar } from './TwoMonthCalendar';
import { LogoutModal } from './LogoutModal';
import {
  PROFILE_MENU_EDGE_MARGIN,
  PROFILE_MENU_MIN_TOP,
  getProfileDropdownPosition,
} from '../utils/profileDropdown';

interface NavbarProps {
  user: any;
  onOpenCreateModal: () => void;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  onOpenWishlist?: () => void;
  onOpenBookings?: () => void;
  isModalOpen?: boolean;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: (val: string) => void;
  checkIn?: string;
  checkOut?: string;
  onDatesChange?: (checkIn: string, checkOut: string) => void;
  guests?: number;
  onGuestsChange?: (guests: number) => void;
}

const POPULAR_DESTINATIONS = [
  { name: 'Goa', state: 'India', subtitle: 'Beaches & coastal villas' },
  { name: 'Mumbai', state: 'Maharashtra', subtitle: 'Iconic skyline & sea view' },
  { name: 'Manali', state: 'Himachal', subtitle: 'Snow peaks & wooden cabins' },
  { name: 'Jaipur', state: 'Rajasthan', subtitle: 'Royal palaces & havelis' },
  { name: 'Delhi', state: 'NCR', subtitle: 'Heritage monuments & culture' },
  { name: 'Kerala', state: 'India', subtitle: 'Tranquil backwaters & palms' },
];

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenCreateModal,
  onOpenAuthModal,
  onLogout,
  onOpenWishlist,
  onOpenBookings,
  isModalOpen = false,
  searchQuery: externalSearchQuery,
  onSearchSubmit,
  checkIn,
  checkOut,
  onDatesChange,
  guests = 0,
  onGuestsChange,
}) => {
  const [internalQuery, setInternalQuery] = useState(externalSearchQuery || '');
  const [activeToggle, setActiveToggle] = useState<'where' | 'when' | 'who' | null>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profileMenuPosition, setProfileMenuPosition] = useState({
    top: PROFILE_MENU_MIN_TOP,
    right: PROFILE_MENU_EDGE_MARGIN,
  });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [adults, setAdults] = useState(guests > 0 ? guests : 0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInternalQuery(externalSearchQuery || '');
  }, [externalSearchQuery]);

  useEffect(() => {
    if (guests !== adults + children) {
      setAdults(guests > 0 ? guests : 0);
      setChildren(0);
      setInfants(0);
    }
  }, [guests]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setActiveToggle(null);
        setIsMobileExpanded(false);
      }
      if (
        profileButtonRef.current &&
        !profileButtonRef.current.contains(target) &&
        (!profileMenuRef.current || !profileMenuRef.current.contains(target))
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleProfileMenu = () => {
    if (isProfileDropdownOpen) {
      setIsProfileDropdownOpen(false);
      return;
    }

    const trigger = profileButtonRef.current;
    if (trigger) {
      setProfileMenuPosition(
        getProfileDropdownPosition(trigger.getBoundingClientRect(), window.innerWidth),
      );
    }
    setIsProfileDropdownOpen(true);
  };

  useEffect(() => {
    if (!isProfileDropdownOpen) return;

    const handleResize = () => {
      const trigger = profileButtonRef.current;
      if (!trigger) return;

      setProfileMenuPosition(
        getProfileDropdownPosition(trigger.getBoundingClientRect(), window.innerWidth),
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isProfileDropdownOpen]);

  const totalGuests = adults + children;

  const handleGuestsUpdate = (newAdults: number, newChildren: number, newInfants: number) => {
    setAdults(newAdults);
    setChildren(newChildren);
    setInfants(newInfants);
    if (onGuestsChange) {
      onGuestsChange(newAdults + newChildren);
    }
  };

  const executeSearch = () => {
    if (onSearchSubmit) {
      onSearchSubmit(internalQuery);
    }
    setActiveToggle(null);
    setIsMobileExpanded(false);
  };

  const formatShortDate = (isoStr?: string) => {
    if (!isoStr) return '';
    const [y, m, d] = isoStr.split('-').map(Number);
    if (!y || !m || !d) return '';
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatLastActive = (lastActiveDate?: string | Date) => {
    if (!lastActiveDate) {
      return { text: 'Active now', isLive: true };
    }
    try {
      const date = new Date(lastActiveDate);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 3) {
        return { text: 'Active now', isLive: true };
      } else if (diffMinutes < 60) {
        return { text: `Active ${diffMinutes}m ago`, isLive: false };
      } else if (diffMinutes < 24 * 60) {
        const hours = Math.floor(diffMinutes / 60);
        return { text: `Active ${hours}h ago`, isLive: false };
      } else {
        return {
          text: `Active ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          isLive: false,
        };
      }
    } catch {
      return { text: 'Active recently', isLive: true };
    }
  };

  const username = user?.username || user?.name || '';
  const email = user?.email || '';
  const initial = (username || email || 'U').trim().charAt(0).toUpperCase();
  const lastActiveInfo = formatLastActive(user?.lastActive || user?.updatedAt);
  const wishlistCount = Array.isArray(user?.wishlist) ? user.wishlist.length : 0;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 shadow-[0_1px_2px_rgba(28,25,23,0.04)] backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-[1920px] items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6 lg:gap-4 lg:px-12 xl:px-14 2xl:px-16">

          
          <div className="flex shrink-0 items-center gap-3">
            <a href="/" className="flex items-center gap-2 text-xl font-bold text-[#fe424d] transition hover:opacity-90">
              <Compass className="h-8 w-8" />
              <span className="hidden font-bold tracking-tight lg:inline text-[22px]">Stay-Go</span>
            </a>
          </div>

          
          <div className="relative mx-0 min-w-0 max-w-2xl flex-1 sm:mx-2 lg:mx-3" ref={searchContainerRef}>

            
            <div
              className={`hidden md:flex w-full min-w-0 items-center h-14 rounded-full border transition-all duration-200 ${activeToggle
                ? 'bg-gray-100/90 border-gray-300 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
            >
              
              <div
                onClick={() => {
                  setActiveToggle('where');
                  setTimeout(() => destinationInputRef.current?.focus(), 50);
                }}
                className={`flex h-full min-w-0 flex-1 basis-0 flex-col justify-center rounded-full px-4 cursor-pointer select-none transition-all duration-150 lg:px-5 ${activeToggle === 'where'
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-gray-100/60'
                  }`}
              >
                <span className="text-[12px] font-medium text-gray-800">
                  Where
                </span>
                <div className="flex min-w-0 items-center justify-between">
                  <input
                    ref={destinationInputRef}
                    type="text"
                    value={internalQuery}
                    onChange={(e) => setInternalQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        executeSearch();
                      }
                    }}
                    placeholder="Search destinations"
                    className="w-full min-w-0 bg-transparent text-[13px] sm:text-sm font-normal text-gray-800 placeholder:text-gray-500 placeholder:font-normal border-0 border-none outline-none focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 shadow-none focus:shadow-none truncate"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                  />
                  {internalQuery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInternalQuery('');
                        if (onSearchSubmit) onSearchSubmit('');
                      }}
                      className="text-gray-400 hover:text-gray-700 p-0.5 rounded-full hover:bg-gray-200 transition shrink-0 ml-1 cursor-pointer"
                      title="Clear destination"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              
              {activeToggle !== 'where' && activeToggle !== 'when' && (
                <div className="w-px h-6 bg-gray-200 shrink-0" />
              )}

              
              <div
                onClick={() => setActiveToggle(activeToggle === 'when' ? null : 'when')}
                className={`flex h-full min-w-0 flex-1 basis-0 flex-col justify-center rounded-full px-4 cursor-pointer select-none transition-all duration-150 lg:px-5 ${activeToggle === 'when'
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-gray-100/60'
                  }`}
              >
                <span className="text-[12px] font-medium text-gray-800">
                  When
                </span>
                <div className="flex min-w-0 items-center justify-between">
                  <span
                    className={`min-w-0 truncate text-[13px] sm:text-sm ${checkIn && checkOut
                      ? 'font-medium text-gray-800'
                      : 'text-gray-500 font-normal'
                      }`}
                  >
                    {checkIn && checkOut
                      ? `${formatShortDate(checkIn)} - ${formatShortDate(checkOut)}`
                      : checkIn
                        ? `${formatShortDate(checkIn)} - Out`
                        : 'Add dates'}
                  </span>
                  {checkIn && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDatesChange) onDatesChange('', '');
                      }}
                      className="text-gray-400 hover:text-gray-700 p-0.5 rounded-full hover:bg-gray-200 transition shrink-0 ml-1 cursor-pointer"
                      title="Clear dates"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              
              {activeToggle !== 'when' && activeToggle !== 'who' && (
                <div className="w-px h-6 bg-gray-200 shrink-0" />
              )}

              
              <div
                onClick={() => setActiveToggle(activeToggle === 'who' ? null : 'who')}
                className={`flex h-full min-w-0 flex-1 basis-0 items-center justify-between gap-1 rounded-full pl-4 pr-1.5 cursor-pointer select-none transition-all duration-150 lg:pl-5 lg:pr-2 ${activeToggle === 'who'
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-gray-100/60'
                  }`}
              >
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <span className="text-[12px] font-medium text-gray-800">
                    Who
                  </span>
                  <span
                    className={`text-[13px] sm:text-sm truncate ${totalGuests > 0 ? 'font-medium text-gray-800' : 'text-gray-500 font-normal'
                      }`}
                  >
                    {totalGuests > 0
                      ? `${totalGuests} ${totalGuests === 1 ? 'guest' : 'guests'}${infants > 0 ? `, ${infants} infant` : ''
                      }`
                      : 'Add guests'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {totalGuests > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGuestsUpdate(0, 0, 0);
                      }}
                      className="text-gray-400 hover:text-gray-700 p-0.5 rounded-full hover:bg-gray-200 transition cursor-pointer"
                      title="Clear guests"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}

                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      executeSearch();
                    }}
                    className="bg-[#fe424d] hover:bg-[#e03a45] text-white p-2.5 rounded-full shadow-sm hover:shadow-md transition active:scale-95 flex items-center justify-center cursor-pointer"
                    title="Search stays"
                  >
                    <Search className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => {
                  setIsMobileExpanded((prev) => !prev);
                  setActiveToggle(null);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-white border border-gray-300 rounded-full shadow-xs text-left"
              >
                <Search className="w-4 h-4 text-[#fe424d] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {internalQuery || 'Anywhere'}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {checkIn && checkOut
                      ? `${formatShortDate(checkIn)} - ${formatShortDate(checkOut)}`
                      : 'Any week'}{' '}
                    • {totalGuests > 0 ? `${totalGuests} guests` : 'Add guests'}
                  </p>
                </div>
              </button>

              
              <AnimatePresence>
                {isMobileExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-x-3 top-[84px] z-50 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-4 shadow-2xl sm:inset-x-4"
                  >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                    <span className="text-sm font-bold text-gray-900">Plan your trip</span>
                    <button
                      type="button"
                      onClick={() => setIsMobileExpanded(false)}
                      className="p-1 text-gray-400 hover:text-gray-700 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Where
                    </label>
                    <input
                      type="text"
                      value={internalQuery}
                      onChange={(e) => setInternalQuery(e.target.value)}
                      placeholder="Search destinations"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-[13px] font-normal text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                  </div>

                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileExpanded(false);
                        setActiveToggle('when');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition ${activeToggle === 'when'
                        ? 'border-gray-400 bg-gray-50'
                        : 'border-gray-200 bg-gray-50/50'
                        }`}
                    >
                      <span className="block text-xs font-medium text-gray-700">When</span>
                      <span className="block text-[13px] font-normal text-gray-500 truncate">
                        {checkIn && checkOut ? `${formatShortDate(checkIn)}-${formatShortDate(checkOut)}` : 'Add dates'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileExpanded(false);
                        setActiveToggle('who');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition ${activeToggle === 'who'
                        ? 'border-gray-400 bg-gray-50'
                        : 'border-gray-200 bg-gray-50/50'
                        }`}
                    >
                      <span className="block text-xs font-medium text-gray-700">Who</span>
                      <span className="block text-[13px] font-normal text-gray-500 truncate">
                        {totalGuests > 0 ? `${totalGuests} guests` : 'Add guests'}
                      </span>
                    </button>
                  </div>

                  
                  <button
                    type="button"
                    onClick={executeSearch}
                    className="w-full flex items-center justify-center gap-2 bg-[#fe424d] hover:bg-[#e03a45] text-white py-2.5 rounded-full text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            
            <AnimatePresence>
              {activeToggle === 'where' && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed inset-x-3 top-[84px] z-50 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl sm:inset-x-4 md:absolute md:inset-x-auto md:left-0 md:top-full md:mt-3 md:w-[420px] md:p-6"
                >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#fe424d]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Suggested Destinations
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveToggle(null)}
                    className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <button
                      key={dest.name}
                      type="button"
                      onClick={() => {
                        setInternalQuery(dest.name);
                        setActiveToggle('when');
                      }}
                      className="group flex items-start gap-2.5 p-2.5 rounded-2xl hover:bg-rose-50/60 border border-transparent hover:border-rose-100 transition text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-rose-100 text-gray-500 group-hover:text-[#fe424d] flex items-center justify-center shrink-0 transition">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 group-hover:text-[#fe424d] transition truncate">
                          {dest.name}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {dest.subtitle}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                </motion.div>
              )}
            </AnimatePresence>

            
            <AnimatePresence>
              {activeToggle === 'when' && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed inset-x-3 top-[84px] z-50 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-3 shadow-xl sm:inset-x-4 sm:p-4 md:absolute md:inset-x-auto md:left-1/2 md:top-full md:mt-2.5 md:w-auto md:min-w-[530px] md:max-w-[95vw] md:-translate-x-1/2 md:p-5"
                >
                <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-gray-100">
                  <div className="flex min-w-0 items-center gap-2">
                    <CalendarIcon className="w-4 h-4 shrink-0 text-[#fe424d]" />
                    <span className="truncate text-xs sm:text-sm font-bold text-gray-900">
                      {internalQuery ? `Select dates for "${internalQuery}"` : 'Select travel dates'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveToggle(null)}
                    className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <TwoMonthCalendar
                  checkIn={checkIn || ''}
                  checkOut={checkOut || ''}
                  onDatesChange={(ci, co) => {
                    if (onDatesChange) onDatesChange(ci, co);
                  }}
                  locationName={internalQuery || 'your destination'}
                  compact={true}
                />

                
                <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (onDatesChange) onDatesChange('', '');
                    }}
                    className="self-start text-xs font-semibold text-gray-500 hover:text-gray-900 underline cursor-pointer"
                  >
                    Clear dates
                  </button>

                  <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveToggle('who')}
                      className="text-xs font-bold text-[#fe424d] hover:bg-rose-50 px-3 py-2 rounded-full transition cursor-pointer"
                    >
                      Next: Add guests →
                    </button>
                    <button
                      type="button"
                      onClick={executeSearch}
                      className="flex items-center gap-2 bg-[#fe424d] hover:bg-[#e03a45] text-white px-4 py-2.5 rounded-full text-xs font-bold transition shadow-sm hover:shadow-md cursor-pointer active:scale-95 sm:px-5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search Stays</span>
                    </button>
                  </div>
                </div>
                </motion.div>
              )}
            </AnimatePresence>

            
            <AnimatePresence>
              {activeToggle === 'who' && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed inset-x-3 top-[84px] z-50 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl sm:inset-x-4 md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-3 md:w-[380px] md:p-6"
                >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#fe424d]" />
                    <span className="text-sm font-bold text-gray-900">Add Guests</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveToggle(null)}
                    className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Adults</p>
                      <p className="text-xs text-gray-500">Ages 13 or above</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={adults <= 0}
                        onClick={() => handleGuestsUpdate(Math.max(0, adults - 1), children, infants)}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-800 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:border-gray-200 disabled:hover:border-gray-200 cursor-pointer transition active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-gray-900">
                        {adults}
                      </span>
                      <button
                        type="button"
                        disabled={adults >= 16}
                        onClick={() => handleGuestsUpdate(adults + 1, children, infants)}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-800 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-30 cursor-pointer transition active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-100" />

                  
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Children</p>
                      <p className="text-xs text-gray-500">Ages 2–12</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={children <= 0}
                        onClick={() => handleGuestsUpdate(adults, Math.max(0, children - 1), infants)}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-800 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:border-gray-200 disabled:hover:border-gray-200 cursor-pointer transition active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-gray-900">
                        {children}
                      </span>
                      <button
                        type="button"
                        disabled={children >= 10}
                        onClick={() => {
                          const newAdults = adults === 0 ? 1 : adults;
                          handleGuestsUpdate(newAdults, children + 1, infants);
                        }}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-800 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-30 cursor-pointer transition active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-100" />

                  
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Infants</p>
                      <p className="text-xs text-gray-500">Under 2</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={infants <= 0}
                        onClick={() => handleGuestsUpdate(adults, children, Math.max(0, infants - 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-800 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:border-gray-200 disabled:hover:border-gray-200 cursor-pointer transition active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-gray-900">
                        {infants}
                      </span>
                      <button
                        type="button"
                        disabled={infants >= 5}
                        onClick={() => {
                          const newAdults = adults === 0 ? 1 : adults;
                          handleGuestsUpdate(newAdults, children, infants + 1);
                        }}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-800 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-30 cursor-pointer transition active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleGuestsUpdate(0, 0, 0)}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-900 underline cursor-pointer"
                  >
                    Clear all
                  </button>

                  <button
                    type="button"
                    onClick={executeSearch}
                    className="flex items-center gap-2 bg-[#fe424d] hover:bg-[#e03a45] text-white px-5 py-2.5 rounded-full text-xs font-bold transition shadow-sm hover:shadow-md cursor-pointer active:scale-95"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Apply & Search</span>
                  </button>
                </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenCreateModal}
              className="hidden lg:block text-xs sm:text-sm font-semibold text-gray-800 px-3.5 py-2 rounded-full transition cursor-pointer"
            >
              Host on Stay-Go
            </button>

            {user ? (
              <div className="flex items-center gap-2 shrink-0">
                
                <div className="relative flex items-center" ref={profileButtonRef}>
                  <button
                    type="button"
                    onClick={toggleProfileMenu}
                    aria-expanded={isProfileDropdownOpen}
                    aria-haspopup="true"
                    title={`Account menu for ${username || email}`}
                    className={`w-9 h-9 rounded-full bg-[#fe424d] text-white font-bold text-xs sm:text-sm flex items-center justify-center select-none shadow-2xs hover:shadow-xs hover:bg-[#e03a45] transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ${
                      isProfileDropdownOpen
                        ? 'ring-2 ring-[#fe424d] ring-offset-2'
                        : ''
                    }`}
                  >
                    {initial}
                  </button>

                  
                  {typeof document !== 'undefined' &&
                    createPortal(
                      <AnimatePresence>
                        {isProfileDropdownOpen && (
                          <motion.div
                            ref={profileMenuRef}
                            style={profileMenuPosition}
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                            className="fixed z-50 w-72 origin-top-right overflow-hidden rounded-2xl border border-gray-200 bg-white py-2.5 shadow-xl sm:w-80 max-w-[calc(100vw-1.5rem)]"
                            role="menu"
                            aria-orientation="vertical"
                          >
                      
                      <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#fe424d] text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0 select-none">
                            {initial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                              {username || 'Traveler'}
                            </p>
                            <p className="text-[11px] sm:text-xs text-gray-500 truncate" title={email}>
                              {email || 'No email attached'}
                            </p>
                            
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  lastActiveInfo.isLive
                                    ? 'bg-emerald-500 animate-pulse'
                                    : 'bg-gray-400'
                                }`}
                              />
                              <span className="text-[10px] sm:text-[11px] font-medium text-gray-500">
                                {lastActiveInfo.text}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      
                      <div className="py-1">
                        
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            if (onOpenWishlist) onOpenWishlist();
                          }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
                          role="menuitem"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#fe424d] flex items-center justify-center">
                              <Heart className="w-4 h-4 fill-[#fe424d]" />
                            </div>
                            <span>My Wishlists</span>
                          </div>
                          {wishlistCount > 0 && (
                            <span className="text-[11px] bg-rose-100 text-[#fe424d] font-bold px-2 py-0.5 rounded-full">
                              {wishlistCount}
                            </span>
                          )}
                        </button>

                        
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            if (onOpenBookings) onOpenBookings();
                          }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
                          role="menuitem"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <CalendarCheck className="w-4 h-4" />
                            </div>
                            <span>My Booking</span>
                          </div>
                        </button>

                        
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            onOpenCreateModal();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-700 transition cursor-pointer lg:hidden"
                          role="menuitem"
                        >
                          <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                            <Compass className="w-4 h-4" />
                          </div>
                          <span>Host on Stay-Go</span>
                        </button>
                      </div>

                      
                      <div className="border-t border-gray-100 my-1" />

                      
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            setIsLogoutModalOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                          role="menuitem"
                        >
                          <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <span>Log out</span>
                        </button>
                      </div>
                      </motion.div>
                        )}
                      </AnimatePresence>,
                      document.body,
                    )}
                </div>

                
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(true)}
                  title="Click to Log out"
                  aria-label="Click to Log out"
                  className="w-9 h-9 rounded-full border border-gray-200 hover:border-red-200 bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 flex items-center justify-center transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer active:scale-95 shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuthModal('login')}
                title="Click to Log in"
                aria-label="Click to Log in"
                className="w-9 h-9 rounded-full border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 hover:text-black flex items-center justify-center transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
              >
                <User className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

        </div>
      </header>

      
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={onLogout}
        user={user}
      />

      
      {!isModalOpen && !isLogoutModalOpen && typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed bottom-8 right-6 z-50 md:hidden"
          >
            <button
              onClick={onOpenCreateModal}
              aria-label="Create Listing"
              className="w-12 h-12 rounded-full bg-[#fe424d] text-white shadow-lg flex items-center justify-center hover:bg-[#e03a44] transition-all transform active:scale-95"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>,
          document.body,
        )}
    </>
  );
};
