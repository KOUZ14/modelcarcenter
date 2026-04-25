'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

const popularSearches = [
  'Ferrari F40',
  'Porsche 911 GT3',
  '1:18 Scale',
  'McLaren P1',
  'AutoArt',
  'Lamborghini',
  'Limited Edition',
  'Hot Wheels',
];

const floatingShapes = [
  { size: 60, delay: 0, duration: 20, left: '10%', top: '20%' },
  { size: 40, delay: 2, duration: 25, left: '85%', top: '15%' },
  { size: 50, delay: 4, duration: 22, left: '15%', top: '75%' },
  { size: 35, delay: 1, duration: 18, left: '90%', top: '70%' },
];

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Handle search logic here
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
  };

  return (
    <section className="relative flex min-h-[70vh] w-full items-center overflow-hidden bg-[#0f172a] lg:min-h-[70vh]">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#0f172a]/95 to-transparent" />
      
      {/* Radial Glow Effects */}
      <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#d4af37] opacity-5 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-[#94a3b8] opacity-5 blur-[100px]" />

      {/* Floating Decorative Shapes */}
      {floatingShapes.map((shape, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full border border-[#d4af37]/10 bg-[#d4af37]/5"
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.left,
            top: shape.top,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-20 lg:py-28">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex items-center gap-3"
          >
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#d4af37]" />
            <span className="gradient-text-gold text-sm font-semibold uppercase tracking-[0.2em]">
              Discover • Compare • Collect
            </span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#d4af37]" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl"
          >
            Find Your Perfect
            <br />
            <span className="gradient-text-gold">Model Car</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 max-w-2xl text-lg text-gray-300 md:text-xl"
          >
            Search thousands of diecast models from trusted sellers worldwide
          </motion.p>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSearch}
            className="mb-8 w-full max-w-3xl"
          >
            <div
              className={clsx(
                'relative flex items-center overflow-hidden rounded-2xl border-2 bg-white shadow-2xl transition-all duration-300',
                isFocused
                  ? 'border-[#d4af37] shadow-[0_0_0_4px_rgba(212,175,55,0.1),0_20px_60px_-15px_rgba(212,175,55,0.3)]'
                  : 'border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]'
              )}
            >
              {/* Search Icon */}
              <div className="flex items-center pl-6">
                <Search className="h-6 w-6 text-[#94a3b8]" />
              </div>

              {/* Input Field */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Search by brand, model, scale..."
                className="flex-1 bg-transparent px-4 py-5 text-[#0f172a] placeholder-[#94a3b8] outline-none md:py-6 md:text-lg"
              />

              {/* Search Button */}
              <motion.button
                type="submit"
                className="m-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6c55a] px-6 py-3 font-semibold text-[#0f172a] transition-all hover:shadow-lg md:px-8 md:py-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="hidden sm:inline">Search</span>
                <Search className="h-5 w-5 sm:hidden" />
              </motion.button>
            </div>
          </motion.form>

          {/* Popular Searches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-3xl"
          >
            <div className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-400">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Popular Searches:</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {popularSearches.map((tag, index) => (
                <motion.button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="group relative overflow-hidden rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#0f172a]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">{tag}</span>
                  
                  {/* Shimmer effect on hover */}
                  <motion.div
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    whileHover={{
                      translateX: '200%',
                      transition: { duration: 0.6 },
                    }}
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Stats or Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 md:gap-12"
          >
            <div className="flex flex-col items-center">
              <div className="mb-2 text-3xl font-bold text-[#d4af37] md:text-4xl">10K+</div>
              <div className="text-xs text-gray-400 md:text-sm">Active Listings</div>
            </div>
            <div className="flex flex-col items-center border-x border-white/10">
              <div className="mb-2 text-3xl font-bold text-[#d4af37] md:text-4xl">500+</div>
              <div className="text-xs text-gray-400 md:text-sm">Trusted Sellers</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-2 text-3xl font-bold text-[#d4af37] md:text-4xl">100+</div>
              <div className="text-xs text-gray-400 md:text-sm">Brands</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8fafc] to-transparent" />
    </section>
  );
}
