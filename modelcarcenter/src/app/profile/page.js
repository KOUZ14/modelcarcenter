'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Car, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  ArrowLeft,
  LogOut,
  Store,
  Heart,
  Package,
  Settings,
  Edit2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { isLoggedIn, getUserData, clearSession } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    
    const userData = getUserData();
    setUser(userData);
    setLoading(false);
  }, [router]);

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ModelCarCenter</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" className="-ml-2 mb-6" asChild>
          <Link href={user.account_type === 'shop' ? '/sell' : '/dashboard'}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{user.username}</h1>
                    <Badge variant={user.account_type === 'shop' ? 'default' : 'secondary'}>
                      {user.account_type === 'shop' ? (
                        <>
                          <Store className="h-3 w-3 mr-1" />
                          Seller
                        </>
                      ) : (
                        <>
                          <Heart className="h-3 w-3 mr-1" />
                          Collector
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your account details and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">{user.username}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Account Type</p>
                    <p className="font-medium capitalize">{user.account_type || 'Collector'}</p>
                  </div>
                </div>
              </div>

              {user.user_id && (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">User ID</p>
                      <p className="font-medium font-mono text-sm">{user.user_id}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {user.account_type === 'shop' ? (
                  <>
                    <Button variant="outline" className="justify-start" asChild>
                      <Link href="/sell">
                        <Package className="h-4 w-4 mr-2" />
                        My Listings
                      </Link>
                    </Button>
                    <Button variant="outline" className="justify-start" asChild>
                      <Link href="/messages">
                        <Mail className="h-4 w-4 mr-2" />
                        Messages
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="justify-start" asChild>
                      <Link href="/wishlist">
                        <Heart className="h-4 w-4 mr-2" />
                        My Wishlist
                      </Link>
                    </Button>
                    <Button variant="outline" className="justify-start" asChild>
                      <Link href="/search">
                        <Package className="h-4 w-4 mr-2" />
                        Browse Cars
                      </Link>
                    </Button>
                  </>
                )}
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start text-red-500 hover:text-red-500" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
