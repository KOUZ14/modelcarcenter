"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Car,
  Heart,
  Share2,
  MessageCircle,
  Star,
  MapPin,
  Clock,
  Shield,
  Truck,
  Package,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  User,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { isLoggedIn, getAuthHeaders, trackActivity } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [user, setUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchProduct();
    checkWishlist();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      // Try to fetch from our API - check if it's a ModelCarCenter listing
      const response = await fetch(`${API_BASE}/listings/${params.id}`);
      
      if (response.ok) {
        const data = await response.json();
        // This is a ModelCarCenter listing
        setProduct({
          ...data,
          source: 'ModelCarCenter',
          price: parseFloat(data.price) || 0,
        });
        // Track view activity
        trackActivity('view', `Viewed "${data.title}"`, { listingId: params.id });
      } else {
        // Demo product for development
        setProduct({
          id: params.id,
          title: '1967 Ford Mustang GT Fastback 1:18 Scale',
          price: 89.99,
          originalPrice: 109.99,
          condition: 'Mint',
          scale: '1:18',
          brand: 'Auto World',
          manufacturer: 'Ford',
          year: '1967',
          color: 'Highland Green',
          description: `This stunning 1:18 scale replica of the iconic 1967 Ford Mustang GT Fastback features incredible attention to detail. The model includes opening doors, hood, and trunk, along with a highly detailed engine compartment.

Key Features:
• Die-cast metal body with plastic details
• Steerable front wheels
• Opening doors, hood, and trunk
• Detailed interior with accurate dashboard
• Rubber tires on chrome wheels
• Comes in original packaging with display case

This is a must-have for any Mustang enthusiast or die-cast collector. The model is in mint condition, never removed from the display case.`,
          images: [
            '/placeholder-car-1.jpg',
            '/placeholder-car-2.jpg',
            '/placeholder-car-3.jpg'
          ],
          seller: {
            id: 'seller123',
            username: 'ClassicDiecast',
            rating: 4.9,
            reviewCount: 247,
            memberSince: '2019',
            responseTime: '< 1 hour',
            location: 'Los Angeles, CA'
          },
          shipping: {
            cost: 9.99,
            freeOver: 100,
            estimatedDays: '3-5 business days',
            international: true
          },
          source: 'local',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          views: 342,
          watchers: 12
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/wishlists`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsWishlisted(data.items?.some(item => item.listing_id === params.id));
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const toggleWishlist = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    try {
      if (isWishlisted) {
        await fetch(`${API_BASE}/api/wishlists/${params.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await fetch(`${API_BASE}/api/wishlists`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            listing_id: params.id,
            listing_title: product?.title,
            listing_price: product?.price,
            listing_image: product?.images?.[0]
          })
        });
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleContactSeller = async () => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    
    if (!messageText.trim()) return;
    
    try {
      // First, get the seller's user ID from the account
      const accountRes = await fetch(`${API_BASE}/accounts/${product.account_id}`, {
        headers: getAuthHeaders(),
      });
      
      if (!accountRes.ok) {
        console.error('Failed to fetch seller account');
        return;
      }
      
      const account = await accountRes.json();
      
      // Create or get conversation with seller
      const convRes = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          recipient_id: product.seller_id || account.user_id,
        })
      });
      
      if (!convRes.ok) {
        console.error('Failed to create conversation');
        return;
      }
      
      const conv = await convRes.json();
      
      // Send the message
      const msgRes = await fetch(`${API_BASE}/conversations/${conv.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          content: messageText,
        }),
      });
      
      if (msgRes.ok) {
        setMessageSent(true);
        setMessageText('');
        // Track message activity
        trackActivity('message', `Messaged seller about "${product.title}"`, { 
          listingId: params.id 
        });
        // Redirect to messages page after a brief delay
        setTimeout(() => {
          router.push('/messages');
        }, 1500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-4">This listing may have been removed or does not exist.</p>
          <Button onClick={() => router.push('/search')}>Browse Listings</Button>
        </div>
      </div>
    );
  }

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
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/wishlist">Wishlist</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/messages">Messages</Link>
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/search" className="hover:text-foreground transition-colors">Search</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <Car className="h-32 w-32 text-muted-foreground/50" />
              </div>
              
              {/* Navigation Arrows */}
              {product.images?.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === 0 ? product.images.length - 1 : prev - 1
                    )}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === product.images.length - 1 ? 0 : prev + 1
                    )}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
              
              {/* Image Counter */}
              {product.images?.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {product.images.length}
                </div>
              )}
              
              {/* Source Badge */}
              {product.source === 'eBay' && (
                <Badge className="absolute top-4 left-4" variant="secondary">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  eBay
                </Badge>
              )}
              {product.source === 'ModelCarCenter' && (
                <Badge className="absolute top-4 left-4" variant="default">
                  <Package className="h-3 w-3 mr-1" />
                  ModelCarCenter
                </Badge>
              )}
            </div>
            
            {/* Thumbnail Strip */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg bg-muted flex items-center justify-center border-2 transition-colors ${
                      currentImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <Car className="h-8 w-8 text-muted-foreground/50" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-2xl font-bold">{product.title}</h1>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleWishlist}
                    className={isWishlisted ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <Badge variant="destructive">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{product.condition}</Badge>
              <Badge variant="secondary">{product.scale}</Badge>
              <Badge variant="secondary">{product.brand}</Badge>
              {product.year && <Badge variant="outline">{product.year}</Badge>}
            </div>

            <Separator />

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Manufacturer</p>
                <p className="font-medium">{product.manufacturer || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Color</p>
                <p className="font-medium">{product.color || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scale</p>
                <p className="font-medium">{product.scale}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Brand</p>
                <p className="font-medium">{product.brand}</p>
              </div>
            </div>

            <Separator />

            {/* Shipping Info */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {product.shipping?.cost === 0 || product.price >= (product.shipping?.freeOver || 100) 
                          ? 'Free Shipping' 
                          : `$${product.shipping?.cost?.toFixed(2) || '9.99'} Shipping`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Est. delivery: {product.shipping?.estimatedDays || '3-5 business days'}
                      </p>
                    </div>
                  </div>
                  {product.shipping?.international && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-green-500" />
                      International shipping available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {product.source === 'eBay' ? (
                <Button size="lg" className="w-full" asChild>
                  <a href={product.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on eBay
                  </a>
                </Button>
              ) : product.source === 'ModelCarCenter' ? (
                <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message Seller
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Message Seller</DialogTitle>
                      <DialogDescription>
                        Ask about {product.title}
                      </DialogDescription>
                    </DialogHeader>
                    {messageSent ? (
                      <div className="py-8 text-center">
                        <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p className="font-medium">Message Sent!</p>
                        <p className="text-sm text-muted-foreground">
                          The seller will respond in their messages
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Hi, I'm interested in this item. Is it still available?"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          rows={4}
                        />
                        <Button 
                          className="w-full" 
                          onClick={handleContactSeller}
                          disabled={!messageText.trim()}
                        >
                          Send Message
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              ) : null}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Buyer Protection
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                Secure Packaging
              </div>
            </div>
          </div>
        </div>

        {/* Description & Seller Info */}
        <div className="grid lg:grid-cols-3 gap-8 mt-12">
          {/* Description */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{product.description}</p>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Listed {formatDate(product.createdAt)}
              </div>
              {product.views && (
                <div>{product.views} views</div>
              )}
              {product.watchers && (
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {product.watchers} watching
                </div>
              )}
            </div>
          </div>

          {/* Seller Info */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{product.seller?.username}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{product.seller?.rating}</span>
                      <span className="text-muted-foreground">
                        ({product.seller?.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{product.seller?.location || 'United States'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Member since {product.seller?.memberSince}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span>Responds {product.seller?.responseTime}</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/seller/${product.seller?.id}`}>
                    View Seller Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              <span className="font-semibold">ModelCarCenter</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ModelCarCenter. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}