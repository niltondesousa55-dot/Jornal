import Hero from '../components/home/Hero';
import NewsGrid from '../components/home/NewsGrid';
import AdPlacement from '../components/ads/AdPlacement';
import ClubMarquee from '../components/home/ClubMarquee';
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

      <ClubMarquee />
    </motion.div>
  );
}
