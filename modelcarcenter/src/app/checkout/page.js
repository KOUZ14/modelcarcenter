'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { useCart } from '@/components/cart-provider';
import { formatMoney } from '@/lib/cart';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  'http://localhost:8080';

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

function CheckoutForm({ clientSecret, paymentId, amount, currency }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!stripe || !elements) return;

    setSubmitting(true);
    try {
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?payment_id=${encodeURIComponent(paymentId)}`,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
    } catch (err) {
      setError(err?.message || 'Payment failed');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Paying <span className="font-medium">{formatMoney(amount, currency)}</span>
      </div>
      <PaymentElement />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button className="w-full" type="submit" disabled={!stripe || !elements || submitting}>
        {submitting ? 'Processing…' : 'Pay'}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, currency, clear } = useCart();

  const [clientSecret, setClientSecret] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stripePromise = useMemo(() => {
    if (!STRIPE_PUBLISHABLE_KEY) return null;
    return loadStripe(STRIPE_PUBLISHABLE_KEY);
  }, []);

  const amount = useMemo(() => {
    const n = Number.isFinite(total) ? total : 0;
    return Number(n.toFixed(2));
  }, [total]);

  useEffect(() => {
    if (!items.length) {
      router.replace('/cart');
    }
  }, [items.length, router]);

  useEffect(() => {
    let cancelled = false;

    async function createPaymentIntent() {
      setLoading(true);
      setError('');
      setClientSecret('');
      setPaymentId('');

      if (!STRIPE_PUBLISHABLE_KEY) {
        setError('Missing Stripe publishable key. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.');
        setLoading(false);
        return;
      }
      if (!items.length) {
        setLoading(false);
        return;
      }

      try {
        const idempotencyKey = crypto.randomUUID();
        const orderId = crypto.randomUUID();
        const listingId = items.length === 1 ? String(items[0].id) : 'multiple';

        const res = await fetch(`${API_BASE}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify({
            provider: 'stripe',
            amount,
            currency,
            metadata: {
              order_id: orderId,
              listing_id: listingId,
            },
            account_id: null,
          }),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to create payment');
        }

        if (cancelled) return;
        setClientSecret(String(data?.client_secret || ''));
        setPaymentId(String(data?.id || data?.payment_id || ''));
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Failed to create payment');
          setLoading(false);
        }
      }
    }

    createPaymentIntent();
    return () => {
      cancelled = true;
    };
  }, [amount, currency, items.length]);

  const canRenderElements = !!stripePromise && !!clientSecret && !!paymentId;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold leading-none">Checkout</h1>
            <p className="text-sm text-muted-foreground leading-none">Pay securely with Stripe</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/cart">Back to cart</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <p className="text-sm text-muted-foreground">Preparing payment…</p> : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              {canRenderElements ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm
                    clientSecret={clientSecret}
                    paymentId={paymentId}
                    amount={amount}
                    currency={currency}
                  />
                </Elements>
              ) : null}
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate pr-3">{it.title} × {it.quantity || 1}</span>
                    <span className="font-medium">{formatMoney((it.price || 0) * (it.quantity || 1), it.currency || currency)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-primary">{formatMoney(amount, currency)}</span>
              </div>
              <Button className="w-full mt-4" variant="outline" onClick={clear}>
                Clear cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
