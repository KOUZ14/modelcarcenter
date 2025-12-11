'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, 
  ArrowRight, 
  Car, 
  Globe, 
  TrendingUp, 
  Shield, 
  Heart, 
  Star,
  ChevronRight,
  Sparkles,
  Clock,
  Zap,
  User,
  LogOut,
  MessageCircle,
  Package
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isLoggedIn, getUserData, clearSession } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const searchInputRef = useRef(null);

  // Popular search suggestions
  const popularSearches = [
    { term: 'Ferrari 488', count: '2.4k' },
    { term: 'Porsche 911 GT3', count: '1.8k' },
    { term: 'McLaren P1', count: '1.2k' },
    { term: 'Lamborghini Huracán', count: '980' },
    { term: 'BMW M3 E30', count: '750' },
    { term: 'Mercedes AMG GT', count: '620' },
  ];

  // Quick filter categories
  const quickFilters = [
    { label: '1:18 Scale', icon: Car },
    { label: '1:64 Scale', icon: Car },
    { label: 'Under $50', icon: TrendingUp },
    { label: 'New Arrivals', icon: Sparkles },
  ];

  // Stats for social proof
  const stats = [
    { value: '50k+', label: 'Model Cars' },
    { value: '12+', label: 'Trusted Sellers' },
    { value: '4.9', label: 'Avg Rating', icon: Star },
  ];

  useEffect(() => {
    setMounted(true);
    // Check if user is logged in using consistent auth
    if (isLoggedIn()) {
      setUser(getUserData());
    }
    
    // Fetch featured products from eBay
    const fetchFeaturedProducts = async () => {
      try {
        setLoadingProducts(true);
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
        const searchTerms = ['ferrari diecast', 'porsche diecast', 'lamborghini diecast', 'bmw diecast'];
        const randomSearch = searchTerms[Math.floor(Math.random() * searchTerms.length)];
        
        const response = await fetch(
          `${API_BASE}/search?q=${encodeURIComponent(randomSearch)}&limit=4`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            setFeaturedProducts(data.results.slice(0, 4));
          }
        }
      } catch (error) {
        console.log('Error fetching featured products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    
    fetchFeaturedProducts();
  }, []);

  const handleLogout = () => {
    clearSession();
    setUser(null);
    router.refresh();
  };

  // Debounced search suggestions
  const fetchSuggestions = useCallback((searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    // Filter popular searches that match the query
    const filtered = popularSearches.filter(s => 
      s.term.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSuggestions(filtered);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 150);
    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  const handleSearch = (searchTerm = query) => {
    if (!searchTerm.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ModelCarCenter</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/search">Browse</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sell">Sell</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/wishlist">
                <Heart className="h-4 w-4 mr-1" />
                Wishlist
              </Link>
            </Button>
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.username}</span>
                      <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="cursor-pointer">
                      <Heart className="h-4 w-4 mr-2" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages" className="cursor-pointer">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  {user.account_type === 'shop' && (
                    <DropdownMenuItem asChild>
                      <Link href="/sell" className="cursor-pointer">
                        <Package className="h-4 w-4 mr-2" />
                        My Listings
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 hero-gradient">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Search across 12+ trusted sellers instantly
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Find Your Perfect
            <span className="text-primary block mt-2">Diecast Model Car</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Stop searching across dozens of websites. Compare prices, find the best deals, 
            and discover rare collectibles — all in one place.
          </p>

          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto">
            <div 
              className={cn(
                "relative rounded-xl border-2 bg-background transition-all duration-200 search-glow",
                isSearchFocused ? "border-primary shadow-lg" : "border-input"
              )}
            >
              <div className="flex items-center">
                <Search className="h-5 w-5 ml-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for any model car... Ferrari, Porsche, McLaren..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyPress={handleKeyPress}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    setIsSearchFocused(false);
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  className="flex-1 px-4 py-4 bg-transparent outline-none text-base placeholder:text-muted-foreground"
                />
                <Button 
                  onClick={() => handleSearch()}
                  className="m-1.5 px-6"
                  size="lg"
                >
                  Search
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && (query || isSearchFocused) && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border bg-popover shadow-lg overflow-hidden z-50">
                  {query && suggestions.length > 0 ? (
                    <div className="p-2">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSearch(suggestion.term);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-left transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            {suggestion.term}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.count} results
                          </Badge>
                        </button>
                      ))}
                    </div>
                  ) : !query ? (
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
                        Popular Searches
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.slice(0, 4).map((search, idx) => (
                          <Button
                            key={idx}
                            variant="secondary"
                            size="sm"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSearch(search.term);
                            }}
                            className="text-sm"
                          >
                            {search.term}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              {quickFilters.map((filter, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleSearch(filter.label)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  {stat.icon && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We aggregate listings from trusted sellers and eBay, so you can find 
              the best deals without the hassle of checking multiple sites.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Search className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Search Once</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Enter your search and we&apos;ll check all major sellers and eBay listings in seconds.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Compare Prices</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  See prices from different sellers side by side. Filter by scale, brand, or budget.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Buy Directly</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Found the perfect car? Click through to the seller&apos;s site to complete your purchase.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                Why Collectors Choose Us
              </Badge>
              <h2 className="text-3xl font-bold mb-6">
                Everything You Need to Build Your Collection
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Multiple Sources, One Search</h3>
                    <p className="text-muted-foreground">
                      We pull listings from top model car retailers and eBay so you never miss a deal.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Trusted Sellers Only</h3>
                    <p className="text-muted-foreground">
                      All our partner sellers are vetted for quality and reliability.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Save Your Favorites</h3>
                    <p className="text-muted-foreground">
                      Create wishlists and get notified when prices drop on items you love.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Real-Time Updates</h3>
                    <p className="text-muted-foreground">
                      Prices and availability are refreshed regularly so you see accurate info.
                    </p>
                  </div>
                </div>
              </div>

              <Button className="mt-8" size="lg" asChild>
                <Link href="/search">
                  Start Searching
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            {/* Featured Cards Preview */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {loadingProducts || featuredProducts.length === 0 ? (
                  // Loading/fallback placeholders
                  <>
                    {[
                      { title: 'Ferrari 488 GTB 1:18 Scale', price: '$149.99', seller: 'eBay' },
                      { title: 'Porsche 911 GT3 RS 1:64', price: '$24.99', seller: 'Tarmac Works' },
                      { title: 'McLaren P1 Limited Edition', price: '$299.00', seller: 'Fairfield' },
                      { title: 'Lamborghini Aventador SVJ', price: '$89.99', seller: 'Model Cars Houston' }
                    ].map((item, idx) => (
                      <Card key={idx} className={cn("card-hover", idx === 1 && "mt-8", idx === 2 && "-mt-4", idx === 3 && "mt-4")}>
                        <div className="aspect-square relative bg-muted rounded-t-lg overflow-hidden animate-pulse">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Car className="h-16 w-16 text-muted-foreground/30" />
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <p className="font-medium text-sm line-clamp-2">{item.title}</p>
                          <p className="text-primary font-bold mt-1">{item.price}</p>
                          <Badge variant="secondary" className="mt-2 text-xs">{item.seller}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  // Actual products from eBay
                  featuredProducts.map((product, idx) => (
                    <Card 
                      key={product.item_id || idx} 
                      className={cn(
                        "card-hover cursor-pointer transition-transform hover:scale-105", 
                        idx === 1 && "mt-8", 
                        idx === 2 && "-mt-4", 
                        idx === 3 && "mt-4"
                      )}
                      onClick={() => window.open(product.item_url, '_blank')}
                    >
                      <div className="aspect-square relative bg-muted rounded-t-lg overflow-hidden">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.title}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={cn(
                            "absolute inset-0 items-center justify-center",
                            product.image_url ? "hidden" : "flex"
                          )}
                        >
                          <Car className="h-16 w-16 text-muted-foreground/30" />
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="font-medium text-sm line-clamp-2">{product.title}</p>
                        <p className="text-primary font-bold mt-1">
                          {product.price ? `$${parseFloat(product.price).toFixed(2)}` : 'Price N/A'}
                        </p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {product.seller_name || product.source || 'eBay'}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Model Car?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of collectors who use ModelCarCenter to discover the best deals on diecast cars.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => searchInputRef.current?.focus()}
            >
              Start Searching
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">ModelCarCenter</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                The best place to find and compare diecast model cars from trusted sellers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Browse</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/search?scale=1:18" className="hover:text-foreground transition-colors">1:18 Scale</Link></li>
                <li><Link href="/search?scale=1:64" className="hover:text-foreground transition-colors">1:64 Scale</Link></li>
                <li><Link href="/search?scale=1:43" className="hover:text-foreground transition-colors">1:43 Scale</Link></li>
                <li><Link href="/search" className="hover:text-foreground transition-colors">All Cars</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Create Account</Link></li>
                <li><Link href="/wishlist" className="hover:text-foreground transition-colors">My Wishlist</Link></li>
                <li><Link href="/sell" className="hover:text-foreground transition-colors">Sell Your Cars</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ModelCarCenter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
