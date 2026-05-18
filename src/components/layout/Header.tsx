import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Instagram, Facebook, Youtube, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'INÍCIO', path: '/' },
  { name: 'NOTÍCIAS', path: '/noticias' },
  { name: 'TORNEIOS', path: '/torneios' },
  { name: 'RANKING', path: '/ranking' },
  { name: 'JOGADORES', path: '/jogadores' },
  { name: 'CLUBES', path: '/clubes' },
  { name: 'VÍDEOS', path: '/videos' },
  { name: 'AGENDA', path: '/agenda' },
  { name: 'CONTACTOS', path: '/contactos' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 py-3" : "bg-transparent py-5"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo Area */}
          <Link to="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center bg-red-600 rounded-lg">
              <Shield className="text-amber-400 w-8 h-8" />
              <div className="absolute inset-0 border-2 border-white/20 rounded-lg animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black italic tracking-tighter leading-none">
                PADEL <span className="text-red-600">ANGOLA</span>
              </span>
              <span className="text-[10px] tracking-[0.3em] font-bold text-zinc-400 uppercase">
                Portal de Informação
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-xs font-bold tracking-widest transition-colors hover:text-red-500",
                  location.pathname === item.path ? "text-red-600 border-b-2 border-red-600 -mb-0.5 pb-0.5" : "text-zinc-400"
                )}
              >
                {item.name}
              </Link>
            ))}
            <button className="text-zinc-400 hover:text-white transition-colors">
              <Search size={18} />
            </button>
            <Link 
              to="/admin" 
              className="px-4 py-2 bg-red-600 text-white text-[10px] font-bold rounded-sm hover:bg-red-700 transition-colors uppercase tracking-widest"
            >
              GESTÃO
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-zinc-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-zinc-900 border-b border-zinc-800 p-6 flex flex-col gap-4 text-center shadow-2xl"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-lg font-bold tracking-tight text-white hover:text-red-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link 
              to="/admin" 
              className="mt-4 p-4 bg-red-600 text-white font-bold rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              ADMINISTRAÇÃO
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
