import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  Globe, 
  Cpu, 
  Dna, 
  Telescope,
  Menu,
  X,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CURATED_CONTENT, CYCLE_INFO, CURATOR_PROFILE } from './constants';
import { CuratedItem } from './types';

export default function App() {
  const [lang, setLang] = useState<'tr' | 'en'>('tr');
  const [view, setView] = useState<'showroom' | 'archive' | 'curators' | 'manifesto'>('showroom');

  const [allContent, setAllContent] = useState<CuratedItem[]>(CURATED_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        if (Array.isArray(data)) {
          setAllContent(data);
        }
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const now = new Date();
  const showroomItems = allContent.filter(item => 
    item.status === 'showroom' && new Date(item.cycleEndDate) > now
  );
  const archiveItems = allContent.filter(item => {
    const isManuallyArchive = item.status === 'archive';
    const isExpiredShowroom = item.status === 'showroom' && new Date(item.cycleEndDate) <= now;
    
    if (!isManuallyArchive && !isExpiredShowroom) return false;
    
    if (!item.expiryDate) return true;
    return new Date(item.expiryDate) > now;
  });

  const [activeItem, setActiveItem] = useState<CuratedItem>(allContent[0]);

  // Update activeItem once content is loaded
  useEffect(() => {
    if (!loading && showroomItems.length > 0) {
      setActiveItem(showroomItems[0]);
    } else if (!loading && allContent.length > 0) {
      setActiveItem(allContent[0]);
    }
  }, [loading, showroomItems.length]);

  // Update activeItem if showroomItems changes (e.g. cycle ends)
  useEffect(() => {
    if (view === 'showroom' && showroomItems.length > 0 && !showroomItems.find(i => i.id === activeItem.id)) {
      setActiveItem(showroomItems[0]);
    }
  }, [showroomItems, view]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cycleDaysRemaining, setCycleDaysRemaining] = useState(CYCLE_INFO.daysRemaining);
  const [showLogs, setShowLogs] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [selectedArchiveItem, setSelectedArchiveItem] = useState<CuratedItem | null>(null);

  const logs = [
    "[SYSTEM] NASA OSDR veri seti #4412 senkronize edildi.",
    "[INTEL] SerpApi: 'Artemis III' bağlamı doğrulandı.",
    "[GENAI] Gemini 2.0: Derin analiz sentezi tamamlandı.",
    "[CURATOR] Mehmet Halit: İçerik 5 günlük döngü için onaylandı.",
    "[HUD] Aethel Core aktif."
  ];

  // Simulate cycle progress
  useEffect(() => {
    if (activeItem.cycleEndDate) {
      const remaining = calculateRemainingDays(activeItem.cycleEndDate);
      setCycleDaysRemaining(remaining);
      
      const total = CYCLE_INFO.totalDays;
      const currentProgress = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
      setProgress(currentProgress);
    }
  }, [activeItem.cycleEndDate]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Space': return <Telescope className="w-4 h-4" />;
      case 'Physics': return <Zap className="w-4 h-4" />;
      case 'Biology': return <Dna className="w-4 h-4" />;
      case 'AI': return <Cpu className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const calculateRemainingDays = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
            {lang === 'tr' ? 'Aethel Core Başlatılıyor...' : 'Initializing Aethel Core...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground overflow-x-hidden cockpit-grid">
      {/* Cockpit HUD Overlay */}
      <div className="fixed inset-0 pointer-events-none border-[20px] border-background z-50 hidden md:block" />
      
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-panel border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">Æ</span>
              </div>
              <span className="text-xl font-medium tracking-tighter uppercase">Aethel Science</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <button 
                onClick={() => setView('showroom')}
                className={`hover:text-foreground transition-colors ${view === 'showroom' ? 'text-foreground border-b border-primary pb-1' : ''}`}
              >
                {lang === 'tr' ? 'Güncel Haberler' : 'Showroom'}
              </button>
              <button 
                onClick={() => setView('archive')}
                className={`hover:text-foreground transition-colors ${view === 'archive' ? 'text-foreground border-b border-primary pb-1' : ''}`}
              >
                {lang === 'tr' ? 'Arşiv' : 'Archive'}
              </button>
              <button 
                onClick={() => setView('manifesto')}
                className={`hover:text-foreground transition-colors ${view === 'manifesto' ? 'text-foreground border-b border-primary pb-1' : ''}`}
              >
                {lang === 'tr' ? 'Manifesto' : 'Manifesto'}
              </button>
              <button 
                onClick={() => setView('curators')}
                className={`hover:text-foreground transition-colors ${view === 'curators' ? 'text-foreground border-b border-primary pb-1' : ''}`}
              >
                {lang === 'tr' ? 'Küratörler' : 'Curators'}
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 border border-white/10 p-1">
              <button 
                onClick={() => setLang('tr')}
                className={`px-3 py-1 text-[10px] font-mono transition-all ${lang === 'tr' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                TR
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-[10px] font-mono transition-all ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                EN
              </button>
            </div>

            <div className="hidden lg:flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-tighter text-muted-foreground">
                <div className="relative">
                  <Clock className="w-3 h-3" />
                  <span className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-primary rounded-full animate-pulse" />
                </div>
                <span className="text-primary/80 animate-pulse">
                  {lang === 'tr' ? 'Zaman Akıyor' : 'Time is Flowing'}
                </span>
                <span className="opacity-20">|</span>
                <span>Döngü {CYCLE_INFO.currentCycle} İlerlemesi</span>
                <span className="text-foreground">{cycleDaysRemaining} Gün Kaldı</span>
              </div>
              <Progress value={progress} className="w-48 h-1 bg-white/5" />
            </div>
            
            <Button variant="outline" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Sidebar: Cycle Metadata */}
          <aside className="lg:col-span-3 space-y-12 hidden lg:block">
            <section className="space-y-4">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{lang === 'tr' ? 'Mevcut Durum' : 'Current Status'}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">{lang === 'tr' ? 'Zaman Durumu' : 'Time Status'}</span>
                  <span className="text-primary animate-pulse">{lang === 'tr' ? 'DURAKLATILDI' : 'PAUSED'}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">{lang === 'tr' ? 'Küratör' : 'Curator'}</span>
                  <span>Aethel Core</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">{lang === 'tr' ? 'Yoğunluk' : 'Density'}</span>
                  <span>{lang === 'tr' ? 'Yüksek' : 'High'}</span>
                </div>
              </div>
            </section>

            {(view === 'showroom' || view === 'archive') && (
              <section className="space-y-4">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  {view === 'showroom' ? (lang === 'tr' ? 'Haftalık Seçki' : 'Weekly Selection') : (lang === 'tr' ? 'Arşiv Navigasyonu' : 'Archive Navigation')}
                </h3>
                <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {(view === 'showroom' ? showroomItems : archiveItems).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveItem(item)}
                      className={`text-left p-4 border transition-all duration-500 group ${
                        activeItem.id === item.id 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'border-white/10 hover:border-white/30 text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono opacity-50">0{item.id}</span>
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="text-sm font-medium leading-tight">{item.title[lang]}</div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </aside>

          {/* Center: Main Content */}
          <div className="lg:col-span-9 space-y-12">
            <AnimatePresence mode="wait">
              {view === 'showroom' ? (
                showroomItems.length > 0 ? (
                  <motion.div
                    key={activeItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-8"
                  >
                    {/* Hero Image */}
                    <div className="relative aspect-[21/9] overflow-hidden group">
                      <img 
                        src={activeItem.imageUrl} 
                        alt={activeItem.title[lang]}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-6 left-6 flex gap-2">
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-white/20 text-[10px] font-mono uppercase tracking-widest px-3 py-1">
                          {activeItem.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Header */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h1 className="text-5xl md:text-7xl font-medium tracking-tighter leading-none text-glow">
                          {activeItem.title[lang]}
                        </h1>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="opacity-50">{lang === 'tr' ? 'Yazar' : 'Author'}</span>
                          <span className="text-foreground">{activeItem.author}</span>
                        </div>
                        <Separator orientation="vertical" className="h-3 bg-white/10" />
                        <div className="flex items-center gap-2">
                          <span className="opacity-50">{lang === 'tr' ? 'Yayınlanma' : 'Published'}</span>
                          <span className="text-foreground">{activeItem.publishDate}</span>
                        </div>
                        <Separator orientation="vertical" className="h-3 bg-white/10" />
                        <div className="flex items-center gap-2">
                          <span className="opacity-50">{lang === 'tr' ? 'Bitiş' : 'Ends'}</span>
                          <span className="text-foreground">{activeItem.cycleEndDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Body Text */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                      <div className="md:col-span-8 space-y-12">
                        {activeItem.dataAnalysis && (
                          <section className="p-8 border border-primary/20 bg-primary/5 space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                              <Telescope className="w-24 h-24" />
                            </div>
                            <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">Data Analysis</h3>
                            <div className="text-lg leading-relaxed data-analysis-glow">
                              {activeItem.dataAnalysis[lang]}
                            </div>
                          </section>
                        )}

                        {activeItem.globalContext && (
                          <section className="space-y-4">
                            <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">{lang === 'tr' ? 'Küresel Bağlam' : 'Global Context'}</h3>
                            <p className="text-lg font-light leading-relaxed italic border-l-2 border-white/10 pl-6">
                              {activeItem.globalContext[lang]}
                            </p>
                          </section>
                        )}

                        <Button 
                          onClick={() => setIsAnalysisOpen(true)}
                          variant="outline" 
                          className="group h-14 px-8 text-xs font-mono uppercase tracking-widest border-white/10 hover:bg-white hover:text-black transition-all"
                        >
                          {lang === 'tr' ? 'Tam Analizi Oku' : 'Read Full Analysis'}
                          <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </Button>
                      </div>
                      
                      <div className="md:col-span-4 space-y-8">
                        <div className="p-6 border border-white/10 bg-white/[0.03] space-y-4">
                          <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">{lang === 'tr' ? 'Curator\'s Note' : 'Curator\'s Note'}</h4>
                          <p className="text-sm font-light leading-relaxed text-muted-foreground italic">
                            {lang === 'tr' 
                              ? '"Bu içerik, NASA OSDR verilerinin ham gerçekliği ile Gemini\'nin analitik sentezinin bir ürünüdür. Hız yerine derinliği tercih ediyoruz."'
                              : '"This content is a product of the raw reality of NASA OSDR data and the analytical synthesis of Gemini. We prefer depth over speed."'}
                          </p>
                          <div className="pt-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">Æ</div>
                            <div className="text-[10px] font-mono uppercase tracking-widest">{CURATOR_PROFILE.name[lang]}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-news"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-[60vh] flex flex-col items-center justify-center space-y-6 text-center"
                  >
                    <div className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center animate-pulse">
                      <Telescope className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-light tracking-tighter">
                        {lang === 'tr' ? 'Yeni Döngü Hazırlanıyor' : 'Preparing New Cycle'}
                      </h3>
                      <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                        {lang === 'tr' ? 'Küratör Mehmet Halit yeni verileri analiz ediyor.' : 'Curator Mehmet Halit is analyzing new data.'}
                      </p>
                    </div>
                  </motion.div>
                )
              ) : view === 'archive' ? (
                <motion.div
                  key="archive-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {archiveItems.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02, borderColor: 'var(--primary)' }}
                      onClick={() => setSelectedArchiveItem(item)}
                      className="group relative bg-black/40 border border-white/10 p-6 space-y-6 cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                    >
                      {/* Ambient Neon Line */}
                      <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/30 transition-colors duration-500" />
                      
                      <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-primary uppercase tracking-widest">
                          {getCategoryIcon(item.category)}
                          <span>[{item.category}]</span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{item.publishDate}</span>
                      </div>

                      <div className="space-y-3 relative z-10">
                        <h3 className="text-lg font-medium tracking-tight leading-snug group-hover:text-primary transition-colors">
                          {item.title[lang]}
                        </h3>
                        <p className="text-xs text-muted-foreground font-light leading-relaxed line-clamp-2">
                          {item.archiveCardSummary?.[lang]}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-orange-500/80">
                          <Clock className="w-3 h-3" />
                          <span>{lang === 'tr' ? 'Kalan:' : 'Rem:'} {calculateRemainingDays(item.expiryDate)} {lang === 'tr' ? 'Gün' : 'Days'}</span>
                        </div>
                        <div className="opacity-20 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight className="w-4 h-4 text-primary" />
                        </div>
                      </div>

                      {/* Minimalist Icon Background */}
                      <div className="absolute bottom-4 right-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                        {item.category === 'Biology' && <Dna className="w-16 h-16" />}
                        {item.category === 'Space' && <Telescope className="w-16 h-16" />}
                        {item.category === 'Physics' && <Zap className="w-16 h-16" />}
                        {item.category === 'Engineering' && <Cpu className="w-16 h-16" />}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : view === 'curators' ? (
                <motion.div
                  key="curators"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.6 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-12"
                >
                  <div className="md:col-span-5">
                    <div className="relative aspect-[4/5] overflow-hidden border border-white/10 group">
                      <img 
                        src={CURATOR_PROFILE.imageUrl} 
                        alt={CURATOR_PROFILE.name[lang]} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                      <div className="absolute inset-0 border border-primary/20 m-4 pointer-events-none" />
                    </div>
                  </div>
                  <div className="md:col-span-7 space-y-8">
                    <div className="space-y-4">
                      <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-[0.3em] px-4 py-1.5 border-primary/50 text-primary bg-primary/5">
                        {lang === 'tr' ? 'Küratör Profili' : 'Curator Profile'}
                      </Badge>
                      <div className="space-y-2">
                        <h1 className="text-5xl md:text-7xl font-medium tracking-tighter leading-none text-glow">
                          {CURATOR_PROFILE.name[lang]}
                        </h1>
                        <p className="text-xl text-muted-foreground font-mono uppercase tracking-[0.2em]">
                          {CURATOR_PROFILE.title[lang]}
                        </p>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-8">
                      <p className="text-2xl font-light leading-relaxed text-foreground/90 italic border-l-2 border-primary/30 pl-8 py-2">
                        "{CURATOR_PROFILE.quote[lang]}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">Current Focus</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed font-light">{CURATOR_PROFILE.details.focus}</p>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">Philosophy</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed font-light">{CURATOR_PROFILE.details.philosophy[lang]}</p>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">Signature Style</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed font-light">{CURATOR_PROFILE.details.style}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="manifesto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-4xl space-y-16 py-12"
                >
                  <div className="space-y-4">
                    <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-[0.3em] px-3 py-1 border-primary/30 text-primary">
                      Aethel Science Protocol
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-light tracking-tighter leading-none">Manifesto</h1>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-primary uppercase tracking-widest">I. {lang === 'tr' ? 'Bilginin Egemenliği' : 'Sovereignty of Information'}</span>
                        <p className="text-lg font-light leading-relaxed text-muted-foreground">
                          {lang === 'tr' 
                            ? 'Evren, keşfedilmeyi bekleyen devasa bir veri setidir. Aethel Science olarak temel amacımız, karmaşık bilimsel verileri analiz ederek insanlık için anlaşılır ve erişilebilir kılmaktır. Bilgi, paylaşıldıkça büyüyen tek güçtür.'
                            : 'The universe is a massive dataset waiting to be discovered. At Aethel Science, our primary goal is to analyze complex scientific data and make it understandable and accessible to humanity. Knowledge is the only power that grows as it is shared.'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-primary uppercase tracking-widest">II. {lang === 'tr' ? 'Teknolojik Etik ve İlerleme' : 'Technological Ethics and Progress'}</span>
                        <p className="text-lg font-light leading-relaxed text-muted-foreground">
                          {lang === 'tr'
                            ? 'Bilim ve teknolojinin güncel hızı, insanlık tarihinin en kritik eşiğindedir. Teknoloji insanın yerini almak için değil, insan potansiyelini maksimize etmek için kullanılmalıdır. Her algoritma, insanlığın ortak refahını hedeflemek zorundadır.'
                            : 'The current pace of science and technology is at the most critical threshold in human history. Technology should be used not to replace humans, but to maximize human potential. Every algorithm we develop must aim for the common welfare of humanity.'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-primary uppercase tracking-widest">III. {lang === 'tr' ? 'Şeffaflık ve Doğruluk' : 'Transparency and Accuracy'}</span>
                        <p className="text-lg font-light leading-relaxed text-muted-foreground">
                          {lang === 'tr'
                            ? 'Yanlış bilginin ışık hızında yayıldığı bu çağda, sistemlerimiz sadece doğrulanmış verilere dayanır. Bizim için "tr" anahtarı sadece bir dil kodu değil, "Truth" (Gerçek) protokolünün bir simgesidir.'
                            : 'In this era where misinformation spreads at the speed of light, our systems rely only on verified data. For us, the "tr" key is not just a language code, but a symbol of the "Truth" protocol.'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-primary uppercase tracking-widest">IV. {lang === 'tr' ? 'Neden Bu Kurallar Var?' : 'Why These Rules Exist?'}</span>
                        <ul className="text-sm font-light leading-relaxed text-muted-foreground space-y-2 list-none">
                          <li className="flex gap-2">
                            <span className="text-primary">/</span>
                            <span>{lang === 'tr' ? 'Kaosu Düzenlemek İçin: Teknolojik ilerleme kontrolsüz bırakılırsa dijital bir kaosa dönüşür.' : 'To Organize Chaos: If technological progress is left uncontrolled, it turns into digital chaos.'}</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">/</span>
                            <span>{lang === 'tr' ? 'Geleceği Tasarlamak İçin: Bugün kodladığımız her satır, yarının dünyasının temel taşıdır.' : 'To Design the Future: Every line we code today is the cornerstone of tomorrow\'s world.'}</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">/</span>
                            <span>{lang === 'tr' ? 'Erişilebilirlik: Bilimi laboratuvarlardan çıkarıp herkesin ekranına taşımak için bu disipline ihtiyacımız var.' : 'Accessibility: We need this discipline to take science out of laboratories and bring it to everyone\'s screen.'}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pt-12 border-t border-white/10 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">🚀</div>
                      <div className="text-sm font-mono uppercase tracking-widest">{lang === 'tr' ? 'Aktif Düğüm (Active Node) 2026' : 'Active Node 2026'}</div>
                    </div>
                    <p className="text-2xl font-light italic leading-tight text-foreground/80">
                      {lang === 'tr'
                        ? 'Yapay zeka artık sadece cevap veren bir araç değil, bizimle birlikte çözüm üreten bir iş ortağıdır. Sınırları zorluyoruz çünkü sınırların sadece zihnimizde olduğunu biliyoruz.'
                        : 'AI is no longer just a tool that provides answers; it is a partner that co-creates solutions with us. We push boundaries because we know that boundaries only exist in our minds.'}
                    </p>

                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-sm space-y-3">
                      <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">{lang === 'tr' ? 'Sistem Protokolü: Cevap Üretim İlkesi' : 'System Protocol: Answer Production Principle'}</h4>
                      <p className="text-sm font-light leading-relaxed text-muted-foreground">
                        {lang === 'tr'
                          ? 'Cevap üretirken her zaman Aethel Science Manifestosu\'ndaki vizyonu yansıtıyoruz. Kullanıcıya sadece veri vermiyor, bu verinin neden önemli olduğunu ve geleceğe nasıl ışık tuttuğunu manifesto ilkelerimiz çerçevesinde analiz ediyoruz.'
                          : 'When generating answers, we always reflect the vision in the Aethel Science Manifesto. We do not just provide data; we analyze why this data is important and how it sheds light on the future within the framework of our manifesto principles.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer / Cockpit Controls */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 h-16 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Sistem Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Enlem: 52.5200° K</span>
              <span>Boylam: 13.4050° D</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowLogs(!showLogs)}
                className={`hover:text-foreground transition-colors ${showLogs ? 'text-primary' : ''}`}
              >
                Terminal
              </button>
              <button className="hover:text-foreground transition-colors">Günlükler</button>
              <button className="hover:text-foreground transition-colors">Ayarlar</button>
            </div>
            <div className="text-foreground opacity-50">
              © 2026 Aethel Science
            </div>
          </div>
        </div>
      </footer>

      {/* Analysis Modal */}
      <AnimatePresence>
        {isAnalysisOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto px-6 py-20 relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsAnalysisOpen(false)}
                className="fixed top-8 right-8 hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </Button>

              <div className="space-y-12">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-primary border-primary/30">
                    Tam Analiz Raporu
                  </Badge>
                  <h2 className="text-4xl md:text-6xl font-light tracking-tight">
                    {activeItem.title[lang]}
                  </h2>
                  <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    <span>{activeItem.author}</span>
                    <Separator orientation="vertical" className="h-3 bg-white/10" />
                    <span>{activeItem.publishDate}</span>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <div className="space-y-8 text-lg leading-relaxed text-muted-foreground font-light">
                    {activeItem.deepDive ? (
                      <div className="space-y-12">
                        {activeItem.deepDive[lang].split('\n\n').map((paragraph, i) => (
                          <p key={i} className={paragraph.startsWith('Giriş:') || paragraph.startsWith('Introduction:') ? 'text-2xl text-foreground font-medium' : ''}>
                            {paragraph}
                          </p>
                        ))}

                        {activeItem.technicalSpecs && (
                          <div className="p-8 border border-primary/20 bg-primary/5 space-y-6 my-12">
                            <h3 className="text-sm font-mono uppercase tracking-widest text-primary">{lang === 'tr' ? 'Teknik Spesifikasyonlar' : 'Technical Specifications'}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              {activeItem.technicalSpecs.map((spec, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                                  <span className="text-xs font-mono text-muted-foreground uppercase">{spec.label}</span>
                                  <span className="text-lg font-mono text-primary">{spec.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeItem.beyondPerspective && (
                          <div className="p-8 border border-white/10 bg-white/[0.02] space-y-6 my-12">
                            <h3 className="text-sm font-mono uppercase tracking-widest text-primary">{lang === 'tr' ? 'Ötesi' : 'The Beyond'}</h3>
                            <p className="text-xl italic">{activeItem.beyondPerspective[lang]}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {activeItem.dataAnalysis && (
                          <div className="p-8 border border-primary/20 bg-primary/5 space-y-6 my-12">
                            <h3 className="text-sm font-mono uppercase tracking-widest text-primary">{lang === 'tr' ? 'NASA OSDR Veri Analizi' : 'NASA OSDR Data Analysis'}</h3>
                            <p className="text-lg data-analysis-glow">{activeItem.dataAnalysis[lang]}</p>
                          </div>
                        )}

                        {activeItem.globalContext && (
                          <div className="space-y-4">
                            <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">{lang === 'tr' ? 'Küresel Bağlam ve Etki' : 'Global Context and Impact'}</h3>
                            <p>{activeItem.globalContext[lang]}</p>
                          </div>
                        )}

                        {activeItem.curatorInsight && (
                          <div className="p-8 border border-white/10 bg-white/[0.02] space-y-6 my-12">
                            <h3 className="text-sm font-mono uppercase tracking-widest text-primary">{lang === 'tr' ? 'Küratör Öngörüsü' : 'Curator Insight'}</h3>
                            <p>{activeItem.curatorInsight[lang]}</p>
                          </div>
                        )}
                      </>
                    )}

                    {activeItem.glossary && activeItem.glossary.length > 0 && (
                      <div className="space-y-6 my-12">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-primary">Glossary</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {activeItem.glossary.map((g, i) => (
                            <div key={i} className="p-4 border border-white/5 bg-white/[0.01]">
                              <div className="text-sm font-mono text-primary mb-1">{g.term}</div>
                              <div className="text-sm text-muted-foreground leading-relaxed">{g.definition[lang]}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p>
                      {lang === 'tr' 
                        ? 'Bu analiz, Aethel Science kürasyon standartlarına uygun olarak NASA OSDR ve SerpApi verileri ışığında Gemini 2.0 tarafından sentezlenmiştir. İçeriğin 5 günlük döngü süresince güncelliğini koruması garanti altındadır.'
                        : 'This analysis has been synthesized by Gemini 2.0 in light of NASA OSDR and SerpApi data, in accordance with Aethel Science curation standards. The content is guaranteed to remain up-to-date throughout the 5-day cycle.'}
                    </p>
                  </div>
                </div>

                <div className="pt-12 border-t border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[10px] font-mono uppercase tracking-widest">{lang === 'tr' ? 'Rapor Sonu' : 'End of Report'}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAnalysisOpen(false)}
                    className="font-mono text-[10px] uppercase tracking-widest"
                  >
                    {lang === 'tr' ? 'Kapat' : 'Close'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal Overlay */}
      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-6 w-80 glass-panel p-4 z-50 font-mono text-[10px] space-y-2"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
              <span className="text-primary">AETHEL_TERMINAL_V1.0</span>
              <X className="w-3 h-3 cursor-pointer" onClick={() => setShowLogs(false)} />
            </div>
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="opacity-30">{i + 1}</span>
                <span className="text-muted-foreground">{log}</span>
              </div>
            ))}
            <div className="pt-2 animate-pulse text-primary">_</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[60] bg-background p-6 flex flex-col gap-8"
          >
            <div className="flex justify-between items-center">
              <span className="text-xl font-medium tracking-tighter uppercase">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                <X />
              </Button>
            </div>
            <nav className="flex flex-col gap-6 text-2xl font-medium tracking-tight">
              <button onClick={() => { setView('showroom'); setIsMenuOpen(false); }}>{lang === 'tr' ? 'Showroom' : 'Showroom'}</button>
              <button onClick={() => { setView('archive'); setIsMenuOpen(false); }}>{lang === 'tr' ? 'Arşiv' : 'Archive'}</button>
              <button onClick={() => { setView('manifesto'); setIsMenuOpen(false); }}>{lang === 'tr' ? 'Manifesto' : 'Manifesto'}</button>
              <button onClick={() => { setView('curators'); setIsMenuOpen(false); }}>{lang === 'tr' ? 'Küratörler' : 'Curators'}</button>
            </nav>
            <Separator className="bg-white/10" />
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{lang === 'tr' ? 'Mevcut Seçki' : 'Current Selection'}</h3>
              {(view === 'showroom' ? showroomItems : archiveItems).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItem(item);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left p-4 border ${
                    activeItem.id === item.id ? 'bg-primary text-primary-foreground border-primary' : 'border-white/10'
                  }`}
                >
                  {item.title[lang]}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Archive Detail Modal */}
      <AnimatePresence>
        {selectedArchiveItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedArchiveItem(null)}
            className="fixed inset-0 z-[110] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl w-full max-h-[90vh] bg-black border border-white/10 overflow-hidden flex flex-col relative"
            >
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedArchiveItem(null)}
                className="absolute top-4 right-4 z-20 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8 space-y-12">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-mono text-primary uppercase tracking-[0.3em]">
                        {getCategoryIcon(selectedArchiveItem.category)}
                        <span>{selectedArchiveItem.category}</span>
                        <Separator orientation="vertical" className="h-3 bg-white/10" />
                        <span className="text-muted-foreground">{selectedArchiveItem.publishDate}</span>
                      </div>
                      <h2 className="text-4xl md:text-6xl font-medium tracking-tighter leading-none">
                        {selectedArchiveItem.title[lang]}
                      </h2>
                    </div>

                    <div className="prose prose-invert max-w-none space-y-8">
                      <div className="text-xl font-light leading-relaxed text-foreground/90 italic border-l-2 border-primary/30 pl-8">
                        {selectedArchiveItem.archiveCardSummary?.[lang]}
                      </div>
                      
                      <div className="space-y-6 text-lg font-light leading-relaxed text-muted-foreground">
                        {selectedArchiveItem.dataAnalysis[lang]}
                        {selectedArchiveItem.globalContext[lang]}
                      </div>
                    </div>

                    {selectedArchiveItem.rawData && (
                      <div className="space-y-6">
                        <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">Raw Technical Data (NASA OSDR)</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {selectedArchiveItem.rawData.map((data, i) => (
                            <div key={i} className="p-4 bg-white/[0.02] border border-white/5 space-y-1">
                              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{data.label}</div>
                              <div className="text-xl font-mono text-foreground">
                                {data.value}
                                <span className="text-[10px] ml-1 opacity-50">{data.unit}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-4 space-y-8">
                    {selectedArchiveItem.curatorInsight && (
                      <div className="p-8 bg-primary/5 border border-primary/20 space-y-6">
                        <h4 className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">Curator's Note</h4>
                        <p className="text-sm font-light leading-relaxed text-white italic">
                          {selectedArchiveItem.curatorInsight[lang]}
                        </p>
                        <div className="pt-4 flex items-center gap-3 border-t border-primary/10">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">Æ</div>
                          <div className="space-y-0.5">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-foreground">{CURATOR_PROFILE.name[lang]}</div>
                            <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{CURATOR_PROFILE.title[lang]}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-8 bg-white/[0.02] border border-white/5 space-y-4">
                      <h4 className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Deep Space Deletion</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-muted-foreground">Expiry Date</span>
                          <span>{selectedArchiveItem.expiryDate}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-muted-foreground">Status</span>
                          <span className="text-orange-500">COLD_STORAGE</span>
                        </div>
                      </div>
                      <Progress value={(calculateRemainingDays(selectedArchiveItem.expiryDate) / 30) * 100} className="h-1 bg-white/5" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
