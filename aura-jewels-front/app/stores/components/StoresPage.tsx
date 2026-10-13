'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, MapPin, Phone, RefreshCw, ChevronRight, Clock, Send } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { getStores } from '@/services/storeService';

interface Store {
  _id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  timings?: string;
  mapUrl: string;
  image: string;
}

const LOCAL_STORES: Store[] = [
  {
    _id: "store_mumbai_1",
    name: "Aura Jewels Flagship Store, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    address: "123, Luxury Boulevard, Bandra Kurla Complex, Mumbai, Maharashtra 400051",
    phone: "+91 98765 43210",
    timings: "Mon - Sun: 11:00 AM - 9:00 PM",
    mapUrl: "https://maps.google.com/?q=Bandra+Kurla+Complex,+Mumbai,+Maharashtra+400051",
    image: "/images/stores/store_interior_mumbai.png"
  },
  {
    _id: "store_delhi_1",
    name: "Aura Jewels Flagship Store, Delhi",
    city: "Delhi",
    state: "Delhi",
    address: "D-15, South Extension II, Block D, Market, New Delhi, Delhi 110049",
    phone: "+91 98765 43211",
    timings: "Mon - Sun: 11:00 AM - 9:00 PM",
    mapUrl: "https://maps.google.com/?q=D-15,+South+Extension+II,+Block+D,+Market,+New+Delhi,+Delhi+110049",
    image: "/images/stores/store_interior_delhi.png"
  },
  {
    _id: "store_hyderabad_1",
    name: "Aura Jewels Heritage Showroom, Hyderabad",
    city: "Hyderabad",
    state: "Telangana",
    address: "Road No. 36, Jubilee Hills, Near Metro Station, Hyderabad, Telangana 500033",
    phone: "+91 98765 43212",
    timings: "Mon - Sun: 11:00 AM - 9:00 PM",
    mapUrl: "https://maps.google.com/?q=Road+No.+36,+Jubilee+Hills,+Hyderabad,+Telangana+500033",
    image: "/images/stores/store_interior_hyderabad.png"
  }
];

const StoresPage = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // Fetch dynamic stores from API with constant fallback
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await getStores();
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setStores(res.data);
          setFilteredStores(res.data);

          // Extract unique states
          const uniqueStates = Array.from(new Set(res.data.map((store: Store) => store.state))) as string[];
          setStates(uniqueStates);
        } else {
          // Fallback to local constant data
          setStores(LOCAL_STORES);
          setFilteredStores(LOCAL_STORES);
          const uniqueStates = Array.from(new Set(LOCAL_STORES.map((store: Store) => store.state))) as string[];
          setStates(uniqueStates);
        }
      } catch (err) {
        console.warn("API loading failed or route deleted. Falling back to local store data:", err);
        // Fallback to local constant data
        setStores(LOCAL_STORES);
        setFilteredStores(LOCAL_STORES);
        const uniqueStates = Array.from(new Set(LOCAL_STORES.map((store: Store) => store.state))) as string[];
        setStates(uniqueStates);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  // Filter stores whenever selectedState or searchQuery changes
  useEffect(() => {
    let result = stores;

    // Filter by State
    if (selectedState !== 'All') {
      result = result.filter(store => store.state === selectedState);
    }

    // Filter by Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(store =>
        store.name.toLowerCase().includes(q) ||
        store.city.toLowerCase().includes(q) ||
        store.state.toLowerCase().includes(q) ||
        store.address.toLowerCase().includes(q)
      );
    }

    setFilteredStores(result);
  }, [selectedState, searchQuery, stores]);

  const handleReset = () => {
    setSelectedState('All');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-jakarta antialiased">

      {/* 1. Hero Banner Section */}
      <section className="relative h-[380px] md:h-[450px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={getImageUrl('images/stores/store-banner.jpg')}
            alt="Aura Jewels Boutique Showroom"
            fill
            priority
            unoptimized
            className="object-cover object-center scale-105 filter brightness-95"
            onError={(e) => {
              // Fallback if prefixed path fails
              const target = e.target as HTMLImageElement;
              if (target.src.includes('/Aura Jewels/')) {
                target.src = '/images/stores/stores_banner_background.png';
              }
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-el-messiri font-normal tracking-wide text-white mt-3 mb-6">
            Aura Jewels In Your City
          </h1>
          <p className="text-white/80 leading-relaxed font-light text-sm md:text-base max-w-2xl mx-auto tracking-wide">
            Enter a realm where exquisite craftsmanship and tailored experiences marry.
            Where every visit promises unforgettable memories.
          </p>
        </div>
      </section>

      {/* 2. Controls Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200/40">

          {/* Left: State Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedState('All')}
              className={`px-5 py-2 text-xs font-semibold tracking-wider uppercase rounded-full border transition-all duration-300 ${selectedState === 'All'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-transparent text-gray-500 border-gray-200 hover:text-[#1A1A1A] hover:border-[#1A1A1A]'
                }`}
            >
              All ({stores.length})
            </button>
            {states.map(state => {
              const count = stores.filter(store => store.state === state).length;
              return (
                <button
                  key={state}
                  onClick={() => setSelectedState(state)}
                  className={`px-5 py-2 text-xs font-semibold tracking-wider uppercase rounded-full border transition-all duration-300 ${selectedState === state
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-transparent text-gray-500 border-gray-200 hover:text-[#1A1A1A] hover:border-[#1A1A1A]'
                    }`}
                >
                  {state} ({count})
                </button>
              );
            })}
          </div>

          {/* Right: Search Bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Shop..."
              className="w-full bg-transparent border border-gray-200 rounded-full py-2.5 pl-11 pr-5 text-[#1A1A1A] placeholder:text-gray-500/80 text-xs focus:outline-none focus:border-[#013D3D] focus:ring-1 focus:ring-[#013D3D] transition-all"
            />
          </div>

        </div>
      </section>

      {/* 3. Showroom Grid Section */}
      <section className="max-w-7xl mx-auto px-6 py-6 pb-20">

        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-200/20 rounded-2xl p-4 flex flex-col h-full animate-pulse">
                <div className="aspect-[4/3] w-full bg-gray-100 rounded-xl" />
                <div className="p-4 flex-grow space-y-4">
                  <div className="h-6 bg-gray-100 rounded-sm w-3/4" />
                  <div className="h-4 bg-gray-100 rounded-sm w-1/4" />
                  <div className="space-y-2 pt-2">
                    <div className="h-3 bg-gray-100 rounded-sm w-full" />
                    <div className="h-3 bg-gray-100 rounded-sm w-5/6" />
                  </div>
                  <div className="h-5 bg-gray-100 rounded-sm w-1/2 pt-4" />
                  <div className="flex gap-3 pt-4">
                    <div className="h-10 bg-gray-100 rounded-sm flex-1" />
                    <div className="h-10 bg-gray-100 rounded-sm w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredStores.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#013D3D]/5 rounded-full flex items-center justify-center text-[#013D3D]">
                <MapPin className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-2xl font-el-messiri tracking-wide text-[#1A1A1A] mb-3">
              No Stores Found
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              We couldn't find any boutiques matching your search filters. Try widening your filters.
            </p>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 border border-[#013D3D] text-[#013D3D] hover:bg-[#013D3D] hover:text-white px-6 py-3 text-xs font-bold tracking-widest uppercase rounded-sm transition-all duration-300 cursor-pointer"
            >
              <RefreshCw className="w-4.5 h-4.5" />
              Reset Filters
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStores.map(store => (
              <div
                key={store._id}
                className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col gap-4"
              >
                {/* Store Image */}
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src={`/Aura Jewels${store.image}`}
                    alt={store.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                    onError={(e) => {
                      // Fallback if prefixed path fails
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes('/Aura Jewels/')) {
                        target.src = store.image;
                      }
                    }}
                  />
                </div>

                {/* Card Title Line */}
                <div className="flex items-center justify-between text-lg font-el-messiri text-[#1A1A1A] font-medium px-1">
                  <h3 className="hover:text-[#013D3D] transition-colors">
                    {store.name}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Subtitle / State */}
                <span className="text-[10px] font-jakarta tracking-widest text-[#013D3D] uppercase font-bold px-1 -mt-2">
                  {store.city.toUpperCase()}, {store.state.toUpperCase()}
                </span>

                {/* Details List */}
                <div className="space-y-3 px-1 text-sm text-gray-500 flex-grow">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-light">{store.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                    <a href={`tel:${store.phone}`} className="hover:text-[#013D3D] transition-colors font-medium">
                      {store.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400 shrink-0" />
                    <span className="font-light">{store.timings || 'Mon - Sun: 11:00 AM - 9:00 PM'}</span>
                  </div>
                </div>

                {/* Divider */}
                <hr className="border-t border-gray-100 my-1" />

                {/* Footer Buttons */}
                <div className="flex items-center gap-3 px-1">
                  <a
                    href="#"
                    // target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#1A1A1A] hover:bg-[#013D3D] text-white text-xs font-bold tracking-widest py-3.5 text-center transition-colors uppercase rounded-md flex items-center justify-center gap-2"
                  >
                    Book Visit
                  </a>
                  <a
                    href={"#"}
                    // target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#F1F3EF] hover:bg-gray-200/40 text-[#1A1A1A] p-3.5 rounded-md border border-gray-200/20 transition-all flex items-center justify-center"
                    title="Locate Store"
                  >
                    <Send className="w-4 h-4" />
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}

      </section>

    </div>
  );
};

export default StoresPage;
