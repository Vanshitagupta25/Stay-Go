import { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { ListingModal } from './components/ListingModal';
import { ListingShow } from './components/ListingShow';
import { AuthModal } from './components/AuthModal';
import { WishlistModal } from './components/WishlistModal';
import { BookingsModal } from './components/BookingsModal';
import { CategoryFilter } from './components/CategoryFilter';
import { authService, listingService } from './services';
import { useGetListingsQuery } from './redux/api/listingApi';
import type { Listing } from './types/listing';
import { ArrowUpDown, X, ChevronDown, Check, RotateCcw, Heart, Star } from 'lucide-react';
import { Pagination } from './components/Pagination';
import { CitySplitMap } from './components/CitySplitMap';
import { formatStandardDateRange } from './utils/dateFormatter';

const SORT_OPTIONS = [
  { value: '', label: 'Default (Recommended)' },
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

  // Sync favorites state with user's saved wishlist in DB
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

  // Real Wishlist toggle persisted in Database
  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      // Prompt user to log in so their wishlist persists
      setAuthModalState({ isOpen: true, mode: 'login' });
      return;
    }

    const isCurrentlyFav = Boolean(favorites[id]);
    const nextState = !isCurrentlyFav;

    // Optimistic UI update
    setFavorites((prev) => ({ ...prev, [id]: nextState }));

    // Micro toast feedback
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
      // Revert if API failed
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

  // Check active user session on app mount using authService
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

  // Fetch listings dynamically from backend API using RTK Query
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

  // Memoized listings to guarantee search filter & sort work in tandem seamlessly
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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
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

      <main
        className="flex-1 w-full mx-auto pt-0 pb-6 px-6 sm:px-8 lg:px-12 xl:px-14 2xl:px-16 max-w-[1920px] transition-all duration-200"
      >
        {/* Categories Bar */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />

        {/* Header & Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
              {searchCity ? `Stays in "${searchCity}"` : 'Explore Stays'}
              {checkIn && checkOut && (
                <span className="text-sm sm:text-base font-normal text-gray-500 ml-2">
                  ({formatStandardDateRange(checkIn, checkOut)})
                </span>
              )}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {totalListings} {totalListings === 1 ? 'stay' : 'stays'} available
              {selectedCategory && ` • Category: ${selectedCategory}`}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="group flex items-center gap-2 bg-white hover:bg-rose-50/70 border border-gray-200 hover:border-rose-200 text-gray-700 hover:text-[#fe424d] px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#fe424d] group-hover:-rotate-45 transition-transform duration-200" />
                <span>Reset</span>
                <span className="flex items-center justify-center min-w-[18px] h-4.5 px-1 bg-rose-100 text-[#fe424d] text-[10px] font-bold rounded-full">
                  {activeFilterCount}
                </span>
              </button>
            )}

            {/* Custom Matching Dimension Sorting Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen((prev) => !prev)}
                className="flex items-center justify-between gap-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-3.5 py-2 shadow-xs cursor-pointer min-w-[210px] transition text-left focus:outline-none focus:ring-2 focus:ring-gray-200"
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
              >
                <div className="flex items-center gap-2 truncate">
                  <ArrowUpDown className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="text-xs text-gray-500 font-medium hidden sm:inline">Sort:</span>
                  <span className="text-xs font-semibold text-gray-800 truncate">
                    {selectedSortOption.label}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${isSortOpen ? 'rotate-180 text-gray-700' : ''
                    }`}
                />
              </button>

              {isSortOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
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
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition cursor-pointer ${isSelected
                          ? 'bg-rose-50 text-[#fe424d] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50 font-medium'
                          }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <span className="truncate">{option.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#fe424d] shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 animate-in fade-in duration-200">
            <span className="text-xs font-medium text-gray-400 mr-1">Active filters:</span>
            {searchCity.trim() && (
              <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-lg shadow-2xs font-medium">
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
              <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-lg shadow-2xs font-medium">
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
              <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-lg shadow-2xs font-medium">
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
              <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-lg shadow-2xs font-medium">
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
              className="text-xs text-[#fe424d] hover:underline font-semibold ml-1 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Loading & Error States */}
        {isLoading && (
          <div className="flex justify-center items-center py-20 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fe424d] mr-3"></div>
            Loading listings...
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center my-6">
            <p className="font-semibold">Failed to load listings from server.</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm underline text-red-600 hover:text-red-800 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !isError && listings.length === 0 && (
          <div className="text-center py-16 text-gray-500 bg-white rounded-2xl border border-gray-100 p-8">
            <p className="text-lg font-medium text-gray-700">No listings found matching your criteria.</p>
            <p className="text-sm text-gray-400 mt-1">Try resetting filters or searching for another destination.</p>
            <button
              onClick={clearAllFilters}
              className="mt-4 inline-flex items-center gap-2 bg-[#fe424d] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#e03a45] transition cursor-pointer shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Listings Content */}
        {!isLoading && !isError && listings.length > 0 && (
          searchCity.trim() ? (
            /* Split View: Listings on Left, Compact Viewport-Fit Google Maps on Right */
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch w-full">
              {/* Left Column: Listing Cards & Pagination */}
              <div className="w-full lg:w-[54%] xl:w-[56%] shrink-0 flex flex-col justify-between">
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {listings.map((listing, index) => (
                      <div
                        key={listing._id}
                        onClick={() => setSelectedListing(listing)}
                        onMouseEnter={() => setHoveredListingId(listing._id)}
                        onMouseLeave={() => setHoveredListingId(null)}
                        className={`group cursor-pointer flex flex-col transition-all duration-200 ${hoveredListingId === listing._id ? '-translate-y-1' : ''
                          }`}
                      >
                        {/* Compact Reduced-Height Image Container */}
                        <div
                          className={`relative aspect-[16/11] sm:aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-2 transition-all duration-200 ${hoveredListingId === listing._id
                              ? 'shadow-md ring-2 ring-gray-900/10'
                              : 'shadow-xs group-hover:shadow-sm'
                            }`}
                        >
                          <img
                            src={
                              listing.image?.url ||
                              'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
                            }
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          {/* Guest favourite badge */}
                          {index % 2 === 0 && (
                            <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 z-10 pointer-events-none">
                              <span>Guest favourite</span>
                            </div>
                          )}
                          {/* Real Database Wishlist Heart Button - Increased Size */}
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(listing._id, e)}
                            className="absolute top-2 right-2 text-white hover:scale-115 active:scale-90 transition-transform z-10 drop-shadow-md cursor-pointer p-1.5 rounded-full hover:bg-black/10"
                            title={favorites[listing._id] ? "Saved in wishlist" : "Add to wishlist"}
                            aria-label={favorites[listing._id] ? "Saved in wishlist" : "Add to wishlist"}
                          >
                            <Heart
                              className={`w-6 h-6 transition-colors ${favorites[listing._id]
                                  ? 'fill-[#fe424d] text-[#fe424d]'
                                  : 'fill-black/35 text-white stroke-[2]'
                                }`}
                            />
                          </button>
                        </div>

                        {/* Extracted Details Below Image */}
                        <div className="flex flex-col gap-0.5 px-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="font-semibold text-gray-900 text-[13px] truncate">
                              {listing.location}, {listing.country}
                            </h3>
                            {/* Real Rating System */}
                            {listing.avgRating !== null && listing.avgRating !== undefined ? (
                              <div className="flex items-center gap-1 text-xs font-semibold text-gray-900 shrink-0">
                                <Star className="w-3 h-3 fill-current text-gray-900" />
                                <span>{Number(listing.avgRating).toFixed(1)}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-0.5 text-xs font-medium text-gray-500 shrink-0">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="font-semibold text-gray-800 text-[11px]">New</span>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs truncate">{listing.title}</p>
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="font-semibold text-gray-900 text-[13px]">
                              ₹{listing.price?.toLocaleString('en-IN') || listing.price}
                            </span>
                            <span className="text-gray-500 text-[11px] font-normal">night</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
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

              {/* Right Column: Google Maps displaying entire map at once with end border */}
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
            /* Compact Cards Grid utilizing full side space with extracted details below image */
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-x-4 sm:gap-x-4.5 gap-y-6 sm:gap-y-7">
                {listings.map((listing, index) => (
                  <div
                    key={listing._id}
                    onClick={() => setSelectedListing(listing)}
                    className="group cursor-pointer flex flex-col transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {/* Compact Image Container with reduced box height and real wishlist heart */}
                    <div className="relative aspect-[16/11] rounded-xl overflow-hidden bg-gray-100 mb-2 shadow-xs group-hover:shadow-sm transition-all duration-300">
                      <img
                        src={
                          listing.image?.url ||
                          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                        loading="lazy"
                      />

                      {/* Guest Favourite Badge */}
                      {index % 3 === 0 && (
                        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 z-10 pointer-events-none">
                          <span>Guest favourite</span>
                        </div>
                      )}

                      {/* Real Database Wishlist Heart Button - Increased Size */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(listing._id, e)}
                        className="absolute top-2.5 right-2.5 text-white hover:scale-115 active:scale-90 transition-transform z-10 drop-shadow-md cursor-pointer p-1.5 rounded-full hover:bg-black/10"
                        title={favorites[listing._id] ? "Saved in wishlist" : "Add to wishlist"}
                        aria-label={favorites[listing._id] ? "Saved in wishlist" : "Add to wishlist"}
                      >
                        <Heart
                          className={`w-6 h-6 transition-colors ${favorites[listing._id]
                              ? 'fill-[#fe424d] text-[#fe424d]'
                              : 'fill-black/35 text-white stroke-[2]'
                            }`}
                        />
                      </button>
                    </div>

                    {/* Extracted Details Below Image */}
                    <div className="flex flex-col gap-0.5 px-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-semibold text-gray-900 text-[13px] truncate">
                          {listing.location}, {listing.country}
                        </h3>
                        {/* Real Rating System */}
                        {listing.avgRating !== null && listing.avgRating !== undefined ? (
                          <div className="flex items-center gap-1 text-xs font-semibold text-gray-900 shrink-0">
                            <Star className="w-3 h-3 fill-current text-gray-900" />
                            <span>{Number(listing.avgRating).toFixed(1)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-0.5 text-xs font-medium text-gray-500 shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-gray-800 text-[11px]">New</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs truncate">{listing.title}</p>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="font-semibold text-gray-900 text-[13px]">
                          ₹{listing.price?.toLocaleString('en-IN') || listing.price}
                        </span>
                        <span className="text-gray-500 text-[11px] font-normal">night</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
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

      {/* Floating Wishlist Micro-Toast Notification */}
      {wishlistToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 backdrop-blur-xs text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-bounce-in border border-gray-800">
          <Heart className="w-3.5 h-3.5 fill-[#fe424d] text-[#fe424d]" />
          <span>{wishlistToast.message}</span>
        </div>
      )}

      {/* Detail / Booking Full Page View */}
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

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500 mt-6">
        <p>© 2026 Stay-Go Inc. All rights reserved.</p>
      </footer>

      {/* Create Listing Modal */}
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

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        onSelectListing={(listing) => setSelectedListing(listing)}
        onRemoveFavorite={(listingId) => {
          toggleFavorite(listingId, { stopPropagation: () => {} } as any);
        }}
      />

      {/* Bookings Modal */}
      <BookingsModal
        isOpen={isBookingsModalOpen}
        onClose={() => setIsBookingsModalOpen(false)}
        onSelectListing={(listing) => setSelectedListing(listing)}
      />
    </div>
  );
}

export default App;
