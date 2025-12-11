"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Car,
  Heart,
  MessageCircle,
  Package,
  Search,
  Settings,
  User,
  LogOut,
  TrendingUp,
  ShoppingBag,
  Star,
  Clock,
  ChevronRight,
  Plus,
  Bell,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isLoggedIn, getUserData, getAuthToken, clearSession, getAuthHeaders } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    wishlistCount: 0,
    messagesCount: 0,
    listingsCount: 0,
    recentSearches: []
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    
    const userData = getUserData();
    setUser(userData);
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      // Fetch wishlist count
      let wishlistCount = 0;
      try {
        const wishlistRes = await fetch(`${API_BASE}/wishlists`, {
          headers: getAuthHeaders()
        });
        
        if (wishlistRes.ok) {
          const wishlistData = await wishlistRes.json();
          // The API returns an array directly, not an object with items
          wishlistCount = Array.isArray(wishlistData) ? wishlistData.length : (wishlistData.items?.length || 0);
        }
      } catch (wishlistError) {
        console.log('Wishlist fetch error (non-critical):', wishlistError.message);
      }

      // Fetch messages count
      let messagesCount = 0;
      try {
        const messagesRes = await fetch(`${API_BASE}/messages/threads`, {
          headers: getAuthHeaders()
        });
        
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          messagesCount = messagesData.threads?.filter(t => t.unreadCount > 0).length || 0;
        }
      } catch (messagesError) {
        console.log('Messages fetch error (non-critical):', messagesError.message);
      }

      // Get recent searches from localStorage
      const recentSearches = JSON.parse(localStorage.getItem('recent_searches') || '[]').slice(0, 5);

      setStats({
        wishlistCount,
        messagesCount,
        listingsCount: 0, // Will be fetched if user is a seller
        recentSearches
      });

      // Demo recent activity
      setRecentActivity([
        { id: 1, type: 'search', text: 'Searched for "Ferrari 1:18"', time: '2 hours ago' },
        { id: 2, type: 'wishlist', text: 'Added item to wishlist', time: '5 hours ago' },
        { id: 3, type: 'view', text: 'Viewed Hot Wheels Collection', time: '1 day ago' },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const quickActions = [
    { icon: Search, label: 'Search Cars', href: '/search', color: 'text-blue-500' },
    { icon: Heart, label: 'My Wishlist', href: '/wishlist', color: 'text-red-500' },
    { icon: MessageCircle, label: 'Messages', href: '/messages', color: 'text-green-500' },
    { icon: Package, label: 'Sell', href: '/sell', color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <span className="font-semibold text-xl hidden sm:inline">ModelCarCenter</span>
          </Link>
          
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/search">Browse</Link>
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline">{user?.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.username}</span>
                    <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
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
                {user?.account_type === 'shop' && (
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
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Wishlist</p>
                  <p className="text-2xl font-bold">{stats.wishlistCount}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Messages</p>
                  <p className="text-2xl font-bold">{stats.messagesCount}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Searches</p>
                  <p className="text-2xl font-bold">{stats.recentSearches.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Search className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Account</p>
                  <p className="text-2xl font-bold capitalize">{user?.account_type || 'Collector'}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <div className={`h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3 ${action.color}`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <p className="font-medium">{action.label}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Searches
              </CardTitle>
              <CardDescription>Your recent search history</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentSearches.length > 0 ? (
                <div className="space-y-2">
                  {stats.recentSearches.map((search, index) => (
                    <Link
                      key={index}
                      href={`/search?q=${encodeURIComponent(search)}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span>{search}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent searches</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/search">Start searching</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your recent actions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {activity.type === 'search' && <Search className="h-4 w-4" />}
                      {activity.type === 'wishlist' && <Heart className="h-4 w-4" />}
                      {activity.type === 'view' && <Eye className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seller Section */}
        {user?.account_type === 'shop' && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Seller Dashboard
                    </CardTitle>
                    <CardDescription>Manage your listings and sales</CardDescription>
                  </div>
                  <Button asChild>
                    <Link href="/sell">
                      <Plus className="h-4 w-4 mr-2" />
                      New Listing
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Active Listings</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">$0</p>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upgrade CTA for collectors */}
        {user?.account_type !== 'shop' && (
          <div className="mt-8">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Want to sell your model cars?</h3>
                    <p className="text-muted-foreground">Upgrade to a seller account and start listing your collection today.</p>
                  </div>
                  <Button>
                    Become a Seller
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
