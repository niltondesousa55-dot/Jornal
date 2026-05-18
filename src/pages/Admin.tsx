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
  clubService,
  NewsArticle, 
  Ad,
  Club 
} from '../services/db';
import { uploadFile } from '../services/storage';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, getCountFromServer } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { Upload, X as XIcon, Loader2, ShieldCheck } from 'lucide-react';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'news' | 'ads' | 'clubs'>('stats');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [totalNewsCount, setTotalNewsCount] = useState(0);
  const [totalAdsCount, setTotalAdsCount] = useState(0);
  const [totalClubsCount, setTotalClubsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Pagination states
  const [lastNewsDoc, setLastNewsDoc] = useState<any>(null);
  const [lastAdDoc, setLastAdDoc] = useState<any>(null);
  const [hasMoreNews, setHasMoreNews] = useState(true);
  const [hasMoreAds, setHasMoreAds] = useState(true);

  // Form states
  const [isAddingNews, setIsAddingNews] = useState(false);
  const [isAddingAd, setIsAddingAd] = useState(false);
  const [isAddingClub, setIsAddingClub] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [editingClubId, setEditingClubId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [newArticle, setNewArticle] = useState<Partial<NewsArticle>>({
    title: '', excerpt: '', content: '', imageUrl: '', category: 'TORNEIOS', isFeatured: false, authorName: '', tags: []
  });
  const [newAd, setNewAd] = useState<Partial<Ad>>({
    title: '', type: 'horizontal', imageUrl: '', link: '', isActive: true, startDate: '', endDate: '', section: 'Geral'
  });
  const [newClub, setNewClub] = useState<Partial<Club>>({
    name: '', logoUrl: '', websiteUrl: '', order: 0
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
    try {
      const [newsResult, adsResult, newsCount, adsCount, clubsData, clubsCount] = await Promise.all([
        newsService.getNewsPaginated(10),
        adService.getAdsPaginated(12),
        getCountFromServer(collection(db, 'news')),
        getCountFromServer(collection(db, 'ads')),
        clubService.getClubs(),
        getCountFromServer(collection(db, 'clubs'))
      ]);
      
      if (newsResult) {
        setNews(newsResult.articles);
        setLastNewsDoc(newsResult.lastVisible);
        setHasMoreNews(newsResult.articles.length === 10);
      }
      
      if (adsResult) {
        setAds(adsResult.ads);
        setLastAdDoc(adsResult.lastVisible);
        setHasMoreAds(adsResult.ads.length === 12);
      }

      if (clubsData) {
        setClubs(clubsData);
      }

      setTotalNewsCount(newsCount.data().count);
      setTotalAdsCount(adsCount.data().count);
      setTotalClubsCount(clubsCount.data().count);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreNews = async () => {
    if (!lastNewsDoc || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await newsService.getNewsPaginated(10, lastNewsDoc);
      if (result) {
        setNews(prev => [...prev, ...result.articles]);
        setLastNewsDoc(result.lastVisible);
        setHasMoreNews(result.articles.length === 10);
      }
    } catch (error) {
      console.error('Error loading more news:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMoreAds = async () => {
    if (!lastAdDoc || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await adService.getAdsPaginated(12, lastAdDoc);
      if (result) {
        setAds(prev => [...prev, ...result.ads]);
        setLastAdDoc(result.lastVisible);
        setHasMoreAds(result.ads.length === 12);
      }
    } catch (error) {
      console.error('Error loading more ads:', error);
    } finally {
      setLoadingMore(false);
    }
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

  const toggleAdStatus = async (ad: Ad) => {
    try {
      await adService.updateAd(ad.id!, { isActive: !ad.isActive });
      fetchData();
    } catch (error) {
      console.error('Error toggling ad status:', error);
    }
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
        console.log('Iniciando upload de ficheiro:', selectedFile.name);
        setUploadProgress(0);
        finalImageUrl = await uploadFile(selectedFile, 'news', (progress) => setUploadProgress(progress));
        console.log('Upload concluído. URL:', finalImageUrl);
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
    } catch (error: any) {
      console.error('Erro detalhado ao guardar notícia:', error);
      alert(`Erro ao guardar: ${error.message || 'Verifique as permissões do Firebase Storage e Database'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setUploading(true);
    let finalImageUrl = newAd.imageUrl || '';

    try {
      if (selectedFile) {
        console.log('Iniciando upload de banner:', selectedFile.name);
        setUploadProgress(0);
        finalImageUrl = await uploadFile(selectedFile, 'ads', (progress) => setUploadProgress(progress));
        console.log('Upload de banner concluído. URL:', finalImageUrl);
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
    } catch (error: any) {
      console.error('Erro detalhado ao guardar anúncio:', error);
      alert(`Erro ao guardar anúncio: ${error.message || 'Verifique a conexão e permissões'}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
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

  const handleSaveClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClub.name) return;
    
    setUploading(true);
    let finalLogoUrl = newClub.logoUrl || '';
    
    try {
      if (selectedFile) {
        console.log('Iniciando upload de logotipo:', selectedFile.name);
        setUploadProgress(0);
        finalLogoUrl = await uploadFile(selectedFile, 'clubs', (progress) => setUploadProgress(progress));
        console.log('Upload concluído. URL:', finalLogoUrl);
      }
      
      if (editingClubId) {
        await clubService.updateClub(editingClubId, { ...newClub, logoUrl: finalLogoUrl } as any);
      } else {
        await clubService.createClub({ ...newClub, logoUrl: finalLogoUrl } as any);
      }

      setIsAddingClub(false);
      setEditingClubId(null);
      clearFile();
      setNewClub({ name: '', logoUrl: '', websiteUrl: '', order: 0 });
      fetchData();
    } catch (error: any) {
      console.error('Erro ao guardar clube:', error);
      alert(`Erro: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEditClub = (club: Club) => {
    setNewClub({
      name: club.name,
      logoUrl: club.logoUrl,
      websiteUrl: club.websiteUrl || '',
      order: club.order || 0
    });
    setEditingClubId(club.id!);
    setIsAddingClub(true);
    setFilePreview(club.logoUrl);
  };

  const handleDeleteClub = async (id: string) => {
    if (confirm('Deseja eliminar este clube?')) {
      await clubService.deleteClub(id);
      fetchData();
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
                { id: 'clubs', label: 'Clubes', icon: ShieldCheck },
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
                      <h4 className="text-4xl font-black italic tracking-tighter">{totalNewsCount}</h4>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Notícias Publicadas</p>
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-4 group hover:border-white transition-all">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-white/10 text-white rounded">
                        <ImageIcon size={24} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-4xl font-black italic tracking-tighter">{totalAdsCount}</h4>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Banners Ativos</p>
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-4 group hover:border-blue-500 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-blue-500/10 text-blue-500 rounded">
                        <ShieldCheck size={24} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-4xl font-black italic tracking-tighter">{totalClubsCount}</h4>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Clubes Parceiros</p>
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
                        {uploading ? (
                          <div className="flex items-center gap-3">
                            <Loader2 size={14} className="animate-spin" />
                            <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <span className="text-[10px] font-bold">{Math.round(uploadProgress)}%</span>
                          </div>
                        ) : <Save size={14} />}
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
                    {hasMoreNews && news.length > 0 && (
                      <button 
                        onClick={loadMoreNews}
                        disabled={loadingMore}
                        className="w-full py-4 bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-50"
                      >
                        {loadingMore ? 'A CARREGAR...' : 'CARREGAR MAIS NOTÍCIAS'}
                      </button>
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
                            {(filePreview.includes('video') || filePreview.match(/\.(mp4|webm|ogg|mov)/i) || (selectedFile?.type.startsWith('video'))) ? (
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
                        {uploading ? (
                          <div className="flex items-center gap-3">
                            <Loader2 size={14} className="animate-spin" />
                            <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <span className="text-[10px] font-bold">{Math.round(uploadProgress)}%</span>
                          </div>
                        ) : <TrendingUp size={14} />}
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
                          "bg-zinc-800 flex items-center justify-center overflow-hidden relative group/preview",
                          ad.type === 'horizontal' ? 'h-24' : ad.type === 'vertical' ? 'h-48' : 'h-32'
                        )}>
                          {ad.imageUrl.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) || ad.imageUrl.includes('video') ? (
                            <video src={ad.imageUrl} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={ad.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                             <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-white text-black px-2 py-1 font-bold uppercase">Ver Link</a>
                          </div>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="font-bold text-xs uppercase tracking-widest truncate">{ad.title || 'Untitled Campaign'}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <button 
                                onClick={() => toggleAdStatus(ad)}
                                className={cn(
                                  "w-3 h-3 rounded-full transition-all hover:scale-110",
                                  ad.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                )} 
                                title={ad.isActive ? "Desativar" : "Ativar"}
                              />
                              <span className="text-[10px] text-zinc-500 font-bold uppercase italic">{ad.type} - {ad.isActive ? 'Ativo' : 'Inativo'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                             <button onClick={() => handleEditAd(ad)} className="p-2 bg-zinc-800 hover:text-white transition-all" title="Editar"><Edit3 size={14} /></button>
                             <button onClick={() => handleDeleteAd(ad.id!)} className="p-2 bg-zinc-800 hover:text-red-500 transition-all" title="Eliminar"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {ads.length === 0 && (
                      <div className="md:col-span-2 text-center py-12 bg-zinc-900 border border-zinc-800 text-zinc-500 uppercase text-xs font-bold tracking-widest">Nenhuma campanha ativa.</div>
                    )}
                    {hasMoreAds && ads.length > 0 && (
                      <div className="md:col-span-2">
                        <button 
                          onClick={loadMoreAds}
                          disabled={loadingMore}
                          className="w-full py-4 bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                          {loadingMore ? 'A CARREGAR...' : 'CARREGAR MAIS CAMPANHAS'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'clubs' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4">
                  <h3 className="font-bold uppercase tracking-widest">Gestão de Clubes</h3>
                  {!isAddingClub && (
                    <button 
                      onClick={() => setIsAddingClub(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                      <Plus size={16} /> Novo Clube
                    </button>
                  )}
                </div>

                {isAddingClub ? (
                  <form onSubmit={handleSaveClub} className="bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Nome do Clube</label>
                        <input 
                          value={newClub.name} 
                          onChange={e => setNewClub({...newClub, name: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Website / Link Social</label>
                        <input 
                          value={newClub.websiteUrl} 
                          onChange={e => setNewClub({...newClub, websiteUrl: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Ordem de Exibição</label>
                        <input 
                          type="number"
                          value={newClub.order} 
                          onChange={e => setNewClub({...newClub, order: parseInt(e.target.value)})}
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Logotipo do Clube</label>
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                          <input 
                            type="text"
                            value={newClub.logoUrl} 
                            onChange={e => setNewClub({...newClub, logoUrl: e.target.value})}
                            placeholder="URL do Logotipo"
                            className="flex-1 bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none"
                            disabled={!!selectedFile}
                          />
                          <span className="flex items-center text-[10px] text-zinc-600 font-bold">OU</span>
                          <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 px-4 py-3 text-white flex items-center gap-2 text-[10px] font-bold uppercase transition-colors">
                            <Upload size={14} /> Selecionar Ficheiro
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                          </label>
                        </div>
                        
                        {filePreview && (
                          <div className="relative w-32 h-32 bg-zinc-800 rounded overflow-hidden group border border-zinc-700 p-2">
                            <img src={filePreview} className="w-full h-full object-contain" />
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
                        {uploading ? (
                          <div className="flex items-center gap-3">
                            <Loader2 size={14} className="animate-spin" />
                            <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <span className="text-[10px] font-bold">{Math.round(uploadProgress)}%</span>
                          </div>
                        ) : <Save size={14} />}
                        {uploading ? 'A CARREGAR...' : editingClubId ? 'ATUALIZAR CLUBE' : 'GUARDAR CLUBE'}
                      </button>
                      <button type="button" onClick={() => { setIsAddingClub(false); setEditingClubId(null); clearFile(); }} className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">CANCELAR</button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {clubs.map(club => (
                      <div key={club.id} className="bg-zinc-900 border border-zinc-800 p-4 flex flex-col items-center gap-4 group relative">
                        <div className="w-20 h-20 bg-white p-2 rounded-lg">
                          <img src={club.logoUrl} className="w-full h-full object-contain" />
                        </div>
                        <h4 className="font-bold text-[10px] uppercase text-center truncate w-full">{club.name}</h4>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                           <button onClick={() => handleEditClub(club)} className="p-2 bg-white text-black hover:bg-zinc-200 transition-all"><Edit3 size={14} /></button>
                           <button onClick={() => handleDeleteClub(club.id!)} className="p-2 bg-red-600 text-white hover:bg-red-700 transition-all"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                    {clubs.length === 0 && (
                      <div className="col-span-full text-center py-12 bg-zinc-900 border border-zinc-800 text-zinc-500 uppercase text-xs font-bold tracking-widest">Nenhum clube registado.</div>
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
