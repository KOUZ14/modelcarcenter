'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  User,
  Menu,
  X,
  Car,
  Settings,
  LogOut,
  Grid3X3,
  ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';

const navLinks = [
  { href: '/browse', label: 'Browse' },
  { href: '/brands', label: 'Brands' },
  { href: '/scales', label: 'Scales' },
  { href: '/deals', label: 'Deals' },
  { href: '/sell', label: 'Sell' },
];

const accountMenuItems = [
  { href: '/collection', label: 'My Collection', icon: Grid3X3 },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        className={clsx(
          'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 shadow-md backdrop-blur-md'
            : 'bg-white'
        )}
        initial={false}
        animate={{
          height: isScrolled ? 64 : 80,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Bottom border */}
        <div
          className={clsx(
            'absolute bottom-0 left-0 right-0 h-px transition-colors duration-300',
            isScrolled ? 'bg-border' : 'bg-gray-100'
          )}
        />

        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <motion.div
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f172a] to-[#1e293b]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Car className="h-5 w-5 text-[#d4af37]" />
              <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#d4af37]" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[#0f172a]">
                ModelCar
                <span className="text-[#d4af37]">Center</span>
              </span>
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-[#94a3b8] sm:block">
                Premium Collectibles
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative px-4 py-2"
              >
                <span
                  className={clsx(
                    'text-sm font-medium transition-colors duration-200',
                    pathname === link.href
                      ? 'text-[#0f172a]'
                      : 'text-[#1e293b] hover:text-[#0f172a]'
                  )}
                >
                  {link.label}
                </span>
                {/* Gold underline animation */}
                <motion.span
                  className="absolute bottom-0 left-4 right-4 h-0.5 origin-left bg-gradient-to-r from-[#d4af37] to-[#e6c55a]"
                  initial={false}
                  animate={{
                    scaleX: pathname === link.href ? 1 : 0,
                  }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <motion.button
              onClick={() => setIsSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#1e293b] transition-colors hover:bg-gray-100 hover:text-[#0f172a]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </motion.button>

            {/* Wishlist Button */}
            <Link href="/wishlist">
              <motion.div
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#1e293b] transition-colors hover:bg-gray-100 hover:text-[#0f172a]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className="h-5 w-5" />
                {/* Wishlist count badge */}
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#d4af37] text-[10px] font-bold text-[#0f172a]">
                  3
                </span>
              </motion.div>
            </Link>

            {/* Account Dropdown */}
            <div className="relative hidden lg:block">
              <motion.button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                onBlur={() => setTimeout(() => setIsAccountOpen(false), 150)}
                className={clsx(
                  'flex items-center gap-2 rounded-full border px-3 py-2 transition-all duration-200',
                  isAccountOpen
                    ? 'border-[#d4af37] bg-amber-50'
                    : 'border-gray-200 hover:border-[#d4af37]/50 hover:bg-gray-50'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
                  <User className="h-4 w-4 text-white" />
                </div>
                <ChevronDown
                  className={clsx(
                    'h-4 w-4 text-[#94a3b8] transition-transform duration-200',
                    isAccountOpen && 'rotate-180'
                  )}
                />
              </motion.button>

              {/* Account Dropdown Menu */}
              <AnimatePresence>
                {isAccountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl"
                  >
                    {/* User Info */}
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="font-semibold text-[#0f172a]">John Collector</p>
                      <p className="text-sm text-[#94a3b8]">Premium Member</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {accountMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1e293b] transition-colors hover:bg-gray-50 hover:text-[#0f172a]"
                        >
                          <item.icon className="h-4 w-4 text-[#94a3b8]" />
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-gray-100 py-2">
                      <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#1e293b] transition-colors hover:bg-gray-100 lg:hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className={clsx('transition-all duration-300', isScrolled ? 'h-16' : 'h-20')} />

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 right-0 top-0 z-50 bg-white p-6 shadow-2xl"
            >
              <div className="mx-auto max-w-3xl">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94a3b8]" />
                    <input
                      type="text"
                      placeholder="Search for model cars, brands, scales..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-[#0f172a] placeholder-[#94a3b8] outline-none transition-all focus:border-[#d4af37] focus:bg-white focus:ring-4 focus:ring-[#d4af37]/10"
                      autoFocus
                    />
                  </div>
                  <motion.button
                    onClick={() => setIsSearchOpen(false)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 text-[#1e293b] transition-colors hover:bg-gray-100"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* Quick Links */}
                <div className="mt-6">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
                    Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Ferrari', '1:18 Scale', 'Porsche 911', 'AutoArt', 'Limited Edition'].map(
                      (term) => (
                        <button
                          key={term}
                          className="rounded-full border border-gray-200 px-4 py-2 text-sm text-[#1e293b] transition-all hover:border-[#d4af37] hover:bg-amber-50 hover:text-[#0f172a]"
                        >
                          {term}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Slide-in Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-sm bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <span className="text-lg font-bold text-[#0f172a]">Menu</span>
                <motion.button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#1e293b] transition-colors hover:bg-gray-100"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Navigation Links */}
              <nav className="border-b border-gray-100 py-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={clsx(
                        'flex items-center justify-between px-6 py-3 text-base font-medium transition-colors',
                        pathname === link.href
                          ? 'bg-amber-50 text-[#0f172a]'
                          : 'text-[#1e293b] hover:bg-gray-50'
                      )}
                    >
                      {link.label}
                      {pathname === link.href && (
                        <div className="h-2 w-2 rounded-full bg-[#d4af37]" />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Account Section */}
              <div className="py-4">
                <p className="mb-2 px-6 text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
                  Account
                </p>
                {accountMenuItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navLinks.length + index) * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-6 py-3 text-[#1e293b] transition-colors hover:bg-gray-50"
                    >
                      <item.icon className="h-5 w-5 text-[#94a3b8]" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-gray-50 p-6">
                <button className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0f172a] to-[#1e293b] px-4 py-3 font-semibold text-white transition-all hover:shadow-lg">
                  <User className="h-5 w-5" />
                  Sign In
                </button>
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d4af37] bg-amber-50 px-4 py-3 font-semibold text-[#0f172a] transition-all hover:bg-[#d4af37] hover:text-white">
                  Create Account
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
