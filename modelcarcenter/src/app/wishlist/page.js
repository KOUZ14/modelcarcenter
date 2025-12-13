'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Car, 
  Heart, 
  Trash2, 
  ExternalLink, 
  Loader2,
  ShoppingBag,
  ArrowLeft,
  User,
  LogOut
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  isLoggedIn, 
  getUserData, 
  getAuthHeaders, 
  clearSession,
  getLocalWishlist,
  removeFromLocalWishlist 
} from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

// Simple confirmation dialog
const ConfirmDialog = ({ children, onConfirm, title, description }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <Card className="relative z-50 w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-muted-foreground mb-4">{description}</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => { onConfirm(); setOpen(false); }}>Remove</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in using consistent auth
    if (isLoggedIn()) {
      const userData = getUserData();
      setUser(userData);
      fetchWishlist();
    } else {
      // Use local storage wishlist for non-logged in users
      const localWishlist = getLocalWishlist();
      setWishlist(localWishlist);
      setLoading(false);
    }
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`${API_BASE}/wishlists`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Token expired, clear session and show local wishlist
          clearSession();
          setUser(null);
          const localWishlist = getLocalWishlist();
          setWishlist(localWishlist);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch wishlist');
      }

      const data = await res.json();
      setWishlist(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load wishlist');
      setLoading(false);
    }
  };

  const removeFromWishlist = async (item) => {
    if (!isLoggedIn()) {
      // Remove from local storage
      const newWishlist = removeFromLocalWishlist(item.link);
      setWishlist(newWishlist);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/wishlists/${item.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        setWishlist(wishlist.filter(w => w.id !== item.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const normalizeImageUrl = (url) => {
    if (!url) return 'https://placehold.co/400x300/1f2937/9ca3af?text=No+Image';
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
    return url;
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setWishlist(getLocalWishlist());
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ModelCarCenter</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist">My Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
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
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="-ml-2 mb-4" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                My Wishlist
              </h1>
              <p className="text-muted-foreground mt-1">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            {!user && wishlist.length > 0 && (
              <Button asChild>
                <Link href="/login">Sign in to sync</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your wishlist...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && wishlist.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start adding model cars you love by clicking the heart icon on any listing
              </p>
              <Button asChild>
                <Link href="/search">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Browse Model Cars
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Wishlist Grid */}
        {!loading && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wishlist.map((item, idx) => (
              <Card key={item.id || idx} className="group overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={normalizeImageUrl(item.image)}
                    alt={item.title || 'Model Car'}
                    fill
                    className="object-cover"
                  />
                  <ConfirmDialog
                    title="Remove from wishlist?"
                    description="This item will be removed from your wishlist."
                    onConfirm={() => removeFromWishlist(item)}
                  >
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </ConfirmDialog>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium line-clamp-2 mb-2">{item.title}</h3>
                  {item.source && (
                    <Badge variant="secondary" className="mb-2">
                      {item.source}
                    </Badge>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-primary">{item.price}</span>
                    <Button size="sm" asChild>
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        View
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                  {item.price_at_add && item.price !== item.price_at_add && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Added at {item.price_at_add}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
