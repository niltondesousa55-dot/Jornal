import Hero from '../components/home/Hero';
import NewsGrid from '../components/home/NewsGrid';
import AdPlacement from '../components/ads/AdPlacement';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-20"
    >
      {/* Top Banner Ad */}
      <div className="pt-24 pb-4">
        <div className="container mx-auto px-4">
          <AdPlacement type="horizontal" className="h-24 md:h-32 w-full" />
        </div>
      </div>

      <Hero />
      
      <NewsGrid />

      {/* Featured Clubs or Partners */}
      <section className="bg-zinc-900 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-red-500 font-bold text-xs tracking-[0.4em] uppercase">PARCERIAS</span>
            <h2 className="text-3xl font-black italic mt-2 uppercase tracking-tight">CLUBES OFICIAIS</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white/10 rounded-full" />
                <span className="font-bold text-zinc-400">CLUB PADEL {i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
