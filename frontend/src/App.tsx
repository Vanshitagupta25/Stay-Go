import { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { ListingModal } from './components/ListingModal';
import { ListingShow } from './components/ListingShow';
import { AuthModal } from './components/AuthModal';
import { WishlistModal } from './components/WishlistModal';
import { BookingsModal } from './components/BookingsModal';
import { CategoryFilter } from './components/CategoryFilter';
import { ListingCard } from './components/ListingCard';
import { Reveal } from './components/Reveal';
import { authService, listingService } from './services';
import { useGetListingsQuery } from './redux/api/listingApi';
import type { Listing } from './types/listing';
import { ArrowUpDown, X, ChevronDown, Check, RotateCcw, Heart, Sparkles } from 'lucide-react';
import { Pagination } from './components/Pagination';
import { CitySplitMap } from './components/CitySplitMap';
import { formatStandardDateRange } from './utils/dateFormatter';
import { EASE_SUBTLE } from './utils/motion';

const SORT_OPTIONS = [
  { value: '', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'title_asc', label: 'Name: A to Z' },
];

export function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchCity, setSearchCity] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('');
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [guests, setGuests] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login',
  });
  const [user, setUser] = useState<any>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [wishlistToast, setWishlistToast] = useState<{ message: string; visible: boolean } | null>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.wishlist && Array.isArray(user.wishlist)) {
      const favMap: Record<string, boolean> = {};
      user.wishlist.forEach((item: any) => {
        const id = typeof item === 'string' ? item : item?._id || item;
        if (id) favMap[id] = true;
      });
      setFavorites(favMap);
    } else if (!user) {
      setFavorites({});
    }
  }, [user]);

  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalState({ isOpen: true, mode: 'login' });
      return;
    }

    const isCurrentlyFav = Boolean(favorites[id]);
    const nextState = !isCurrentlyFav;

    setFavorites((prev) => ({ ...prev, [id]: nextState }));

    setWishlistToast({
      message: nextState ? 'Saved to wishlist' : 'Removed from wishlist',
      visible: true,
    });
    setTimeout(() => setWishlistToast(null), 2200);

    try {
      const res = await authService.toggleWishlist(id);
      if (res?.success && Array.isArray(res.wishlist)) {
        setUser((prevUser: any) => ({
          ...prevUser,
          wishlist: res.wishlist,
        }));
      }
    } catch (err) {
      setFavorites((prev) => ({ ...prev, [id]: isCurrentlyFav }));
      console.error('Failed to update favorite in DB:', err);
    }
  };

  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedSortOption = SORT_OPTIONS.find((opt) => opt.value === selectedSort) || SORT_OPTIONS[0];

  useEffect(() => {
    authService
      .getCurrentUser()
      .then((res) => {
        if (res?.success && res?.user) {
          setUser(res.user);
        }
      })
      .catch(() => { });
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch { }
    setUser(null);
    setFavorites({});
  };

  const { data, isLoading, isError, refetch } = useGetListingsQuery({
    category: selectedCategory || undefined,
    city: searchCity.trim() || undefined,
    sort: selectedSort || undefined,
    page: currentPage,
    limit: itemsPerPage,
    checkIn: checkIn || undefined,
    checkOut: checkOut || undefined,
    guests: guests > 0 ? guests : undefined,
  });

  const listings = useMemo(() => {
    let list = data?.listings ? [...data.listings] : [];
    if (searchCity && searchCity.trim()) {
      const q = searchCity.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.location?.toLowerCase().includes(q) ||
          item.country?.toLowerCase().includes(q) ||
          item.title?.toLowerCase().includes(q)
      );
    }
    if (selectedSort === 'price_asc' || selectedSort === 'price_low') {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (selectedSort === 'price_desc' || selectedSort === 'price_high') {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (selectedSort === 'newest') {
      list.sort((a, b) => (b._id > a._id ? 1 : -1));
    } else if (selectedSort === 'title_asc' || selectedSort === 'name_asc') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    if (guests > 0) {
      list = list.filter((item) => (item.guests !== undefined ? item.guests >= guests : true));
    }
    return list;
  }, [data?.listings, searchCity, selectedSort, guests]);

  const totalPages = data?.totalPages || 1;
  const totalListings = searchCity.trim() ? listings.length : (data?.totalListings ?? listings.length);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSelectedSort(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSearchCity('');
    setSelectedSort('');
    setCheckIn('');
    setCheckOut('');
    setGuests(0);
    setCurrentPage(1);
  };

  const activeFilterCount =
    (searchCity.trim() ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (selectedSort ? 1 : 0) +
    (checkIn && checkOut ? 1 : 0) +
    (guests > 0 ? 1 : 0);

  return (
    <div className="stay-page-bg flex min-h-screen flex-col font-sans">
      <Navbar
        user={user}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenAuthModal={(mode) => setAuthModalState({ isOpen: true, mode })}
        onLogout={handleLogout}
        onOpenWishlist={() => setIsWishlistModalOpen(true)}
        onOpenBookings={() => setIsBookingsModalOpen(true)}
        isModalOpen={isCreateModalOpen || authModalState.isOpen || isWishlistModalOpen || isBookingsModalOpen}
        searchQuery={searchCity}
        onSearchSubmit={(val) => {
          setSearchCity(val);
          setCurrentPage(1);
        }}
        checkIn={checkIn}
        checkOut={checkOut}
        onDatesChange={(ci, co) => {
          setCheckIn(ci);
          setCheckOut(co);
          setCurrentPage(1);
        }}
        guests={guests}
        onGuestsChange={(g) => {
          setGuests(g);
          setCurrentPage(1);
        }}
      />

      <main className="mx-auto w-full max-w-[1920px] flex-1 px-4 pb-6 pt-5 sm:px-8 sm:pt-7 lg:px-12 xl:px-14 2xl:px-16">
        <Reveal className={`relative ${isSortOpen ? 'z-40' : 'z-0'}`}>
          <section className="relative rounded-[26px] border border-white/70 bg-white/75 p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_18px_50px_-30px_rgba(28,25,23,0.35)] backdrop-blur-sm sm:p-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[26px]"
            >
              <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#fe424d]/10 blur-3xl" />
              <div className="absolute -bottom-24 left-16 h-56 w-56 rounded-full bg-amber-200/20 blur-3xl" />
            </div>

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#fe424d]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Handpicked escapes
                </span>
                <h1 className="mt-3 text-[26px] font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
                  {searchCity ? `Stays in "${searchCity}"` : 'Find a stay that feels like yours'}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {totalListings} {totalListings === 1 ? 'stay' : 'stays'} available
                  {selectedCategory && ` • ${selectedCategory}`}
                  {checkIn && checkOut && ` • ${formatStandardDateRange(checkIn, checkOut)}`}
                </p>
              </div>

              <div className="flex w-full items-center gap-3 sm:w-auto sm:justify-end">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="group flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-rose-200 hover:bg-rose-50/70 hover:text-[#fe424d] hover:shadow-md cursor-pointer"
                    title="Reset all filters"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-gray-400 transition-transform duration-200 group-hover:-rotate-45 group-hover:text-[#fe424d]" />
                    <span>Reset</span>
                    <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-rose-100 px-1 text-[10px] font-bold text-[#fe424d]">
                      {activeFilterCount}
                    </span>
                  </button>
                )}

                
                <div className="relative z-20 min-w-0 flex-1 sm:flex-none" ref={sortRef}>
                  <button
                    type="button"
                    onClick={() => setIsSortOpen((prev) => !prev)}
                    className="flex w-full min-w-0 cursor-pointer items-center justify-between gap-2.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-left shadow-sm transition hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-200 sm:min-w-[220px]"
                    aria-haspopup="listbox"
                    aria-expanded={isSortOpen}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 shrink-0 text-gray-500" />
                      <span className="hidden shrink-0 text-xs font-medium text-gray-500 sm:inline">Sort:</span>
                      <span className="min-w-0 truncate text-xs font-semibold text-gray-800">
                        {selectedSortOption.label}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform duration-200 ${
                        isSortOpen ? 'rotate-180 text-gray-700' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isSortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: EASE_SUBTLE }}
                        className="absolute right-0 top-full z-50 mt-2 w-full origin-top overflow-hidden rounded-2xl border border-gray-200 bg-white py-1.5 shadow-xl sm:min-w-[220px]"
                        role="listbox"
                      >
                        {SORT_OPTIONS.map((option) => {
                          const isSelected = selectedSort === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                handleSortChange(option.value);
                                setIsSortOpen(false);
                              }}
                              className={`flex w-full cursor-pointer items-center justify-between gap-2 px-3.5 py-2.5 text-left text-xs transition ${
                                isSelected
                                  ? 'bg-rose-50 font-semibold text-[#fe424d]'
                                  : 'font-medium text-gray-700 hover:bg-gray-50'
                              }`}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <span className="truncate">{option.label}</span>
                              {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#fe424d]" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.06} className="mt-5">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        </Reveal>

        
        <AnimatePresence initial={false}>
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: EASE_SUBTLE }}
              className="mb-6 flex flex-wrap items-center gap-2"
            >
              <span className="mr-1 text-xs font-medium text-gray-400">Active filters:</span>
            {searchCity.trim() && (
              <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full shadow-sm font-medium">
                <span>City: <strong className="text-gray-900 font-semibold">{searchCity.trim()}</strong></span>
                <button
                  type="button"
                  onClick={() => setSearchCity('')}
                  className="text-gray-400 hover:text-[#fe424d] p-0.5 rounded-full hover:bg-rose-50 transition cursor-pointer"
                  title="Remove city filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full shadow-sm font-medium">
                <span>Category: <strong className="text-gray-900 font-semibold">{selectedCategory}</strong></span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className="text-gray-400 hover:text-[#fe424d] p-0.5 rounded-full hover:bg-rose-50 transition cursor-pointer"
                  title="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {checkIn && checkOut && (
              <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full shadow-sm font-medium">
                <span>Dates: <strong className="text-gray-900 font-semibold">{formatStandardDateRange(checkIn, checkOut)}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setCheckIn('');
                    setCheckOut('');
                  }}
                  className="text-gray-400 hover:text-[#fe424d] p-0.5 rounded-full hover:bg-rose-50 transition cursor-pointer"
                  title="Remove date filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {guests > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full shadow-sm font-medium">
                <span>Guests: <strong className="text-gray-900 font-semibold">{guests} {guests === 1 ? 'guest' : 'guests'}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setGuests(0);
                    setCurrentPage(1);
                  }}
                  className="text-gray-400 hover:text-[#fe424d] p-0.5 rounded-full hover:bg-rose-50 transition cursor-pointer"
                  title="Remove guests filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
              <button
                type="button"
                onClick={clearAllFilters}
                className="ml-1 cursor-pointer text-xs font-semibold text-[#fe424d] hover:underline"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="flex flex-col">
                <div className="stay-skeleton mb-3 aspect-[16/11] rounded-2xl" />
                <div className="stay-skeleton mb-2 h-3.5 w-3/4 rounded-full" />
                <div className="stay-skeleton mb-1.5 h-3 w-1/2 rounded-full" />
                <div className="stay-skeleton h-4 w-1/3 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="my-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm">
            <p className="font-semibold">Failed to load listings from server.</p>
            <button
              onClick={() => refetch()}
              className="mt-2 cursor-pointer text-sm font-semibold text-red-600 underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !isError && listings.length === 0 && (
          <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-[#fe424d]">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-800">No stays match those filters yet.</p>
            <p className="mt-1 text-sm text-gray-500">
              Try resetting filters or searching for another destination.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#fe424d] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e03a45] hover:shadow-md"
            >
              Reset Filters
            </button>
          </div>
        )}

        
        {!isLoading && !isError && listings.length > 0 && (
          searchCity.trim() ? (
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch w-full">
              
              <div className="w-full lg:w-[54%] xl:w-[56%] shrink-0 flex flex-col justify-between">
                <div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                    {listings.map((listing, index) => (
                      <ListingCard
                        key={listing._id}
                        listing={listing}
                        index={index}
                        compact
                        isFavorite={Boolean(favorites[listing._id])}
                        isHighlighted={hoveredListingId === listing._id}
                        onOpen={() => setSelectedListing(listing)}
                        onToggleFavorite={(e) => toggleFavorite(listing._id, e)}
                        onHoverChange={setHoveredListingId}
                      />
                    ))}
                  </div>
                </div>

                
                <div className="pt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalListings}
                    itemsPerPage={itemsPerPage}
                    itemLabel="stays"
                    onPageChange={handlePageChange}
                    className="!mt-0"
                  />
                </div>
              </div>

              
              <div className="w-full lg:w-[46%] xl:w-[44%] h-[340px] sm:h-[380px] lg:h-auto lg:self-stretch lg:min-h-[290px] lg:max-h-[calc(100vh-320px)] lg:sticky lg:top-24 rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col">
                <CitySplitMap
                  listings={listings}
                  searchCity={searchCity}
                  hoveredListingId={hoveredListingId}
                  onSelectListing={(listing) => setSelectedListing(listing)}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {listings.map((listing, index) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    index={index}
                    isFavorite={Boolean(favorites[listing._id])}
                    onOpen={() => setSelectedListing(listing)}
                    onToggleFavorite={(e) => toggleFavorite(listing._id, e)}
                  />
                ))}
              </div>

              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalListings}
                itemsPerPage={itemsPerPage}
                itemLabel="stays"
                onPageChange={handlePageChange}
              />
            </>
          )
        )}
      </main>

      
      <AnimatePresence>
        {wishlistToast && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.28, ease: EASE_SUBTLE }}
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-gray-800 bg-gray-900/95 px-4 py-2.5 text-xs font-medium text-white shadow-2xl backdrop-blur-sm sm:text-sm"
          >
            <Heart className="h-3.5 w-3.5 fill-[#fe424d] text-[#fe424d]" />
            <span>{wishlistToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      
      {selectedListing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
          <ListingShow
            listingId={selectedListing._id}
            initialListing={selectedListing}
            currentUser={user}
            isFavorite={Boolean(favorites[selectedListing._id])}
            onToggleFavorite={(e) => toggleFavorite(selectedListing._id, e)}
            onOpenAuthModal={(mode) => setAuthModalState({ isOpen: true, mode })}
            onClose={() => setSelectedListing(null)}
          />
        </div>
      )}

      <footer className="mt-10 border-t border-black/5 bg-white/70 py-7 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1920px] flex-col items-center justify-between gap-2 px-6 text-xs text-gray-500 sm:flex-row sm:px-8 lg:px-12">
          <p>© 2026 Stay-Go Inc. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#fe424d]" />
            Thoughtfully curated stays
          </p>
        </div>
      </footer>

      
      <ListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data, imageFile) => {
          try {
            await listingService.createListing(data, imageFile);
            setIsCreateModalOpen(false);
            refetch();
          } catch (error: any) {
            console.error("Failed to create listing:", error);
            alert(error.message || "Failed to create listing. Please try again.");
          }
        }}
      />

      
      <AuthModal
        key={`${authModalState.mode}-${authModalState.isOpen}`}
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />

      
      <WishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        onSelectListing={(listing) => setSelectedListing(listing)}
        onRemoveFavorite={(listingId) => {
          toggleFavorite(listingId, { stopPropagation: () => {} } as any);
        }}
      />

      
      <BookingsModal
        isOpen={isBookingsModalOpen}
        onClose={() => setIsBookingsModalOpen(false)}
        onSelectListing={(listing) => setSelectedListing(listing)}
      />
    </div>
  );
}

export default App;
