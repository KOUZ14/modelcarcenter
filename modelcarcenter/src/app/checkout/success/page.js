'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  'http://localhost:8080';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const paymentId = useMemo(() => searchParams.get('payment_id') || '', [searchParams]);

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let intervalId;
    let timeoutId;

    async function fetchStatus() {
      if (!paymentId) {
        setError('Missing payment_id');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/payments/${encodeURIComponent(paymentId)}`);
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || 'Failed to fetch payment status');

        if (cancelled) return;
        const nextStatus = String(data?.status || '');
        setStatus(nextStatus);
        setLoading(false);
        return nextStatus;
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Failed to fetch payment status');
          setLoading(false);
        }
        return null;
      }
    }

    // Initial fetch, then poll for a short window (webhook timing)
    fetchStatus().then((initial) => {
      if (cancelled) return;
      if (!initial || (initial !== 'succeeded' && initial !== 'failed' && initial !== 'canceled')) {
        intervalId = window.setInterval(() => {
          fetchStatus().then((s) => {
            if (s === 'succeeded' || s === 'failed' || s === 'canceled') {
              if (intervalId) window.clearInterval(intervalId);
              intervalId = undefined;
            }
          });
        }, 2000);
        timeoutId = window.setTimeout(() => {
          if (intervalId) window.clearInterval(intervalId);
          intervalId = undefined;
        }, 20000);
      }
    });

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold leading-none">Checkout Result</h1>
            <p className="text-sm text-muted-foreground leading-none">Payment status</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">Payment ID</div>
            <div className="text-sm font-mono break-all">{paymentId || '—'}</div>
            <Separator />
            {loading ? <p className="text-sm text-muted-foreground">Checking status…</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {!loading && !error ? (
              <p className="text-sm">
                Status: <span className="font-medium">{status || 'unknown'}</span>
              </p>
            ) : null}

            <div className="flex gap-2 pt-2">
              <Button asChild>
                <Link href="/search">Continue shopping</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/cart">Back to cart</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
