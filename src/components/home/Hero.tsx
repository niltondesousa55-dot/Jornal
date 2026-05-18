import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { newsService, NewsArticle } from '../../services/db';

export default function Hero() {
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const fetchLatest = async () => {
      const news = await newsService.getLatestNews(3);
      if (news) setLatestNews(news);
    };
    fetchLatest();
  }, []);

  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden pt-20">
      {/* Background Image with Mesh Gradient */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/src/assets/images/padel_hero_action_1779119894774.png" 
          alt="Padel Action Angola"
          className="w-full h-full object-cover grayscale-[0.2]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Main Hero Text */}
          <div className="flex-1 space-y-8 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 rounded-sm text-[10px] font-black tracking-widest text-white uppercase mb-4">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                AO VIVO: CIRCUITO NACIONAL
              </div>
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.85] text-white uppercase">
                O MELHOR <br /> 
                <span className="text-amber-400">DO PADEL</span> <br /> 
                EM ANGOLA
              </h1>
              <p className="mt-6 text-zinc-400 text-lg md:text-xl font-medium tracking-tight max-w-md">
                Notícias, torneios, entrevistas e tudo sobre o mundo do desporto que mais cresce no país.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <Link 
                to="/noticias" 
                className="px-8 py-4 bg-red-600 text-white font-black italic tracking-widest text-sm hover:bg-red-700 transition-all flex items-center gap-2 group"
              >
                SAIBA MAIS
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 bg-zinc-800/80 backdrop-blur-md text-white font-black italic tracking-widest text-sm hover:bg-zinc-700 transition-all flex items-center gap-2">
                VER RANKING
              </button>
            </motion.div>
          </div>

          {/* Featured News Sidebar in Hero */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-full lg:w-96 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 p-6 rounded-sm space-y-6"
          >
            <h3 className="text-amber-500 font-bold text-xs tracking-widest uppercase flex items-center justify-between">
              ÚLTIMAS NOTÍCIAS
              <span className="w-8 h-px bg-amber-500/30" />
            </h3>
            
            <div className="space-y-6">
              {latestNews.length > 0 ? latestNews.map((item) => (
                <div key={item.id} className="flex gap-4 group cursor-pointer">
                  <div className="w-20 h-20 bg-zinc-800 overflow-hidden shrink-0">
                    <img 
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">{item.category}</span>
                    <h4 className="text-sm font-bold leading-tight group-hover:text-amber-400 transition-colors line-clamp-2 uppercase">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">
                      {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recente'}
                    </p>
                  </div>
                </div>
              )) : (
                [1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-4">
                    <div className="w-20 h-20 bg-zinc-800 shrink-0" />
                    <div className="flex-1 space-y-2">
                       <div className="h-2 bg-zinc-800 w-1/4" />
                       <div className="h-4 bg-zinc-800 w-full" />
                       <div className="h-2 bg-zinc-800 w-1/2" />
                    </div>
                  </div>
                ))
              )}
            </div>

            <button className="w-full py-3 bg-red-600/10 border border-red-600/20 text-red-500 font-bold text-[10px] tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all">
              VER TODAS AS NOTÍCIAS
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
