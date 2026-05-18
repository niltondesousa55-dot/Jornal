import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { clubService, Club } from '../../services/db';

export default function ClubMarquee() {
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    const fetchClubs = async () => {
      const data = await clubService.getClubs();
      if (data) setClubs(data);
    };
    fetchClubs();
  }, []);

  if (clubs.length === 0) return null;

  // Duplicate clubs to create endless loop effect
  const marqueeClubs = [...clubs, ...clubs, ...clubs];

  return (
    <div className="bg-zinc-950 border-y border-zinc-800 py-8 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-zinc-950 to-transparent z-10" />
      
      <div className="container mx-auto px-4 mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 text-center italic">Clubes Parceiros</h3>
      </div>

      <div className="flex overflow-hidden">
        <motion.div 
          className="flex gap-12 shrink-0 items-center px-6"
          animate={{
            x: [-1000, 0], 
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {marqueeClubs.map((club, index) => (
            <div 
              key={`${club.id}-${index}`} 
              className="w-32 h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-500 opacity-50 hover:opacity-100"
            >
              <img 
                src={club.logoUrl} 
                alt={club.name} 
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
