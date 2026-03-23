import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Supplement, getCategoryStyle, UserPreferences } from '../types';
import SupplementDetailModal from './SupplementDetailModal';
import StarRating from './StarRating';
import { 
  Microscope, Trophy, Crown, RefreshCcw, 
  Leaf, WheatOff, FlaskConical, Sprout, Sparkles, Play, Pause, Lock, ArrowUp, ArrowDown
} from 'lucide-react';
import { soundService } from '../services/sound';

export const getEmoji = (name: string) => {
  const n = name.toLowerCase();
  // Rendimiento
  if (n.includes('creatina')) return '⚡️';
  if (n.includes('proteína') || n.includes('whey')) return '🥩';
  if (n.includes('beta-alanina')) return '🔥';
  if (n.includes('citrulina')) return '💪';
  if (n.includes('elevatp')) return '🔋';
  if (n.includes('senactiv')) return '🌹';
  if (n.includes('ecdysterona')) return '🌱';
  if (n.includes('peako2')) return '🍄';
  if (n.includes('theacrine') || n.includes('teacrine')) return '☕';
  if (n.includes('norvalina')) return '🩸';
  if (n.includes('cordyceps')) return '🍄';
  if (n.includes('hmb')) return '🧱';
  if (n.includes('ribósido') || n.includes('nr')) return '🧬';
  if (n.includes('fenogreco')) return '🌿';
  if (n.includes('ribosa')) return '🍬';
  if (n.includes('turkestanica')) return '⛰️';
  if (n.includes('ornithine') || n.includes('okg')) return '🧪';
  if (n.includes('beetroot') || n.includes('remolacha')) return '🟣';

  // Mental
  if (n.includes('omega')) return '🧠';
  if (n.includes('cafeína')) return '☕';
  if (n.includes('teanina')) return '🌿';
  if (n.includes('melatonina')) return '💤';
  if (n.includes('bacopa')) return '🍃';
  if (n.includes('noopept')) return '💊';
  if (n.includes('9-me-bc')) return '🔌';
  if (n.includes('uridina')) return '🧬';
  if (n.includes('citicolina') || n.includes('cdp-colina')) return '🔵';
  if (n.includes('agmatina')) return '🐚';
  if (n.includes('panax')) return '🎋';
  if (n.includes('aniracetam')) return '🎨';
  if (n.includes('tirosina')) return '🎯';
  if (n.includes('celastrus')) return '🔥';
  if (n.includes('fosfatidilserina')) return '🥚';
  if (n.includes('semax')) return '👃';
  if (n.includes('coluracetam')) return '👁️';
  if (n.includes('sabroxy')) return '📖';

  // General
  if (n.includes('magnesio')) return '🌙';
  if (n.includes('vitamina d')) return '☀️';
  if (n.includes('zinc')) return '🛡️';
  if (n.includes('curcumina') || n.includes('cúrcuma') || n.includes('hydrocurc')) return '🟠';
  if (n.includes('shilajit')) return '🌋';
  if (n.includes('berberina')) return '🌿';
  if (n.includes('lactoferrina')) return '🥛';
  if (n.includes('pterostilbene')) return '🍇';
  if (n.includes('olivo')) return '🫒';
  if (n.includes('clorofila')) return '🍵';
  if (n.includes('neem')) return '🌳';
  if (n.includes('inositol')) return '🍚';
  if (n.includes('pomelo')) return '🍊';
  if (n.includes('alfa lipoico') || n.includes('ala')) return '🧪';
  if (n.includes('gaba')) return '🧘';
  if (n.includes('zeolita')) return '🧱';
  if (n.includes('pino')) return '🌲';
  if (n.includes('málico')) return '🍏';

  // Hormonal
  if (n.includes('ashwagandha')) return '🧘';
  if (n.includes('tongkat')) return '🐘';
  if (n.includes('maca')) return '🥔';
  if (n.includes('dim')) return '🥦';
  if (n.includes('muira')) return '🪵';
  if (n.includes('tribulus')) return '🔱';
  if (n.includes('pine pollen')) return '🌲';
  if (n.includes('tocotrienoles')) return '🥥';
  if (n.includes('safed')) return '🥛';
  if (n.includes('shatavari')) return '🌷';
  if (n.includes('ortiga')) return '🌱';
  if (n.includes('diosgenina')) return '🍠';
  if (n.includes('polen')) return '🐝';
  if (n.includes('mucuna')) return '🎭';
  if (n.includes('testofen')) return '🔥';

  // Belleza
  if (n.includes('colágeno')) return '🦴';
  if (n.includes('biotina')) return '💅';
  if (n.includes('silicio')) return '💎';
  if (n.includes('msm')) return '🌋';
  if (n.includes('ceramidas')) return '🧱';
  if (n.includes('cistina')) return '💇';
  if (n.includes('picnogenol') || n.includes('pycnogenol')) return '🌲';
  if (n.includes('astaxantina')) return '🦐';
  if (n.includes('hialurónico')) return '💦';
  if (n.includes('uva')) return '🍇';
  if (n.includes('ubiquinol') || n.includes('coq10')) return '🔋';
  if (n.includes('soja')) return '🫘';
  if (n.includes('luteína')) return '🌼';
  if (n.includes('vitamina c')) return '🍋';

  // Digestión
  if (n.includes('probióticos') || n.includes('akkermansia') || n.includes('boulardii') || n.includes('probiota')) return '🦠';
  if (n.includes('tributirina')) return '🧈';
  if (n.includes('betaína')) return '🧪';
  if (n.includes('triphala')) return '🍂';
  if (n.includes('enzimas') || n.includes('digest gold')) return '🧪';
  if (n.includes('almidón')) return '🥔';
  if (n.includes('maslínico')) return '🫒';
  if (n.includes('piperina')) return '🌶️';
  if (n.includes('jengibre')) return '🫚';
  if (n.includes('peppermint')) return '🍃';
  if (n.includes('dgl') || n.includes('regaliz')) return '🍭';
  if (n.includes('alcachofa')) return '🥦';
  if (n.includes('cinamaldehído')) return '🪵';

  // Longevidad
  if (n.includes('nmn') || n.includes('resveratrol')) return '⏳';
  if (n.includes('urolitina')) return '🍎';
  if (n.includes('spermidina')) return '🧬';
  if (n.includes('trehalosa')) return '🍚';
  if (n.includes('pqq')) return '🌟';
  if (n.includes('lithium') || n.includes('litio')) return '💎';
  if (n.includes('cacao')) return '🍫';
  if (n.includes('bergamota')) return '🍊';
  if (n.includes('carnosina')) return '🥩';
  if (n.includes('glynac')) return '🧪';
  if (n.includes('fucoidan')) return '🌊';
  if (n.includes('fisetina')) return '🍓';
  if (n.includes('apigenina')) return '🌼';
  if (n.includes('hydroxitirosol')) return '🫒';
  if (n.includes('ergotioneína')) return '🍄';

  return '💊';
};

interface Props {
  supplements: Supplement[];
  activeSuppIds: string[];
  onToggleProtocol: (id: string) => void;
  onVote: (id: string, rating: number) => void;
  onRemoveVote: (id: string) => void;
  isSyncing: boolean;
  onSync: () => void;
  preferences: UserPreferences;
  onUpdatePreferences?: (updates: Partial<UserPreferences>) => void;
  onStartOnboarding: () => void;
  onAttemptUpgrade: () => void;
}

const RankingView: React.FC<Props> = ({ 
  supplements, 
  activeSuppIds, 
  onToggleProtocol, 
  onVote, 
  onRemoveVote, 
  isSyncing, 
  onSync,
  preferences,
  onStartOnboarding,
  onAttemptUpgrade
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ d: '00', h: '00', m: '00', s: '00' });
  const [showSyncInfo, setShowSyncInfo] = useState(false);
  
  // Persistencia de estados anteriores para cálculo de tendencias
  const prevScientificRanks = useRef<Record<string, number>>({});
  const prevCommunityRanks = useRef<Record<string, number>>({});

  const activeSupplement = useMemo(() => 
    selectedId ? supplements.find(s => s.id === selectedId) : null,
    [selectedId, supplements]
  );

  const sortedScientific = useMemo(() => 
    [...supplements].sort((a, b) => b.scientificScore - a.scientificScore),
    [supplements]
  );

  const sortedCommunity = useMemo(() => 
    [...supplements].sort((a, b) => b.rating - a.rating || b.votes - a.votes),
    [supplements]
  );

  const topScientific = useMemo(() => sortedScientific.slice(0, 10), [sortedScientific]);
  const topCommunity = useMemo(() => sortedCommunity.slice(0, 10), [sortedCommunity]);

  // Inicialización y persistencia de snapshots
  useEffect(() => {
    if (Object.keys(prevScientificRanks.current).length === 0) {
      const savedSci = localStorage.getItem('SI_RANK_SCI_SNAPSHOT');
      const savedCom = localStorage.getItem('SI_RANK_COM_SNAPSHOT');
      
      if (savedSci) prevScientificRanks.current = JSON.parse(savedSci);
      else sortedScientific.forEach((s, i) => prevScientificRanks.current[s.id] = i);
      
      if (savedCom) prevCommunityRanks.current = JSON.parse(savedCom);
      else sortedCommunity.forEach((s, i) => prevCommunityRanks.current[s.id] = i);
    }
  }, []);

  // Lógica de Sincronización Independiente
  useEffect(() => {
    if (isSyncing) {
        sortedScientific.forEach((s, i) => prevScientificRanks.current[s.id] = i);
        localStorage.setItem('SI_RANK_SCI_SNAPSHOT', JSON.stringify(prevScientificRanks.current));
    }
  }, [isSyncing, sortedScientific]);

  const lastCommunityOrder = useRef<string>('');
  useEffect(() => {
    const currentOrder = topCommunity.map(s => s.id).join(',');
    if (lastCommunityOrder.current !== currentOrder && lastCommunityOrder.current !== '') {
        localStorage.setItem('SI_RANK_COM_SNAPSHOT', JSON.stringify(prevCommunityRanks.current));
    }
    topCommunity.forEach((s, i) => {
        if (prevCommunityRanks.current[s.id] === undefined) prevCommunityRanks.current[s.id] = i;
    });
    lastCommunityOrder.current = currentOrder;
  }, [topCommunity]);

  const getRankDiff = (id: string, type: 'scientific' | 'community', currentIdx: number) => {
    const prevRanks = type === 'scientific' ? prevScientificRanks.current : prevCommunityRanks.current;
    const prevIdx = prevRanks[id];
    if (prevIdx === undefined) return 0;
    return prevIdx - currentIdx;
  };

  const handleSyncTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSyncing) return;
    soundService.playClick();
    onSync();
  };

  const handleSelect = (sup: Supplement) => {
    soundService.playClick();
    setSelectedId(sup.id);
  };

  const handleProtocolClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!preferences.isLoggedIn) {
      soundService.playClick();
      onStartOnboarding();
      return;
    }
    if (!preferences.isPremium) {
      soundService.playClick();
      return;
    }
    onToggleProtocol(id);
  };

  useEffect(() => {
    const updateTimer = () => {
      if (!preferences?.lastScientificSync) return;
      const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
      const nextSync = preferences.lastScientificSync + ONE_WEEK;
      const diff = nextSync - Date.now();
      
      if (diff <= 0) {
        setTimeLeft({ d: '00', h: '00', m: '00', s: '00' });
        if (!isSyncing) onSync();
        return;
      }

      const fmt = (n: number) => n.toString().padStart(2, '0');
      setTimeLeft({
        d: fmt(Math.floor(diff / 86400000)),
        h: fmt(Math.floor((diff % 86400000) / 3600000)),
        m: Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0'),
        s: Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')
      });
    };
    const interval = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(interval);
  }, [preferences?.lastScientificSync, isSyncing, onSync]);

  const TrendBadge = ({ diff }: { diff: number }) => {
    if (diff === 0) return null;
    const isUp = diff > 0;
    const absDiff = Math.abs(diff);

    return (
      <div className={`
        flex items-center gap-1 px-2 py-0.5 rounded-lg border backdrop-blur-md shadow-sm transition-all duration-500 animate-fade-in
        ${isUp 
          ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' 
          : 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/20 shadow-red-500/5'}
      `}>
        {isUp ? (
          <ArrowUp size={12} strokeWidth={4} className="animate-pulse" />
        ) : (
          <ArrowDown size={12} strokeWidth={4} className="animate-pulse" />
        )}
        <span className="text-[11px] font-black tabular-nums tracking-tighter italic leading-none">
          {absDiff}
        </span>
      </div>
    );
  };

  const UserVoteBadge = ({ vote }: { vote: number }) => (
    <div className="bg-black border border-amber-500/30 px-3 py-1 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] animate-pulse">
      <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] italic leading-none">TU VOTO: {vote.toFixed(1)}</span>
    </div>
  );

  const renderSubBadges = (sup: Supplement) => (
    <div className="mt-1 p-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl flex flex-wrap gap-1">
      {sup.isVegan && (
        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg bg-black text-emerald-500 text-[8px] font-black uppercase tracking-tighter border border-emerald-500/20 leading-none">
          <Leaf size={10} /> VEGANO
        </div>
      )}
      {sup.isGlutenFree && (
        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg bg-black text-amber-500 text-[8px] font-black uppercase tracking-tighter border border-amber-500/20 leading-none">
          <WheatOff size={10} /> SIN GLUTEN
        </div>
      )}
      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter border bg-black leading-none ${sup.origin === 'Natural' ? 'text-indigo-400 border-indigo-500/20' : 'text-purple-400 border-purple-500/20'}`}>
        {sup.origin === 'Natural' ? <Sprout size={10} /> : <FlaskConical size={10} />} {sup.origin}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col animate-fade-in py-8 space-y-12 pb-32 max-w-[1440px] mx-auto px-4 sm:px-8">
      {/* Live Evidence Sync Bar */}
      <div className="relative group mb-2 z-[60]">
        <div 
          onClick={handleSyncTrigger}
          className={`
            flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 bg-surface/50 border-2 rounded-[1.5rem] sm:rounded-[2rem] backdrop-blur-md transition-all cursor-pointer hover:scale-[1.005] active:scale-[0.99] gap-4
            ${isSyncing ? 'border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.4)]' : 'border-border/60 hover:border-indigo-500/40 shadow-2xl'}
          `}
          onMouseEnter={() => setShowSyncInfo(true)}
          onMouseLeave={() => setShowSyncInfo(false)}
        >
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className={`w-4 h-4 rounded-full animate-ping absolute inset-0 opacity-75 ${isSyncing ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
              <div className={`w-4 h-4 rounded-full relative ${isSyncing ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">
                {isSyncing ? 'RECALIBRANDO EVIDENCIA...' : 'ACTUALIZACIÓN CIENTÍFICA'}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest italic">
                  Sincronización de Base de Datos Biológica
                </span>
                {!isSyncing && (
                  <div className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[7px] font-black uppercase tracking-widest animate-pulse">
                    Actualizar ahora
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 font-mono text-xl sm:text-3xl font-black text-primary italic tracking-tighter">
            <div className="flex flex-col items-center">
              <span className="text-indigo-600 dark:text-indigo-400 leading-none">{timeLeft.d}</span>
              <span className="text-[7px] sm:text-[9px] text-secondary uppercase tracking-widest mt-1">Días</span>
            </div>
            <span className="opacity-20">:</span>
            <div className="flex flex-col items-center">
              <span className="text-indigo-600 dark:text-indigo-400 leading-none">{timeLeft.h}</span>
              <span className="text-[7px] sm:text-[9px] text-secondary uppercase tracking-widest mt-1">Horas</span>
            </div>
            <span className="opacity-20">:</span>
            <div className="flex flex-col items-center">
              <span className="text-indigo-600 dark:text-indigo-400 leading-none">{timeLeft.m}</span>
              <span className="text-[7px] sm:text-[9px] text-secondary uppercase tracking-widest mt-1">Mins</span>
            </div>
            <span className="opacity-20">:</span>
            <div className="flex flex-col items-center">
              <span className="text-indigo-600 dark:text-indigo-400 animate-pulse leading-none">{timeLeft.s}</span>
              <span className="text-[7px] sm:text-[9px] text-secondary uppercase tracking-widest mt-1">Segs</span>
            </div>
          </div>
        </div>

        {showSyncInfo && (
          <div className="absolute top-full mt-4 left-0 right-0 z-[100] bg-white dark:bg-[#0c0c0c] border-2 border-indigo-500/30 p-8 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.9)] animate-slide-up transition-colors duration-300 pointer-events-none">
            <div className="flex items-start gap-5">
              <div className="p-3 bg-indigo-500/20 rounded-2xl">
                <RefreshCcw size={28} className={`${isSyncing ? "animate-spin" : "animate-spin-slow"} text-indigo-600 dark:text-indigo-400`} />
              </div>
              <div>
                <h4 className="text-primary font-black uppercase italic tracking-tighter mb-2 text-lg">Mecanismo de Recalibración IA</h4>
                <p className="text-sm text-secondary leading-relaxed font-medium">
                  Las tendencias del ranking científico se mantienen estáticas hasta que finaliza el ciclo de 7 días o se fuerza una actualización manual. Esto garantiza que las flechas reflejen fielmente el impacto de la evidencia acumulada.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* RANKING CIENTÍFICO */}
        <div className="xl:w-1/2 space-y-6">
          <div className="flex items-center space-x-5 mb-1">
            <div className="p-4 bg-indigo-500/10 dark:bg-[#3B82F6]/20 text-indigo-600 dark:text-[#3B82F6] rounded-2xl border border-indigo-500/30 shadow-2xl">
              <Microscope size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-primary tracking-tight italic uppercase leading-none">TOP 10 CIENTÍFICO</h2>
              <p className="text-[11px] text-secondary uppercase font-bold tracking-[0.3em] mt-2">Impacto Clínico Validado</p>
            </div>
          </div>

          <div className="space-y-4">
            {topScientific.map((sup, idx) => {
              const style = getCategoryStyle(sup.category);
              const posDiff = getRankDiff(sup.id, 'scientific', idx);
              const isActive = activeSuppIds.includes(sup.id);
              const scoreDiff = sup.previousScientificScore !== undefined ? sup.scientificScore - sup.previousScientificScore : 0;
              
              return (
                <div 
                  key={`sci-${sup.id}`} 
                  onClick={() => handleSelect(sup)}
                  className={`
                    group bg-surface border-y border-r rounded-r-[1.5rem] rounded-l-lg py-2 sm:py-3 px-3 sm:px-6 flex items-center transition-all duration-500 cursor-pointer hover:-translate-y-1 relative overflow-visible min-h-[90px] sm:min-h-[110px]
                    ${posDiff > 0 ? 'border-emerald-500/30 shadow-emerald-500/5 shadow-2xl' : 
                      posDiff < 0 ? 'border-red-500/30 shadow-red-500/5 shadow-2xl' : 
                      'border-border hover:border-indigo-500/40 shadow-xl'}
                    ${isActive ? 'border-amber-500/40 shadow-amber-500/10' : ''}
                  `}
                >
                  {/* Impact Bar lateral */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-lg transition-all duration-1000 ${scoreDiff > 0 ? 'bg-emerald-500 shadow-[0_0_10px_#10B981]' : scoreDiff < 0 ? 'bg-red-500 shadow-[0_0_10px_#EF4444]' : 'bg-indigo-500/20'}`} />

                  <div className="absolute top-0 left-1.5 z-[10]">
                    <div className={`px-4 py-1.5 rounded-br-[1.5rem] flex items-center justify-center font-black text-xs relative ${idx < 3 ? 'bg-indigo-600 dark:bg-[#3B82F6] text-white shadow-lg' : 'bg-neutral-200 dark:bg-neutral-800 text-secondary'}`}>
                      #{idx + 1}
                      {idx < 3 && (
                        <div className="absolute -top-3.5 -left-3.5 text-indigo-600 dark:text-white animate-float-crown drop-shadow-[0_0_12px_rgba(59,130,246,0.8)] pointer-events-none z-[15]">
                          <Crown size={22} fill="currentColor" strokeWidth={1} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`w-14 h-14 ${style.bg} rounded-[1.2rem] flex items-center justify-center mr-5 ml-4 border ${style.border} flex-shrink-0 shadow-2xl overflow-hidden ${isActive ? 'border-amber-500 shadow-amber-500/20' : ''}`}>
                    <span className="text-3xl dark:filter dark:grayscale dark:brightness-[2] group-hover:filter-none transition-all duration-700">{getEmoji(sup.name)}</span>
                  </div>

                  <div className="flex-grow min-w-0 flex flex-col justify-center overflow-visible">
                    <div className="flex items-center gap-3 mb-1.5 overflow-visible">
                      <h3 className={`text-base sm:text-xl font-black uppercase italic tracking-tighter leading-tight border-l-4 border-indigo-500/50 pl-2 sm:pl-3 pr-3 sm:pr-6 bg-clip-text text-transparent bg-gradient-to-br from-neutral-900 to-neutral-500 dark:from-white dark:to-white/60 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,1)] group-hover:border-indigo-500 transition-all ${isActive ? 'from-amber-400 to-amber-600 border-amber-500' : ''}`}>
                        {sup.name}
                      </h3>
                      <TrendBadge diff={posDiff} />
                      {scoreDiff !== 0 && (
                        <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase italic animate-bounce-subtle ${scoreDiff > 0 ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'}`}>
                          {scoreDiff > 0 ? 'ALZA CLÍNICA' : 'AJUSTE EVIDENCIA'}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-start gap-1">
                        <div className="p-0.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg inline-flex self-start">
                          <div className={`flex items-center gap-2 px-2.5 py-0.5 rounded-md border bg-black border-white/10 shadow-lg leading-none`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse shadow-[0_0_8px_var(--tw-shadow-color)] ${style.glow}`} />
                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${style.text} italic`}>
                              {sup.category}
                            </span>
                          </div>
                        </div>
                        {renderSubBadges(sup)}
                      </div>

                      {sup.isEmerging && (
                        <div className="mb-1 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/80 border-2 border-[#06B6D4]/50 text-[#06B6D4] text-[9px] font-black uppercase tracking-wider leading-none animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.4)] italic">
                          <span className="flex items-center gap-1.5 italic"><Sparkles size={11} className="text-[#06B6D4]" /> EMERGENTE</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-center self-stretch pl-4 sm:pl-6 border-l border-border/60 ml-2 sm:ml-4 flex-shrink-0">
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                         <button 
                            onClick={(e) => handleProtocolClick(e, sup.id)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all shadow-lg 
                              ${!preferences.isPremium 
                                ? 'bg-black/20 border-white/5 text-secondary/30 cursor-not-allowed' 
                                : (isActive ? 'bg-amber-500 border-amber-400 text-black shadow-amber-500/40' : 'bg-black/20 border-white/5 text-secondary hover:text-amber-500 hover:border-amber-500/40')
                              }`}
                          >
                            {!preferences.isPremium ? <Lock size={14} className="text-amber-500/40" /> : (isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />)}
                          </button>
                        <div className="flex flex-col items-end relative min-w-[50px]">
                          <div className="text-[7px] sm:text-[8px] font-black text-secondary uppercase tracking-[0.2em] mb-0.5 leading-none">Score IA</div>
                          <div className="flex items-center gap-1 sm:gap-2">
                             {sup.previousScientificScore !== undefined && (
                               <span className="text-[10px] sm:text-xs text-secondary/40 line-through font-bold decoration-red-500/50">{sup.previousScientificScore}</span>
                             )}
                             <div className="text-xl sm:text-3xl font-black italic leading-none text-indigo-600 dark:text-[#3B82F6]">
                               {sup.scientificScore}
                             </div>
                             {scoreDiff !== 0 && (
                               <span className={`text-[8px] sm:text-[10px] font-black italic ml-1 ${scoreDiff > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                 {scoreDiff > 0 ? `+${scoreDiff.toFixed(1)}` : scoreDiff.toFixed(1)}
                               </span>
                             )}
                          </div>
                        </div>
                      </div>
                      <StarRating 
                        rating={sup.rating} 
                        size={14} 
                        interactive={preferences.isPremium} 
                        onVote={(r) => preferences.isPremium && onVote(sup.id, r)} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RANKING COMUNIDAD - Las subidas y bajadas las determinan los votos de usuarios premium */}
        <div className="xl:w-1/2 space-y-6 relative">
          <div className="flex items-center space-x-5 mb-1">
            <div className="p-4 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 rounded-2xl border border-amber-500/30 shadow-2xl">
              <Trophy size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-primary tracking-tight italic uppercase leading-none">TOP 10 BIOHACKERS</h2>
              <p className="text-[11px] text-secondary uppercase font-bold tracking-[0.3em] mt-2">Élite de la Comunidad (Votación PRO)</p>
            </div>
          </div>

          <div className="space-y-4 relative">
            {topCommunity.map((sup, idx) => {
              const style = getCategoryStyle(sup.category);
              const posDiff = getRankDiff(sup.id, 'community', idx);
              const isActive = activeSuppIds.includes(sup.id);
              
              return (
                <div 
                  key={`com-${sup.id}`} 
                  onClick={() => handleSelect(sup)}
                  className={`
                    group bg-surface border rounded-[1.5rem] py-3 px-6 flex items-center transition-all duration-500 cursor-pointer hover:-translate-y-1 relative overflow-visible min-h-[110px]
                    ${posDiff > 0 ? 'border-emerald-500/30 shadow-emerald-500/5 shadow-2xl' : 
                      posDiff < 0 ? 'border-red-500/30 shadow-red-500/5 shadow-2xl' : 
                      'border-border hover:border-amber-500/60 shadow-2xl'}
                    ${isActive ? 'border-amber-500/40 shadow-amber-500/10' : ''}
                  `}
                >
                  <div className="absolute top-0 left-0 z-[10]">
                    <div className={`px-4 py-1.5 rounded-br-[1.5rem] flex items-center justify-center font-black text-xs relative ${idx < 3 ? 'bg-amber-500 text-black shadow-lg shadow-amber-400/50' : 'bg-neutral-200 dark:bg-neutral-800 text-secondary'}`}>
                      #{idx + 1}
                      {idx < 3 && (
                        <div className="absolute -top-3.5 -left-3.5 text-amber-600 dark:text-amber-500 animate-float-crown drop-shadow-[0_0_12px_rgba(245,158,11,0.8)] pointer-events-none z-[15]">
                          <Crown size={22} fill="currentColor" strokeWidth={1} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`w-14 h-14 ${style.bg} rounded-[1.2rem] flex items-center justify-center mr-5 border ${style.border} flex-shrink-0 shadow-2xl overflow-hidden ${isActive ? 'border-amber-500 shadow-amber-500/20' : ''}`}>
                    <span className="text-3xl dark:filter dark:grayscale dark:brightness-[2] group-hover:filter-none transition-all duration-700">{getEmoji(sup.name)}</span>
                  </div>
                  
                  <div className="flex-grow min-w-0 flex flex-col justify-center overflow-visible">
                    <div className="flex items-center gap-3 mb-1.5 overflow-visible">
                      <h3 className={`text-xl font-black uppercase italic tracking-tighter leading-tight border-l-4 border-amber-500/50 pl-3 pr-6 bg-clip-text text-transparent bg-gradient-to-br from-neutral-900 to-neutral-500 dark:from-white dark:to-white/70 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,1)] group-hover:border-amber-500 transition-all ${isActive ? 'from-amber-400 to-amber-600 border-amber-500' : ''}`}>
                        {sup.name}
                      </h3>
                      <TrendBadge diff={posDiff} />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-start gap-1">
                        <div className="p-0.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg inline-flex self-start">
                          <div className={`flex items-center gap-2 px-2.5 py-0.5 rounded-md border bg-black border-white/10 shadow-lg leading-none`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse shadow-[0_0_8px_var(--tw-shadow-color)] ${style.glow}`} />
                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${style.text} italic`}>
                              {sup.category}
                            </span>
                          </div>
                        </div>
                        {renderSubBadges(sup)}
                      </div>

                      {sup.isEmerging && (
                        <div className="mb-1 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/80 border-2 border-[#06B6D4]/50 text-[#06B6D4] text-[9px] font-black uppercase tracking-wider leading-none animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.4)] italic">
                          <span className="flex items-center gap-1.5 italic"><Sparkles size={11} className="text-[#06B6D4]" /> EMERGENTE</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end justify-center self-stretch pl-6 border-l border-border/60 ml-4 flex-shrink-0">
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => handleProtocolClick(e, sup.id)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-lg 
                            ${!preferences.isPremium 
                              ? 'bg-black/20 border-white/5 text-secondary/30 cursor-not-allowed' 
                              : (isActive ? 'bg-amber-500 border-amber-400 text-black shadow-amber-500/40' : 'bg-black/20 border-white/5 text-secondary hover:text-amber-500 hover:border-amber-500/40')
                            }`}
                        >
                          {!preferences.isPremium ? <Lock size={16} className="text-amber-500/40" /> : (isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />)}
                        </button>
                        <div className="flex flex-col items-end">
                          <div className="text-[8px] font-black text-secondary uppercase tracking-[0.2em] mb-0.5 leading-none">Rating PRO</div>
                          <div className="text-3xl font-black italic leading-none text-amber-600 dark:text-amber-500">{sup.rating.toFixed(1)}</div>
                        </div>
                      </div>
                      {sup.userVote !== undefined && <UserVoteBadge vote={sup.userVote} />}
                      <StarRating 
                        rating={sup.rating} 
                        size={14} 
                        interactive={preferences.isPremium} 
                        onVote={(r) => preferences.isPremium && onVote(sup.id, r)} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {!preferences.isPremium && (
              <div className="absolute inset-0 z-[30] bg-white/80 dark:bg-[#0c0c0c]/90 backdrop-blur-md rounded-[2.5rem] flex flex-col items-center justify-center border border-amber-500/40 text-center p-8 shadow-2xl transition-all duration-500 overflow-hidden">
                 <Lock size={48} className="text-amber-500 mb-6 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                 <h3 className="text-3xl font-black text-amber-500 uppercase italic tracking-tighter mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Ranking Exclusivo <span className="text-primary dark:text-white">PRO</span></h3>
                 <p className="text-slate-600 dark:text-slate-300 text-sm font-bold uppercase tracking-widest italic mt-2 max-w-[320px] leading-relaxed opacity-80">
                   Las votaciones de la élite biohacker son visibles únicamente para miembros con acceso de laboratorio.
                 </p>
                 <button 
                  onClick={onAttemptUpgrade}
                  className="mt-8 px-12 py-4 bg-amber-500 text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] italic hover:bg-amber-400 transition-all shadow-xl hover:shadow-amber-500/40 border border-white/10"
                 >
                   ACTUALIZAR A PRO
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {activeSupplement && (
        <SupplementDetailModal 
          supplement={activeSupplement} 
          onClose={() => setSelectedId(null)} 
          onVote={onVote}
          onRemoveVote={onRemoveVote}
          onToggleProtocol={onToggleProtocol}
          isActive={activeSuppIds.includes(activeSupplement.id)}
          isPremium={preferences.isPremium}
          isLoggedIn={preferences.isLoggedIn}
          onStartOnboarding={onStartOnboarding}
        />
      )}
    </div>
  );
};

export default RankingView;