'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, MessageCircle, ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { useCart } from '@/components/cart-provider';
import { formatMoney, toNumberPrice } from '@/lib/cart';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getAuthHeaders, isLoggedIn, trackActivity } from '@/lib/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  'http://localhost:8080';

function normalizeImageUrl(url) {
  if (!url) return '/favicon.ico';
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return url;
  } catch {
    return '/favicon.ico';
  }
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSending, setMessageSending] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const listingId = useMemo(() => String(params?.id ?? ''), [params?.id]);

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setError('');
      setAdded(false);
      try {
        const res = await fetch(`${API_BASE_URL}/listings/${encodeURIComponent(listingId)}`);
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || 'Failed to load listing');
        }
        const data = await res.json();
        if (cancelled) return;
        setProduct({
          ...data,
          id: data?.id ?? listingId,
          title: data?.title ?? 'Listing',
          description: data?.description ?? '',
          price: toNumberPrice(data?.price),
          currency: data?.currency ?? 'USD',
          image_url: data?.image_url ?? data?.image ?? null,
          source: 'ModelCarCenter',
        });
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load listing');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (listingId) fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  const onAddToCart = () => {
    if (!product) return;
    addItem(
      {
        id: String(product.id ?? listingId),
        title: product.title,
        price: product.price,
        currency: product.currency,
        image_url: product.image_url,
      },
      qty
    );
    setAdded(true);
  };

  const openMessageSeller = () => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    setMessageError('');
    setMessageSent(false);
    setMessageText('');
    setMessageOpen(true);
  };

  const sendMessageToSeller = async () => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    if (!messageText.trim()) return;

    setMessageSending(true);
    setMessageError('');
    try {
      if (!product) throw new Error('Listing not loaded');

      const conversationBody = product.seller_user_id
        ? { recipient_id: product.seller_user_id }
        : product.account_id
          ? { account_id: product.account_id }
          : null;

      if (!conversationBody) {
        throw new Error('Could not determine seller for this listing');
      }

      const convRes = await fetch(`${API_BASE_URL}/messages/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(conversationBody),
      });
      const convData = await convRes.json().catch(() => null);
      if (!convRes.ok) throw new Error(convData?.error || 'Failed to start conversation');

      const conversationId = convData?.id || convData?.conversation_id;
      if (!conversationId) throw new Error('Conversation creation did not return an id');

      const msgRes = await fetch(
        `${API_BASE_URL}/messages/conversations/${encodeURIComponent(String(conversationId))}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ content: messageText.trim() }),
        }
      );
      const msgData = await msgRes.json().catch(() => null);
      if (!msgRes.ok) throw new Error(msgData?.error || 'Failed to send message');

      trackActivity('message', `Messaged seller about "${product?.title || 'listing'}"`, {
        listing_id: String(product?.id ?? listingId),
        conversation_id: String(conversationId),
      });

      setMessageSent(true);
      setMessageSending(false);
    } catch (e) {
      setMessageError(e?.message || 'Failed to send message');
      setMessageSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold leading-none">Product</h1>
              <p className="text-sm text-muted-foreground leading-none">ModelCarCenter listing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">Loading…</CardContent>
          </Card>
        )}

        {!loading && error && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button asChild variant="outline">
                <Link href="/search">Back to search</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && product && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <div className="relative aspect-square bg-muted">
                <Image
                  src={normalizeImageUrl(product.image_url)}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{product.title}</CardTitle>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary">ModelCarCenter</Badge>
                      {product.condition ? <Badge variant="outline">{product.condition}</Badge> : null}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatMoney(product.price, product.currency)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {product.description ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No description provided.</p>
                )}

                <Separator className="my-6" />

                <div className="flex items-end gap-3">
                  <div className="w-24">
                    <label className="text-sm font-medium">Qty</label>
                    <Input
                      className="mt-1"
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => {
                        const next = Number.parseInt(e.target.value, 10);
                        setQty(Number.isFinite(next) && next > 0 ? next : 1);
                      }}
                    />
                  </div>
                  <Button className="flex-1" onClick={onAddToCart}>
                    Add to cart
                  </Button>
                  <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={openMessageSeller}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message seller
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Message seller</DialogTitle>
                        <DialogDescription>
                          Ask a question about this listing before buying.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-3">
                        <Textarea
                          placeholder="Write your message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                        />
                        {messageError ? <p className="text-sm text-destructive">{messageError}</p> : null}
                        {messageSent ? (
                          <p className="text-sm text-muted-foreground">Message sent.</p>
                        ) : null}
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            onClick={sendMessageToSeller}
                            disabled={messageSending || !messageText.trim()}
                          >
                            {messageSending ? 'Sending…' : 'Send'}
                          </Button>
                          <Button variant="outline" asChild>
                            <Link href="/messages">Go to messages</Link>
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" asChild>
                    <Link href="/cart">View cart</Link>
                  </Button>
                </div>

                {added ? (
                  <p className="text-sm text-muted-foreground mt-3">Added to cart.</p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
