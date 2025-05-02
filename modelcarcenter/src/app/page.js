'use client'; // 👈 Required at the top to mark this as a Client Component

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown, ArrowDownAZ, ArrowUpAZ, ArrowDownUp, ArrowUpDown, ExternalLink, Filter, X, Tag, Clock, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState(null);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchMode, setSearchMode] = useState('normal');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Simulated recent searches
  const recentSearches = ['McLaren Speedtail', 'Ferrari 458', 'Bugatti Chiron', 'Porsche 911'];
  
  // Mock featured brands
  const featuredBrands = [
    { name: 'Ferrari', count: 24 },
    { name: 'Porsche', count: 36 },
    { name: 'Lamborghini', count: 19 },
    { name: 'McLaren', count: 12 },
    { name: 'Bugatti', count: 8 },
  ];

  // Mock price ranges
  const priceRanges = [
    { label: 'Under $50', value: 'under-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: '$100 - $200', value: '100-200' },
    { label: 'Over $200', value: 'over-200' },
  ];

  // Scroll listener for header visibility
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setHeaderVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
  
    setLoading(true);
    setError('');
    setCars([]);
    setShowSearchSuggestions(false);
    setSearchMode('searching');
    setCurrentPage(1);
  
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);

      const data = await res.json();
  
      if (!res.ok || !data.request_id) {
        setError(data.error || 'Something went wrong starting your search.');
        setLoading(false);
        setSearchMode('normal');
        return;
      }
  
      const requestId = data.request_id;
  
      // Start polling results
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/results/${requestId}`);
          const resultData = await res.json();
  
          if (resultData.status === 'done') {
            clearInterval(pollInterval);
            setCars(resultData.results || []);
            setSearchMode('results');
            setLoading(false);
          } else if (resultData.status === 'failed') {
            clearInterval(pollInterval);
            setError(resultData.error || 'Scraping failed.');
            setLoading(false);
            setSearchMode('normal');
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          setError('Error retrieving search results.');
          setLoading(false);
          setSearchMode('normal');
        }
      }, 3000); // Poll every 3 seconds
    } catch (err) {
      setError('Failed to initiate search.');
      setLoading(false);
      setSearchMode('normal');
    }
  };
  

  // Handle keypress for search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle focus on search input
  const handleSearchFocus = () => {
    if (query.trim() === '' && searchMode === 'normal') {
      setShowSearchSuggestions(true);
    }
  };

  // Handle blur on search input
  const handleSearchBlur = () => {
    // Small delay to allow clicking on suggestions
    setTimeout(() => {
      setShowSearchSuggestions(false);
    }, 200);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value.trim() === '') {
      setShowSearchSuggestions(true);
    } else {
      setShowSearchSuggestions(false);
    }
  };

  // Handle tooltip display
  const showItemTooltip = (message, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY - 10
    });
    setTooltipMessage(message);
    setShowTooltip(true);
  };

  const hideTooltip = () => {
    setShowTooltip(false);
  };

  // Filtering and sorting
  let filteredCars = [...cars];

  if (sortOption === 'price-low') {
    filteredCars.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (sortOption === 'price-high') {
    filteredCars.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  } else if (sortOption === 'az') {
    filteredCars.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === 'za') {
    filteredCars.sort((a, b) => b.title.localeCompare(a.title));
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCars.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const setSortAndClose = (option) => {
    setSortOption(option);
    setShowSortMenu(false);
  };

  const getSortIcon = () => {
    switch(sortOption) {
      case 'price-low': return <ArrowUpDown size={18} />;
      case 'price-high': return <ArrowDownUp size={18} />;
      case 'az': return <ArrowDownAZ size={18} />;
      case 'za': return <ArrowUpAZ size={18} />;
      default: return <SlidersHorizontal size={18} />;
    }
  };

  const normalizeImageUrl = (url) => {
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
    return url;
  };
  

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Calculate start and end of the pages to show
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust start and end to ensure we show maxPagesToShow - 2 pages (excluding first and last)
      if (end - start < maxPagesToShow - 3) {
        if (currentPage < totalPages / 2) {
          end = Math.min(totalPages - 1, start + maxPagesToShow - 3);
        } else {
          start = Math.max(2, end - (maxPagesToShow - 3));
        }
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always include last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen text-gray-100">
      {/* Floating header */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50 py-3 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h2 className="text-xl font-bold text-blue-400">ModelCarCenter</h2>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div 
          className="fixed bg-gray-800 text-gray-200 px-3 py-1 rounded text-xs z-50 transform -translate-x-1/2 -translate-y-full pointer-events-none"
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        >
          {tooltipMessage}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
        </div>
      )}

      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-indigo-800 pt-16 pb-32 px-4 overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-10 w-60 h-60 bg-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative">
          <h1 className="text-5xl sm:text-6xl font-bold text-center text-white mb-4 tracking-tight p-10">
            Model Car<span className="text-blue-400"> Finder</span>
          </h1>
          <p className="text-center text-blue-200 mb-10 max-w-2xl mx-auto text-lg">
            Discover model cars from trusted sellers around the world
          </p>
          
          {/* Search input in hero */}
          <div className="relative mt-10 max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search e.g. McLaren Speedtail, Ferrari 488..."
              value={query}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              suppressHydrationWarning={true}
              className="w-full pl-12 pr-20 py-5 border-0 rounded-xl bg-gray-800/60 backdrop-blur-md focus:ring-2 focus:ring-blue-500 shadow-lg text-gray-100 placeholder-gray-400"
            />
            <button
              onClick={handleSearch}
              suppressHydrationWarning={true}
              className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200 shadow-md shadow-blue-900/50"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative pb-16">
        {/* Filters sidebar */}
        <div className={`fixed inset-y-0 right-0 w-72 bg-gray-800/90 backdrop-blur-lg border-l border-gray-700 shadow-xl p-6 z-40 transition-transform duration-300 ease-in-out transform ${showFilters ? 'translate-x-0' : 'translate-x-full'} overflow-auto`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-100">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 hover:bg-gray-700 rounded-full"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          
          {/* Filter sections */}
          <div className="space-y-6">
            {/* Price range */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Price Range</h4>
              <div className="space-y-2">
                {priceRanges.map((range, idx) => (
                  <label key={idx} className="flex items-center space-x-2 text-gray-300 hover:text-gray-100">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500" />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Scale */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Scale</h4>
              <div className="space-y-2">
                {['1:18', '1:24', '1:43', '1:64'].map((scale, idx) => (
                  <label key={idx} className="flex items-center space-x-2 text-gray-300 hover:text-gray-100">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500" />
                    <span>{scale}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Brands */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Brands</h4>
              <div className="space-y-2">
                {featuredBrands.map((brand, idx) => (
                  <label key={idx} className="flex items-center justify-between text-gray-300 hover:text-gray-100">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500" />
                      <span>{brand.name}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full">{brand.count}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Apply button */}
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition mt-6">
              Apply Filters
            </button>
          </div>
        </div>
        
        {/* Overlay when filters are open */}
        {showFilters && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setShowFilters(false)}
          ></div>
        )}

        {/* Results container */}
        <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl">
          {/* Filters bar */}
          <div className="p-4 flex justify-between items-center border-b border-gray-700/50">
            <div className="text-gray-300">
              {filteredCars.length > 0 && !loading && (
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-white">{filteredCars.length}</span>
                  <span className="text-gray-400">results for</span>
                  <span className="font-medium text-blue-400">&quot;{query}&quot;</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                suppressHydrationWarning={true}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-medium transition"
              >
                  {getSortIcon()}
                  <span>Sort</span>
                  <ChevronDown size={16} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10 border border-gray-700">
                    <div className="py-1">
                      <button 
                        onClick={() => setSortAndClose('price-low')}
                        className={`block px-4 py-2 text-sm w-full text-left ${sortOption === 'price-low' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'} hover:bg-gray-700`}
                      >
                        Price: Low to High
                      </button>
                      <button 
                        onClick={() => setSortAndClose('price-high')}
                        className={`block px-4 py-2 text-sm w-full text-left ${sortOption === 'price-high' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'} hover:bg-gray-700`}
                      >
                        Price: High to Low
                      </button>
                      <button 
                        onClick={() => setSortAndClose('az')}
                        className={`block px-4 py-2 text-sm w-full text-left ${sortOption === 'az' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'} hover:bg-gray-700`}
                      >
                        Name: A to Z
                      </button>
                      <button 
                        onClick={() => setSortAndClose('za')}
                        className={`block px-4 py-2 text-sm w-full text-left ${sortOption === 'za' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'} hover:bg-gray-700`}
                      >
                        Name: Z to A
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setShowFilters(true)}
                suppressHydrationWarning={true}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-medium md:hidden"
              >
                <Filter size={18} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Loading animation */}
          {loading && (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-t-blue-500 border-r-blue-400 border-b-blue-300 border-l-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-3 border-3 border-t-blue-400 border-r-blue-300 border-b-blue-200 border-l-blue-500 rounded-full animate-spin animation-delay-150"></div>
              </div>
              <p className="text-lg font-medium text-gray-300">Searching across all sellers...</p>
              <p className="text-sm text-gray-400 mt-2">Finding the best deals for &quot;{query}&quot;</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="m-6 bg-red-900/30 border border-red-700 text-red-200 px-6 py-4 rounded-lg">
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-1 text-red-300">Please try again or modify your search query.</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredCars.length === 0 && searchMode === 'results' && (
            <div className="text-center py-16 px-4">
              <div className="bg-gray-700/50 inline-block p-6 rounded-full mb-6">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-200 mb-3">No results found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                We couldn&apos;t find any model cars matching &quot;{query}&quot;. Try searching for a different model or check your spelling.
              </p>
              <div className="mt-8">
                <p className="text-sm text-gray-500 mb-3">Popular searches</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {recentSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(search);
                        handleSearch();
                      }}
                      className="px-4 py-2 bg-gray-700/70 hover:bg-gray-700 rounded-full text-sm text-gray-300 transition"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Default state */}
          {!loading && !error && filteredCars.length === 0 && searchMode === 'normal' && (
            <div className="p-10">
              <div className="text-center mb-8">
                <h3 className="text-xl font-medium text-gray-200 mb-2">Start your search</h3>
                <p className="text-gray-400">Enter a model name, brand, or any keywords to begin</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700/30 border border-gray-700 rounded-xl p-6 flex flex-col items-center text-center">
                  <div className="bg-indigo-900/30 p-4 rounded-full mb-4">
                    <Tag className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-200 mb-2">All Brands</h4>
                  <p className="text-gray-400 text-sm">Browse model cars from all kinds of sellers worldwide.</p>
                </div>
                
                <div className="bg-gray-700/30 border border-gray-700 rounded-xl p-6 flex flex-col items-center text-center">
                  <div className="bg-blue-900/30 p-4 rounded-full mb-4">
                    <ShoppingCart className="h-8 w-8 text-blue-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-200 mb-2">Best Prices</h4>
                  <p className="text-gray-400 text-sm">Compare prices from multiple trusted sellers in one place.</p>
                </div>
                
                <div className="bg-gray-700/30 border border-gray-700 rounded-xl p-6 flex flex-col items-center text-center">
                  <div className="bg-purple-900/30 p-4 rounded-full mb-4">
                    <Filter className="h-8 w-8 text-purple-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-200 mb-2">Precise Filtering</h4>
                  <p className="text-gray-400 text-sm">Find exactly what you&apos;re looking for with detailed filters.</p>
                </div>
              </div>
              
              <div className="mt-10">
                <h4 className="text-lg font-medium text-gray-200 mb-4">Popular searches</h4>
                <div className="flex flex-wrap gap-2">
                {[...(Array.isArray(recentSearches) ? recentSearches : []), 'Aston Martin DB5', 'Koenigsegg Jesko', 'Mclaren P1', 'Ferrari F40'].map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(search);
                      handleSearch();
                    }}
                    className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-full text-sm text-gray-300 transition"
                  >
                    {search}
                  </button>
                ))}

                </div>
              </div>
            </div>
          )}

          {/* Results grid */}
          {!loading && currentItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {currentItems.map((car, idx) => (
                <a
                  key={idx}
                  href={car.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  onMouseEnter={() => setActiveCard(idx)}
                  onMouseLeave={() => setActiveCard(null)}
                  onMouseOver={(e) => showItemTooltip('View on seller site', e)}
                  onMouseOut={hideTooltip}
                >
                  <div className={`bg-gray-800/50 rounded-xl overflow-hidden transition-all duration-300 h-full flex flex-col border border-gray-700/50 ${activeCard === idx ? 'shadow-lg shadow-blue-500/10 border-blue-500/50 scale-105' : 'shadow-md'}`}>
                    <div className="relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-b from-blue-600/10 to-blue-600/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}></div>
                      <Image
                        src={normalizeImageUrl(car.image)}
                        alt={car.title}
                        width={400}
                        height={300}
                        className="w-full h-56 object-cover object-center transition-transform duration-700 group-hover:scale-110"
                      />

                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow relative z-10">
                      <h2 className="text-lg font-semibold text-gray-100 mb-2 line-clamp-2">{car.title}</h2>
                      <div className="mt-auto pt-3 flex justify-between items-center">
                        <p className="text-blue-400 font-bold">{car.price}</p>
                        <div className="bg-blue-600/20 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ExternalLink size={16} className="text-blue-400" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 rounded-xl"></div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8 mb-16">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-700/50 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'} text-gray-200 transition`}
            >
              Previous
            </button>
            {getPaginationNumbers().map((page, idx) => (
              <button
                key={idx}
                onClick={() => typeof page === 'number' && goToPage(page)}
                className={`px-4 py-2 rounded-lg ${typeof page === 'number' ? (currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600') : 'cursor-default text-gray-500'} transition`}
                disabled={typeof page !== 'number'}
              >
                {page}
              </button>
            ))}
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-700/50 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'} text-gray-200 transition`}
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
}
