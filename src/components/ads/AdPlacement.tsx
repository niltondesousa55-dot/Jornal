import { useState, useEffect } from 'react';
import { adService, Ad } from '../../services/db';

interface AdPlacementProps {
  type: 'horizontal' | 'vertical' | 'middle';
  section?: string;
  className?: string;
}

export default function AdPlacement({ type, section, className }: AdPlacementProps) {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      const ads = await adService.getAds();
      if (ads && ads.length > 0) {
        let filtered = ads.filter(a => a.type === type);
        
        if (section) {
          const sectionFiltered = filtered.filter(a => a.section === section);
          if (sectionFiltered.length > 0) {
            filtered = sectionFiltered;
          }
        }

        if (filtered.length > 0) {
          // Pick a random active ad for rotation
          setAd(filtered[Math.floor(Math.random() * filtered.length)]);
        }
      }
    };
    fetchAd();
  }, [type, section]);

  if (!ad) {
    return (
      <div className={`bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] ${className}`}>
        Espaço Publicitário ({type})
      </div>
    );
  }

  const isVideo = ad.imageUrl.includes('video') || ad.imageUrl.endsWith('.mp4') || ad.imageUrl.includes('storage.googleapis.com'); // Simple heuristic

  return (
    <a 
      href={ad.link} 
      target="_blank" 
      rel="no-referrer"
      className={`block relative group overflow-hidden ${className}`}
    >
      {isVideo ? (
        <video 
          src={ad.imageUrl} 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <img 
          src={ad.imageUrl} 
          alt={ad.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="absolute top-1 right-1 bg-black/50 text-[8px] text-white px-1 font-bold uppercase tracking-tighter">PUB</div>
    </a>
  );
}
