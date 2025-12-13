'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { useCart } from '@/components/cart-provider';
import { formatMoney } from '@/lib/cart';

function safeImg(src) {
  return src || '/favicon.ico';
}

export default function CartPage() {
  const { items, removeItem, setQuantity, clear, total, currency } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5" />
            <div>
              <h1 className="text-lg font-semibold leading-none">Cart</h1>
              <p className="text-sm text-muted-foreground leading-none">Review your items</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/search">Continue shopping</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center">
              <p className="text-muted-foreground mb-4">Your cart is empty.</p>
              <Button asChild>
                <Link href="/search">Browse listings</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 flex gap-4">
                    <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <Image src={safeImg(item.image)} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{formatMoney(item.price, item.currency)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                            aria-label="Decrease"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div className="w-10 text-center text-sm">{item.quantity || 1}</div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setQuantity(item.id, (item.quantity || 1) + 1)}
                            aria-label="Increase"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm font-medium">
                          {formatMoney((item.price || 0) * (item.quantity || 1), item.currency)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-primary">{formatMoney(total, currency)}</span>
                </div>
                <Separator className="my-4" />
                <Button className="w-full" asChild>
                  <Link href="/checkout">Checkout</Link>
                </Button>
                <Button className="w-full mt-2" variant="outline" onClick={clear}>
                  Clear cart
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
