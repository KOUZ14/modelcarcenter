'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Car, 
  Plus, 
  Package, 
  DollarSign, 
  Edit, 
  Trash2, 
  Loader2,
  ArrowLeft,
  Store,
  Eye,
  MoreVertical
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SellPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewListingDialog, setShowNewListingDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    quantity: '1',
    sku: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      setLoading(false);
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    if (parsedUser.account_type === 'shop') {
      fetchSellerAccount(token, parsedUser);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSellerAccount = async (token, userData) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
      
      // First, check if user has a seller account
      const accountsRes = await fetch(`${API_BASE}/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (accountsRes.ok) {
        const accounts = await accountsRes.json();
        const userAccount = accounts.find(a => a.name === userData.username);
        
        if (userAccount) {
          setAccount(userAccount);
          
          // Fetch listings
          const listingsRes = await fetch(`${API_BASE}/accounts/${userAccount.id}/listings?include_listings=true`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (listingsRes.ok) {
            const accountData = await listingsRes.json();
            setListings(accountData.listings || []);
          }
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load seller data');
      setLoading(false);
    }
  };

  const createSellerAccount = async () => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;

    setSubmitting(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
      const res = await fetch(`${API_BASE}/accounts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.username,
          account_type: 'shop',
          contact_email: user.email,
        }),
      });

      if (res.ok) {
        const newAccount = await res.json();
        setAccount(newAccount);
        setListings([]);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create seller account');
      }
    } catch (err) {
      setError('Failed to create seller account');
    }
    setSubmitting(false);
  };

  const createListing = async () => {
    if (!account) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    setSubmitting(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
      const res = await fetch(`${API_BASE}/accounts/${account.id}/listings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newListing.title,
          description: newListing.description,
          price: parseFloat(newListing.price),
          currency: newListing.currency,
          quantity: parseInt(newListing.quantity),
          sku: newListing.sku || null,
        }),
      });

      if (res.ok) {
        const listing = await res.json();
        setListings([listing, ...listings]);
        setShowNewListingDialog(false);
        setNewListing({
          title: '',
          description: '',
          price: '',
          currency: 'USD',
          quantity: '1',
          sku: '',
        });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create listing');
      }
    } catch (err) {
      setError('Failed to create listing');
    }
    setSubmitting(false);
  };

  const deleteListing = async (listingId) => {
    if (!account) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
      const res = await fetch(`${API_BASE}/accounts/${account.id}/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setListings(listings.filter(l => l.id !== listingId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Not logged in
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ModelCarCenter</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>
        
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Store className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Start Selling</h1>
          <p className="text-muted-foreground mb-8">
            Create an account to list your model cars and reach collectors worldwide
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // User is not a seller
  if (!loading && user && user.account_type !== 'shop') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ModelCarCenter</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>
        
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Store className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Become a Seller</h1>
          <p className="text-muted-foreground mb-8">
            Your account is set up as a collector. To sell model cars, you need to upgrade to a seller account.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Contact support to upgrade your account type, or create a new seller account.
          </p>
          <Button asChild>
            <Link href="/register">Create Seller Account</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ModelCarCenter</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile">Profile</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" className="-ml-2 mb-4" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </Button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading seller dashboard...</p>
          </div>
        ) : !account ? (
          // No seller account yet
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Set Up Your Shop</CardTitle>
              <CardDescription>
                Create your seller profile to start listing model cars
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={createSellerAccount} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Seller Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Seller dashboard
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Seller Dashboard</h1>
                <p className="text-muted-foreground">
                  Manage your listings and track sales
                </p>
              </div>
              <Dialog open={showNewListingDialog} onOpenChange={setShowNewListingDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Listing
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Listing</DialogTitle>
                    <DialogDescription>
                      Add a new model car to your inventory
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Ferrari 488 GTB 1:18 Scale"
                        value={newListing.title}
                        onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your model car..."
                        value={newListing.description}
                        onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="99.99"
                          value={newListing.price}
                          onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={newListing.currency}
                          onValueChange={(value) => setNewListing({ ...newListing, currency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={newListing.quantity}
                          onChange={(e) => setNewListing({ ...newListing, quantity: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU (Optional)</Label>
                        <Input
                          id="sku"
                          placeholder="SKU-001"
                          value={newListing.sku}
                          onChange={(e) => setNewListing({ ...newListing, sku: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewListingDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createListing} disabled={submitting || !newListing.title || !newListing.price}>
                      {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Listing
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{listings.length}</p>
                      <p className="text-sm text-muted-foreground">Active Listings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">$0</p>
                      <p className="text-sm text-muted-foreground">Total Sales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Listings */}
            <Card>
              <CardHeader>
                <CardTitle>Your Listings</CardTitle>
                <CardDescription>
                  Manage your model car inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                {listings.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No listings yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first listing to start selling
                    </p>
                    <Button onClick={() => setShowNewListingDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Listing
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {listings.map((listing) => (
                      <div
                        key={listing.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{listing.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={listing.is_active ? 'default' : 'secondary'}>
                              {listing.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Qty: {listing.quantity}
                            </span>
                            {listing.sku && (
                              <span className="text-sm text-muted-foreground">
                                SKU: {listing.sku}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-primary">
                            {listing.currency} {listing.price?.toFixed(2)}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => deleteListing(listing.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
