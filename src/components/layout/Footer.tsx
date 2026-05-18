import { Instagram, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center font-bold text-xl italic">PA</div>
              <div className="flex flex-col">
                <span className="text-xl font-black italic tracking-tighter leading-none uppercase">Padel Angola</span>
                <span className="text-[8px] tracking-[0.2em] font-bold text-zinc-500 uppercase">Est. 2024</span>
              </div>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              O seu portal definitivo sobre o mundo do padel em Angola. Notícias, torneios, rankings e muito mais.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-red-600 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-red-600 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-red-600 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-red-500 font-bold text-sm tracking-widest uppercase">Links Rápidos</h4>
            <ul className="space-y-3 text-zinc-400 text-sm">
              <li><Link to="/noticias" className="hover:text-amber-400 transition-colors">Últimas Notícias</Link></li>
              <li><Link to="/torneios" className="hover:text-amber-400 transition-colors">Calendário de Torneios</Link></li>
              <li><Link to="/ranking" className="hover:text-amber-400 transition-colors">Ranking Nacional</Link></li>
              <li><Link to="/clubes" className="hover:text-amber-400 transition-colors">Clubes Parceiros</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-red-500 font-bold text-sm tracking-widest uppercase">Contacto</h4>
            <ul className="space-y-3 text-zinc-400 text-sm">
              <li className="flex gap-3"><MapPin size={16} className="shrink-0 text-amber-500" /> Luanda, Angola</li>
              <li className="flex gap-3"><Phone size={16} className="shrink-0 text-amber-500" /> +244 9XX XXX XXX</li>
              <li className="flex gap-3"><Mail size={16} className="shrink-0 text-amber-500" /> info@padelangola.ao</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-red-500 font-bold text-sm tracking-widest uppercase">Newsletter</h4>
            <p className="text-zinc-500 text-sm">Subscreva para receber as últimas novidades diretamente no seu email.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Seu email" 
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-red-600 transition-colors"
              />
              <button className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 transition-colors">OK</button>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between text-zinc-500 text-[10px] font-medium tracking-wider uppercase">
          <p>© 2024 Padel Angola. Todos os direitos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacidade</a>
            <a href="#" className="hover:text-white">Termos de Uso</a>
            <a href="#" className="hover:text-white">Publicidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
