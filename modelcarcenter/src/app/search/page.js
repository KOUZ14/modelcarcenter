'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  ArrowUpDown, 
  ExternalLink, 
  Filter, 
  X, 
  Car,
  Heart,
  Loader2,
  Grid3X3,
  List,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlist, setWishlist] = useState([]);
  const itemsPerPage = 12;

  // Filter states
  const [selectedScales, setSelectedScales] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const scales = ['1:18', '1:24', '1:43', '1:64'];
  const brands = ['Ferrari', 'Porsche', 'Lamborghini', 'McLaren', 'BMW', 'Mercedes', 'Audi'];

  // Search on initial load if query exists
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setCars([]);
    setCurrentPage(1);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setLoading(false);
        return;
      }

      setCars(data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch search results. Please try again.');
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      handleSearch();
    }
  };

  const toggleWishlist = (car) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.link === car.link);
      if (exists) {
        return prev.filter(item => item.link !== car.link);
      }
      return [...prev, car];
    });
  };

  const isInWishlist = (car) => {
    return wishlist.some(item => item.link === car.link);
  };

  const normalizeImageUrl = (url) => {
    if (!url) return 'https://placehold.co/400x300/1f2937/9ca3af?text=No+Image';
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
    return url;
  };

  // Filtering logic
  let filteredCars = [...cars];

  // Apply price filter
  if (priceRange.min || priceRange.max) {
    filteredCars = filteredCars.filter(car => {
      const price = parseFloat(car.price?.replace(/[^0-9.]/g, '') || 0);
      const min = priceRange.min ? parseFloat(priceRange.min) : 0;
      const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      return price >= min && price <= max;
    });
  }

  // Sorting
  if (sortOption === 'price-low') {
    filteredCars.sort((a, b) => {
      const priceA = parseFloat(a.price?.replace(/[^0-9.]/g, '') || 0);
      const priceB = parseFloat(b.price?.replace(/[^0-9.]/g, '') || 0);
      return priceA - priceB;
    });
  } else if (sortOption === 'price-high') {
    filteredCars.sort((a, b) => {
      const priceA = parseFloat(a.price?.replace(/[^0-9.]/g, '') || 0);
      const priceB = parseFloat(b.price?.replace(/[^0-9.]/g, '') || 0);
      return priceB - priceA;
    });
  } else if (sortOption === 'az') {
    filteredCars.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (sortOption === 'za') {
    filteredCars.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
  }

  // Pagination
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCars.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold hidden sm:block">ModelCarCenter</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search model cars..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-4"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <ThemeToggle />
            <Button size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb and Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Link>
            </Button>
            {initialQuery && (
              <h1 className="text-2xl font-bold">
                Results for &quot;{initialQuery}&quot;
                {!loading && (
                  <span className="text-muted-foreground font-normal text-lg ml-2">
                    ({filteredCars.length} found)
                  </span>
                )}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[160px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="az">Name: A to Z</SelectItem>
                <SelectItem value="za">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Filters</h3>

                {/* Price Range */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-2 block">Price Range</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Scale Filter */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-2 block">Scale</Label>
                  <div className="space-y-2">
                    {scales.map((scale) => (
                      <div key={scale} className="flex items-center space-x-2">
                        <Checkbox
                          id={`scale-${scale}`}
                          checked={selectedScales.includes(scale)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedScales([...selectedScales, scale]);
                            } else {
                              setSelectedScales(selectedScales.filter(s => s !== scale));
                            }
                          }}
                        />
                        <Label htmlFor={`scale-${scale}`} className="text-sm font-normal cursor-pointer">
                          {scale}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Brand Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Brand</Label>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedBrands([...selectedBrands, brand]);
                            } else {
                              setSelectedBrands(selectedBrands.filter(b => b !== brand));
                            }
                          }}
                        />
                        <Label htmlFor={`brand-${brand}`} className="text-sm font-normal cursor-pointer">
                          {brand}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-6"
                  onClick={() => {
                    setSelectedScales([]);
                    setSelectedBrands([]);
                    setPriceRange({ min: '', max: '' });
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Mobile Filters Drawer */}
          {showFilters && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setShowFilters(false)}
              />
              <div className="fixed inset-y-0 right-0 w-80 bg-background border-l z-50 lg:hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold">Filters</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <ScrollArea className="h-[calc(100vh-60px)] p-4">
                  {/* Same filter content as desktop */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-2 block">Price Range</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-2 block">Scale</Label>
                    <div className="space-y-2">
                      {scales.map((scale) => (
                        <div key={scale} className="flex items-center space-x-2">
                          <Checkbox
                            id={`mobile-scale-${scale}`}
                            checked={selectedScales.includes(scale)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedScales([...selectedScales, scale]);
                              } else {
                                setSelectedScales(selectedScales.filter(s => s !== scale));
                              }
                            }}
                          />
                          <Label htmlFor={`mobile-scale-${scale}`} className="text-sm font-normal">
                            {scale}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => setShowFilters(false)}
                  >
                    Apply Filters
                  </Button>
                </ScrollArea>
              </div>
            </>
          )}

          {/* Results Area */}
          <div className="flex-1">
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">Searching across all sellers...</p>
                <p className="text-muted-foreground">Finding the best deals for you</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-destructive bg-destructive/10">
                <CardContent className="p-6 text-center">
                  <p className="text-destructive font-medium">{error}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => handleSearch()}
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!loading && !error && filteredCars.length === 0 && initialQuery && (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn&apos;t find any model cars matching &quot;{initialQuery}&quot;
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Ferrari 488', 'Porsche 911', 'McLaren P1'].map((term) => (
                      <Button
                        key={term}
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setQuery(term);
                          router.push(`/search?q=${encodeURIComponent(term)}`);
                        }}
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Grid */}
            {!loading && currentItems.length > 0 && (
              <>
                <div className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'space-y-4'
                )}>
                  {currentItems.map((car, idx) => (
                    <Card
                      key={idx}
                      className={cn(
                        "group overflow-hidden card-hover",
                        viewMode === 'list' && 'flex'
                      )}
                    >
                      <div className={cn(
                        "relative overflow-hidden bg-muted",
                        viewMode === 'grid' ? 'aspect-square' : 'w-48 h-36 flex-shrink-0'
                      )}>
                        <Image
                          src={normalizeImageUrl(car.image)}
                          alt={car.title || 'Model Car'}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(car);
                          }}
                        >
                          <Heart
                            className={cn(
                              "h-4 w-4",
                              isInWishlist(car) && "fill-red-500 text-red-500"
                            )}
                          />
                        </Button>
                      </div>
                      <CardContent className={cn(
                        "p-4",
                        viewMode === 'list' && 'flex-1 flex flex-col justify-between'
                      )}>
                        <div>
                          <h3 className="font-medium line-clamp-2 mb-2">{car.title}</h3>
                          {car.source && (
                            <Badge variant="secondary" className="mb-2">
                              {car.source}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <span className="text-lg font-bold text-primary">{car.price}</span>
                          <Button size="sm" asChild>
                            <a href={car.link} target="_blank" rel="noopener noreferrer">
                              View
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* No Query State */}
            {!loading && !error && !initialQuery && (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Start your search</h3>
                  <p className="text-muted-foreground mb-6">
                    Enter a model name, brand, or keywords to find your perfect diecast car
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Ferrari', 'Porsche', 'McLaren', 'Lamborghini', 'BMW'].map((term) => (
                      <Button
                        key={term}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQuery(term);
                          router.push(`/search?q=${encodeURIComponent(term)}`);
                        }}
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
