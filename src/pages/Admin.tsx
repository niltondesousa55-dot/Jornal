import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Newspaper, 
  Image as ImageIcon, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  LogOut,
  ChevronRight,
  TrendingUp,
  Users
} from 'lucide-react';
import { 
  newsService, 
  adService, 
  NewsArticle, 
  Ad 
} from '../services/db';
import { uploadFile } from '../services/storage';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { cn } from '../lib/utils';
import { Upload, X as XIcon, Loader2 } from 'lucide-react';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'news' | 'ads'>('stats');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [isAddingNews, setIsAddingNews] = useState(false);
  const [isAddingAd, setIsAddingAd] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [newArticle, setNewArticle] = useState<Partial<NewsArticle>>({
    title: '', excerpt: '', content: '', imageUrl: '', category: 'TORNEIOS', isFeatured: false, authorName: '', tags: []
  });
  const [newAd, setNewAd] = useState<Partial<Ad>>({
    title: '', type: 'horizontal', imageUrl: '', link: '', isActive: true, startDate: '', endDate: '', section: 'Geral'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        fetchData();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [newsData, adsData] = await Promise.all([
      newsService.getLatestNews(50),
      adService.getAds()
    ]);
    if (newsData) setNews(newsData);
    if (adsData) setAds(adsData);
    setLoading(false);
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleEditNews = (item: NewsArticle) => {
    setNewArticle({
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      imageUrl: item.imageUrl,
      category: item.category,
      isFeatured: item.isFeatured,
      authorName: item.authorName || '',
      tags: item.tags || []
    });
    setEditingNewsId(item.id);
    setIsAddingNews(true);
    setFilePreview(item.imageUrl);
  };

  const handleDeleteNews = async (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar esta notícia?')) {
      await newsService.deleteNews(id);
      fetchData();
    }
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticle.title || !newArticle.content) return;
    
    setUploading(true);
    let finalImageUrl = newArticle.imageUrl || '';
    
    try {
      if (selectedFile) {
        finalImageUrl = await uploadFile(selectedFile, 'news');
      }
      
      if (editingNewsId) {
        await newsService.updateNews(editingNewsId, { ...newArticle, imageUrl: finalImageUrl } as any);
      } else {
        await newsService.createNews({ ...newArticle, imageUrl: finalImageUrl } as any);
      }

      setIsAddingNews(false);
      setEditingNewsId(null);
      clearFile();
      setNewArticle({ title: '', excerpt: '', content: '', imageUrl: '', category: 'TORNEIOS', isFeatured: false, authorName: '', tags: [] });
      fetchData();
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Erro ao guardar notícia. Verifique as permissões de gravação.');
    } finally {
      setUploading(false);
    }
  };

  const handleEditAd = (ad: Ad) => {
    setNewAd({
      title: ad.title,
      type: ad.type,
      imageUrl: ad.imageUrl,
      link: ad.link,
      isActive: ad.isActive,
      startDate: ad.startDate || '',
      endDate: ad.endDate || '',
      section: ad.section || 'Geral'
    });
    setEditingAdId(ad.id);
    setIsAddingAd(true);
    setFilePreview(ad.imageUrl);
  };

  const handleDeleteAd = async (id: string) => {
    if (confirm('Deseja remover esta campanha publicitária?')) {
      await adService.deleteAd(id);
      fetchData();
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setUploading(true);
    let finalImageUrl = newAd.imageUrl || '';

    try {
      if (selectedFile) {
        finalImageUrl = await uploadFile(selectedFile, 'ads');
      }
      
      if (!finalImageUrl || !newAd.type) {
        alert('É necessário uma imagem ou vídeo para o banner.');
        setUploading(false);
        return;
      }

      if (editingAdId) {
        await adService.updateAd(editingAdId, { ...newAd, imageUrl: finalImageUrl } as any);
      } else {
        await adService.createAd({ ...newAd, imageUrl: finalImageUrl } as any);
      }

      setIsAddingAd(false);
      setEditingAdId(null);
      clearFile();
      setNewAd({ title: '', type: 'horizontal', imageUrl: '', link: '', isActive: true, startDate: '', endDate: '', section: 'Geral' });
      fetchData();
    } catch (error) {
      console.error('Error saving ad:', error);
      alert('Erro ao guardar anúncio.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-sm text-center space-y-6">
          <div className="w-16 h-16 bg-red-600 rounded-lg mx-auto flex items-center justify-center">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black italic uppercase">Gestão Portal</h2>
          <p className="text-zinc-400 text-sm">Autentique-se para aceder à área de administração de conteúdos e publicidade.</p>
          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3"
          >
            LOGIN COM GOOGLE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800">
              <img src={user.photoURL || ''} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{user.displayName}</p>
                <p className="text-[10px] text-zinc-500 truncate">Administrador</p>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'stats', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'news', label: 'Notícias', icon: Newspaper },
                { id: 'ads', label: 'Publicidade', icon: ImageIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all",
                    activeTab === tab.id ? "bg-red-600 text-white" : "text-zinc-400 hover:bg-zinc-900"
                  )}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all mt-4 border-t border-zinc-800"
              >
                <LogOut size={18} />
                Sair
              </button>
            </nav>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            {activeTab === 'stats' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-4 group hover:border-red-600 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-red-600/10 text-red-600 rounded">
                        <TrendingUp size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">+12% vs. Ontem</span>
                    </div>
                    <div>
                      <h4 className="text-4xl font-black italic tracking-tighter">1,245</h4>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Visualizações Únicas</p>
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-4 group hover:border-amber-400 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-amber-400/10 text-amber-400 rounded">
                        <Newspaper size={24} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-4xl font-black italic tracking-tighter">{news.length}</h4>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Notícias Publicadas</p>
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-4 group hover:border-white transition-all">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-white/10 text-white rounded">
                        <Users size={24} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-4xl font-black italic tracking-tighter">842</h4>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Utilizadores Registados</p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-8">
                  <h3 className="text-xl font-bold uppercase mb-6 flex items-center justify-between">
                    Atividade Recente
                    <button className="text-[10px] text-red-500">Ver tudo</button>
                  </h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-4 text-sm border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                        <div className="w-2 h-2 rounded-full bg-red-600" />
                        <p className="flex-1 text-zinc-400"><span className="text-white font-bold">Admin</span> publicou uma nova notícia: "Circuito Luanda Open"</p>
                        <span className="text-[10px] text-zinc-600 uppercase font-bold">Há 2 horas</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'news' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4">
                  <h3 className="font-bold uppercase tracking-widest">Gestão de Notícias</h3>
                  {!isAddingNews && (
                    <button 
                      onClick={() => setIsAddingNews(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                      <Plus size={16} /> Nova Notícia
                    </button>
                  )}
                </div>

                {isAddingNews ? (
                  <form onSubmit={handleSaveNews} className="bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Título</label>
                        <input 
                          value={newArticle.title} 
                          onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Categoria</label>
                        <select 
                          value={newArticle.category} 
                          onChange={e => setNewArticle({...newArticle, category: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none"
                        >
                          <option>TORNEIOS</option>
                          <option>ENTREVISTA</option>
                          <option>EQUIPAMENTO</option>
                          <option>RANKING</option>
                          <option>CLUBES</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Autor</label>
                        <input 
                          value={newArticle.authorName} 
                          onChange={e => setNewArticle({...newArticle, authorName: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Tags (separadas por vírgula)</label>
                        <input 
                          value={newArticle.tags?.join(', ')} 
                          onChange={e => setNewArticle({...newArticle, tags: e.target.value.split(',').map(t => t.trim())})}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Resumo (Excerpt)</label>
                      <textarea 
                        value={newArticle.excerpt} 
                        onChange={e => setNewArticle({...newArticle, excerpt: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none h-20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Conteúdo</label>
                      <textarea 
                        value={newArticle.content} 
                        onChange={e => setNewArticle({...newArticle, content: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none h-40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Imagem de Capa</label>
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                          <input 
                            type="text"
                            value={newArticle.imageUrl} 
                            onChange={e => setNewArticle({...newArticle, imageUrl: e.target.value})}
                            placeholder="URL da Imagem externa"
                            className="flex-1 bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none"
                            disabled={!!selectedFile}
                          />
                          <span className="flex items-center text-[10px] text-zinc-600 font-bold">OU</span>
                          <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 px-4 py-3 text-white flex items-center gap-2 text-[10px] font-bold uppercase transition-colors">
                            <Upload size={14} /> Selecionar Ficheiro
                            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                          </label>
                        </div>
                        
                        {filePreview && (
                          <div className="relative w-40 h-24 bg-zinc-800 rounded overflow-hidden group">
                            {filePreview.includes('video') || filePreview.endsWith('.mp4') ? (
                              <video src={filePreview} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={filePreview} className="w-full h-full object-cover" />
                            )}
                            <button 
                              type="button"
                              onClick={clearFile}
                              className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XIcon size={20} className="text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button 
                        type="submit" 
                        disabled={uploading}
                        className="bg-red-600 text-white px-8 py-3 font-bold uppercase text-[10px] tracking-widest hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                      >
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {uploading ? 'A CARREGAR...' : editingNewsId ? 'ATUALIZAR NOTÍCIA' : 'GUARDAR NOTÍCIA'}
                      </button>
                      <button type="button" onClick={() => { setIsAddingNews(false); setEditingNewsId(null); clearFile(); }} className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">CANCELAR</button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {news.map(item => (
                      <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-4 flex items-center gap-4 group">
                        <img src={item.imageUrl} className="w-16 h-16 object-cover bg-zinc-800" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                          <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">{item.category}</span>
                          <h4 className="font-bold text-sm truncate uppercase">{item.title}</h4>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase">Criado em: {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditNews(item)} className="p-2 bg-zinc-800 hover:text-white transition-all"><Edit3 size={16} /></button>
                          <button onClick={() => handleDeleteNews(item.id)} className="p-2 bg-zinc-800 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                    {news.length === 0 && (
                      <div className="text-center py-12 bg-zinc-900 border border-zinc-800 text-zinc-500 uppercase text-xs font-bold tracking-widest">Nenhuma notícia encontrada.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ads' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4">
                  <h3 className="font-bold uppercase tracking-widest">Gestão de Publicidade</h3>
                  {!isAddingAd && (
                    <button 
                      onClick={() => setIsAddingAd(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                      <Plus size={16} /> Novo Banner
                    </button>
                  )}
                </div>

                {isAddingAd ? (
                  <form onSubmit={handleSaveAd} className="bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Nome da Campanha</label>
                        <input 
                          value={newAd.title} 
                          onChange={e => setNewAd({...newAd, title: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Tipo / Formato</label>
                        <select 
                          value={newAd.type} 
                          onChange={e => setNewAd({...newAd, type: e.target.value as any})}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none"
                        >
                          <option value="horizontal">Horizontal (Topo/Rodapé)</option>
                          <option value="vertical">Vertical (Lateral)</option>
                          <option value="middle">Middle (Meio da Página)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Início Veiculação</label>
                        <input 
                          type="datetime-local"
                          value={newAd.startDate} 
                          onChange={e => setNewAd({...newAd, startDate: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Fim Veiculação</label>
                        <input 
                          type="datetime-local"
                          value={newAd.endDate} 
                          onChange={e => setNewAd({...newAd, endDate: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Secção / Segmentação</label>
                        <select 
                          value={newAd.section} 
                          onChange={e => setNewAd({...newAd, section: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none"
                        >
                          <option>Geral</option>
                          <option>Home</option>
                          <option>Notícias</option>
                          <option>Torneios</option>
                          <option>Social</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Link de Destino</label>
                      <input 
                        value={newAd.link} 
                        onChange={e => setNewAd({...newAd, link: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Banner (Imagem ou Vídeo)</label>
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                          <input 
                            type="text"
                            value={newAd.imageUrl} 
                            onChange={e => setNewAd({...newAd, imageUrl: e.target.value})}
                            placeholder="URL do Banner externo"
                            className="flex-1 bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none"
                            disabled={!!selectedFile}
                          />
                          <span className="flex items-center text-[10px] text-zinc-600 font-bold">OU</span>
                          <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 px-4 py-3 text-white flex items-center gap-2 text-[10px] font-bold uppercase transition-colors">
                            <Upload size={14} /> Selecionar Ficheiro
                            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                          </label>
                        </div>
                        
                        {filePreview && (
                          <div className="relative w-40 h-24 bg-zinc-800 rounded overflow-hidden group">
                            {filePreview.includes('video') || filePreview.endsWith('.mp4') || (selectedFile?.type.startsWith('video')) ? (
                              <video src={filePreview} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={filePreview} className="w-full h-full object-cover" />
                            )}
                            <button 
                              type="button"
                              onClick={clearFile}
                              className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XIcon size={20} className="text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button 
                        type="submit" 
                        disabled={uploading}
                        className="bg-red-600 text-white px-8 py-3 font-bold uppercase text-[10px] tracking-widest hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                      >
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                        {uploading ? 'A CARREGAR...' : editingAdId ? 'ATUALIZAR CAMPANHA' : 'ATIVAR CAMPANHA'}
                      </button>
                      <button type="button" onClick={() => { setIsAddingAd(false); setEditingAdId(null); clearFile(); }} className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">CANCELAR</button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ads.map(ad => (
                      <div key={ad.id} className="bg-zinc-900 border border-zinc-800 overflow-hidden group">
                        <div className={cn(
                          "bg-zinc-800 flex items-center justify-center overflow-hidden",
                          ad.type === 'horizontal' ? 'h-24' : ad.type === 'vertical' ? 'h-48' : 'h-32'
                        )}>
                          <img src={ad.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="p-4 flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-xs uppercase tracking-widest">{ad.title || 'Untitled Campaign'}</h4>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase italic">{ad.type}</span>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => handleEditAd(ad)} className="p-2 bg-zinc-800 hover:text-white transition-all"><Edit3 size={14} /></button>
                             <button onClick={() => handleDeleteAd(ad.id)} className="p-2 bg-zinc-800 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {ads.length === 0 && (
                      <div className="md:col-span-2 text-center py-12 bg-zinc-900 border border-zinc-800 text-zinc-500 uppercase text-xs font-bold tracking-widest">Nenhuma campanha ativa.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
