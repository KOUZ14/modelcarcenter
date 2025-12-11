'use client';

import Link from 'next/link';
import { Car, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function TermsOfServicePage() {
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

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 11, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using ModelCarCenter (&quot;the Service&quot;), you accept and agree to be bound by the 
              terms and provisions of this agreement. If you do not agree to abide by these terms, please do 
              not use this Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              ModelCarCenter is a platform that aggregates model car listings from various sources, including 
              eBay, and provides users with search, filtering, and wishlist functionality to help them find 
              and track diecast model cars.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To access certain features of the Service, you may be required to create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide accurate and complete information when creating your account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update any information to keep it accurate and current</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit any harmful, threatening, or offensive content</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Interfere with or disrupt the Service or servers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Links and Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service may contain links to third-party websites or services, including eBay listings. 
              We are not responsible for the content, accuracy, or practices of these third-party services. 
              Your interactions with such services are governed by their respective terms and policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service and its original content, features, and functionality are owned by ModelCarCenter 
              and are protected by international copyright, trademark, and other intellectual property laws. 
              You may not reproduce, distribute, modify, or create derivative works without our express 
              written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT ANY WARRANTIES 
              OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE 
              UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. WE MAKE NO WARRANTIES REGARDING THE 
              ACCURACY OR COMPLETENESS OF ANY LISTINGS OR INFORMATION PROVIDED THROUGH THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              IN NO EVENT SHALL MODELCARCENTER, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, 
              OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE 
              DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER 
              INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE 
              THE SERVICE.
            </p>
          </section>

          <section className="bg-muted/50 p-6 rounded-lg border-l-4 border-primary">
            <h2 className="text-2xl font-semibold mb-4">9. Dispute Resolution and Arbitration Agreement</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS, INCLUDING YOUR 
              RIGHT TO FILE A LAWSUIT IN COURT.</strong>
            </p>
            
            <h3 className="text-lg font-medium mb-2">9.1 Agreement to Arbitrate</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You and ModelCarCenter agree that any dispute, claim, or controversy arising out of or relating 
              to these Terms of Service or the use of the Service shall be settled by binding arbitration, 
              rather than in court, except that you may assert claims in small claims court if your claims qualify.
            </p>

            <h3 className="text-lg font-medium mb-2">9.2 Waiver of Class Actions</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              YOU AND MODELCARCENTER AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS 
              INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR 
              REPRESENTATIVE PROCEEDING. Unless both you and ModelCarCenter agree otherwise, the arbitrator 
              may not consolidate more than one person&apos;s claims and may not otherwise preside over any form 
              of a representative or class proceeding.
            </p>

            <h3 className="text-lg font-medium mb-2">9.3 Arbitration Procedures</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The arbitration will be administered by the American Arbitration Association (&quot;AAA&quot;) under its 
              Consumer Arbitration Rules. The arbitration will be conducted in the English language. The 
              arbitrator&apos;s decision shall be final and binding.
            </p>

            <h3 className="text-lg font-medium mb-2">9.4 Informal Resolution First</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Before initiating arbitration, you agree to first contact us at legal@modelcarcenter.com and 
              attempt to resolve any dispute informally. If we are unable to resolve a dispute within 60 days, 
              either party may proceed with arbitration.
            </p>

            <h3 className="text-lg font-medium mb-2">9.5 Opt-Out</h3>
            <p className="text-muted-foreground leading-relaxed">
              You may opt out of this arbitration agreement by sending written notice to legal@modelcarcenter.com 
              within 30 days of first accepting these Terms. If you opt out, you will still be bound by all 
              other provisions of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed and construed in accordance with the laws of the United States, 
              without regard to its conflict of law provisions. Our failure to enforce any right or provision 
              of these Terms will not be considered a waiver of those rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify or replace these Terms at any time at our sole discretion. 
              If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms 
              taking effect. Your continued use of the Service after any changes constitutes acceptance of 
              the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account and bar access to the Service immediately, without 
              prior notice or liability, under our sole discretion, for any reason whatsoever, including 
              without limitation if you breach the Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Severability</h2>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions 
              will remain in full force and effect. The invalid or unenforceable provision will be modified 
              to the minimum extent necessary to make it valid and enforceable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-muted-foreground mt-2">
              Email: <a href="mailto:legal@modelcarcenter.com" className="text-primary hover:underline">legal@modelcarcenter.com</a>
            </p>
          </section>
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
