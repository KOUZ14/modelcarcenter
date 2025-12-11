'use client';

import Link from 'next/link';
import { Car, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Button variant="ghost" size="sm" className="-ml-2 mb-6" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-xl text-muted-foreground mb-8">
            Have questions, feedback, or need assistance? We&apos;d love to hear from you.
          </p>

          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <p className="text-lg text-muted-foreground">
              Contact form coming soon. In the meantime, please reach out to us via email:
            </p>
            <a 
              href="mailto:support@modelcarcenter.com" 
              className="text-2xl font-medium text-primary hover:underline mt-4 block"
            >
              support@modelcarcenter.com
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ModelCarCenter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
