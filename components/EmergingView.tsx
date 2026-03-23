import React, { useState, useMemo } from 'react';
import { Supplement, getCategoryStyle, UserPreferences, PremiumTag } from '../types';
import { 
  FlaskConical, Sprout, Leaf, WheatOff, Info, 
  ExternalLink, Microscope, Zap, FileText, Target, Clock, Sparkles, Play, Pause, Filter, Globe
} from 'lucide-react';
import { soundService } from '../services/sound';
import { getEmoji } from './RankingView';
import StarRating from './StarRating';
import SupplementDetailModal from './SupplementDetailModal';

interface Props {
  supplements: Supplement[];
  activeSuppIds: string[];
  onToggleProtocol: (id: string) => void;
  onVote: (id: string, rating: number) => void;
  onRemoveVote: (id: string) => void;
  preferences: UserPreferences;
  onStartOnboarding: () => void;
}

const CATEGORIES: PremiumTag[] = [
  'Rendimiento físico y deportivo',
  'Salud mental y cognitiva',
  'Salud general',
  'Salud hormonal y sexual',
  'Belleza y estética',
  'Digestión y metabolismo',
  'Longevidad y biohacking'
];

const SHORT_NAMES: Record<string, string> = {
  'Rendimiento físico y deportivo': 'Rendimiento',
  'Salud mental y cognitiva': 'Mental',
  'Salud general': 'General',
  'Salud hormonal y sexual': 'Hormonal',
  'Belleza y estética': 'Belleza',
  'Digestión y metabolismo': 'Digestión',
  'Longevidad y biohacking': 'Longevidad'
};

const EmergingCard: React.FC<{ supplement: Supplement; onSelect: (id: string) => void; onVote: (id: string, r: number) => void; isActive: boolean; onToggleProtocol: (id: string) => void }> = ({ supplement, onSelect, onVote, isActive, onToggleProtocol }) => {
  const style = getCategoryStyle(supplement.category);

  return (
    <div 
      onClick={() => { soundService.playClick(); onSelect(supplement.id); }}
      className={`group relative bg-surface border rounded-[1.5rem] p-6 hover:border-indigo-500/40 transition-all duration-500 cursor-pointer shadow-xl dark:shadow-2xl flex flex-col gap-6 ${isActive ? 'border-amber-500/40 shadow-amber-500/10' : 'border-border/60'}`}
    >
      {/* Header Card */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${style.bg} border ${style.border} flex items-center justify-center text-3xl shadow-lg ${isActive ? 'border-amber-500 shadow-amber-500/20' : ''}`}>
            {getEmoji(supplement.name)}
          </div>
          <div className="flex flex-col">
            <h3 className={`text-xl font-black italic uppercase tracking-tighter leading-tight drop-shadow-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${isActive ? 'text-amber-500' : 'text-primary'}`}>
              {supplement.name}
            </h3>
            <div className={`mt-1 self-start px-2 py-0.5 rounded-md bg-black border ${style.border}`}>
              <span className={`text-[8px] font-black uppercase tracking-widest ${style.text}`}>
                {supplement.benefitTag || supplement.category}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
           <button 
              onClick={(e) => { e.stopPropagation(); onToggleProtocol(supplement.id); }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-lg ${isActive ? 'bg-amber-500 border-amber-400 text-black shadow-amber-500/40' : 'bg-black/20 border-white/5 text-secondary hover:text-amber-500 hover:border-amber-500/40'}`}
              title={isActive ? "Pausar Protocolo" : "Activar Protocolo"}
            >
              {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
          <div className="flex flex-col items-end">
            <StarRating 
              rating={supplement.rating} 
              size={14} 
              interactive={true} 
              onVote={(r) => onVote(supplement.id, r)}
            />
            <span className="text-[7px] font-black text-secondary uppercase tracking-tighter mt-1">
              {supplement.rating.toFixed(1)}/5 • {supplement.votes} VOTOS
            </span>
          </div>
        </div>
      </div>

      {/* Badges Fila 2 */}
      <div className="flex flex-wrap gap-2">
        {supplement.isVegan && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest">
            <Leaf size={10} strokeWidth={3} /> Vegano
          </div>
        )}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black border ${supplement.origin === 'Natural' ? 'border-indigo-500/20 text-indigo-400' : 'border-purple-500/20 text-purple-400'} text-[9px] font-black uppercase tracking-widest`}>
          {supplement.origin === 'Natural' ? <Sprout size={10} /> : <FlaskConical size={10} />} Origen {supplement.origin}
        </div>
      </div>

      {/* Descripción Breve */}
      <div className="flex items-start gap-2 text-secondary text-sm leading-relaxed font-medium">
        <Info size={14} className="mt-1 flex-shrink-0" />
        <p className="line-clamp-2 italic">"{supplement.description}"</p>
      </div>

      {/* Footer Card */}
      <div className="mt-auto pt-4 border-t border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border shadow-lg bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition-all`}>
            <Zap size={12} />
            <span className="text-[10px] font-black italic">Score: {supplement.scientificScore}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black text-[9px] uppercase tracking-widest">
          Ver Fuente <ExternalLink size={10} />
        </div>
      </div>
    </div>
  );
};

const EmergingView: React.FC<Props> = ({ 
  supplements, 
  activeSuppIds, 
  onToggleProtocol, 
  onVote, 
  onRemoveVote,
  preferences,
  onStartOnboarding
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('Todas');

  const filteredEmergingSupplements = useMemo(() => {
    let list = supplements.filter(s => s.isEmerging);
    if (activeFilter !== 'Todas') {
      list = list.filter(s => s.category === activeFilter);
    }
    return list;
  }, [supplements, activeFilter]);

  const activeDetail = selectedId ? supplements.find(s => s.id === selectedId) : null;

  return (
    <div className="py-12 animate-fade-in space-y-12 max-w-[1440px] mx-auto px-4 sm:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-black text-primary italic uppercase tracking-tighter mb-4 leading-none">
            Compuestos Emergentes
          </h2>
          <p className="text-lg text-secondary font-medium leading-relaxed italic">
            Nuevas moléculas y protocolos con evidencia creciente en la literatura científica actual.
          </p>
        </div>

        {/* Filtro de Categorías */}
        <div className="bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner backdrop-blur-md flex flex-wrap gap-1">
          <button 
            onClick={() => { soundService.playClick(); setActiveFilter('Todas'); }}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest italic transition-all flex items-center gap-2 ${activeFilter === 'Todas' ? 'bg-indigo-600 text-white shadow-lg' : 'text-secondary hover:text-indigo-600 dark:hover:text-white'}`}
          >
            <Globe size={12} /> Todas
          </button>
          {CATEGORIES.map(cat => {
            const isSelected = activeFilter === cat;
            const style = getCategoryStyle(cat);
            return (
              <button 
                key={cat}
                onClick={() => { soundService.playClick(); setActiveFilter(cat); }}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest italic transition-all flex items-center gap-2 border ${isSelected ? `bg-indigo-600 text-white border-indigo-500 shadow-lg` : 'text-secondary border-transparent hover:bg-white/10'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                {SHORT_NAMES[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {filteredEmergingSupplements.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredEmergingSupplements.map(sup => (
            <EmergingCard 
              key={sup.id} 
              supplement={sup} 
              onSelect={setSelectedId} 
              onVote={onVote} 
              isActive={activeSuppIds.includes(sup.id)}
              onToggleProtocol={onToggleProtocol}
            />
          ))}
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center opacity-40">
          <Filter size={64} className="text-secondary mb-6 animate-pulse" />
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">Sin resultados</h3>
          <p className="text-sm font-bold uppercase tracking-widest mt-2 italic">No hay compuestos emergentes en esta categoría actualmente.</p>
        </div>
      )}

      {activeDetail && (
        <SupplementDetailModal 
          supplement={activeDetail} 
          onClose={() => setSelectedId(null)} 
          onVote={onVote} 
          onRemoveVote={onRemoveVote}
          onToggleProtocol={onToggleProtocol}
          isActive={activeSuppIds.includes(activeDetail.id)}
          isPremium={preferences.isPremium}
          isLoggedIn={preferences.isLoggedIn}
          onStartOnboarding={onStartOnboarding}
        />
      )}
    </div>
  );
};

export default EmergingView;