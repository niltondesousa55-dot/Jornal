import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { newsService, NewsArticle } from '../../services/db';
import AdPlacement from '../ads/AdPlacement';

export default function NewsTabs() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await newsService.getLatestNews(6);
      if (data) setNews(data);
      setLoading(false);
    };
    fetchContent();
  }, []);

  // Placeholder data if firebase is empty
  const displayNews = news.length > 0 ? news : [
    {
      id: '1',
      title: 'Circuito Nacional de Padel 2024 Arrenca em Luanda',
      excerpt: 'As melhores duplas do país encontram-se este fim de semana para a primeira etapa...',
      imageUrl: 'https://images.unsplash.com/photo-1626248801379-51a0748a5f96?q=80&w=2070&auto=format&fit=crop',
      category: 'TORNEIOS',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'A Expansão dos Campos de Padel em Benguela',
      excerpt: 'Novos clubes abrem portas e a paixão pelo desporto de raquete conquista o sul...',
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2070&auto=format&fit=crop',
      category: 'CLUBES',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Entrevista Exclusiva: O Futuro do Padel em Angola',
      excerpt: 'O presidente da federação fala sobre os planos de profissionalização...',
      imageUrl: 'https://images.unsplash.com/photo-1533550824965-0c7f123d57f9?q=80&w=2070&auto=format&fit=crop',
      category: 'ENTREVISTA',
      createdAt: new Date().toISOString()
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12 border-b border-zinc-800 pb-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase">DESTACADOS</h2>
            <div className="w-20 h-1 bg-red-600" />
          </div>
          <button className="text-xs font-bold text-zinc-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-2">
            Ver todas as notícias <ArrowRight size={14} />
          </button>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main News Area */}
          <div className="lg:col-span-9 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayNews.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="relative aspect-video overflow-hidden mb-4 bg-zinc-900 group">
                    {item.imageUrl.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) || item.imageUrl.includes('video') ? (
                      <video 
                        src={item.imageUrl} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        muted
                        onMouseOver={e => e.currentTarget.play()}
                        onMouseOut={e => e.currentTarget.pause()}
                      />
                    ) : (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-amber-400 text-black text-[9px] font-black px-2 py-1 uppercase tracking-widest italic">{item.category}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold leading-tight group-hover:text-red-500 transition-colors uppercase">
                      {item.title}
                    </h3>
                    <p className="text-zinc-500 text-sm line-clamp-2">
                      {item.excerpt}
                    </p>
                    <button className="text-[10px] font-black uppercase tracking-widest text-zinc-300 border-b border-zinc-700 group-hover:border-red-600 group-hover:text-white transition-all pb-1">
                      LER MAIS
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Dynamic Middle Ad */}
            <AdPlacement type="middle" className="h-40 w-full" />

            {/* Event Agenda */}
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm">
              <h3 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-3">
                <Calendar className="text-red-600" />
                PRÓXIMOS EVENTOS
              </h3>
              <div className="space-y-4">
                {[
                  { date: '01 JUN', title: 'TORNEIO OPEN LUANDA', location: 'Clube Padel 360°' },
                  { date: '15 JUN', title: 'CIRCUITO NACIONAL - 2ª ETAPA', location: 'Benguela' },
                  { date: '29 JUN', title: 'TORNEIO INTERCLUBES', location: 'Luanda Padel Club' },
                ].map((ev, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-zinc-950/50 border border-white/5 hover:border-red-600/30 transition-all group">
                    <div className="flex gap-6 items-center">
                      <div className="text-center shrink-0">
                        <span className="block text-2xl font-black text-amber-400 leading-none">{ev.date.split(' ')[0]}</span>
                        <span className="text-[10px] font-bold text-zinc-500">{ev.date.split(' ')[1]}</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold uppercase tracking-tight group-hover:text-amber-400 transition-colors">{ev.title}</h4>
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                          <MapPin size={12} className="text-red-600" /> {ev.location}
                        </p>
                      </div>
                    </div>
                    <button className="mt-4 md:mt-0 px-4 py-2 bg-zinc-800 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors">
                      CALENDÁRIO
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <aside className="lg:col-span-3 space-y-10">
            {/* Vertical Ad */}
            <AdPlacement type="vertical" className="h-[600px] w-full" />
            
            {/* Rankings Quick View */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-6">
              <h4 className="text-amber-500 font-black text-xs tracking-widest uppercase">TOP JOGADORES</h4>
              <div className="space-y-4">
                {[
                  { rank: 1, name: 'Ricardo Dias', points: '2400' },
                  { rank: 2, name: 'Paulo Santos', points: '2150' },
                  { rank: 3, name: 'Marcos Almeida', points: '1980' },
                  { rank: 4, name: 'João Miguel', points: '1850' },
                ].map((player) => (
                  <div key={player.rank} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-zinc-800 text-[10px] font-black text-zinc-500">{player.rank}</span>
                      <span className="text-sm font-bold uppercase">{player.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-red-600">{player.points} PTS</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-2 bg-zinc-800 text-[9px] font-bold tracking-widest uppercase hover:bg-amber-400 hover:text-black transition-colors">
                VER RANKING COMPLETO
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
